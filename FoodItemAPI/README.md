# Food Items API - .NET Core Web API

A RESTful Web API built with .NET Core 6.0 for managing food items with in-memory storage. This project demonstrates clean architecture principles, CRUD operations, comprehensive error handling, and full test coverage.

## 📋 Features

✅ **In-Memory Database**: Efficient in-memory storage using thread-safe operations
✅ **Complete CRUD Operations**: Create, Read, Update, Delete food items
✅ **RESTful API Design**: Standard HTTP methods and status codes
✅ **Error Handling**: Comprehensive error handling with appropriate HTTP status codes
✅ **Input Validation**: Full validation of all inputs (name, category, price, etc.)
✅ **Swagger Documentation**: Interactive API documentation and testing interface
✅ **Unit Tests**: 40+ unit tests covering database and controller operations
✅ **Thread Safety**: Concurrent operation support with locking mechanisms
✅ **CORS Support**: Cross-origin resource sharing enabled for frontend integration
✅ **Logging**: Integrated logging for tracking operations and errors

## 🏗️ Project Structure

```
FoodItemAPI/
├── Controllers/
│   └── FoodController.cs          # API endpoints
├── Models/
│   ├── FoodItem.cs               # Food item entity model
│   └── ApiResponse.cs            # Standardized API response
├── Services/
│   └── InMemoryDatabase.cs       # In-memory database with CRUD
├── Program.cs                    # Startup configuration
├── FoodItemAPI.csproj           # Main project file
│
FoodItemAPI.Tests/
├── InMemoryDatabaseTests.cs      # Database unit tests (30+ tests)
├── FoodControllerTests.cs        # Controller unit tests (15+ tests)
└── FoodItemAPI.Tests.csproj      # Test project file
│
└── README.md                     # This file
```

## 🚀 Getting Started

### Prerequisites

- .NET 6.0 SDK or later
- Visual Studio 2022, Visual Studio Code, or any .NET IDE

### Installation

1. **Clone or Extract the Project**
   ```bash
   cd FoodItemAPI
   ```

2. **Restore NuGet Packages**
   ```bash
   dotnet restore
   ```

3. **Build the Solution**
   ```bash
   dotnet build
   ```

4. **Run the API**
   ```bash
   dotnet run --project FoodItemAPI
   ```

5. **Run Unit Tests**
   ```bash
   dotnet test
   ```

## 📚 API Documentation

### Base URL
```
https://localhost:7000/api/food
```

### Endpoints

#### 1. Get All Food Items
```http
GET /api/food
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Retrieved 10 food items",
  "data": [
    {
      "id": "abc123",
      "name": "Hummus Starter",
      "category": "Starters",
      "price": 100,
      "description": "Creamy hummus with olive oil and lemon",
      "image": "https://example.com/image.jpg",
      "ingredients": "Chickpeas, tahini, olive oil, lemon, garlic",
      "featured": true,
      "tags": ["veg"],
      "createdAt": "2024-01-01T10:00:00Z",
      "updatedAt": "2024-01-01T10:00:00Z"
    }
  ],
  "statusCode": 200
}
```

---

#### 2. Get Food Item by ID
```http
GET /api/food/{id}
```

**Parameters:**
- `id` (string, required): Food item ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Food item retrieved successfully",
  "data": {
    "id": "abc123",
    "name": "Hummus Starter",
    "category": "Starters",
    "price": 100,
    ...
  },
  "statusCode": 200
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Food item not found",
  "data": null,
  "statusCode": 404
}
```

---

#### 3. Create a New Food Item
```http
POST /api/food
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Chicken Shawarma",
  "category": "Main",
  "price": 150,
  "description": "Grilled chicken shawarma with special sauce",
  "image": "https://example.com/shawarma.jpg",
  "ingredients": "Chicken, spices, bread, sauce",
  "featured": true,
  "tags": ["hot", "spicy"]
}
```

**Response (201 Created):**
```json
{
  "success": true,
  "message": "Food item created successfully",
  "data": {
    "id": "new-id-123",
    "name": "Chicken Shawarma",
    "category": "Main",
    "price": 150,
    ...
    "createdAt": "2024-01-02T10:00:00Z",
    "updatedAt": "2024-01-02T10:00:00Z"
  },
  "statusCode": 201
}
```

**Response (400 Bad Request):**
```json
{
  "success": false,
  "message": "Item name is required",
  "data": null,
  "statusCode": 400
}
```

---

#### 4. Update a Food Item
```http
PUT /api/food/{id}
Content-Type: application/json
```

**Parameters:**
- `id` (string, required): Food item ID

**Request Body:**
```json
{
  "name": "Updated Shawarma",
  "category": "Main",
  "price": 160,
  "description": "Updated description",
  "image": "https://example.com/shawarma.jpg",
  "ingredients": "Updated ingredients",
  "featured": false,
  "tags": ["hot"]
}
```

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Food item updated successfully",
  "data": {
    "id": "existing-id",
    "name": "Updated Shawarma",
    "category": "Main",
    "price": 160,
    ...
    "updatedAt": "2024-01-02T11:30:00Z"
  },
  "statusCode": 200
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Food item not found",
  "data": null,
  "statusCode": 404
}
```

---

#### 5. Delete a Food Item
```http
DELETE /api/food/{id}
```

**Parameters:**
- `id` (string, required): Food item ID

**Response (200 OK):**
```json
{
  "success": true,
  "message": "Food item deleted successfully",
  "data": null,
  "statusCode": 200
}
```

**Response (404 Not Found):**
```json
{
  "success": false,
  "message": "Food item not found",
  "data": null,
  "statusCode": 404
}
```

---

## 🔍 Interactive API Testing

Once the API is running, open your browser and navigate to:

```
https://localhost:7000
```

This will open the Swagger UI where you can:
- View all endpoints
- Test API calls directly from the browser
- See request/response examples
- Download the OpenAPI specification

## ✅ Unit Tests

The project includes comprehensive unit tests covering:

### InMemoryDatabase Tests (30+ tests)
- ✅ GetAll operations
- ✅ GetById with valid/invalid IDs
- ✅ Create operations with validation
- ✅ Update operations with edge cases
- ✅ Delete operations
- ✅ Thread safety and concurrent operations

### FoodController Tests (15+ tests)
- ✅ All HTTP endpoints
- ✅ Status code validation
- ✅ Response structure validation
- ✅ Error handling scenarios
- ✅ Input validation

### Running Tests

```bash
# Run all tests
dotnet test

# Run with verbose output
dotnet test --verbosity detailed

# Run specific test class
dotnet test --filter ClassName=InMemoryDatabaseTests

# Run with code coverage
dotnet test /p:CollectCoverage=true
```

## 📝 Input Validation Rules

All operations enforce the following validation:

| Field | Rules |
|-------|-------|
| **Name** | Required, minimum 1 character |
| **Category** | Required, non-empty |
| **Price** | Required, must be ≥ 0 |
| **Description** | Optional |
| **Image** | Optional, valid URL format |
| **Ingredients** | Optional |
| **Featured** | Boolean, defaults to false |
| **Tags** | Optional array of strings |

## 🔒 Error Handling

The API handles various error scenarios:

| Status Code | Scenario |
|---|---|
| **200** | Successful GET, PUT, DELETE |
| **201** | Successful POST (item created) |
| **400** | Bad request, validation error, missing fields |
| **404** | Item not found |
| **500** | Server error |

All error responses include a descriptive message to help debugging.

## 🔄 Threading and Concurrency

The InMemoryDatabase implements thread-safe operations using lock mechanisms:

```csharp
private readonly object _lock = new object();

public FoodItem Create(FoodItem item)
{
    lock (_lock)
    {
        // Thread-safe operation
        _items.Add(item);
    }
}
```

This ensures data consistency even under concurrent access.

## 🛠️ Architecture Highlights

### Modular Design
- Separation of concerns (Models, Services, Controllers)
- Interface-based design for easy testing and extension
- Dependency injection for loose coupling

### Data Models
- **FoodItem**: Core entity with validation
- **ApiResponse<T>**: Standardized API responses with helper methods

### Service Layer
- **InMemoryDatabase**: Implements CRUD with thread safety
- **IFoodDatabase**: Interface for future database implementations

### API Layer
- **FoodController**: Handles HTTP requests and responses
- Comprehensive error handling and logging

## 🚀 Future Enhancements

To extend this API to use a real database:

1. **Add Entity Framework Core**
   ```bash
   dotnet add package Microsoft.EntityFrameworkCore
   dotnet add package Microsoft.EntityFrameworkCore.SqlServer
   ```

2. **Replace InMemoryDatabase**
   ```csharp
   public class SqlDatabase : IFoodDatabase
   {
       private readonly FoodDbContext _context;
       // Implement CRUD using EF Core
   }
   ```

3. **Add Migrations**
   ```bash
   dotnet ef migrations add InitialCreate
   dotnet ef database update
   ```

## 📦 Dependencies

### Main Project
- **Swashbuckle.AspNetCore**: Swagger/OpenAPI support

### Test Project
- **xUnit**: Testing framework
- **Moq**: Mocking library (included via xUnit)
- **Microsoft.NET.Test.Sdk**: Test infrastructure

## 🐛 Troubleshooting

### Port Already in Use
If port 7000 is in use, change it in `launchSettings.json`:
```json
"profiles": {
  "https": {
    "commandName": "Project",
    "dotnetRunMessages": true,
    "launchBrowser": true,
    "launchUrl": "swagger/ui",
    "applicationUrl": "https://localhost:7001;http://localhost:5001"
  }
}
```

### CORS Issues
Ensure CORS is enabled in `Program.cs`:
```csharp
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", builder =>
    {
        builder.AllowAnyOrigin().AllowAnyMethod().AllowAnyHeader();
    });
});
```

## 📄 License

This project is provided as-is for educational and commercial use.

## 👨‍💻 Contributing

Contributions are welcome! Please ensure:
- All tests pass before submitting changes
- New features include unit tests
- Code follows the existing style and patterns
- API documentation is updated

## 📞 Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Happy Coding! 🎉**
