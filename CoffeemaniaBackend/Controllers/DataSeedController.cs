// DataSeedController.cs
using Microsoft.AspNetCore.Mvc;
using CoffeemaniaBackend.Services;
using CoffeemaniaBackend.DTOs;

namespace CoffeemaniaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class DataSeedController : ControllerBase
    {
        private readonly IProductService _productService;

        public DataSeedController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpPost("init-products")]
        public async Task<IActionResult> InitializeProducts()
        {
            var products = new List<CreateProductDto>
            {
                new CreateProductDto
                {
                    Name = "Кофе в зернах Эспрессо",
                    Price = 2300,
                    ImageUrl = "img/arabica.jpg",
                    ShortDescription = "Премиальный кофе в зернах",
                    Category = "coffee",
                    Weight = 1000,
                    Calories = 1,
                    Proteins = 0.2m,
                    Fats = 0.1m,
                    Carbohydrates = 0.3m
                },
                new CreateProductDto
                {
                    Name = "Кофе в зёрнах Декаф Колумбия",
                    Price = 2300,
                    ImageUrl = "img/espresso.jpg",
                    ShortDescription = "Безкофеиновый кофе",
                    Category = "coffee",
                    Weight = 1000,
                    Calories = 1,
                    Proteins = 0.2m,
                    Fats = 0.1m,
                    Carbohydrates = 0.3m
                },
                // Добавьте остальные товары по аналогии
            };

            var createdProducts = new List<ProductDto>();
            foreach (var product in products)
            {
                var created = await _productService.CreateProductAsync(product);
                createdProducts.Add(created);
            }

            return Ok(new { message = "Products initialized", count = createdProducts.Count });
        }
    }
}