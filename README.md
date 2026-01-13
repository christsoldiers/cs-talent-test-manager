# Christ Soldiers Talent Test Manager

A comprehensive React application for managing the Christ Soldiers youth wing talent test program at Bethel Gospel Assembly Church.

## Features

### Public Features
- **Home Page**: Welcome section with upcoming events and recent news
- **About Us Page**: Mission, vision, history, and age categories
- **Events Page**: Detailed information about all upcoming events
- **Gallery Page**: Photo gallery with category filtering
- **Contact Us Page**: Contact form and church information
- **Responsive Navigation**: Mobile-friendly navigation bar

### Admin Portal
- **Participant Registration**: Register participants for talent tests
- **Age-Based Categories**: Automatic categorization based on age
  - Junior: 6-10 years
  - Intermediate: 11-15 years
  - Senior: 16-20 years
  - Super Senior: 21-25 years
- **Event Management**: Manage various event types
  - Solo Music (Male and Female)
  - Story Writing
  - Poem Writing
  - Bible Verse Competition
- **Dashboard**: View statistics and manage all participants

### Judge Portal
- **Participant Scoring**: Score participants on multiple criteria
- **Filtering**: Filter participants by event and age category
- **Scoring Criteria**: Rate participants on 5 different aspects (0-10 points each)
- **Comments**: Add optional feedback for participants

## Installation

### Prerequisites
- Node.js (version 14 or higher)
- npm (comes with Node.js)

### Setup Instructions

1. Navigate to the project directory:
```bash
cd christ-soldiers-talent-test-manager
```

2. Install dependencies (already installed):
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

4. Open your browser and visit:
```
http://localhost:3000
```

## Usage

### Public Pages
Navigate through the public pages using the navigation menu:
- Home
- About Us
- Events
- Gallery
- Contact Us

### Admin Access
1. Click "Admin Portal" in the navigation menu
2. Use the following demo credentials:
   - **Admin Login**:
     - Username: `admin`
     - Password: `admin123`
   - **Judge Login**:
     - Username: `judge1`
     - Password: `judge123`
   - **Section Login**:
     - Pathanapuram: `pathanapuram` / `pathanapuram123`
     - Kollam: `kollam` / `kollam123`
     - Alappuzha: `alappuzha` / `alappuzha123`
     - Kottayam: `kottayam` / `kottayam123`

### Admin Functions
Once logged in as admin, you can:
- View participant statistics by age category
- Add new participants from any section
- Edit existing participant information
- Delete participants
- Assign participants to specific events and categories
- View all participants across all sections

### Section Functions
Once logged in as a section coordinator, you can:
- View participants from your specific section only
- Add new participants from your section
- Edit participant information from your section
- Delete participants from your section
- Assign participants to events
- View section-specific statistics

### Judge Functions
Once logged in as judge, you can:
- View all registered participants
- Filter participants by event or age category
- Score participants on 5 criteria (0-10 points each)
- Add comments and feedback
- Submit scores for record keeping

## Event Categories

The application supports the following talent test categories:
1. **Solo Music (Male)** - Individual singing performance
2. **Solo Music (Female)** - Individual singing performance
3. **Story Writing** - Creative writing competition
4. **Poem Writing** - Poetry composition
5. **Bible Verse Competition** - Scripture memorization and recitation

## Age Categories

Participants are automatically categorized based on their age:
- **Junior**: 6-10 years
- **Intermediate**: 11-15 years
- **Senior**: 16-20 years
- **Super Senior**: 21-25 years

## Technology Stack

- **React** (v18+) - UI framework
- **React Router DOM** - Navigation and routing
- **CSS3** - Styling with responsive design
- **Local Storage** - Data persistence (demo purposes)

## Project Structure

```
christ-soldiers-talent-test-manager/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.js
│   │   └── Navbar.css
│   ├── context/
│   │   └── AuthContext.js
│   ├── pages/
│   │   ├── Home.js
│   │   ├── Home.css
│   │   ├── About.js
│   │   ├── About.css
│   │   ├── Events.js
│   │   ├── Events.css
│   │   ├── Gallery.js
│   │   ├── Gallery.css
│   │   ├── Contact.js
│   │   ├── Contact.css
│   │   └── Admin/
│   │       ├── AdminLogin.js
│   │       ├── AdminLogin.css
│   │       ├── AdminDashboard.js
│   │       ├── AdminDashboard.css
│   │       ├── JudgeDashboard.js
│   │       └── JudgeDashboard.css
│   ├── services/
│   │   └── StorageService.js
│   ├── App.js
│   ├── App.css
│   └── index.js
├── package.json
└── README.md
```

## Data Storage

This demo application uses browser Local Storage for data persistence. In a production environment, you should:
- Replace the StorageService with actual backend API calls
- Implement proper authentication and authorization
- Use a database for data storage
- Add input validation and security measures

## Responsive Design

The application is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile devices

## Build for Production

To create a production build:

```bash
npm run build
```

This creates an optimized build in the `build` folder ready for deployment.

## Available Scripts

- `npm start` - Runs the app in development mode
- `npm test` - Launches the test runner
- `npm run build` - Builds the app for production
- `npm run eject` - Ejects from Create React App (one-way operation)

## Future Enhancements

Potential improvements for production use:
- Backend API integration
- Database integration (MongoDB, PostgreSQL, etc.)
- User authentication with JWT
- Email notifications
- PDF report generation
- Image upload for gallery
- Real-time scoring updates
- Multi-language support
- Advanced analytics and reporting

## Support

For questions or issues, please contact:
- Email: christsoldiers@bethelagc.org
- Phone: +1 (555) 123-4567

## License

This project is created for Bethel Gospel Assembly Church - Christ Soldiers youth wing.

## Acknowledgments

- Bethel Gospel Assembly Church
- Christ Soldiers Youth Wing
- All contributors and volunteers

---

**Note**: This is a demonstration application using local storage. For production use, implement proper backend services, authentication, and database integration.


### Analyzing the Bundle Size

This section has moved here: [https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size](https://facebook.github.io/create-react-app/docs/analyzing-the-bundle-size)

### Making a Progressive Web App

This section has moved here: [https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app](https://facebook.github.io/create-react-app/docs/making-a-progressive-web-app)

### Advanced Configuration

This section has moved here: [https://facebook.github.io/create-react-app/docs/advanced-configuration](https://facebook.github.io/create-react-app/docs/advanced-configuration)

### Deployment

This section has moved here: [https://facebook.github.io/create-react-app/docs/deployment](https://facebook.github.io/create-react-app/docs/deployment)

### `npm run build` fails to minify

This section has moved here: [https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify](https://facebook.github.io/create-react-app/docs/troubleshooting#npm-run-build-fails-to-minify)
