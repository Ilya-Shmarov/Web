using System.ComponentModel.DataAnnotations;

namespace CoffeemaniaBackend.Models
{
    public class Product
    {
        [Key]
        public int Id { get; set; }

        [Required]
        [StringLength(200)]
        public string Name { get; set; }

        [Required]
        public decimal Price { get; set; }

        [StringLength(500)]
        public string ImageUrl { get; set; }

        [StringLength(500)] // Добавляем новое поле
        public string ImageUrl2 { get; set; }

        [StringLength(1000)]
        public string ShortDescription { get; set; }

        public string DetailedDescription { get; set; }

        [StringLength(50)]
        public string Category { get; set; }

        public int Weight { get; set; }

        public int Calories { get; set; }

        public decimal Proteins { get; set; }

        public decimal Fats { get; set; }

        public decimal Carbohydrates { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    }
}