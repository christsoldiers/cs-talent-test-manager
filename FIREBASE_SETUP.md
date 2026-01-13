# Firebase Setup and Migration Guide

## Overview
This guide will help you set up Firebase for the Christ Soldiers Talent Test Manager application and migrate your existing localStorage data to Firebase Firestore.

## Prerequisites
- A Google account
- Firebase project created at [Firebase Console](https://console.firebase.google.com/)

## Step 1: Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project"
3. Enter project name: `christ-soldiers-talent-test`
4. Follow the setup wizard
5. Enable Google Analytics (optional)

## Step 2: Register Your Web App

1. In Firebase Console, click the web icon (</>)
2. Register app with nickname: `talent-test-manager`
3. Copy the Firebase configuration object

## Step 3: Configure Firebase in Your App

1. Open `src/config/firebase.js`
2. Replace the placeholder config with your actual Firebase config:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_ACTUAL_API_KEY",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

## Step 4: Enable Firestore Database

1. In Firebase Console, go to "Firestore Database"
2. Click "Create database"
3. Start in **Test mode** (for development)
4. Choose your preferred location
5. Click "Enable"

### Production Security Rules (Update Later)

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow authenticated users to read/write their own data
    match /{collection}/{document=**} {
      allow read: if true; // Public read for results
      allow write: if request.auth != null; // Only authenticated users can write
    }
  }
}
```

## Step 5: Run the Migration

1. Start your React app: `npm start`
2. Login as admin
3. Navigate to **"🔄 Firebase Migration"** in the admin dashboard
4. Review the migration information
5. Click **"Start Migration"** button
6. Wait for migration to complete
7. Click **"Verify Firebase Data"** to confirm

## Step 6: Verify Migration

The migration utility will show you the count of migrated records:

- Events
- Participants
- Sections
- Judges
- Group Teams
- Results

Check the Firebase Console under Firestore Database to see your collections.

## What Gets Migrated

### Collections Created:
1. **participants** - All participant registrations
2. **events** - Individual events (Solo Music, Story Writing, etc.)
3. **groupEvents** - Group events (Group Song, Group Bible Quiz)
4. **groupTeams** - Team registrations for group events
5. **sections** - Sections with their churches
6. **judges** - Judge credentials and locked scores
7. **results** - All scoring data
8. **config** - Points configuration

## Next Steps (After Migration)

### Phase 1: Test with Firebase (Current State)
- Migration creates all data in Firebase
- App still uses localStorage (StorageService)
- You can verify data in Firebase Console
- No functionality changes yet

### Phase 2: Switch to Firebase (Future Work)
To actually use Firebase instead of localStorage, you need to:

1. Update each component to use `FirebaseService` instead of `StorageService`
2. Handle async operations (Firebase returns Promises)
3. Add loading states for async data fetching
4. Implement real-time updates using Firestore listeners
5. Add error handling for network issues

Example conversion:
```javascript
// Old (localStorage - synchronous)
const participants = StorageService.getParticipants();

// New (Firebase - asynchronous)
const [participants, setParticipants] = useState([]);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const loadData = async () => {
    setLoading(true);
    const data = await FirebaseService.getParticipants();
    setParticipants(data);
    setLoading(false);
  };
  loadData();
}, []);
```

## Firebase vs localStorage

### localStorage (Current)
✅ Fast and synchronous
✅ Works offline
✅ No setup required
❌ Limited to single browser
❌ No real-time sync
❌ Data lost if cleared

### Firebase (After Migration)
✅ Syncs across devices
✅ Real-time updates
✅ Scalable and secure
✅ Cloud backup
❌ Requires internet
❌ Async operations (more complex code)

## Troubleshooting

### Migration Failed
- Check Firebase config is correct
- Verify Firestore is enabled
- Check browser console for errors
- Ensure you have internet connection

### Data Not Appearing
- Verify in Firebase Console under Firestore Database
- Check security rules allow read access
- Look for errors in browser console

### Permission Denied
- Update Firestore security rules to allow access
- Start in test mode for development

## Support

For issues or questions:
1. Check browser console for errors
2. Verify Firebase configuration
3. Review Firestore security rules
4. Check network connectivity

---

**Note**: The app will continue to use localStorage until you update the components to use FirebaseService. The migration is the first step - actual implementation of Firebase throughout the app is a separate task.
