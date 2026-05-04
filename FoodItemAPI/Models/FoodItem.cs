namespace FoodItemAPI.Models;

public class FoodItem
{
    public string Id { get; set; } = Guid.NewGuid().ToString();
    public required string Name { get; set; }
    public required string Category { get; set; }
    public decimal Price { get; set; }
    public string? Description { get; set; }
    public string? Image { get; set; }
    public string? Ingredients { get; set; }
    public bool Featured { get; set; }
    public List<string> Tags { get; set; } = new();
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
}
