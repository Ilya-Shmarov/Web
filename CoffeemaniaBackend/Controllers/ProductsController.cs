using Microsoft.AspNetCore.Mvc;
using CoffeemaniaBackend.Services;
using CoffeemaniaBackend.DTOs;

namespace CoffeemaniaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class ProductsController : ControllerBase
    {
        private readonly IProductService _productService;

        public ProductsController(IProductService productService)
        {
            _productService = productService;
        }

        [HttpGet]
        public async Task<IActionResult> GetProducts()
        {
            var products = await _productService.GetProductsAsync();
            return Ok(products);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetProduct(int id)
        {
            var product = await _productService.GetProductByIdAsync(id);
            if (product == null)
                return NotFound();

            return Ok(product);
        }

        [HttpGet("category/{category}")]
        public async Task<IActionResult> GetProductsByCategory(string category)
        {
            var products = await _productService.GetProductsByCategoryAsync(category);
            return Ok(products);
        }

        // Методы для создания/обновления товаров (можно использовать для инициализации данных)
        [HttpPost]
        public async Task<IActionResult> CreateProduct([FromBody] CreateProductDto productDto)
        {
            var product = await _productService.CreateProductAsync(productDto);
            return CreatedAtAction(nameof(GetProduct), new { id = product.Id }, product);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateProduct(int id, [FromBody] CreateProductDto productDto)
        {
            var updatedProduct = await _productService.UpdateProductAsync(id, productDto);
            if (updatedProduct == null)
                return NotFound();

            return Ok(updatedProduct);
        }
    }
}