using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Http;
using FoodItemAPI.Models;
using FoodItemAPI.Services;

namespace FoodItemAPI.Controllers;

[ApiController]
[Route("api/[controller]")]
public class FoodController : ControllerBase
{
    private readonly IFoodDatabase _database;
    private readonly ILogger<FoodController> _logger;

    public FoodController(IFoodDatabase database, ILogger<FoodController> logger)
    {
        _database = database;
        _logger = logger;
    }

    /// <summary>
    /// Get all food items
    /// </summary>
    /// <returns>List of all food items</returns>
    [HttpGet]
    public IActionResult GetAll()
    {
        try
        {
            _logger.LogInformation("Fetching all food items");
            var items = _database.GetAll().ToList();
            var response = ApiResponse<List<FoodItem>>.SuccessResponse(items, $"Retrieved {items.Count} food items", 200);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching food items");
            var response = ApiResponse<List<FoodItem>>.ErrorResponse("An error occurred while fetching items", 500);
            return StatusCode(500, response);
        }
    }

    /// <summary>
    /// Get a food item by ID
    /// </summary>
    /// <param name="id">Food item ID</param>
    /// <returns>Food item details</returns>
    [HttpGet("{id}")]
    public IActionResult GetById(string id)
    {
        try
        {
            _logger.LogInformation("Fetching food item with ID: {Id}", id);
            
            if (string.IsNullOrWhiteSpace(id))
            {
                var badResponse = ApiResponse<object>.ErrorResponse("ID cannot be empty", 400);
                return BadRequest(badResponse);
            }

            var item = _database.GetById(id);
            if (item == null)
            {
                var notFoundResponse = ApiResponse<object>.ErrorResponse("Food item not found", 404);
                return NotFound(notFoundResponse);
            }

            var response = ApiResponse<FoodItem>.SuccessResponse(item, "Food item retrieved successfully", 200);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error fetching food item with ID: {Id}", id);
            var response = ApiResponse<object>.ErrorResponse("An error occurred while fetching the item", 500);
            return StatusCode(500, response);
        }
    }

    /// <summary>
    /// Create a new food item
    /// </summary>
    /// <param name="item">Food item data</param>
    /// <returns>Created food item</returns>
    [HttpPost]
    public IActionResult Create([FromBody] FoodItem item)
    {
        try
        {
            _logger.LogInformation("Creating new food item: {ItemName}", item?.Name);

            if (item == null)
            {
                var badResponse = ApiResponse<object>.ErrorResponse("Item data is required", 400);
                return BadRequest(badResponse);
            }

            var createdItem = _database.Create(item);
            var response = ApiResponse<FoodItem>.SuccessResponse(createdItem, "Food item created successfully", 201);
            return CreatedAtAction(nameof(GetById), new { id = createdItem.Id }, response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while creating food item");
            var response = ApiResponse<object>.ErrorResponse(ex.Message, 400);
            return BadRequest(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error creating food item");
            var response = ApiResponse<object>.ErrorResponse("An error occurred while creating the item", 500);
            return StatusCode(500, response);
        }
    }

    /// <summary>
    /// Update an existing food item
    /// </summary>
    /// <param name="id">Food item ID</param>
    /// <param name="item">Updated food item data</param>
    /// <returns>Updated food item</returns>
    [HttpPut("{id}")]
    public IActionResult Update(string id, [FromBody] FoodItem item)
    {
        try
        {
            _logger.LogInformation("Updating food item with ID: {Id}", id);

            if (string.IsNullOrWhiteSpace(id))
            {
                var badResponse = ApiResponse<object>.ErrorResponse("ID cannot be empty", 400);
                return BadRequest(badResponse);
            }

            if (item == null)
            {
                var badResponse = ApiResponse<object>.ErrorResponse("Item data is required", 400);
                return BadRequest(badResponse);
            }

            var updatedItem = _database.Update(id, item);
            if (updatedItem == null)
            {
                var notFoundResponse = ApiResponse<object>.ErrorResponse("Food item not found", 404);
                return NotFound(notFoundResponse);
            }

            var response = ApiResponse<FoodItem>.SuccessResponse(updatedItem, "Food item updated successfully", 200);
            return Ok(response);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Validation error while updating food item");
            var response = ApiResponse<object>.ErrorResponse(ex.Message, 400);
            return BadRequest(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error updating food item with ID: {Id}", id);
            var response = ApiResponse<object>.ErrorResponse("An error occurred while updating the item", 500);
            return StatusCode(500, response);
        }
    }

    /// <summary>
    /// Delete a food item
    /// </summary>
    /// <param name="id">Food item ID</param>
    /// <returns>Deletion confirmation</returns>
    [HttpDelete("{id}")]
    public IActionResult Delete(string id)
    {
        try
        {
            _logger.LogInformation("Deleting food item with ID: {Id}", id);

            if (string.IsNullOrWhiteSpace(id))
            {
                var badResponse = ApiResponse<object>.ErrorResponse("ID cannot be empty", 400);
                return BadRequest(badResponse);
            }

            var deleted = _database.Delete(id);
            if (!deleted)
            {
                var notFoundResponse = ApiResponse<object>.ErrorResponse("Food item not found", 404);
                return NotFound(notFoundResponse);
            }

            var response = ApiResponse<object>.SuccessResponse(null, "Food item deleted successfully", 200);
            return Ok(response);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting food item with ID: {Id}", id);
            var response = ApiResponse<object>.ErrorResponse("An error occurred while deleting the item", 500);
            return StatusCode(500, response);
        }
    }
}
