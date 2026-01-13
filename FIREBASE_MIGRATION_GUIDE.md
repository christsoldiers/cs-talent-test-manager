# Firebase Migration Guide

This guide will help you migrate the Christ Soldiers Talent Test Manager from localStorage to Firebase Firestore.

## Prerequisites

1. A Firebase account (free tier is sufficient)
2. Node.js and npm installed
3. The application running locally

## Step 1: Create a Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add Project" or select an existing project
3. Follow the setup wizard to create your project
4. Enable Google Analytics (optional)

## Step 2: Set up Firestore Database

1. In the Firebase Console, navigate to **Firestore Database**
2. Click "Create database"
3. Choose **Start in production mode** (we'll configure rules later)
4. Select a location closest to your users
5. Click "Enable"

## Step 3: Register Your Web App

1. In the Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to "Your apps" section
3. Click the **Web** icon (</>)
4. Register your app with a nickname (e.g., "Christ Soldiers Talent Test")
5. **Copy the Firebase configuration object**

## Step 4: Configure Firebase in Your Application

1. Open `src/config/firebase.js`
2. Replace the placeholder values with your actual Firebase configuration:

```javascript
const firebaseConfig = {
  apiKey: "YOUR_API_KEY_HERE",
  authDomain: "YOUR_AUTH_DOMAIN_HERE",
  projectId: "YOUR_PROJECT_ID_HERE",
  storageBucket: "YOUR_STORAGE_BUCKET_HERE",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID_HERE",
  appId: "YOUR_APP_ID_HERE"
};
```

## Step 5: Set up Firestore Security Rules

In the Firebase Console, go to **Firestore Database** → **Rules** and set up your security rules:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Allow read/write access to authenticated users only
    // For development, you can use:
    match /{document=**} {
      allow read, write: if true;
    }
    
    // For production, implement proper authentication:
    // match /{document=**} {
    //   allow read, write: if request.auth != null;
    // }
  }
}
```

**Note:** The permissive rule above is for development only. Implement proper authentication for production.

## Step 6: Run the Migration

1. Start your development server:
   ```bash
   npm start
   ```

2. Log in as admin (username: `admin`, password: `admin123`)

3. Navigate to **Firebase Migration** from the admin dashboard

4. Click **Start Migration** button

5. Wait for the migration to complete (this may take a few minutes depending on data size)

6. Click **Verify Firebase Data** to confirm all data was migrated successfully

## Step 7: Data Structure in Firestore

The migration creates the following collections:

- **participants** - All participant registrations
- **events** - Individual event definitions
- **groupEvents** - Group event definitions
- **groupTeams** - Group team registrations
- **sections** - Section/location data with churches
- **judges** - Judge credentials and locked scores
- **results** - All scoring results
- **config** - Application configuration (points system, etc.)

## Step 8: Update Components to Use Firebase (Future Step)

Once migration is successful, you'll need to update components to use `FirebaseService` instead of `StorageService`. This involves:

1. Replacing imports:
   ```javascript
   // Old
   import StorageService from '../../services/StorageService';
   
   // New
   import FirebaseService from '../../services/FirebaseService';
   ```

2. Converting synchronous calls to async:
   ```javascript
   // Old (synchronous)
   const participants = StorageService.getParticipants();
   
   // New (asynchronous)
   const participants = await FirebaseService.getParticipants();
   ```

3. Updating component state management with async/await patterns

## Migration Verification Checklist

After migration, verify the following in Firebase Console:

- [ ] All participants are present in the `participants` collection
- [ ] Events are in the `events` collection
- [ ] Group events are in the `groupEvents` collection
- [ ] Sections with churches are in the `sections` collection
- [ ] Judge data is in the `judges` collection
- [ ] Results are in the `results` collection
- [ ] Points configuration is in the `config` collection

## Rollback Plan

If you need to rollback:

1. Your localStorage data remains intact
2. Simply remove the Firebase configuration from `firebase.js`
3. Continue using `StorageService` in your components

## Firebase Pricing

The free **Spark Plan** includes:

- 1 GiB stored data
- 50K reads per day
- 20K writes per day
- 20K deletes per day

This should be sufficient for the talent test application. Monitor usage in Firebase Console.

## Troubleshooting

### "Permission Denied" Errors

- Check your Firestore security rules
- Ensure you're using the correct Firebase configuration
- For development, use permissive rules (see Step 5)

### Migration Fails

- Check browser console for errors
- Verify Firebase configuration is correct
- Ensure Firestore is enabled in Firebase Console
- Check your internet connection

### Data Not Appearing

- Verify migration completed successfully
- Check Firebase Console → Firestore Database to see collections
- Use the "Verify Firebase Data" button in the migration utility

## Support

For issues with:
- **Firebase**: [Firebase Documentation](https://firebase.google.com/docs)
- **Application**: Contact the development team

## Next Steps

Once migration is complete and verified:

1. Update all components to use `FirebaseService`
2. Test all CRUD operations
3. Implement proper authentication (Firebase Auth)
4. Set up production security rules
5. Deploy the application

---

**Important:** Keep your Firebase configuration file (`firebase.js`) secure and never commit sensitive credentials to public repositories. Use environment variables for production deployments.
