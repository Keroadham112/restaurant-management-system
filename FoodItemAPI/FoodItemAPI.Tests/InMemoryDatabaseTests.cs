using Xunit;
using FoodItemAPI.Services;
using FoodItemAPI.Models;

namespace FoodItemAPI.Tests;

public class InMemoryDatabaseTests
{
    private readonly IFoodDatabase _database;

    public InMemoryDatabaseTests()
    {
        _database = new InMemoryDatabase();
    }

    #region GetAll Tests
    [Fact]
    public void GetAll_ShouldReturnAllItems()
    {
        // Act
        var items = _database.GetAll().ToList();

        // Assert
        Assert.NotEmpty(items);
        Assert.True(items.Count >= 10, "Should have at least 10 seed items");
    }

    [Fact]
    public void GetAll_ShouldReturnItemsOrderedByCreatedDateDescending()
    {
        // Act
        var items = _database.GetAll().ToList();

        // Assert
        for (int i = 0; i < items.Count - 1; i++)
        {
            Assert.True(items[i].CreatedAt >= items[i + 1].CreatedAt);
        }
    }
    #endregion

    #region GetById Tests
    [Fact]
    public void GetById_WithValidId_ShouldReturnItem()
    {
        // Arrange
        var allItems = _database.GetAll().First();
        var id = allItems.Id;

        // Act
        var item = _database.GetById(id);

        // Assert
        Assert.NotNull(item);
        Assert.Equal(id, item.Id);
    }

    [Fact]
    public void GetById_WithInvalidId_ShouldReturnNull()
    {
        // Act
        var item = _database.GetById("invalid-id");

        // Assert
        Assert.Null(item);
    }

    [Fact]
    public void GetById_WithEmptyId_ShouldReturnNull()
    {
        // Act
        var item = _database.GetById("");

        // Assert
        Assert.Null(item);
    }

    [Fact]
    public void GetById_WithNullId_ShouldReturnNull()
    {
        // Act
        var item = _database.GetById(null!);

        // Assert
        Assert.Null(item);
    }
    #endregion

    #region Create Tests
    [Fact]
    public void Create_WithValidItem_ShouldAddItem()
    {
        // Arrange
        var initialCount = _database.GetCount();
        var newItem = new FoodItem
        {
            Name = "Test Item",
            Category = "Starters",
            Price = 50,
            Description = "Test description",
            Featured = false
        };

        // Act
        var createdItem = _database.Create(newItem);

        // Assert
        Assert.NotNull(createdItem);
        Assert.NotNull(createdItem.Id);
        Assert.NotEqual(string.Empty, createdItem.Id); // Should generate new ID
        Assert.Equal("Test Item", createdItem.Name);
        Assert.Equal("Starters", createdItem.Category);
        Assert.Equal(50, createdItem.Price);
        Assert.Equal(initialCount + 1, _database.GetCount());
    }

    [Fact]
    public void Create_WithNullItem_ShouldThrowArgumentNullException()
    {
        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => _database.Create(null!));
    }

    [Fact]
    public void Create_WithEmptyName_ShouldThrowArgumentException()
    {
        // Arrange
        var item = new FoodItem
        {
            Name = "",
            Category = "Starters",
            Price = 50
        };

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _database.Create(item));
    }

    [Fact]
    public void Create_WithNullName_ShouldThrowArgumentException()
    {
        // Arrange
        var item = new FoodItem
        {
            Name = null!,
            Category = "Starters",
            Price = 50
        };

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _database.Create(item));
    }

    [Fact]
    public void Create_WithEmptyCategory_ShouldThrowArgumentException()
    {
        // Arrange
        var item = new FoodItem
        {
            Name = "Test",
            Category = "",
            Price = 50
        };

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _database.Create(item));
    }

    [Fact]
    public void Create_WithNegativePrice_ShouldThrowArgumentException()
    {
        // Arrange
        var item = new FoodItem
        {
            Name = "Test",
            Category = "Starters",
            Price = -10
        };

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _database.Create(item));
    }

    [Fact]
    public void Create_ShouldSetCreatedAndUpdatedDate()
    {
        // Arrange
        var item = new FoodItem
        {
            Name = "Test Item",
            Category = "Main",
            Price = 100
        };

        // Act
        var createdItem = _database.Create(item);

        // Assert
        Assert.NotEqual(default(DateTime), createdItem.CreatedAt);
        Assert.NotEqual(default(DateTime), createdItem.UpdatedAt);
        // CreatedAt and UpdatedAt should be approximately equal (within 100ms tolerance)
        var timeDifference = Math.Abs((createdItem.CreatedAt - createdItem.UpdatedAt).TotalMilliseconds);
        Assert.True(timeDifference < 100, $"Timestamps differ by {timeDifference}ms");
    }
    #endregion

    #region Update Tests
    [Fact]
    public void Update_WithValidIdAndItem_ShouldUpdateItem()
    {
        // Arrange
        var originalItem = _database.GetAll().First();
        var originalId = originalItem.Id;
        var updatedItem = new FoodItem
        {
            Name = "Updated Name",
            Category = "Desserts",
            Price = 200,
            Description = "Updated description",
            Featured = true,
            Tags = new List<string> { "sweet", "hot" }
        };

        // Act
        var result = _database.Update(originalId, updatedItem);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(originalId, result.Id);
        Assert.Equal("Updated Name", result.Name);
        Assert.Equal("Desserts", result.Category);
        Assert.Equal(200, result.Price);
        Assert.True(result.Featured);
        Assert.Contains("sweet", result.Tags);
    }

    [Fact]
    public void Update_WithInvalidId_ShouldReturnNull()
    {
        // Arrange
        var item = new FoodItem
        {
            Name = "Test",
            Category = "Starters",
            Price = 50
        };

        // Act
        var result = _database.Update("invalid-id", item);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void Update_WithEmptyId_ShouldReturnNull()
    {
        // Arrange
        var item = new FoodItem
        {
            Name = "Test",
            Category = "Starters",
            Price = 50
        };

        // Act
        var result = _database.Update("", item);

        // Assert
        Assert.Null(result);
    }

    [Fact]
    public void Update_WithNullItem_ShouldThrowArgumentNullException()
    {
        // Arrange
        var originalId = _database.GetAll().First().Id;

        // Act & Assert
        Assert.Throws<ArgumentNullException>(() => _database.Update(originalId, null!));
    }

    [Fact]
    public void Update_WithEmptyName_ShouldThrowArgumentException()
    {
        // Arrange
        var originalId = _database.GetAll().First().Id;
        var item = new FoodItem
        {
            Name = "",
            Category = "Starters",
            Price = 50
        };

        // Act & Assert
        Assert.Throws<ArgumentException>(() => _database.Update(originalId, item));
    }

    [Fact]
    public void Update_ShouldUpdateUpdatedDateOnly()
    {
        // Arrange
        var originalItem = _database.GetAll().First();
        var originalId = originalItem.Id;
        var originalCreatedAt = originalItem.CreatedAt;
        var updatedItem = new FoodItem
        {
            Name = "Updated",
            Category = originalItem.Category,
            Price = originalItem.Price
        };

        // Act
        System.Threading.Thread.Sleep(100); // Ensure time difference
        var result = _database.Update(originalId, updatedItem);

        // Assert
        Assert.NotNull(result);
        Assert.Equal(originalCreatedAt, result.CreatedAt);
        Assert.True(result.UpdatedAt > originalCreatedAt);
    }
    #endregion

    #region Delete Tests
    [Fact]
    public void Delete_WithValidId_ShouldRemoveItem()
    {
        // Arrange
        var initialCount = _database.GetCount();
        var itemToDelete = _database.GetAll().Last();
        var idToDelete = itemToDelete.Id;

        // Act
        var deleted = _database.Delete(idToDelete);

        // Assert
        Assert.True(deleted);
        Assert.Equal(initialCount - 1, _database.GetCount());
        Assert.Null(_database.GetById(idToDelete));
    }

    [Fact]
    public void Delete_WithInvalidId_ShouldReturnFalse()
    {
        // Act
        var deleted = _database.Delete("invalid-id");

        // Assert
        Assert.False(deleted);
    }

    [Fact]
    public void Delete_WithEmptyId_ShouldReturnFalse()
    {
        // Act
        var deleted = _database.Delete("");

        // Assert
        Assert.False(deleted);
    }

    [Fact]
    public void Delete_WithNullId_ShouldReturnFalse()
    {
        // Act
        var deleted = _database.Delete(null!);

        // Assert
        Assert.False(deleted);
    }
    #endregion

    #region Thread Safety Tests
    [Fact]
    public void ConcurrentOperations_ShouldMaintainDataIntegrity()
    {
        // Arrange
        var tasks = new List<Task>();
        var errors = new List<Exception>();

        // Act
        for (int i = 0; i < 10; i++)
        {
            tasks.Add(Task.Run(() =>
            {
                try
                {
                    for (int j = 0; j < 10; j++)
                    {
                        var item = new FoodItem
                        {
                            Name = $"Concurrent Item {j}",
                            Category = "Test",
                            Price = j * 10
                        };
                        _database.Create(item);
                    }
                    var items = _database.GetAll();
                    foreach (var it in items)
                    {
                        var retrieved = _database.GetById(it.Id);
                    }
                }
                catch (Exception ex)
                {
                    lock (errors)
                    {
                        errors.Add(ex);
                    }
                }
            }));
        }

        Task.WaitAll(tasks.ToArray());

        // Assert
        Assert.Empty(errors);
        Assert.True(_database.GetCount() > 100);
    }
    #endregion
}
