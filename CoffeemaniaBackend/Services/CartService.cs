using Microsoft.EntityFrameworkCore;
using CoffeemaniaBackend.Data;
using CoffeemaniaBackend.DTOs;
using CoffeemaniaBackend.Models;

namespace CoffeemaniaBackend.Services
{
    public class CartService : ICartService
    {
        private readonly AppDbContext _context;

        public CartService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<CartResponseDto> GetCartAsync(int userId)
        {
            var cartItems = await _context.CartItems
                .Include(ci => ci.Product)
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            var items = cartItems.Select(ci => new CartItemResponseDto
            {
                Id = ci.Id,
                ProductId = ci.ProductId,
                ProductName = ci.Product.Name,
                ProductPrice = ci.Product.Price,
                ProductImageUrl = ci.Product.ImageUrl,
                Quantity = ci.Quantity,
                TotalPrice = ci.Product.Price * ci.Quantity,
                CreatedAt = ci.CreatedAt
            }).ToList();

            return new CartResponseDto
            {
                Items = items,
                TotalAmount = items.Sum(i => i.TotalPrice),
                TotalItems = items.Sum(i => i.Quantity)
            };
        }

        public async Task<CartItemResponseDto> AddToCartAsync(int userId, AddToCartDto addToCartDto)
        {
            // Проверяем, существует ли товар
            var product = await _context.Products.FindAsync(addToCartDto.ProductId);
            if (product == null)
                throw new ArgumentException("Product not found");

            // Проверяем, есть ли уже такой товар в корзине
            var existingItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == addToCartDto.ProductId);

            if (existingItem != null)
            {
                // Увеличиваем количество
                existingItem.Quantity += addToCartDto.Quantity;
                existingItem.UpdatedAt = DateTime.UtcNow;
            }
            else
            {
                // Создаем новый элемент корзины
                var cartItem = new CartItem
                {
                    UserId = userId,
                    ProductId = addToCartDto.ProductId,
                    Quantity = addToCartDto.Quantity
                };
                _context.CartItems.Add(cartItem);
            }

            await _context.SaveChangesAsync();

            // Возвращаем обновленный элемент
            var updatedItem = await _context.CartItems
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == addToCartDto.ProductId);

            return new CartItemResponseDto
            {
                Id = updatedItem.Id,
                ProductId = updatedItem.ProductId,
                ProductName = updatedItem.Product.Name,
                ProductPrice = updatedItem.Product.Price,
                ProductImageUrl = updatedItem.Product.ImageUrl,
                Quantity = updatedItem.Quantity,
                TotalPrice = updatedItem.Product.Price * updatedItem.Quantity,
                CreatedAt = updatedItem.CreatedAt
            };
        }

        public async Task<CartItemResponseDto> UpdateCartItemAsync(int userId, UpdateCartItemDto updateCartItemDto)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == updateCartItemDto.ProductId);

            if (cartItem == null)
                throw new ArgumentException("Cart item not found");

            if (updateCartItemDto.Quantity <= 0)
            {
                _context.CartItems.Remove(cartItem);
                await _context.SaveChangesAsync();
                return null;
            }

            cartItem.Quantity = updateCartItemDto.Quantity;
            cartItem.UpdatedAt = DateTime.UtcNow;
            await _context.SaveChangesAsync();

            return new CartItemResponseDto
            {
                Id = cartItem.Id,
                ProductId = cartItem.ProductId,
                ProductName = cartItem.Product.Name,
                ProductPrice = cartItem.Product.Price,
                ProductImageUrl = cartItem.Product.ImageUrl,
                Quantity = cartItem.Quantity,
                TotalPrice = cartItem.Product.Price * cartItem.Quantity,
                CreatedAt = cartItem.CreatedAt
            };
        }

        public async Task<bool> RemoveFromCartAsync(int userId, int productId)
        {
            var cartItem = await _context.CartItems
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == productId);

            if (cartItem == null)
                return false;

            _context.CartItems.Remove(cartItem);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> ClearCartAsync(int userId)
        {
            var cartItems = await _context.CartItems
                .Where(ci => ci.UserId == userId)
                .ToListAsync();

            if (!cartItems.Any())
                return false;

            _context.CartItems.RemoveRange(cartItems);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<CartItemResponseDto> GetCartItemAsync(int userId, int productId)
        {
            var cartItem = await _context.CartItems
                .Include(ci => ci.Product)
                .FirstOrDefaultAsync(ci => ci.UserId == userId && ci.ProductId == productId);

            if (cartItem == null)
                return null;

            return new CartItemResponseDto
            {
                Id = cartItem.Id,
                ProductId = cartItem.ProductId,
                ProductName = cartItem.Product.Name,
                ProductPrice = cartItem.Product.Price,
                ProductImageUrl = cartItem.Product.ImageUrl,
                Quantity = cartItem.Quantity,
                TotalPrice = cartItem.Product.Price * cartItem.Quantity,
                CreatedAt = cartItem.CreatedAt
            };
        }
    }
}

