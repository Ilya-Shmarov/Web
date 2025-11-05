using CoffeemaniaBackend.DTOs;

namespace CoffeemaniaBackend.Services
{
    public interface IProductService
    {
        Task<List<ProductDto>> GetProductsAsync();
        Task<ProductDto> GetProductByIdAsync(int id);
        Task<List<ProductDto>> GetProductsByCategoryAsync(string category);
        Task<ProductDto> CreateProductAsync(CreateProductDto product);
        Task<ProductDto> UpdateProductAsync(int id, CreateProductDto product);
        Task<bool> DeleteProductAsync(int id);
    }
}