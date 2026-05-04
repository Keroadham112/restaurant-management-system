# Quick Start Guide - Food Items API

## 🚀 Setup Instructions

### Step 1: Navigate to Project Directory
```powershell
cd c:\Users\kokoa\Downloads\FoodItemAPI
```

### Step 2: Restore Dependencies
```powershell
dotnet restore
```

### Step 3: Build the Project
```powershell
dotnet build
```

### Step 4: Run the API
```powershell
dotnet run --project FoodItemAPI
```

The API will start at:
- **HTTPS**: `https://localhost:7000`
- **HTTP**: `http://localhost:5000`

### Step 5: Access Swagger UI
Open your browser and go to:
```
https://localhost:7000
```

You'll see the interactive Swagger documentation where you can test all endpoints.

---

## 🧪 Running Unit Tests

### Run All Tests
```powershell
dotnet test
```

### Run with Detailed Output
```powershell
dotnet test --verbosity detailed
```

### Run Specific Test Class
```powershell
dotnet test --filter ClassName=InMemoryDatabaseTests
```

### Expected Test Results
```
========== Test Run Summary ==========
Total Tests: 45+
Passed: 45+
Failed: 0
Skipped: 0
Duration: < 5 seconds
```

---

## 📋 Project Files Created

### Main Project Files
```
FoodItemAPI/
├── Program.cs                          # Startup configuration
├── FoodItemAPI.csproj                 # Project file
├── README.md                          # Full documentation
├── Controllers/
│   └── FoodController.cs              # API endpoints (5 endpoints)
├── Models/
│   ├── FoodItem.cs                    # Food item entity
│   └── ApiResponse.cs                 # Response wrapper
└── Services/
    └── InMemoryDatabase.cs            # Database implementation
```

### Test Project Files
```
FoodItemAPI.Tests/
├── FoodItemAPI.Tests.csproj           # Test project file
├── InMemoryDatabaseTests.cs           # 30+ database tests
└── FoodControllerTests.cs             # 15+ controller tests
```

---

## 🔗 API Endpoints Overview

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/food` | Get all food items |
| GET | `/api/food/{id}` | Get item by ID |
| POST | `/api/food` | Create new item |
| PUT | `/api/food/{id}` | Update item |
| DELETE | `/api/food/{id}` | Delete item |

---

## 📊 Key Features Implemented

✅ **In-Memory Storage**: 10 seed food items pre-loaded
✅ **CRUD Operations**: Full create, read, update, delete
✅ **Input Validation**: All fields validated
✅ **Error Handling**: HTTP 400, 404, 500 status codes
✅ **Thread Safety**: Concurrent operations supported
✅ **Logging**: Operations logged to console
✅ **CORS**: Cross-origin requests enabled
✅ **Swagger**: Interactive API documentation
✅ **Unit Tests**: 45+ tests with high coverage
✅ **Clean Architecture**: Modular, extensible design

---

## 🎯 Example API Calls

### Get All Items
```powershell
curl -X GET "https://localhost:7000/api/food"
```

### Create Item
```powershell
curl -X POST "https://localhost:7000/api/food" `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Grilled Fish",
    "category": "Main",
    "price": 180,
    "description": "Fresh grilled sea fish",
    "featured": false,
    "tags": ["hot"]
  }'
```

### Update Item
```powershell
curl -X PUT "https://localhost:7000/api/food/{id}" `
  -H "Content-Type: application/json" `
  -d '{
    "name": "Updated Name",
    "category": "Main",
    "price": 200
  }'
```

### Delete Item
```powershell
curl -X DELETE "https://localhost:7000/api/food/{id}"
```

---

## 🔍 Testing Individual Features

### Test InMemoryDatabase Directly
Run tests specific to database:
```powershell
dotnet test --filter ClassName=InMemoryDatabaseTests
```

### Test FoodController
Run tests specific to API controller:
```powershell
dotnet test --filter ClassName=FoodControllerTests
```

### Test Specific Functionality
```powershell
# Test Create operations only
dotnet test --filter Name~Create

# Test Delete operations only
dotnet test --filter Name~Delete

# Test validation
dotnet test --filter Name~Validation
```

---

## 🌐 Integrating with Frontend

The API is designed to work seamlessly with your existing JavaScript frontend. To connect:

1. **Update API Base URL** in your JavaScript:
```javascript
const API_BASE = 'https://localhost:7000';
```

2. **Update Frontend API Calls**:
```javascript
// Old: using in-memory state
const items = await apiClient.getItems();

// New: using .NET API
const response = await fetch('https://localhost:7000/api/food');
const data = await response.json();
```

3. **Handle CORS**: The API already has CORS enabled, so frontend requests will work.

---

## 🛠️ Development Commands

### Clean Build
```powershell
dotnet clean
dotnet build
```

### Watch Mode (Auto-rebuild on file changes)
```powershell
dotnet watch run --project FoodItemAPI
```

### View Project Information
```powershell
dotnet --info
```

### List NuGet Packages
```powershell
dotnet list package
```

---

## 📝 Notes

- The API uses **in-memory storage** by default (no database needed)
- **Seed data** (10 items) is automatically loaded on startup
- **Thread-safe operations** allow concurrent requests
- **Swagger documentation** updates automatically as you develop
- All **timestamps** are in UTC format

---

## ✨ Next Steps

1. ✅ Run the API and test in Swagger
2. ✅ Run all unit tests to verify functionality
3. ✅ Review the code in `FoodController` and `InMemoryDatabase`
4. ✅ Integrate with your frontend by updating API URLs
5. ✅ Consider extending to use a real database (SQL Server, MongoDB, etc.)

---

**Happy Building! 🎉**
