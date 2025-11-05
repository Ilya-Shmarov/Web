using CoffeemaniaBackend.DTOs;
using CoffeemaniaBackend.Models;

namespace CoffeemaniaBackend.Services
{
    public interface ICartService
    {
        Task<CartResponseDto> GetCartAsync(int userId);
        Task<CartItemResponseDto> AddToCartAsync(int userId, AddToCartDto addToCartDto);
        Task<CartItemResponseDto> UpdateCartItemAsync(int userId, UpdateCartItemDto updateCartItemDto);
        Task<bool> RemoveFromCartAsync(int userId, int productId);
        Task<bool> ClearCartAsync(int userId);
        Task<CartItemResponseDto> GetCartItemAsync(int userId, int productId);
    }
}

