using Microsoft.EntityFrameworkCore;
using CoffeemaniaBackend.Data;
using CoffeemaniaBackend.Models;
using CoffeemaniaBackend.DTOs;

namespace CoffeemaniaBackend.Services
{
    public class FeedbackService : IFeedbackService
    {
        private readonly AppDbContext _context;

        public FeedbackService(AppDbContext context)
        {
            _context = context;
        }

        public async Task<Feedback> CreateFeedbackAsync(FeedbackDto feedbackDto)
        {
            var feedback = new Feedback
            {
                Name = feedbackDto.Name,
                Email = feedbackDto.Email,
                ProductId = feedbackDto.ProductId,
                Rating = feedbackDto.Rating,
                Newsletter = feedbackDto.Newsletter,
                Public = feedbackDto.Public,
                Category = feedbackDto.Category,
                Message = feedbackDto.Message,
                AdditionalComments = feedbackDto.AdditionalComments
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }

        public async Task<Feedback> CreateAuthenticatedFeedbackAsync(FeedbackDto feedbackDto, int userId)
        {
            var feedback = new Feedback
            {
                UserId = userId,
                ProductId = feedbackDto.ProductId,
                Rating = feedbackDto.Rating,
                Newsletter = feedbackDto.Newsletter,
                Public = feedbackDto.Public,
                Category = feedbackDto.Category,
                Message = feedbackDto.Message,
                AdditionalComments = feedbackDto.AdditionalComments
            };

            _context.Feedbacks.Add(feedback);
            await _context.SaveChangesAsync();
            return feedback;
        }

        public async Task<List<FeedbackResponseDto>> GetFeedbacksAsync(bool publicOnly = true, int? productId = null)
        {
            var query = _context.Feedbacks
                .Include(f => f.User)
                .Include(f => f.Product)
                .AsQueryable();

            if (publicOnly)
            {
                query = query.Where(f => f.Public);
            }

            if (productId.HasValue)
            {
                query = query.Where(f => f.ProductId == productId.Value);
            }

            var feedbacks = await query
                .OrderByDescending(f => f.CreatedAt)
                .ToListAsync();

            return feedbacks.Select(f => new FeedbackResponseDto
            {
                Id = f.Id,
                Name = f.Name ?? (f.User != null ? $"{f.User.FirstName} {f.User.LastName}" : "Анонимный пользователь"),
                Email = f.Email,
                ProductId = f.ProductId,
                ProductName = f.Product?.Name,
                Rating = f.Rating,
                Newsletter = f.Newsletter,
                Public = f.Public,
                Category = f.Category,
                Message = f.Message,
                AdditionalComments = f.AdditionalComments,
                CreatedAt = f.CreatedAt,
                UserName = f.User != null ? $"{f.User.FirstName} {f.User.LastName}" : null
            }).ToList();
        }

        public async Task<FeedbackResponseDto> GetFeedbackByIdAsync(int id)
        {
            var feedback = await _context.Feedbacks
                .Include(f => f.User)
                .Include(f => f.Product)
                .FirstOrDefaultAsync(f => f.Id == id);

            if (feedback == null)
                return null;

            return new FeedbackResponseDto
            {
                Id = feedback.Id,
                Name = feedback.Name ?? (feedback.User != null ? $"{feedback.User.FirstName} {feedback.User.LastName}" : "Анонимный пользователь"),
                Email = feedback.Email,
                ProductId = feedback.ProductId,
                ProductName = feedback.Product?.Name,
                Rating = feedback.Rating,
                Newsletter = feedback.Newsletter,
                Public = feedback.Public,
                Category = feedback.Category,
                Message = feedback.Message,
                AdditionalComments = feedback.AdditionalComments,
                CreatedAt = feedback.CreatedAt,
                UserName = feedback.User != null ? $"{feedback.User.FirstName} {feedback.User.LastName}" : null
            };
        }

        public async Task<bool> DeleteFeedbackAsync(int id, int? userId = null)
        {
            var feedback = await _context.Feedbacks.FindAsync(id);
            if (feedback == null)
                return false;

            // Проверяем права на удаление
            if (userId.HasValue && feedback.UserId != userId.Value)
            {
                return false; // Пользователь может удалять только свои отзывы
            }

            _context.Feedbacks.Remove(feedback);
            await _context.SaveChangesAsync();
            return true;
        }
    }
}