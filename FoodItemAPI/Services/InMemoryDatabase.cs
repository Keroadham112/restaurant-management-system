using FoodItemAPI.Models;

namespace FoodItemAPI.Services;

public interface IFoodDatabase
{
    IEnumerable<FoodItem> GetAll();
    FoodItem? GetById(string id);
    FoodItem Create(FoodItem item);
    FoodItem? Update(string id, FoodItem item);
    bool Delete(string id);
    int GetCount();
}

public class InMemoryDatabase : IFoodDatabase
{
    private readonly List<FoodItem> _items;
    private readonly object _lock = new object();

    public InMemoryDatabase()
    {
        _items = new List<FoodItem>(InitializeSeedData());
    }

    public IEnumerable<FoodItem> GetAll()
    {
        lock (_lock)
        {
            return _items.OrderByDescending(x => x.CreatedAt).ToList();
        }
    }

    public FoodItem? GetById(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return null;

        lock (_lock)
        {
            return _items.FirstOrDefault(x => x.Id == id);
        }
    }

    public FoodItem Create(FoodItem item)
    {
        if (item == null)
            throw new ArgumentNullException(nameof(item));

        if (string.IsNullOrWhiteSpace(item.Name))
            throw new ArgumentException("Item name is required");

        if (string.IsNullOrWhiteSpace(item.Category))
            throw new ArgumentException("Item category is required");

        if (item.Price < 0)
            throw new ArgumentException("Item price cannot be negative");

        lock (_lock)
        {
            item.Id = Guid.NewGuid().ToString();
            item.CreatedAt = DateTime.UtcNow;
            item.UpdatedAt = DateTime.UtcNow;
            _items.Add(item);
            return item;
        }
    }

    public FoodItem? Update(string id, FoodItem item)
    {
        if (string.IsNullOrWhiteSpace(id))
            return null;

        if (item == null)
            throw new ArgumentNullException(nameof(item));

        if (string.IsNullOrWhiteSpace(item.Name))
            throw new ArgumentException("Item name is required");

        if (string.IsNullOrWhiteSpace(item.Category))
            throw new ArgumentException("Item category is required");

        if (item.Price < 0)
            throw new ArgumentException("Item price cannot be negative");

        lock (_lock)
        {
            var existingItem = _items.FirstOrDefault(x => x.Id == id);
            if (existingItem == null)
                return null;

            existingItem.Name = item.Name;
            existingItem.Category = item.Category;
            existingItem.Price = item.Price;
            existingItem.Description = item.Description;
            existingItem.Image = item.Image;
            existingItem.Ingredients = item.Ingredients;
            existingItem.Featured = item.Featured;
            existingItem.Tags = item.Tags ?? new List<string>();
            existingItem.UpdatedAt = DateTime.UtcNow;

            return existingItem;
        }
    }

    public bool Delete(string id)
    {
        if (string.IsNullOrWhiteSpace(id))
            return false;

        lock (_lock)
        {
            var item = _items.FirstOrDefault(x => x.Id == id);
            if (item == null)
                return false;

            _items.Remove(item);
            return true;
        }
    }

    public int GetCount()
    {
        lock (_lock)
        {
            return _items.Count;
        }
    }

    private static List<FoodItem> InitializeSeedData()
    {
        return new List<FoodItem>
        {
            new() { Id = "1", Name = "Hummus Starter", Category = "Starters", Price = 100, Description = "Creamy hummus with olive oil and lemon", Image = "https://media.istockphoto.com/id/2213689776/photo/hummus-in-bowl-houmous-dip-chickpea-humus-tahini-sauce-middle-eastern-spread.jpg", Ingredients = "Chickpeas, tahini, olive oil, lemon, garlic", Featured = true, Tags = new List<string> { "veg" } },
            new() { Id = "2", Name = "Fattoush Salad", Category = "Starters", Price = 110, Description = "Fresh mixed salad with toasted bread and pomegranate dressing", Image = "https://plus.unsplash.com/premium_photo-1664392068994-9277c9ed4837", Ingredients = "Lettuce, cucumber, tomato, toasted bread, dressing", Featured = false, Tags = new List<string> { "veg" } },
            new() { Id = "3", Name = "Chicken Shawarma", Category = "Main", Price = 150, Description = "Grilled chicken shawarma with special sauce", Image = "https://images.unsplash.com/photo-1529006557810-274b9b2fc783", Ingredients = "Chicken, spices, bread, sauce", Featured = true, Tags = new List<string> { "hot" } },
            new() { Id = "4", Name = "Cheeseburger", Category = "Main", Price = 160, Description = "Beef burger with cheddar, lettuce and tomato", Image = "https://images.unsplash.com/photo-1568901346375-23c9450c58cd", Ingredients = "Beef, cheese, bun, lettuce, tomato", Featured = false, Tags = new List<string> { "hot" } },
            new() { Id = "5", Name = "Chicken Kabsa", Category = "Main", Price = 170, Description = "Spiced rice with chicken pieces", Image = "https://images.unsplash.com/photo-1633945274405-b6c8069047b0", Ingredients = "Rice, chicken, spices", Featured = false, Tags = new List<string> { "hot", "spicy" } },
            new() { Id = "6", Name = "Kunafa with Cream", Category = "Desserts", Price = 120, Description = "Hot kunafa served with cream and syrup", Image = "https://media.istockphoto.com/id/2201053247/photo/turkish-dessert-kunefe-kunafa-kadayif-with-pistachio.jpg", Ingredients = "Kunafa, cream, syrup", Featured = true, Tags = new List<string> { "sweet", "hot" } },
            new() { Id = "7", Name = "Vanilla Ice Cream", Category = "Desserts", Price = 100, Description = "Smooth vanilla ice cream with chocolate sauce", Image = "https://images.unsplash.com/photo-1563805042-7684c019e1cb", Ingredients = "Milk, sugar, vanilla", Featured = false, Tags = new List<string> { "cold", "sweet" } },
            new() { Id = "8", Name = "Lemon Mint Juice", Category = "Drinks", Price = 100, Description = "Fresh lemon juice with mint and sugar", Image = "https://images.unsplash.com/photo-1556679343-c7306c1976bc", Ingredients = "Lemon, mint, sugar", Featured = false, Tags = new List<string> { "cold", "veg" } },
            new() { Id = "9", Name = "Turkish Coffee", Category = "Drinks", Price = 100, Description = "Traditional finely ground Turkish coffee", Image = "https://images.unsplash.com/photo-1669809374019-9a9d02b0e10d", Ingredients = "Coffee, sugar (optional)", Featured = false, Tags = new List<string> { "hot" } },
            new() { Id = "10", Name = "Orange Juice", Category = "Drinks", Price = 90, Description = "Freshly squeezed orange juice", Image = "https://images.unsplash.com/photo-1600271886742-f049cd451bba", Ingredients = "Oranges, sugar (optional)", Featured = true, Tags = new List<string> { "cold", "veg" } }
        };
    }
}
