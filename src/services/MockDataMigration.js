import FirebaseService from './FirebaseService';

/**
 * Mock Data Migration Script
 * This script creates and populates Firebase with initial mock data
 * for testing and development purposes
 */
class MockDataMigration {
  async migrateAll() {
    try {
      console.log('🚀 Starting mock data migration to Firebase...');
      
      // Create mock data
      const mockData = this.generateMockData();
      
      console.log('📊 Mock data generated:', {
        events: mockData.events.length,
        groupEvents: mockData.groupEvents.length,
        sections: mockData.sections.length,
        participants: mockData.participants.length,
        groupTeams: mockData.groupTeams.length,
        scores: mockData.results.length
      });
      
      // Migrate to Firebase
      await this.migrateData(mockData);
      
      console.log('✅ Mock data migration completed successfully!');
      return {
        success: true,
        message: 'All mock data migrated to Firebase successfully',
        data: mockData
      };
      
    } catch (error) {
      console.error('❌ Mock data migration failed:', error);
      return {
        success: false,
        message: 'Migration failed: ' + error.message,
        error
      };
    }
  }

  generateMockData() {
    const events = this.generateEvents();
    const groupEvents = this.generateGroupEvents();
    const sections = this.generateSections();
    const participants = this.generateParticipants(sections);
    const groupTeams = this.generateGroupTeams(sections, groupEvents);
    const results = this.generateScores(participants, events);
    const pointsConfig = this.generatePointsConfig();

    return {
      events,
      groupEvents,
      sections,
      participants,
      groupTeams,
      results,
      pointsConfig
    };
  }

  generateEvents() {
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

  generateGroupEvents() {
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

  generateSections() {
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

  generateParticipants(sections) {
    const participants = [];
    const firstNames = ['John', 'Mary', 'David', 'Sarah', 'Michael', 'Anna', 'James', 'Ruth', 'Peter', 'Rachel', 
                        'Paul', 'Rebecca', 'Daniel', 'Esther', 'Joseph', 'Hannah', 'Samuel', 'Deborah', 'Timothy', 'Lydia'];
    const lastNames = ['Thomas', 'George', 'John', 'Philip', 'Samuel', 'David', 'Joseph', 'Abraham', 'Jacob', 'Isaac'];
    let idCounter = 1;

    sections.forEach(section => {
      const churchNames = section.churches.map(c => c.name);
      
      // Generate 15-20 participants per section
      const participantCount = 15 + Math.floor(Math.random() * 6);
      
      for (let i = 0; i < participantCount; i++) {
        const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
        const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
        const age = 6 + Math.floor(Math.random() * 20); // Age 6-25
        const ageCategory = this.getAgeCategory(age);
        const gender = Math.random() > 0.5 ? 'Male' : 'Female';
        
        // Assign 1-3 random events
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

    // Assign chest numbers
    this.assignChestNumbers(participants);

    return participants;
  }

  getAgeCategory(age) {
    if (age >= 6 && age <= 10) return 'Junior';
    if (age >= 11 && age <= 15) return 'Intermediate';
    if (age >= 16 && age <= 20) return 'Senior';
    if (age >= 21 && age <= 25) return 'Super Senior';
    return null;
  }

  assignChestNumbers(participants) {
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

  generateGroupTeams(sections, groupEvents) {
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
          scores: [] // Will be populated by judge scoring
        });
      });
    });

    return teams;
  }

  generateScores(participants, events) {
    const scores = [];
    const judges = ['judge1', 'judge2', 'judge3'];

    participants.forEach(participant => {
      participant.eventIds.forEach(eventId => {
        judges.forEach(judgeName => {
          const criteria1 = 7 + Math.floor(Math.random() * 4); // 7-10
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

  generatePointsConfig() {
    return {
      individual: { first: 5, second: 3, third: 1 },
      group: { first: 10, second: 5, third: 3 }
    };
  }

  async migrateData(mockData) {
    console.log('📝 Migrating events...');
    for (const event of mockData.events) {
      await FirebaseService.addEvent(event);
    }

    console.log('📝 Migrating group events...');
    for (const groupEvent of mockData.groupEvents) {
      await FirebaseService.addEvent(groupEvent);
    }

    console.log('📝 Migrating sections...');
    for (const section of mockData.sections) {
      await FirebaseService.addSection(section);
    }

    console.log('📝 Migrating participants...');
    for (const participant of mockData.participants) {
      await FirebaseService.addParticipant(participant);
    }

    console.log('📝 Migrating group teams...');
    for (const team of mockData.groupTeams) {
      await FirebaseService.addGroupTeam(team);
    }

    console.log('📝 Migrating scores/results...');
    for (const score of mockData.results) {
      await FirebaseService.addScore(score);
    }

    console.log('📝 Setting up admin credentials...');
    // Admin credentials are handled by FirebaseService.getData() default values
    // No need to explicitly save them as they're created automatically

    console.log('📝 Migrating points configuration...');
    await FirebaseService.savePointsConfig(mockData.pointsConfig);

    console.log('✨ All data migrated successfully!');
  }

  async clearAllData() {
    console.log('🗑️  Clearing all Firebase data...');
    
    try {
      // Note: You would need to implement deleteAll methods in FirebaseService
      // or manually clear collections from Firebase Console
      console.warn('⚠️  Manual clearing required. Please delete collections from Firebase Console:');
      console.warn('   - participants');
      console.warn('   - events');
      console.warn('   - groupEvents');
      console.warn('   - groupTeams');
      console.warn('   - sections');
      console.warn('   - results');
      console.warn('   - config');
      console.warn('Note: Judge and section credentials are managed through the Master Data page');
      
      return {
        success: true,
        message: 'Manual clearing required - see console warnings'
      };
    } catch (error) {
      console.error('Error clearing data:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  async verifyMigration() {
    try {
      console.log('🔍 Verifying migration...');
      
      const [events, participants, sections, results, groupTeams] = await Promise.all([
        FirebaseService.getEvents(),
        FirebaseService.getParticipants(),
        FirebaseService.getSections(),
        FirebaseService.getScores(),
        FirebaseService.getGroupTeams()
      ]);
      
      const counts = {
        events: events.length,
        participants: participants.length,
        sections: sections.length,
        results: results.length,
        groupTeams: groupTeams.length
      };

      console.log('✅ Firebase data counts:', counts);
      
      return {
        success: true,
        counts
      };
    } catch (error) {
      console.error('❌ Verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new MockDataMigration();
