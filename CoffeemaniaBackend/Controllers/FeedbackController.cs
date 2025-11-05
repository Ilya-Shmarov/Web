using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using CoffeemaniaBackend.Services;
using CoffeemaniaBackend.DTOs;

namespace CoffeemaniaBackend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class FeedbackController : ControllerBase
    {
        private readonly IFeedbackService _feedbackService;

        public FeedbackController(IFeedbackService feedbackService)
        {
            _feedbackService = feedbackService;
        }

        [HttpPost]
        public async Task<IActionResult> CreateFeedback([FromBody] FeedbackDto feedbackDto)
        {
            try
            {
                var feedback = await _feedbackService.CreateFeedbackAsync(feedbackDto);
                return Ok(new { message = "Отзыв успешно отправлен", id = feedback.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpPost("authenticated")]
        [Authorize]
        public async Task<IActionResult> CreateAuthenticatedFeedback([FromBody] FeedbackDto feedbackDto)
        {
            try
            {
                var userId = GetCurrentUserId();
                var feedback = await _feedbackService.CreateAuthenticatedFeedbackAsync(feedbackDto, userId);
                return Ok(new { message = "Отзыв успешно отправлен", id = feedback.Id });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        [HttpGet]
        public async Task<IActionResult> GetFeedbacks([FromQuery] bool publicOnly = true, [FromQuery] int? productId = null)
        {
            var feedbacks = await _feedbackService.GetFeedbacksAsync(publicOnly, productId);
            return Ok(feedbacks);
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetFeedback(int id)
        {
            var feedback = await _feedbackService.GetFeedbackByIdAsync(id);
            if (feedback == null)
                return NotFound();

            return Ok(feedback);
        }

        [HttpDelete("{id}")]
        [Authorize]
        public async Task<IActionResult> DeleteFeedback(int id)
        {
            try
            {
                var userId = GetCurrentUserId();
                var result = await _feedbackService.DeleteFeedbackAsync(id, userId);
                if (!result)
                    return NotFound(new { message = "Отзыв не найден или у вас нет прав на его удаление" });

                return Ok(new { message = "Отзыв успешно удален" });
            }
            catch (Exception ex)
            {
                return BadRequest(new { message = ex.Message });
            }
        }

        private int GetCurrentUserId()
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userIdClaim) || !int.TryParse(userIdClaim, out int userId))
            {
                throw new UnauthorizedAccessException("Invalid user ID");
            }
            return userId;
        }
    }
}