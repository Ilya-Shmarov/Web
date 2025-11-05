using CoffeemaniaBackend.Models;
using CoffeemaniaBackend.DTOs;

namespace CoffeemaniaBackend.Services
{
    public interface IFeedbackService
    {
        Task<Feedback> CreateFeedbackAsync(FeedbackDto feedbackDto);
        Task<Feedback> CreateAuthenticatedFeedbackAsync(FeedbackDto feedbackDto, int userId);
        Task<List<FeedbackResponseDto>> GetFeedbacksAsync(bool publicOnly = true, int? productId = null);
        Task<FeedbackResponseDto> GetFeedbackByIdAsync(int id);
        Task<bool> DeleteFeedbackAsync(int id, int? userId = null);
    }
}