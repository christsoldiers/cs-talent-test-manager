# Mock Data Migration Scripts

This directory contains scripts to populate Firebase with mock/test data for development and testing.

## Available Scripts

### 1. Node.js Script (Command Line)
**File:** `migrate-mock-data.js`

A standalone Node.js script that can be run from the command line to populate Firebase with mock data.

#### Prerequisites
1. Install Firebase Admin SDK:
   ```bash
   npm install firebase-admin --save-dev
   ```

2. Download Firebase service account key:
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the file as `firebase-service-account.json` in the project root

#### Usage
Run the migration script:
```bash
npm run migrate
```

Or directly:
```bash
node scripts/migrate-mock-data.js
```

The script will:
- Ask for confirmation before proceeding
- Generate and upload mock data to Firebase
- Display progress and verification results
- Show login credentials for testing

### 2. Web Interface (In-App)
**File:** `../src/services/MockDataMigration.js`  
**Page:** `../src/pages/Admin/MockDataMigrationPage.js`

A web-based interface accessible from the admin panel.

#### Usage
1. Start the React app: `npm start`
2. Login as admin (username: `admin`, password: `admin123`)
3. Navigate to: `/admin/mock-migration`
4. Click "Start Migration"
5. Click "Verify Data" to confirm

## What Data is Created?

Both scripts create identical mock data:

- **5 Individual Events**
  - Solo Music (Male)
  - Solo Music (Female)
  - Story Writing
  - Poem Writing
  - Bible Verse Competition

- **2 Group Events**
  - Group Song
  - Group Bible Quiz

- **4 Sections**
  - Pathanapuram
  - Kollam
  - Alappuzha
  - Kottayam

- **60-80 Participants**
  - Realistic names and details
  - Assigned to sections and churches
  - Registered for 1-3 events each
  - Auto-assigned chest numbers

- **8 Group Teams** (2 per section)

- **180-240 Score Entries**
  - From 3 judges
  - For all participant-event combinations

- **3 Judge Accounts**
  - judge1, judge2, judge3
  - Password: `judge123`

- **Configuration**
  - Points config for rankings
  - Admin credentials
  - Judge credentials
  - Section credentials

## Login Credentials

After migration, you can login with:

### Admin
- Username: `admin`
- Password: `admin123`

### Judges
- Username: `judge1`, `judge2`, or `judge3`
- Password: `judge123`

### Sections
- Username: `pathanapuram`, `kollam`, `alappuzha`, or `kottayam`
- Password: `<sectionname>123` (e.g., `pathanapuram123`)

## Important Notes

⚠️ **Warning:**
- This script ADDS data to Firebase - it does NOT clear existing data first
- Running it multiple times will create duplicate entries
- To clear data, manually delete collections from Firebase Console
- Recommended: Use on a fresh/empty Firebase project for testing

## Troubleshooting

### "firebase-service-account.json not found"
Download your service account key from Firebase Console and save it in the project root.

### "Permission denied" errors
Ensure your Firebase rules allow write access, or use the service account which has admin access.

### Script hangs or times out
Check your internet connection and Firebase project configuration.

## Project Structure

```
scripts/
  ├── migrate-mock-data.js      # Node.js standalone script
  └── README.md                  # This file

src/
  └── services/
      └── MockDataMigration.js   # Web-based migration service
  └── pages/
      └── Admin/
          └── MockDataMigrationPage.js  # Web UI for migration
```
