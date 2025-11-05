namespace CoffeemaniaBackend.DTOs
{
    public class FeedbackDto
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public int? ProductId { get; set; }
        public int Rating { get; set; }
        public bool Newsletter { get; set; }
        public bool Public { get; set; }
        public string Category { get; set; }
        public string Message { get; set; }
        public string AdditionalComments { get; set; }
    }
    
    public class FeedbackResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Email { get; set; }
        public int? ProductId { get; set; }
        public string ProductName { get; set; }
        public int Rating { get; set; }
        public bool Newsletter { get; set; }
        public bool Public { get; set; }
        public string Category { get; set; }
        public string Message { get; set; }
        public string AdditionalComments { get; set; }
        public DateTime CreatedAt { get; set; }
        public string UserName { get; set; }
    }
}