using Microsoft.EntityFrameworkCore;
using System.Security.Cryptography;
using System.Text;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.IdentityModel.Tokens;
using System.Security.Claims;
using CoffeemaniaBackend.Data;
using CoffeemaniaBackend.Models;
using CoffeemaniaBackend.DTOs;

namespace CoffeemaniaBackend.Services
{
    public class AuthService : IAuthService
    {
        private readonly AppDbContext _context;
        private readonly IConfiguration _configuration;
        private readonly ILogger<AuthService> _logger;

        public AuthService(AppDbContext context, IConfiguration configuration, ILogger<AuthService> logger)
        {
            _context = context;
            _configuration = configuration;
            _logger = logger;
        }

        public async Task<bool> UserExistsAsync(string login, string email, string phone)
        {
            return await _context.Users.AnyAsync(u =>
                u.Login == login || u.Email == email || u.Phone == phone);
        }

        public async Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto)
        {
            try
            {
                _logger.LogInformation($"Attempting to register user: {registerDto.Login}");

                // Проверяем существование пользователя
                if (await UserExistsAsync(registerDto.Login, registerDto.Email, registerDto.Phone))
                {
                    _logger.LogWarning($"User already exists: {registerDto.Login}");
                    throw new Exception("Пользователь с таким логином, email или телефоном уже существует");
                }

                if (!registerDto.PrivacyPolicy)
                {
                    throw new Exception("Необходимо согласие с политикой конфиденциальности");
                }

                // Создаем хэш пароля
                CreatePasswordHash(registerDto.Password, out byte[] passwordHash, out byte[] passwordSalt);

                var user = new User
                {
                    FirstName = registerDto.FirstName,
                    LastName = registerDto.LastName,
                    Phone = registerDto.Phone,
                    Email = registerDto.Email,
                    Login = registerDto.Login,
                    PasswordHash = Convert.ToBase64String(passwordHash) + ":" + Convert.ToBase64String(passwordSalt),
                    CreatedAt = DateTime.UtcNow,
                    UpdatedAt = DateTime.UtcNow
                };

                _logger.LogInformation($"Creating user: {user.Login}, Email: {user.Email}, Phone: {user.Phone}");

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                _logger.LogInformation($"User registered successfully: {user.Id}");

                var token = GenerateJwtToken(user);
                var userDto = new UserDto
                {
                    FirstName = user.FirstName,
                    LastName = user.LastName,
                    Phone = user.Phone,
                    Email = user.Email,
                    Login = user.Login
                };

                return new AuthResponseDto { Token = token, User = userDto };
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, $"Error during registration for user: {registerDto.Login}");
                throw;
            }
        }

        // Остальные методы остаются без изменений...
        private void CreatePasswordHash(string password, out byte[] passwordHash, out byte[] passwordSalt)
        {
            using (var hmac = new HMACSHA512())
            {
                passwordSalt = hmac.Key;
                passwordHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
            }
        }

        private bool VerifyPasswordHash(string password, byte[] storedHash, byte[] storedSalt)
        {
            using (var hmac = new HMACSHA512(storedSalt))
            {
                var computedHash = hmac.ComputeHash(Encoding.UTF8.GetBytes(password));
                return computedHash.SequenceEqual(storedHash);
            }
        }

        private string GenerateJwtToken(User user)
        {
            var tokenHandler = new JwtSecurityTokenHandler();
            var keyString = _configuration["Jwt:Secret"];

            if (string.IsNullOrEmpty(keyString))
            {
                throw new ArgumentException("JWT Secret key is not configured properly");
            }

            var key = Encoding.UTF8.GetBytes(keyString);

            var tokenDescriptor = new SecurityTokenDescriptor
            {
                Subject = new ClaimsIdentity(new[]
                {
                    new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                    new Claim(ClaimTypes.Name, user.Login),
                    new Claim(ClaimTypes.Email, user.Email)
                }),
                Expires = DateTime.UtcNow.AddDays(7),
                SigningCredentials = new SigningCredentials(new SymmetricSecurityKey(key), SecurityAlgorithms.HmacSha256Signature)
            };

            var token = tokenHandler.CreateToken(tokenDescriptor);
            return tokenHandler.WriteToken(token);
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto loginDto)
        {
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == loginDto.Login);
            if (user == null)
            {
                throw new Exception("Пользователь не найден");
            }

            var parts = user.PasswordHash.Split(':');
            if (parts.Length != 2)
            {
                throw new Exception("Неверный формат пароля");
            }

            var storedHash = Convert.FromBase64String(parts[0]);
            var storedSalt = Convert.FromBase64String(parts[1]);

            if (!VerifyPasswordHash(loginDto.Password, storedHash, storedSalt))
            {
                throw new Exception("Неверный пароль");
            }

            var token = GenerateJwtToken(user);
            var userDto = new UserDto
            {
                FirstName = user.FirstName,
                LastName = user.LastName,
                Phone = user.Phone,
                Email = user.Email,
                Login = user.Login
            };

            return new AuthResponseDto { Token = token, User = userDto };
        }
    }
}