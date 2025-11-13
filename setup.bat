@echo off
echo.
echo 🚀 MongoDB Atlas Admin Panel Setup
echo ==================================
echo.

REM Check if .env file exists
if not exist .env (
    echo ⚠️  .env file not found!
    echo.
    echo 📝 Creating .env file from template...
    copy .env.example .env
    echo ✅ .env file created!
    echo.
    echo 📋 Next steps:
    echo 1. Open .env file in your editor
    echo 2. Replace the MongoDB connection string:
    echo    - Get it from: https://www.mongodb.com/cloud/atlas
    echo    - Format: mongodb+srv://USERNAME:PASSWORD@cluster0.xxxxx.mongodb.net/admin_panel
    echo 3. Save the file
    echo 4. Run: npm run server
    echo.
) else (
    echo ✅ .env file found!
)

echo.
echo 📚 Available commands:
echo   npm run server    - Start backend server
echo   npm run dev       - Start frontend development
echo   npm run dev:all   - Start both (requires concurrently^)
echo.
echo 📖 Documentation:
echo   - MONGODB_SETUP.md - Complete MongoDB Atlas setup guide
echo   - DATABASE_SETUP.md - Database architecture overview
echo.
pause
