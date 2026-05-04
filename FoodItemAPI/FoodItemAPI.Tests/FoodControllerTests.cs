using Xunit;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Logging;
using Moq;
using FoodItemAPI.Controllers;
using FoodItemAPI.Models;
using FoodItemAPI.Services;

namespace FoodItemAPI.Tests;

public class FoodControllerTests
{
    private readonly FoodController _controller;
    private readonly IFoodDatabase _database;
    private readonly Mock<ILogger<FoodController>> _mockLogger;

    public FoodControllerTests()
    {
        _database = new InMemoryDatabase();
        _mockLogger = new Mock<ILogger<FoodController>>();
        _controller = new FoodController(_database, _mockLogger.Object);
    }

    #region GetAll Tests
    [Fact]
    public void GetAll_ShouldReturnOkWithItems()
    {
        // Act
        var result = _controller.GetAll();

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);
        
        var response = Assert.IsType<ApiResponse<List<FoodItem>>>(okResult.Value);
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.NotEmpty(response.Data);
    }
    #endregion

    #region GetById Tests
    [Fact]
    public void GetById_WithValidId_ShouldReturnOkWithItem()
    {
        // Arrange
        var item = _database.GetAll().First();
        var id = item.Id;

        // Act
        var result = _controller.GetById(id);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);
        
        var response = Assert.IsType<ApiResponse<FoodItem>>(okResult.Value);
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal(id, response.Data.Id);
    }

    [Fact]
    public void GetById_WithInvalidId_ShouldReturnNotFound()
    {
        // Act
        var result = _controller.GetById("invalid-id");

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(404, notFoundResult.StatusCode);
        
        var response = Assert.IsType<ApiResponse<object>>(notFoundResult.Value);
        Assert.False(response.Success);
    }

    [Fact]
    public void GetById_WithEmptyId_ShouldReturnBadRequest()
    {
        // Act
        var result = _controller.GetById("");

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badResult.StatusCode);
    }
    #endregion

    #region Create Tests
    [Fact]
    public void Create_WithValidItem_ShouldReturnCreatedAtAction()
    {
        // Arrange
        var item = new FoodItem
        {
            Name = "Test Food",
            Category = "Starters",
            Price = 50
        };

        // Act
        var result = _controller.Create(item);

        // Assert
        var createdResult = Assert.IsType<CreatedAtActionResult>(result);
        Assert.Equal(nameof(FoodController.GetById), createdResult.ActionName);
        Assert.Equal(201, createdResult.StatusCode);
        
        var response = Assert.IsType<ApiResponse<FoodItem>>(createdResult.Value);
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal("Test Food", response.Data.Name);
    }

    [Fact]
    public void Create_WithNullItem_ShouldReturnBadRequest()
    {
        // Act
        var result = _controller.Create(null!);

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badResult.StatusCode);
    }

    [Fact]
    public void Create_WithEmptyName_ShouldReturnBadRequest()
    {
        // Arrange
        var item = new FoodItem
        {
            Name = "",
            Category = "Starters",
            Price = 50
        };

        // Act
        var result = _controller.Create(item);

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badResult.StatusCode);
    }

    [Fact]
    public void Create_WithNegativePrice_ShouldReturnBadRequest()
    {
        // Arrange
        var item = new FoodItem
        {
            Name = "Test",
            Category = "Starters",
            Price = -10
        };

        // Act
        var result = _controller.Create(item);

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badResult.StatusCode);
    }
    #endregion

    #region Update Tests
    [Fact]
    public void Update_WithValidIdAndItem_ShouldReturnOkWithUpdatedItem()
    {
        // Arrange
        var originalItem = _database.GetAll().First();
        var id = originalItem.Id;
        var updatedItem = new FoodItem
        {
            Name = "Updated Name",
            Category = "Desserts",
            Price = 150
        };

        // Act
        var result = _controller.Update(id, updatedItem);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);
        
        var response = Assert.IsType<ApiResponse<FoodItem>>(okResult.Value);
        Assert.True(response.Success);
        Assert.NotNull(response.Data);
        Assert.Equal("Updated Name", response.Data.Name);
    }

    [Fact]
    public void Update_WithInvalidId_ShouldReturnNotFound()
    {
        // Arrange
        var item = new FoodItem
        {
            Name = "Test",
            Category = "Starters",
            Price = 50
        };

        // Act
        var result = _controller.Update("invalid-id", item);

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(404, notFoundResult.StatusCode);
    }

    [Fact]
    public void Update_WithEmptyId_ShouldReturnBadRequest()
    {
        // Arrange
        var item = new FoodItem
        {
            Name = "Test",
            Category = "Starters",
            Price = 50
        };

        // Act
        var result = _controller.Update("", item);

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badResult.StatusCode);
    }

    [Fact]
    public void Update_WithNullItem_ShouldReturnBadRequest()
    {
        // Arrange
        var id = _database.GetAll().First().Id;

        // Act
        var result = _controller.Update(id, null!);

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badResult.StatusCode);
    }
    #endregion

    #region Delete Tests
    [Fact]
    public void Delete_WithValidId_ShouldReturnOkWithSuccessMessage()
    {
        // Arrange
        var item = _database.GetAll().Last();
        var id = item.Id;

        // Act
        var result = _controller.Delete(id);

        // Assert
        var okResult = Assert.IsType<OkObjectResult>(result);
        Assert.Equal(200, okResult.StatusCode);
        
        var response = Assert.IsType<ApiResponse<object>>(okResult.Value);
        Assert.True(response.Success);
    }

    [Fact]
    public void Delete_WithInvalidId_ShouldReturnNotFound()
    {
        // Act
        var result = _controller.Delete("invalid-id");

        // Assert
        var notFoundResult = Assert.IsType<NotFoundObjectResult>(result);
        Assert.Equal(404, notFoundResult.StatusCode);
    }

    [Fact]
    public void Delete_WithEmptyId_ShouldReturnBadRequest()
    {
        // Act
        var result = _controller.Delete("");

        // Assert
        var badResult = Assert.IsType<BadRequestObjectResult>(result);
        Assert.Equal(400, badResult.StatusCode);
    }
    #endregion
}
