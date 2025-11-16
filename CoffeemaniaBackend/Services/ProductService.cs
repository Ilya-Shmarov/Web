using Microsoft.EntityFrameworkCore;
using CoffeemaniaBackend.Data;
using CoffeemaniaBackend.Models;
using CoffeemaniaBackend.DTOs;

namespace CoffeemaniaBackend.Services
{
    public class ProductService : IProductService
    {
        private readonly AppDbContext _context;

        public ProductService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<List<ProductDto>> GetProductsAsync()
        {
            var products = await _context.Products
                .OrderBy(p => p.Name)
                .ToListAsync();

            return products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                ImageUrl2 = p.ImageUrl2, // Добавляем новое поле
                ShortDescription = p.ShortDescription,
                DetailedDescription = p.DetailedDescription,
                Category = p.Category,
                Weight = p.Weight,
                Calories = p.Calories,
                Proteins = p.Proteins,
                Fats = p.Fats,
                Carbohydrates = p.Carbohydrates,
                CreatedAt = p.CreatedAt
            }).ToList();
        }

        public async Task<ProductDto> GetProductByIdAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return null;

            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                ImageUrl = product.ImageUrl,
                ImageUrl2 = product.ImageUrl2, // Добавляем новое поле
                ShortDescription = product.ShortDescription,
                DetailedDescription = product.DetailedDescription,
                Category = product.Category,
                Weight = product.Weight,
                Calories = product.Calories,
                Proteins = product.Proteins,
                Fats = product.Fats,
                Carbohydrates = product.Carbohydrates,
                CreatedAt = product.CreatedAt
            };
        }

        public async Task<List<ProductDto>> GetProductsByCategoryAsync(string category)
        {
            var products = await _context.Products
                .Where(p => p.Category == category)
                .OrderBy(p => p.Name)
                .ToListAsync();

            return products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                ImageUrl2 = p.ImageUrl2, // Добавляем новое поле
                ShortDescription = p.ShortDescription,
                DetailedDescription = p.DetailedDescription,
                Category = p.Category,
                Weight = p.Weight,
                Calories = p.Calories,
                Proteins = p.Proteins,
                Fats = p.Fats,
                Carbohydrates = p.Carbohydrates,
                CreatedAt = p.CreatedAt
            }).ToList();
        }

        public async Task<ProductDto> CreateProductAsync(CreateProductDto productDto)
        {
            var product = new Product
            {
                Name = productDto.Name,
                Price = productDto.Price,
                ImageUrl = productDto.ImageUrl,
                ImageUrl2 = productDto.ImageUrl2, // Добавляем новое поле
                ShortDescription = productDto.ShortDescription,
                DetailedDescription = productDto.DetailedDescription,
                Category = productDto.Category,
                Weight = productDto.Weight,
                Calories = productDto.Calories,
                Proteins = productDto.Proteins,
                Fats = productDto.Fats,
                Carbohydrates = productDto.Carbohydrates,
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };

            _context.Products.Add(product);
            await _context.SaveChangesAsync();

            return new ProductDto
            {
                Id = product.Id,
                Name = product.Name,
                Price = product.Price,
                ImageUrl = product.ImageUrl,
                ImageUrl2 = product.ImageUrl2, // Добавляем новое поле
                ShortDescription = product.ShortDescription,
                DetailedDescription = product.DetailedDescription,
                Category = product.Category,
                Weight = product.Weight,
                Calories = product.Calories,
                Proteins = product.Proteins,
                Fats = product.Fats,
                Carbohydrates = product.Carbohydrates,
                CreatedAt = product.CreatedAt
            };
        }

        public async Task<ProductDto> UpdateProductAsync(int id, CreateProductDto productDto)
        {
            var existingProduct = await _context.Products.FindAsync(id);
            if (existingProduct == null)
                return null;

            existingProduct.Name = productDto.Name;
            existingProduct.Price = productDto.Price;
            existingProduct.ImageUrl = productDto.ImageUrl;
            existingProduct.ImageUrl2 = productDto.ImageUrl2; // Добавляем новое поле
            existingProduct.ShortDescription = productDto.ShortDescription;
            existingProduct.DetailedDescription = productDto.DetailedDescription;
            existingProduct.Category = productDto.Category;
            existingProduct.Weight = productDto.Weight;
            existingProduct.Calories = productDto.Calories;
            existingProduct.Proteins = productDto.Proteins;
            existingProduct.Fats = productDto.Fats;
            existingProduct.Carbohydrates = productDto.Carbohydrates;
            existingProduct.UpdatedAt = DateTime.UtcNow;

            await _context.SaveChangesAsync();

            return new ProductDto
            {
                Id = existingProduct.Id,
                Name = existingProduct.Name,
                Price = existingProduct.Price,
                ImageUrl = existingProduct.ImageUrl,
                ImageUrl2 = existingProduct.ImageUrl2, // Добавляем новое поле
                ShortDescription = existingProduct.ShortDescription,
                DetailedDescription = existingProduct.DetailedDescription,
                Category = existingProduct.Category,
                Weight = existingProduct.Weight,
                Calories = existingProduct.Calories,
                Proteins = existingProduct.Proteins,
                Fats = existingProduct.Fats,
                Carbohydrates = existingProduct.Carbohydrates,
                CreatedAt = existingProduct.CreatedAt
            };
        }

        public async Task<bool> DeleteProductAsync(int id)
        {
            var product = await _context.Products.FindAsync(id);
            if (product == null)
                return false;

            _context.Products.Remove(product);
            await _context.SaveChangesAsync();
            return true;
        }

        // Новый метод для поиска товаров
        public async Task<List<ProductDto>> SearchProductsAsync(string searchTerm)
        {
            if (string.IsNullOrWhiteSpace(searchTerm))
                return await GetProductsAsync();

            var products = await _context.Products
                .Where(p => p.Name.ToLower().Contains(searchTerm.ToLower()))
                .OrderBy(p => p.Name)
                .ToListAsync();

            return products.Select(p => new ProductDto
            {
                Id = p.Id,
                Name = p.Name,
                Price = p.Price,
                ImageUrl = p.ImageUrl,
                ImageUrl2 = p.ImageUrl2,
                ShortDescription = p.ShortDescription,
                DetailedDescription = p.DetailedDescription,
                Category = p.Category,
                Weight = p.Weight,
                Calories = p.Calories,
                Proteins = p.Proteins,
                Fats = p.Fats,
                Carbohydrates = p.Carbohydrates,
                CreatedAt = p.CreatedAt
            }).ToList();
        }
    }
}