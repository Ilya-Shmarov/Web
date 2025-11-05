using CoffeemaniaBackend.DTOs;

namespace CoffeemaniaBackend.Services
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<bool> UserExistsAsync(string login, string email, string phone);
    }
}