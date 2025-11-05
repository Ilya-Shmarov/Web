using System.ComponentModel.DataAnnotations;

namespace CoffeemaniaBackend.Models
{
    public class Feedback
    {
        [Key]
        public int Id { get; set; }
        
        // Для анонимных отзывов
        [StringLength(100)]
        public string Name { get; set; }
        
        [EmailAddress]
        [StringLength(100)]
        public string Email { get; set; }
        
        // Для авторизованных пользователей
        public int? UserId { get; set; }
        
        // Для отзывов о конкретных товарах
        public int? ProductId { get; set; }
        
        [Required]
        [Range(1, 5)]
        public int Rating { get; set; }
        
        public bool Newsletter { get; set; }
        
        public bool Public { get; set; }
        
        [Required]
        [StringLength(50)]
        public string Category { get; set; }
        
        [Required]
        public string Message { get; set; }
        
        public string AdditionalComments { get; set; }
        
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        
        // Navigation properties
        public User User { get; set; }
        public Product Product { get; set; }
    }
}