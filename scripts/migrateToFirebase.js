/**
 * Firebase Data Migration Script
 * Run this script to seed initial data into Firebase
 * 
 * Usage: node scripts/migrateToFirebase.js
 */

require('dotenv').config();
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, doc, setDoc, serverTimestamp } = require('firebase/firestore');
const { getAuth, createUserWithEmailAndPassword } = require('firebase/auth');

// Firebase configuration from environment variables
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Validate configuration
if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
  console.error('❌ Error: Firebase configuration is missing!');
  console.error('Please check your .env file and ensure all REACT_APP_FIREBASE_* variables are set.');
  process.exit(1);
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// Sample Data
const events = [
  {
    id: 1,
    name: 'Solo Music (Male)',
    description: 'Individual singing performance for male participants',
    ageGroups: ['Junior', 'Intermediate', 'Senior', 'Super Senior'],
    scoringType: 'all-judges'
  },
  {
    id: 2,
    name: 'Solo Music (Female)',
    description: 'Individual singing performance for female participants',
    ageGroups: ['Junior', 'Intermediate', 'Senior', 'Super Senior'],
    scoringType: 'all-judges'
  },
  {
    id: 3,
    name: 'Story Writing',
    description: 'Creative story writing competition',
    ageGroups: ['Junior', 'Intermediate', 'Senior', 'Super Senior'],
    scoringType: 'single-judge'
  },
  {
    id: 4,
    name: 'Poem Writing',
    description: 'Poetry composition competition',
    ageGroups: ['Junior', 'Intermediate', 'Senior', 'Super Senior'],
    scoringType: 'single-judge'
  },
  {
    id: 5,
    name: 'Bible Verse Competition',
    description: 'Scripture memorization and recitation',
    ageGroups: ['Junior', 'Intermediate', 'Senior', 'Super Senior'],
    scoringType: 'all-judges'
  }
];

const groupEvents = [
  {
    id: 1,
    name: 'Group Song',
    description: 'Team singing performance - one team per section',
    maxParticipants: 10,
    scoringType: 'judge'
  },
  {
    id: 2,
    name: 'Group Bible Quiz',
    description: 'Team Bible quiz competition - one team per section',
    maxParticipants: 5,
    scoringType: 'quiz',
    questionsCount: 50
  }
];

const sections = [
  {
    id: 1,
    name: 'Pathanapuram',
    churches: [
      { name: 'Bethel Gospel Assembly Church - Pathanapuram', pastor: { name: 'Rev. John', contact: '9876543210' } },
      { name: 'Grace Gospel Church - Pathanapuram', pastor: { name: 'Rev. Paul', contact: '9876543211' } },
      { name: 'Zion Assembly - Pathanapuram', pastor: { name: 'Rev. Peter', contact: '9876543212' } },
      { name: 'Faith Gospel Church - Pathanapuram', pastor: { name: 'Rev. James', contact: '9876543213' } }
    ],
    presbyter: { name: 'Elder Thomas', contact: '9876543214' }
  },
  {
    id: 2,
    name: 'Kollam',
    churches: [
      { name: 'Bethel Gospel Assembly Church - Kollam', pastor: { name: 'Rev. David', contact: '9876543215' } },
      { name: 'Living Word Church - Kollam', pastor: { name: 'Rev. Samuel', contact: '9876543216' } },
      { name: 'New Life Assembly - Kollam', pastor: { name: 'Rev. Joseph', contact: '9876543217' } },
      { name: 'Calvary Church - Kollam', pastor: { name: 'Rev. Daniel', contact: '9876543218' } },
      { name: 'Victory Gospel Church - Kollam', pastor: { name: 'Rev. Matthew', contact: '9876543219' } }
    ],
    presbyter: { name: 'Elder Abraham', contact: '9876543220' }
  },
  {
    id: 3,
    name: 'Alappuzha',
    churches: [
      { name: 'Bethel Gospel Assembly Church - Alappuzha', pastor: { name: 'Rev. Stephen', contact: '9876543221' } },
      { name: 'Gospel Light Church - Alappuzha', pastor: { name: 'Rev. Philip', contact: '9876543222' } },
      { name: 'Pentecostal Assembly - Alappuzha', pastor: { name: 'Rev. Andrew', contact: '9876543223' } },
      { name: 'Emmanuel Gospel Church - Alappuzha', pastor: { name: 'Rev. Timothy', contact: '9876543224' } },
      { name: 'Believers Church - Alappuzha', pastor: { name: 'Rev. Mark', contact: '9876543225' } }
    ],
    presbyter: { name: 'Elder Isaac', contact: '9876543226' }
  },
  {
    id: 4,
    name: 'Kottayam',
    churches: [
      { name: 'Bethel Gospel Assembly Church - Kottayam', pastor: { name: 'Rev. Luke', contact: '9876543227' } },
      { name: 'Word of Life Church - Kottayam', pastor: { name: 'Rev. Barnabas', contact: '9876543228' } },
      { name: 'Gospel Faith Assembly - Kottayam', pastor: { name: 'Rev. Silas', contact: '9876543229' } },
      { name: 'Holy Spirit Church - Kottayam', pastor: { name: 'Rev. Titus', contact: '9876543230' } },
      { name: 'Trinity Gospel Church - Kottayam', pastor: { name: 'Rev. Benjamin', contact: '9876543231' } },
      { name: 'Covenant Church - Kottayam', pastor: { name: 'Rev. Joshua', contact: '9876543232' } }
    ],
    presbyter: { name: 'Elder Jacob', contact: '9876543233' }
  }
];

// Helper functions
function getAgeCategory(age) {
  if (age >= 6 && age <= 10) return 'Junior';
  if (age >= 11 && age <= 15) return 'Intermediate';
  if (age >= 16 && age <= 20) return 'Senior';
  if (age >= 21 && age <= 25) return 'Super Senior';
  return null;
}

function generateParticipants() {
  const participants = [];
  const firstNames = ['John', 'Mary', 'David', 'Sarah', 'Michael', 'Anna', 'James', 'Ruth', 'Peter', 'Rachel'];
  const lastNames = ['Thomas', 'George', 'John', 'Philip', 'Samuel'];
  let idCounter = 1;

  sections.forEach(section => {
    const churchNames = section.churches.map(c => c.name);
    const participantCount = 15;
    
    for (let i = 0; i < participantCount; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const age = 6 + Math.floor(Math.random() * 20);
      const ageCategory = getAgeCategory(age);
      const gender = Math.random() > 0.5 ? 'Male' : 'Female';
      
      const eventCount = 1 + Math.floor(Math.random() * 2);
      const eventIds = [];
      const availableEvents = gender === 'Male' ? [1, 3, 4, 5] : [2, 3, 4, 5];
      
      for (let j = 0; j < eventCount; j++) {
        const eventId = availableEvents[Math.floor(Math.random() * availableEvents.length)];
        if (!eventIds.includes(eventId)) {
          eventIds.push(eventId);
        }
      }

      participants.push({
        id: idCounter++,
        name: `${firstName} ${lastName}`,
        age,
        ageCategory,
        gender,
        email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@example.com`,
        phone: `98765${String(43210 + i).padStart(5, '0')}`,
        churchName: churchNames[Math.floor(Math.random() * churchNames.length)],
        section: section.name,
        eventIds,
        chestNumber: null,
        registrationDate: new Date(2026, 0, 5).toISOString()
      });
    }
  });

  assignChestNumbers(participants);
  return participants;
}

function assignChestNumbers(participants) {
  const categoryPrefixes = { 'Junior': 'J', 'Intermediate': 'I', 'Senior': 'S', 'Super Senior': 'SS' };
  const counters = { 'Junior': 1, 'Intermediate': 1, 'Senior': 1, 'Super Senior': 1 };

  participants.forEach(participant => {
    const prefix = categoryPrefixes[participant.ageCategory];
    const number = counters[participant.ageCategory];
    participant.chestNumber = `${prefix}-${String(number).padStart(3, '0')}`;
    counters[participant.ageCategory]++;
  });
}

function generateGroupTeams() {
  const teams = [];
  let idCounter = 1;

  sections.forEach(section => {
    groupEvents.forEach(event => {
      teams.push({
        id: idCounter++,
        groupEventId: event.id,
        sectionId: section.id,
        teamName: `${section.name} ${event.name} Team`,
        participants: [`Participant 1`, `Participant 2`, `Participant 3`],
        scores: []
      });
    });
  });

  return teams;
}

function generateScores(participants) {
  const scores = [];
  const judges = ['judge1', 'judge2', 'judge3'];

  participants.forEach(participant => {
    participant.eventIds.forEach(eventId => {
      judges.forEach(judgeName => {
        const criteria1 = 7 + Math.floor(Math.random() * 4);
        const criteria2 = 7 + Math.floor(Math.random() * 4);
        const criteria3 = 7 + Math.floor(Math.random() * 4);
        const criteria4 = 7 + Math.floor(Math.random() * 4);
        const criteria5 = 7 + Math.floor(Math.random() * 4);

        scores.push({
          id: `${participant.id}-${eventId}-${judgeName}`,
          participantId: participant.id,
          eventId: eventId,
          judgeName: judgeName,
          criteria1,
          criteria2,
          criteria3,
          criteria4,
          criteria5,
          totalScore: criteria1 + criteria2 + criteria3 + criteria4 + criteria5,
          comments: '',
          submittedAt: new Date(2026, 0, 11).toISOString()
        });
      });
    });
  });

  return scores;
}

// Migration functions
async function migrateEvents() {
  console.log('Migrating events...');
  const eventsCol = collection(db, 'events');
  
  for (const event of events) {
    try {
      const docRef = doc(eventsCol, String(event.id));
      await setDoc(docRef, {
        ...event,
        createdAt: serverTimestamp(),
      });
      console.log(`✓ Added event: ${event.name}`);
    } catch (error) {
      console.error(`✗ Error adding ${event.name}:`, error.message);
    }
  }
}

async function migrateGroupEvents() {
  console.log('\nMigrating group events...');
  const groupEventsCol = collection(db, 'groupEvents');
  
  for (const event of groupEvents) {
    try {
      const docRef = doc(groupEventsCol, String(event.id));
      await setDoc(docRef, {
        ...event,
        createdAt: serverTimestamp(),
      });
      console.log(`✓ Added group event: ${event.name}`);
    } catch (error) {
      console.error(`✗ Error adding ${event.name}:`, error.message);
    }
  }
}

async function migrateSections() {
  console.log('\nMigrating sections...');
  const sectionsCol = collection(db, 'sections');
  
  for (const section of sections) {
    try {
      const docRef = doc(sectionsCol, String(section.id));
      await setDoc(docRef, {
        ...section,
        createdAt: serverTimestamp(),
      });
      console.log(`✓ Added section: ${section.name}`);
    } catch (error) {
      console.error(`✗ Error adding ${section.name}:`, error.message);
    }
  }
}

async function migrateParticipants() {
  console.log('\nMigrating participants...');
  const participants = generateParticipants();
  const participantsCol = collection(db, 'participants');
  
  for (const participant of participants) {
    try {
      const docRef = doc(participantsCol, String(participant.id));
      await setDoc(docRef, {
        ...participant,
        createdAt: serverTimestamp(),
      });
      console.log(`✓ Added participant: ${participant.name}`);
    } catch (error) {
      console.error(`✗ Error adding participant:`, error.message);
    }
  }
  
  return participants;
}

async function migrateGroupTeams() {
  console.log('\nMigrating group teams...');
  const teams = generateGroupTeams();
  const teamsCol = collection(db, 'groupTeams');
  
  for (const team of teams) {
    try {
      const docRef = doc(teamsCol, String(team.id));
      await setDoc(docRef, {
        ...team,
        createdAt: serverTimestamp(),
      });
      console.log(`✓ Added team: ${team.teamName}`);
    } catch (error) {
      console.error(`✗ Error adding team:`, error.message);
    }
  }
}

async function migrateScores(participants) {
  console.log('\nMigrating scores...');
  const scores = generateScores(participants);
  const scoresCol = collection(db, 'results');
  
  for (const score of scores) {
    try {
      const docRef = doc(scoresCol, score.id);
      await setDoc(docRef, {
        ...score,
        createdAt: serverTimestamp(),
      });
    } catch (error) {
      console.error(`✗ Error adding score:`, error.message);
    }
  }
  console.log(`✓ Added ${scores.length} score entries`);
}

async function migrateConfig() {
  console.log('\nMigrating configuration...');
  const configCol = collection(db, 'config');
  
  try {
    await setDoc(doc(configCol, 'pointsConfig'), {
      individual: { first: 5, second: 3, third: 1 },
      group: { first: 10, second: 5, third: 3 }
    });
    console.log('✓ Added points configuration');

    await setDoc(doc(configCol, 'adminCredentials'), {
      username: 'admin',
      password: 'admin123'
    });
    console.log('✓ Added admin credentials');

    // Judge and section credentials should be managed through Master Data page
    console.log('ℹ️  Judge and section credentials will be managed through the Master Data page');
  } catch (error) {
    console.error('✗ Error adding config:', error.message);
  }
}

// Run migration
async function runMigration() {
  console.log('=================================================');
  console.log('CS Talent Test Manager - Firebase Data Migration');
  console.log('=================================================\n');
  
  try {
    await migrateConfig();
    
    console.log('\n=================================================');
    console.log('Migration Completed Successfully!');
    console.log('=================================================\n');
    
    console.log('Login Credentials:');
    console.log('------------------');
    console.log('Admin:');
    console.log('  Username: admin');
    console.log('  Password: admin123\n');
    console.log('Note: All master data (events, sections, judges, participants, etc.) should be created through the Master Data page.\n');
    
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    process.exit(1);
  }
}

// Execute migration
runMigration();
