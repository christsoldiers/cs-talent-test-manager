#!/usr/bin/env node

/**
 * Mock Data Migration Script (Node.js standalone)
 * 
 * This script can be run directly from the command line to populate
 * Firebase with mock data for testing and development.
 * 
 * Usage:
 *   node scripts/migrate-mock-data.js
 * 
 * Or add to package.json scripts:
 *   "migrate": "node scripts/migrate-mock-data.js"
 * 
 * Then run:
 *   npm run migrate
 */

// Import Firebase Admin SDK
const admin = require('firebase-admin');
const readline = require('readline');

// Initialize Firebase Admin
let db;

function initializeFirebase() {
  try {
    // Check if already initialized
    if (admin.apps.length === 0) {
      // Try to load service account key
      try {
        const serviceAccount = require('../firebase-service-account.json');
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      } catch (error) {
        console.error('❌ Error: firebase-service-account.json not found.');
        console.error('Please download your service account key from Firebase Console:');
        console.error('1. Go to Project Settings > Service Accounts');
        console.error('2. Click "Generate New Private Key"');
        console.error('3. Save as firebase-service-account.json in project root');
        process.exit(1);
      }
    }
    
    db = admin.firestore();
    console.log('✅ Firebase initialized successfully');
    return true;
  } catch (error) {
    console.error('❌ Error initializing Firebase:', error.message);
    return false;
  }
}

// Mock Data Generators
function generateEvents() {
  return [
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
}

function generateGroupEvents() {
  return [
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
}

function generateSections() {
  return [
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
}

function getAgeCategory(age) {
  if (age >= 6 && age <= 10) return 'Junior';
  if (age >= 11 && age <= 15) return 'Intermediate';
  if (age >= 16 && age <= 20) return 'Senior';
  if (age >= 21 && age <= 25) return 'Super Senior';
  return null;
}

function generateParticipants(sections) {
  const participants = [];
  const firstNames = ['John', 'Mary', 'David', 'Sarah', 'Michael', 'Anna', 'James', 'Ruth', 'Peter', 'Rachel', 
                      'Paul', 'Rebecca', 'Daniel', 'Esther', 'Joseph', 'Hannah', 'Samuel', 'Deborah', 'Timothy', 'Lydia'];
  const lastNames = ['Thomas', 'George', 'John', 'Philip', 'Samuel', 'David', 'Joseph', 'Abraham', 'Jacob', 'Isaac'];
  let idCounter = 1;

  sections.forEach(section => {
    const churchNames = section.churches.map(c => c.name);
    const participantCount = 15 + Math.floor(Math.random() * 6);
    
    for (let i = 0; i < participantCount; i++) {
      const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
      const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
      const age = 6 + Math.floor(Math.random() * 20);
      const ageCategory = getAgeCategory(age);
      const gender = Math.random() > 0.5 ? 'Male' : 'Female';
      
      const eventCount = 1 + Math.floor(Math.random() * 3);
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
        registrationDate: new Date(2026, 0, 5 + Math.floor(Math.random() * 5)).toISOString()
      });
    }
  });

  assignChestNumbers(participants);
  return participants;
}

function assignChestNumbers(participants) {
  const categoryPrefixes = {
    'Junior': 'J',
    'Intermediate': 'I',
    'Senior': 'S',
    'Super Senior': 'SS'
  };

  const counters = {
    'Junior': 1,
    'Intermediate': 1,
    'Senior': 1,
    'Super Senior': 1
  };

  participants.forEach(participant => {
    const prefix = categoryPrefixes[participant.ageCategory];
    const number = counters[participant.ageCategory];
    participant.chestNumber = `${prefix}-${String(number).padStart(3, '0')}`;
    counters[participant.ageCategory]++;
  });
}

function generateGroupTeams(sections, groupEvents) {
  const teams = [];
  let idCounter = 1;

  sections.forEach(section => {
    groupEvents.forEach(event => {
      const teamName = `${section.name} ${event.name} Team`;
      const maxParticipants = event.maxParticipants || 5;
      const participantCount = Math.max(3, Math.floor(Math.random() * maxParticipants));
      
      const participants = [];
      for (let i = 0; i < participantCount; i++) {
        participants.push(`Participant ${i + 1}`);
      }

      teams.push({
        id: idCounter++,
        groupEventId: event.id,
        sectionId: section.id,
        teamName,
        participants,
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
        const totalScore = criteria1 + criteria2 + criteria3 + criteria4 + criteria5;

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
          totalScore,
          comments: '',
          submittedAt: new Date(2026, 0, 11 + judges.indexOf(judgeName)).toISOString()
        });
      });
    });
  });

  return scores;
}

function generateJudges() {
  return [
    {
      id: 'judge1',
      username: 'judge1',
      password: 'judge123',
      name: 'Judge One',
      lockedScores: []
    },
    {
      id: 'judge2',
      username: 'judge2',
      password: 'judge123',
      name: 'Judge Two',
      lockedScores: []
    },
    {
      id: 'judge3',
      username: 'judge3',
      password: 'judge123',
      name: 'Judge Three',
      lockedScores: []
    }
  ];
}

function generatePointsConfig() {
  return {
    individual: { first: 5, second: 3, third: 1 },
    group: { first: 10, second: 5, third: 3 }
  };
}

// Migration functions
async function migrateCollection(collectionName, data, idField = 'id') {
  console.log(`📝 Migrating ${collectionName}...`);
  const batch = db.batch();
  
  for (const item of data) {
    const docId = String(item[idField]);
    const docRef = db.collection(collectionName).doc(docId);
    batch.set(docRef, item);
  }
  
  await batch.commit();
  console.log(`✅ Migrated ${data.length} ${collectionName}`);
}

async function migrateConfig(configName, data) {
  console.log(`📝 Migrating ${configName}...`);
  await db.collection('config').doc(configName).set(data);
  console.log(`✅ Migrated ${configName}`);
}

async function migrateAll() {
  console.log('🚀 Starting mock data migration...\n');
  
  const events = generateEvents();
  const groupEvents = generateGroupEvents();
  const sections = generateSections();
  const participants = generateParticipants(sections);
  const groupTeams = generateGroupTeams(sections, groupEvents);
  const scores = generateScores(participants);
  const judges = generateJudges();
  const pointsConfig = generatePointsConfig();

  console.log('📊 Generated mock data:');
  console.log(`   - Events: ${events.length}`);
  console.log(`   - Group Events: ${groupEvents.length}`);
  console.log(`   - Sections: ${sections.length}`);
  console.log(`   - Participants: ${participants.length}`);
  console.log(`   - Group Teams: ${groupTeams.length}`);
  console.log(`   - Scores: ${scores.length}`);
  console.log(`   - Judges: ${judges.length}\n`);

  try {
    await migrateCollection('events', events);
    await migrateCollection('groupEvents', groupEvents);
    await migrateCollection('sections', sections);
    await migrateCollection('participants', participants);
    await migrateCollection('groupTeams', groupTeams);
    await migrateCollection('results', scores, 'id');
    await migrateCollection('judges', judges, 'id');
    await migrateConfig('pointsConfig', pointsConfig);
    await migrateConfig('adminCredentials', { username: 'admin', password: 'admin123' });
    await migrateConfig('judgeCredentials', { 
      judges: [
        { username: 'judge1', password: 'judge123' },
        { username: 'judge2', password: 'judge123' },
        { username: 'judge3', password: 'judge123' }
      ]
    });
    await migrateConfig('sectionCredentials', {
      sections: [
        { username: 'pathanapuram', password: 'pathanapuram123', section: 'Pathanapuram' },
        { username: 'kollam', password: 'kollam123', section: 'Kollam' },
        { username: 'alappuzha', password: 'alappuzha123', section: 'Alappuzha' },
        { username: 'kottayam', password: 'kottayam123', section: 'Kottayam' }
      ]
    });

    console.log('\n✅ Migration completed successfully! 🎉');
    console.log('\nYou can now:');
    console.log('  - Login as admin (username: admin, password: admin123)');
    console.log('  - Login as judge (username: judge1/judge2/judge3, password: judge123)');
    console.log('  - Login as section (username: pathanapuram/kollam/alappuzha/kottayam, password: <section>123)');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    throw error;
  }
}

async function verifyMigration() {
  console.log('\n🔍 Verifying migration...\n');
  
  try {
    const collections = ['events', 'groupEvents', 'sections', 'participants', 'groupTeams', 'results', 'judges'];
    
    for (const collectionName of collections) {
      const snapshot = await db.collection(collectionName).get();
      console.log(`   ${collectionName}: ${snapshot.size} documents`);
    }
    
    console.log('\n✅ Verification completed');
  } catch (error) {
    console.error('❌ Verification failed:', error);
  }
}

// Interactive prompt
function askQuestion(query) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise(resolve => rl.question(query, ans => {
    rl.close();
    resolve(ans);
  }));
}

// Main execution
async function main() {
  console.log('╔════════════════════════════════════════════════╗');
  console.log('║   Mock Data Migration Script for Firebase     ║');
  console.log('║   CS Talent Test Manager                       ║');
  console.log('╚════════════════════════════════════════════════╝\n');

  if (!initializeFirebase()) {
    process.exit(1);
  }

  console.log('\n⚠️  WARNING: This will add data to your Firebase database.');
  console.log('Make sure you are targeting the correct project!\n');

  const answer = await askQuestion('Continue with migration? (yes/no): ');
  
  if (answer.toLowerCase() !== 'yes' && answer.toLowerCase() !== 'y') {
    console.log('\n❌ Migration cancelled.');
    process.exit(0);
  }

  try {
    await migrateAll();
    await verifyMigration();
    console.log('\n✨ All done! Your Firebase database is now populated with mock data.\n');
    process.exit(0);
  } catch (error) {
    console.error('\n❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script
main();
