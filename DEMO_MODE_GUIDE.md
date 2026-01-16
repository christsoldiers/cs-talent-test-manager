# Demo Mode Guide

This application supports a demo mode that uses mock data instead of Firebase. This is useful for demonstrations, testing, and development without requiring Firebase setup.

## Enabling Demo Mode

1. Open the `.env` file in the root directory
2. Set the demo mode flag to true:
   ```
   REACT_APP_IS_DEMO=true
   ```
3. Restart the application

## Disabling Demo Mode

To return to production mode with Firebase:

1. Open the `.env` file
2. Set the demo mode flag to false:
   ```
   REACT_APP_IS_DEMO=false
   ```
3. Restart the application

## Demo Mode Features

When demo mode is enabled:

- ✅ All data is stored in memory (no database required)
- ✅ All features work identically to production
- ✅ Changes persist during the session
- ✅ Data resets when the application restarts
- ✅ No Firebase configuration or credentials needed
- ✅ Perfect for testing and demonstrations

## Demo Credentials

### Admin Login
- **Username:** `admin`
- **Password:** `admin123`

### Judge Login
- **Username:** `judge1`, `judge2`, or `judge3`
- **Password:** `judge123`

### Section Login
- **Username:** `pathanapuram`, `kollam`, `alappuzha`, or `kottayam`
- **Passwords:** 
  - `pathanapuram123`
  - `kollam123`
  - `alappuzha123`
  - `kottayam123`

## Initial Demo Data

When starting in demo mode, the system begins with:

- Empty participants list
- Empty events list
- Empty sections list
- Empty judges list
- Pre-configured admin, judge, and section credentials
- Default points configuration (Individual: 5,3,1 | Group: 10,5,3)

You can add data through the admin interface just like in production mode.

## Populating Demo Data

To quickly populate the demo environment with sample data:

1. Use the Migration Utility in the admin dashboard
2. Upload a JSON file with sample data
3. The mock service will load this data into memory

## Technical Details

Demo mode works by:

1. Checking the `REACT_APP_IS_DEMO` environment variable
2. Routing all FirebaseService calls to MockDataService
3. Storing data in JavaScript objects in memory
4. Providing the same async interface as Firebase

## Notes

- Data does NOT persist between sessions in demo mode
- Export your data before closing the application if you want to keep it
- The mock service provides the exact same API as FirebaseService
- All async/await patterns work identically
- Console will show "🎭 Running in DEMO mode - using mock data" on startup

## Troubleshooting

**Changes not appearing?**
- Make sure you restarted the app after changing `.env`
- Check the console for the demo mode message

**Still connecting to Firebase?**
- Verify `REACT_APP_IS_DEMO=true` (no quotes, no spaces)
- Environment variables must start with `REACT_APP_`
- Restart the development server

**Data disappeared?**
- Demo mode data resets on restart (by design)
- Export data before closing if needed
