// Mock storage service - In production, replace with actual backend API calls
class StorageService {
  constructor() {
    this.storageKey = 'christSoldiersData';
    this.initializeStorage();
  }

  initializeStorage() {
    const existingData = localStorage.getItem(this.storageKey);
    
    if (!existingData) {
      const initialData = {
        participants: this.generateMockParticipants(),
        events: [
          {
            id: 1,
            name: 'Solo Music (Male)',
            description: 'Individual singing performance for male participants',
            ageGroups: ['Junior', 'Intermediate', 'Senior', 'Super Senior'],
            scoringType: 'all-judges' // 'all-judges' or 'single-judge'
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
        ],
        groupEvents: [
          {
            id: 1,
            name: 'Group Song',
            description: 'Team singing performance - one team per section',
            maxParticipants: 10,
            scoringType: 'judge' // Scored by judges
          },
          {
            id: 2,
            name: 'Group Bible Quiz',
            description: 'Team Bible quiz competition - one team per section',
            maxParticipants: 5,
            scoringType: 'quiz', // Score based on correct answers
            questionsCount: 50 // Total questions in the quiz
          }
        ],
        groupTeams: [], // { id, groupEventId, sectionId, teamName, participants: [], scores: [] }
        sections: [
          {
            id: 1,
            name: 'Pathanapuram',
            churches: [
              'Bethel Gospel Assembly Church - Pathanapuram',
              'Grace Gospel Church - Pathanapuram',
              'Zion Assembly - Pathanapuram',
              'Faith Gospel Church - Pathanapuram'
            ]
          },
          {
            id: 2,
            name: 'Kollam',
            churches: [
              'Bethel Gospel Assembly Church - Kollam',
              'Living Word Church - Kollam',
              'New Life Assembly - Kollam',
              'Calvary Church - Kollam',
              'Victory Gospel Church - Kollam'
            ]
          },
          {
            id: 3,
            name: 'Alappuzha',
            churches: [
              'Bethel Gospel Assembly Church - Alappuzha',
              'Gospel Light Church - Alappuzha',
              'Pentecostal Assembly - Alappuzha',
              'Emmanuel Gospel Church - Alappuzha',
              'Believers Church - Alappuzha'
            ]
          },
          {
            id: 4,
            name: 'Kottayam',
            churches: [
              'Bethel Gospel Assembly Church - Kottayam',
              'Word of Life Church - Kottayam',
              'Gospel Faith Assembly - Kottayam',
              'Holy Spirit Church - Kottayam',
              'Trinity Gospel Church - Kottayam',
              'Covenant Church - Kottayam'
            ]
          }
        ],
        scores: this.generateMockScores(),
        judgeLocks: this.generateMockJudgeLocks(),
        adminCredentials: {
          username: 'admin',
          password: 'admin123'
        },
        judgeCredentials: [
          { username: 'judge1', password: 'judge123' },
          { username: 'judge2', password: 'judge123' },
          { username: 'judge3', password: 'judge123' }
        ],
        sectionCredentials: [
          { username: 'pathanapuram', password: 'pathanapuram123', section: 'Pathanapuram' },
          { username: 'kollam', password: 'kollam123', section: 'Kollam' },
          { username: 'alappuzha', password: 'alappuzha123', section: 'Alappuzha' },
          { username: 'kottayam', password: 'kottayam123', section: 'Kottayam' }
        ],
        groupTeams: this.generateMockGroupTeams(),
        groupEventLocks: this.generateMockGroupEventLocks(),
        pointsConfig: {
          individual: { first: 5, second: 3, third: 1 },
          group: { first: 10, second: 5, third: 3 }
        },
        declaredResults: [] // Array of { eventId, category } for individual events and { groupEventId } for group events
      };
      
      // Generate mock scores for participants
      initialData.scores = this.generateScoresForParticipants(initialData.participants);
      
      localStorage.setItem(this.storageKey, JSON.stringify(initialData));
    } else {
      // Check if sections exist, if not, add them to existing data
      const data = JSON.parse(existingData);
      let updated = false;
      
      if (!data.sections) {
        data.sections = [
          {
            id: 1,
            name: 'Pathanapuram',
            churches: [
              'Bethel Gospel Assembly Church - Pathanapuram',
              'Grace Gospel Church - Pathanapuram',
              'Zion Assembly - Pathanapuram',
              'Faith Gospel Church - Pathanapuram'
            ]
          },
          {
            id: 2,
            name: 'Kollam',
            churches: [
              'Bethel Gospel Assembly Church - Kollam',
              'Living Word Church - Kollam',
              'New Life Assembly - Kollam',
              'Calvary Church - Kollam',
              'Victory Gospel Church - Kollam'
            ]
          },
          {
            id: 3,
            name: 'Alappuzha',
            churches: [
              'Bethel Gospel Assembly Church - Alappuzha',
              'Gospel Light Church - Alappuzha',
              'Pentecostal Assembly - Alappuzha',
              'Emmanuel Gospel Church - Alappuzha',
              'Believers Church - Alappuzha'
            ]
          },
          {
            id: 4,
            name: 'Kottayam',
            churches: [
              'Bethel Gospel Assembly Church - Kottayam',
              'Word of Life Church - Kottayam',
              'Gospel Faith Assembly - Kottayam',
              'Holy Spirit Church - Kottayam',
              'Trinity Gospel Church - Kottayam',
              'Covenant Church - Kottayam'
            ]
          }
        ];
        updated = true;
      }
      
      if (!data.sectionCredentials) {
        data.sectionCredentials = [
          { username: 'pathanapuram', password: 'pathanapuram123', section: 'Pathanapuram' },
          { username: 'kollam', password: 'kollam123', section: 'Kollam' },
          { username: 'alappuzha', password: 'alappuzha123', section: 'Alappuzha' },
          { username: 'kottayam', password: 'kottayam123', section: 'Kottayam' }
        ];
        updated = true;
      }
      
      if (!data.groupTeams) {
        data.groupTeams = this.generateMockGroupTeams();
        updated = true;
      }
      
      if (!data.groupEventLocks) {
        data.groupEventLocks = this.generateMockGroupEventLocks();
        updated = true;
      }
      
      if (!data.pointsConfig) {
        data.pointsConfig = {
          individual: { first: 5, second: 3, third: 1 },
          group: { first: 10, second: 5, third: 3 }
        };
        updated = true;
      }
      
      if (updated) {
        localStorage.setItem(this.storageKey, JSON.stringify(data));
      }
    }
  }

  generateMockScores() {
    // This will be populated after participants are created
    // Since we need participant IDs, we'll generate scores separately
    return [];
  }

  generateScoresForParticipants(participants) {
    const scores = [];
    const judges = ['judge1', 'judge2', 'judge3'];
    
    participants.forEach(participant => {
      const eventIds = participant.eventIds || [];
      
      eventIds.forEach(eventId => {
        // Generate scores from all 3 judges for this participant-event combination
        judges.forEach(judgeName => {
          // Generate random criteria scores (0-10 each)
          const criteria1 = Math.floor(Math.random() * 4) + 7; // 7-10
          const criteria2 = Math.floor(Math.random() * 4) + 7; // 7-10
          const criteria3 = Math.floor(Math.random() * 4) + 7; // 7-10
          const criteria4 = Math.floor(Math.random() * 4) + 7; // 7-10
          const criteria5 = Math.floor(Math.random() * 4) + 7; // 7-10
          const totalScore = criteria1 + criteria2 + criteria3 + criteria4 + criteria5;
          
          scores.push({
            id: `${participant.id}-${eventId}-${judgeName}`,
            participantId: participant.id,
            eventId: eventId,
            judgeName: judgeName,
            criteria1: criteria1,
            criteria2: criteria2,
            criteria3: criteria3,
            criteria4: criteria4,
            criteria5: criteria5,
            totalScore: totalScore,
            comments: '',
            submittedAt: new Date(2026, 0, 11 + judges.indexOf(judgeName)).toISOString()
          });
        });
      });
    });
    
    return scores;
  }

  generateMockJudgeLocks() {
    // Generate locks for all events and categories
    const locks = [];
    const judges = ['judge1', 'judge2', 'judge3'];
    const events = [1, 2, 3, 4, 5];
    const categories = ['Junior', 'Intermediate', 'Senior', 'Super Senior'];
    
    judges.forEach(judge => {
      events.forEach(eventId => {
        categories.forEach(category => {
          locks.push({
            judgeName: judge,
            eventId: eventId,
            category: category,
            locked: true,
            lockedDate: new Date(2026, 0, 12).toISOString()
          });
        });
      });
    });
    
    return locks;
  }

  generateMockGroupEventLocks() {
    // Generate locks for all group events from all judges
    const locks = [];
    const judges = ['judge1', 'judge2', 'judge3'];
    const groupEventIds = [1, 2]; // Group Song and Group Bible Quiz
    
    judges.forEach(judge => {
      groupEventIds.forEach(groupEventId => {
        locks.push({
          judgeName: judge,
          groupEventId: groupEventId,
          locked: true,
          lockedDate: new Date(2026, 0, 12).toISOString()
        });
      });
    });
    
    return locks;
  }

  generateMockGroupTeams() {
    // Generate teams for group events (Group Song and Group Bible Quiz)
    // One team per section for each group event
    const teams = [];
    const sections = [
      { id: 1, name: 'Pathanapuram' },
      { id: 2, name: 'Kollam' },
      { id: 3, name: 'Alappuzha' },
      { id: 4, name: 'Kottayam' }
    ];

    const judges = ['judge1', 'judge2', 'judge3'];

    // Group Song teams (groupEventId: 1)
    const groupSongParticipants = {
      1: ['Aarav David', 'Ananya Grace', 'Vivaan Joseph', 'Diya Mary', 'Aditya James', 'Saanvi Elizabeth', 'Arjun Peter', 'Navya Joy'],
      2: ['Aiden Kumar', 'Emma Sharma', 'Ethan Raj', 'Olivia Patel', 'Noah Sharma', 'Sophia Singh', 'Lucas Patel', 'Ava Verma'],
      3: ['Liam George', 'Charlotte Philip', 'Benjamin Matthew', 'Amelia Abraham', 'William Isaac', 'Isabella Daniel', 'James Thomas', 'Mia Joseph'],
      4: ['Michael Peter', 'Emily Grace', 'Daniel Samuel', 'Abigail Ruth', 'Matthew Luke', 'Elizabeth Mary', 'Joseph Mark', 'Sarah Faith']
    };

    const chestNumbers = {
      1: { song: 'GS001', quiz: 'GQ001' },
      2: { song: 'GS002', quiz: 'GQ002' },
      3: { song: 'GS003', quiz: 'GQ003' },
      4: { song: 'GS004', quiz: 'GQ004' }
    };

    sections.forEach(section => {
      // Group Song team
      const groupSongTeam = {
        id: section.id,
        groupEventId: 1,
        sectionId: section.id,
        teamName: `${section.name} Harmony`,
        chestNumber: chestNumbers[section.id].song,
        participants: groupSongParticipants[section.id],
        scores: []
      };

      // Add scores from all judges
      judges.forEach(judge => {
        groupSongTeam.scores.push({
          judgeName: judge,
          score: Math.floor(Math.random() * 11) + 40, // Random score between 40-50
          comments: 'Excellent harmony and stage presence',
          timestamp: new Date(2026, 0, 12).toISOString()
        });
      });

      teams.push(groupSongTeam);
    });

    // Group Bible Quiz teams (groupEventId: 2)
    const quizParticipants = {
      1: ['Reyansh Thomas', 'Pari Faith', 'Krishna Paul', 'Kiara Hope', 'Shivansh George'],
      2: ['Mason Singh', 'Harper Nair', 'Logan Varma', 'Evelyn Reddy', 'Jayden Nair'],
      3: ['Oliver James', 'Ella Stephen', 'Elijah Simon', 'Scarlett Timothy', 'Lucas Peter'],
      4: ['Alexander David', 'Grace Elizabeth', 'Henry Thomas', 'Chloe Anna', 'Sebastian Joseph']
    };

    sections.forEach(section => {
      // Group Bible Quiz team
      const quizTeam = {
        id: section.id + 4, // IDs 5-8
        groupEventId: 2,
        sectionId: section.id,
        teamName: `${section.name} Bible Warriors`,
        chestNumber: chestNumbers[section.id].quiz,
        participants: quizParticipants[section.id],
        scores: []
      };

      // Add scores from all judges (for quiz, score is number of correct answers out of 50)
      judges.forEach(judge => {
        quizTeam.scores.push({
          judgeName: judge,
          score: Math.floor(Math.random() * 11) + 40, // Random score between 40-50 correct answers
          comments: 'Great biblical knowledge',
          timestamp: new Date(2026, 0, 12).toISOString()
        });
      });

      teams.push(quizTeam);
    });

    return teams;
  }

  generateMockParticipants() {
    const juniorMaleNames = [
      'Aarav David', 'Reyansh Thomas', 'Vivaan Joseph', 'Aditya James', 'Arjun Peter',
      'Sai Samuel', 'Arnav Luke', 'Dhruv Mark', 'Krishna Paul', 'Advait John',
      'Vihaan Simon', 'Atharv Philip', 'Aryan Stephen', 'Kabir Timothy', 'Shivansh George',
      'Rudra Michael', 'Yuvraj Matthew', 'Ayaan Abraham', 'Vedant Isaac', 'Pranav Daniel'
    ];
    
    const juniorFemaleNames = [
      'Aadhya Grace', 'Ananya Ruth', 'Diya Mary', 'Saanvi Elizabeth', 'Navya Joy',
      'Pari Faith', 'Kiara Hope', 'Isha Anna', 'Avni Rose', 'Sara Love',
      'Myra Grace', 'Anika Faith', 'Riya Peace', 'Tara Hope', 'Shanaya Joy',
      'Zara Grace', 'Kavya Love', 'Dia Rose', 'Ira Faith', 'Nisha Hope'
    ];
    
    const intermediateMaleNames = [
      'Aiden Kumar', 'Ethan Raj', 'Noah Sharma', 'Lucas Patel', 'Mason Singh',
      'Logan Varma', 'Jayden Nair', 'Levi Reddy', 'Carter Joshi', 'Owen Menon',
      'Jackson Iyer', 'Wyatt Pillai', 'Grayson Das', 'Asher Roy', 'Leo Gupta',
      'Hudson Desai', 'Mateo Mehta', 'Ezra Kapoor', 'Eli Verma', 'Axel Khan'
    ];
    
    const intermediateFemaleNames = [
      'Sophia Rose', 'Emma Grace', 'Olivia Faith', 'Ava Hope', 'Isabella Joy',
      'Mia Love', 'Charlotte Peace', 'Amelia Grace', 'Harper Faith', 'Evelyn Joy',
      'Abigail Hope', 'Emily Love', 'Ella Grace', 'Scarlett Faith', 'Madison Joy',
      'Luna Hope', 'Chloe Grace', 'Layla Love', 'Penelope Faith', 'Riley Joy'
    ];
    
    const seniorMaleNames = [
      'John David', 'Samuel Thomas', 'Joshua Abraham', 'Daniel Joseph', 'Matthew James',
      'Benjamin Peter', 'Jacob Philip', 'Andrew Simon', 'Caleb Stephen', 'Nathan Luke',
      'Ethan Mark', 'Isaac Paul', 'Ryan Timothy', 'Aaron George', 'Joel Michael',
      'Elijah Matthew', 'James Jonathan', 'Alexander David', 'Michael John', 'William Samuel'
    ];
    
    const seniorFemaleNames = [
      'Sarah Grace', 'Hannah Ruth', 'Esther Mary', 'Rachel Elizabeth', 'Rebecca Joy',
      'Miriam Faith', 'Abigail Hope', 'Deborah Anna', 'Lydia Rose', 'Martha Joy',
      'Naomi Grace', 'Priscilla Faith', 'Tabitha Love', 'Rhoda Peace', 'Eunice Hope',
      'Phoebe Grace', 'Dorcas Joy', 'Mary Ann', 'Elizabeth Sarah', 'Ruth Hannah'
    ];
    
    const superSeniorMaleNames = [
      'Christopher Emmanuel', 'Jonathan David', 'Nicholas Peter', 'Timothy Paul', 'Stephen Mark',
      'Philip Andrew', 'Thomas Matthew', 'Paul Simon', 'Peter John', 'James Philip',
      'Mark Timothy', 'Luke Samuel', 'Simon Peter', 'Barnabas Joseph', 'Silas James',
      'Titus Thomas', 'Timothy Luke', 'Matthias John', 'Judas Matthew', 'Thaddeus Mark'
    ];
    
    const superSeniorFemaleNames = [
      'Elizabeth Grace', 'Catherine Joy', 'Victoria Faith', 'Alexandra Hope', 'Stephanie Love',
      'Michelle Grace', 'Jennifer Faith', 'Jessica Hope', 'Amanda Joy', 'Melissa Love',
      'Rachel Grace', 'Rebecca Faith', 'Sarah Hope', 'Hannah Joy', 'Leah Love',
      'Ruth Grace', 'Esther Faith', 'Deborah Hope', 'Miriam Joy', 'Mary Love'
    ];
    
    const namesByCategory = {
      'Junior': { male: juniorMaleNames, female: juniorFemaleNames },
      'Intermediate': { male: intermediateMaleNames, female: intermediateFemaleNames },
      'Senior': { male: seniorMaleNames, female: seniorFemaleNames },
      'Super Senior': { male: superSeniorMaleNames, female: superSeniorFemaleNames }
    };
    
    const sections = ['Pathanapuram', 'Kollam', 'Alappuzha', 'Kottayam'];
    const churches = {
      'Pathanapuram': [
        'Bethel Gospel Assembly Church - Pathanapuram',
        'Grace Gospel Church - Pathanapuram',
        'Zion Assembly - Pathanapuram',
        'Faith Gospel Church - Pathanapuram'
      ],
      'Kollam': [
        'Bethel Gospel Assembly Church - Kollam',
        'Living Word Church - Kollam',
        'New Life Assembly - Kollam',
        'Calvary Church - Kollam',
        'Victory Gospel Church - Kollam'
      ],
      'Alappuzha': [
        'Bethel Gospel Assembly Church - Alappuzha',
        'Gospel Light Church - Alappuzha',
        'Pentecostal Assembly - Alappuzha',
        'Emmanuel Gospel Church - Alappuzha',
        'Believers Church - Alappuzha'
      ],
      'Kottayam': [
        'Bethel Gospel Assembly Church - Kottayam',
        'Word of Life Church - Kottayam',
        'Gospel Faith Assembly - Kottayam',
        'Holy Spirit Church - Kottayam',
        'Trinity Gospel Church - Kottayam',
        'Covenant Church - Kottayam'
      ]
    };
    
    const participants = [];
    let idCounter = 1000;
    
    // Generate 20 participants for each category
    const categories = [
      { name: 'Junior', ageRange: [6, 10] },
      { name: 'Intermediate', ageRange: [11, 15] },
      { name: 'Senior', ageRange: [16, 20] },
      { name: 'Super Senior', ageRange: [21, 25] }
    ];
    
    categories.forEach(category => {
      const maleNames = namesByCategory[category.name].male;
      const femaleNames = namesByCategory[category.name].female;
      let maleIndex = 0;
      let femaleIndex = 0;
      
      for (let i = 0; i < 20; i++) {
        const gender = i % 2 === 0 ? 'Male' : 'Female';
        const name = gender === 'Male' ? maleNames[maleIndex++] : femaleNames[femaleIndex++];
        const age = category.ageRange[0] + Math.floor(Math.random() * (category.ageRange[1] - category.ageRange[0] + 1));
        const section = sections[Math.floor(Math.random() * sections.length)];
        const churchList = churches[section];
        const church = churchList[Math.floor(Math.random() * churchList.length)];
        
        // Select random events (1-3 events)
        const numEvents = Math.floor(Math.random() * 3) + 1;
        const eventIds = [];
        const availableEvents = gender === 'Male' ? [1, 3, 4, 5] : [2, 3, 4, 5]; // Gender-specific events
        
        for (let j = 0; j < numEvents; j++) {
          const eventId = availableEvents[Math.floor(Math.random() * availableEvents.length)];
          if (!eventIds.includes(eventId)) {
            eventIds.push(eventId);
          }
        }
        
        participants.push({
          id: idCounter++,
          name: name,
          age: age,
          ageCategory: category.name,
          gender: gender,
          email: `${name.toLowerCase().replace(' ', '.')}@example.com`,
          phone: `+91 ${90000 + Math.floor(Math.random() * 10000)} ${10000 + Math.floor(Math.random() * 90000)}`,
          eventIds: eventIds,
          section: section,
          churchName: church,
          registrationDate: new Date(2026, 0, Math.floor(Math.random() * 12) + 1).toISOString(),
          chestNumber: null
        });
      }
    });
    
    return participants;
  }

  getData() {
    return JSON.parse(localStorage.getItem(this.storageKey));
  }

  saveData(data) {
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  // Participant methods
  getParticipants() {
    return this.getData().participants;
  }

  generateChestNumber(ageCategory) {
    const participants = this.getParticipants();
    const categoryPrefixes = {
      'Junior': 'J',
      'Intermediate': 'I',
      'Senior': 'S',
      'Super Senior': 'SS'
    };
    
    const prefix = categoryPrefixes[ageCategory];
    if (!prefix) return null;
    
    // Find all chest numbers for this category
    const categoryParticipants = participants.filter(p => 
      p.chestNumber && p.chestNumber.startsWith(prefix + '-')
    );
    
    // Extract numbers and find the highest
    const numbers = categoryParticipants.map(p => {
      const match = p.chestNumber.match(new RegExp(`^${prefix}-(\\d+)$`));
      return match ? parseInt(match[1]) : 0;
    });
    
    const nextNumber = numbers.length > 0 ? Math.max(...numbers) + 1 : 1;
    return `${prefix}-${String(nextNumber).padStart(3, '0')}`;
  }

  addParticipant(participant) {
    const data = this.getData();
    const newParticipant = {
      ...participant,
      id: Date.now(),
      registrationDate: new Date().toISOString(),
      chestNumber: participant.chestNumber || null
    };
    data.participants.push(newParticipant);
    this.saveData(data);
    return newParticipant;
  }

  updateParticipant(id, updatedParticipant) {
    const data = this.getData();
    const index = data.participants.findIndex(p => p.id === id);
    if (index !== -1) {
      data.participants[index] = { ...data.participants[index], ...updatedParticipant };
      this.saveData(data);
      return data.participants[index];
    }
    return null;
  }

  deleteParticipant(id) {
    const data = this.getData();
    data.participants = data.participants.filter(p => p.id !== id);
    this.saveData(data);
  }

  assignChestNumber(participantId) {
    const data = this.getData();
    const participant = data.participants.find(p => p.id === participantId);
    if (!participant) return null;
    
    if (participant.chestNumber) {
      return participant.chestNumber; // Already has a chest number
    }
    
    const chestNumber = this.generateChestNumber(participant.ageCategory);
    participant.chestNumber = chestNumber;
    this.saveData(data);
    return chestNumber;
  }

  removeChestNumber(participantId) {
    const data = this.getData();
    const participant = data.participants.find(p => p.id === participantId);
    if (participant) {
      participant.chestNumber = null;
      this.saveData(data);
      return true;
    }
    return false;
  }

  assignAllChestNumbers() {
    const data = this.getData();
    const categories = ['Junior', 'Intermediate', 'Senior', 'Super Senior'];
    const categoryPrefixes = {
      'Junior': 'J',
      'Intermediate': 'I',
      'Senior': 'S',
      'Super Senior': 'SS'
    };
    let assignedCount = 0;
    
    // Process each category separately to ensure sequential numbering
    categories.forEach(category => {
      const categoryParticipants = data.participants.filter(p => 
        p.ageCategory === category && !p.chestNumber
      );
      
      if (categoryParticipants.length === 0) return;
      
      // Find the highest existing chest number for this category
      const prefix = categoryPrefixes[category];
      const existingNumbers = data.participants
        .filter(p => p.chestNumber && p.chestNumber.startsWith(prefix + '-'))
        .map(p => {
          const match = p.chestNumber.match(new RegExp(`^${prefix}-(\\\\d+)$`));
          return match ? parseInt(match[1]) : 0;
        });
      
      let nextNumber = existingNumbers.length > 0 ? Math.max(...existingNumbers) + 1 : 1;
      
      // Assign chest numbers sequentially
      categoryParticipants.forEach(participant => {
        participant.chestNumber = `${prefix}-${String(nextNumber).padStart(3, '0')}`;
        nextNumber++;
        assignedCount++;
      });
    });
    
    this.saveData(data);
    return assignedCount;
  }

  // Event methods
  getEvents() {
    return this.getData().events;
  }

  // Section methods
  getSections() {
    return this.getData().sections || [];
  }

  getChurchesBySection(sectionName) {
    const sections = this.getSections();
    const section = sections.find(s => s.name === sectionName);
    return section ? section.churches : [];
  }

  // Score methods
  getScores() {
    return this.getData().scores;
  }

  addScore(score) {
    const data = this.getData();
    const newScore = {
      ...score,
      id: Date.now(),
      submittedDate: new Date().toISOString()
    };
    data.scores.push(newScore);
    this.saveData(data);
    return newScore;
  }

  updateScore(participantId, eventId, judgeName, updatedScore) {
    const data = this.getData();
    const scoreIndex = data.scores.findIndex(
      s => s.participantId === participantId && 
           s.eventId === eventId && 
           s.judgeName === judgeName
    );
    
    if (scoreIndex !== -1) {
      // Update existing score, keep original id and submittedDate
      data.scores[scoreIndex] = {
        ...data.scores[scoreIndex],
        ...updatedScore,
        updatedDate: new Date().toISOString()
      };
      this.saveData(data);
      return data.scores[scoreIndex];
    } else {
      // If not found, add as new score
      return this.addScore(updatedScore);
    }
  }

  getScoresByParticipant(participantId) {
    return this.getData().scores.filter(s => s.participantId === participantId);
  }

  getScoresByEvent(eventId) {
    return this.getData().scores.filter(s => s.eventId === eventId);
  }

  getScoresByJudge(judgeName) {
    return this.getData().scores.filter(s => s.judgeName === judgeName);
  }

  getScoresByParticipantAndEvent(participantId, eventId) {
    return this.getData().scores.filter(
      s => s.participantId === participantId && s.eventId === eventId
    );
  }

  // Judge Lock methods
  lockScores(judgeName, eventId, category) {
    const data = this.getData();
    if (!data.judgeLocks) data.judgeLocks = [];
    
    const lockIndex = data.judgeLocks.findIndex(
      l => l.judgeName === judgeName && l.eventId === eventId && l.category === category
    );
    
    if (lockIndex !== -1) {
      data.judgeLocks[lockIndex].locked = true;
      data.judgeLocks[lockIndex].lockedDate = new Date().toISOString();
    } else {
      data.judgeLocks.push({
        judgeName,
        eventId,
        category,
        locked: true,
        lockedDate: new Date().toISOString()
      });
    }
    
    this.saveData(data);
  }

  unlockScores(judgeName, eventId, category) {
    const data = this.getData();
    if (!data.judgeLocks) data.judgeLocks = [];
    
    const lockIndex = data.judgeLocks.findIndex(
      l => l.judgeName === judgeName && l.eventId === eventId && l.category === category
    );
    
    if (lockIndex !== -1) {
      data.judgeLocks[lockIndex].locked = false;
    }
    
    this.saveData(data);
  }

  isScoreLocked(judgeName, eventId, category) {
    const data = this.getData();
    if (!data.judgeLocks) return false;
    
    const lock = data.judgeLocks.find(
      l => l.judgeName === judgeName && l.eventId === eventId && l.category === category
    );
    
    return lock ? lock.locked : false;
  }

  areAllJudgesLocked(eventId, category) {
    const data = this.getData();
    if (!data.judgeLocks) return false;
    
    // Find the event to check its scoring type
    const event = data.events.find(e => e.id === eventId);
    
    // For single-judge events, check if at least one judge has locked
    if (event && event.scoringType === 'single-judge') {
      const lockedJudges = data.judgeLocks.filter(
        l => l.eventId === eventId && l.category === category && l.locked
      );
      return lockedJudges.length > 0;
    }
    
    // For all-judges events, check if all judges have locked
    const judgeCount = data.judgeCredentials.length;
    const lockedJudges = data.judgeLocks.filter(
      l => l.eventId === eventId && l.category === category && l.locked
    );
    
    return lockedJudges.length === judgeCount;
  }

  getJudgeLocks() {
    const data = this.getData();
    return data.judgeLocks || [];
  }

  // Authentication methods
  validateAdmin(username, password) {
    const data = this.getData();
    return data.adminCredentials.username === username && 
           data.adminCredentials.password === password;
  }

  validateJudge(username, password) {
    const data = this.getData();
    return data.judgeCredentials.some(
      judge => judge.username === username && judge.password === password
    );
  }

  validateSection(username, password) {
    const data = this.getData();
    const sectionCreds = data.sectionCredentials || [];
    const section = sectionCreds.find(
      sec => sec.username === username && sec.password === password
    );
    return section ? { valid: true, section: section.section } : { valid: false };
  }

  getParticipantsBySection(sectionName) {
    return this.getData().participants.filter(p => p.section === sectionName);
  }

  // Utility methods
  getAgeCategory(age) {
    if (age >= 6 && age <= 10) return 'Junior';
    if (age >= 11 && age <= 15) return 'Intermediate';
    if (age >= 16 && age <= 20) return 'Senior';
    if (age >= 21 && age <= 25) return 'Super Senior';
    return null;
  }

  calculateAverageScore(participantId) {
    const scores = this.getScoresByParticipant(participantId);
    if (scores.length === 0) return 0;
    const total = scores.reduce((sum, score) => sum + score.totalScore, 0);
    return (total / scores.length).toFixed(2);
  }

  // Result Declaration Methods
  declareResult(eventId, category) {
    const data = this.getData();
    const declaredResults = data.declaredResults || [];
    
    // Check if already declared
    const existingIndex = declaredResults.findIndex(
      r => r.eventId === eventId && r.category === category
    );
    
    if (existingIndex === -1) {
      declaredResults.push({
        eventId,
        category,
        declaredAt: new Date().toISOString(),
        declaredBy: 'admin' // Can be extended to track specific admin
      });
      
      data.declaredResults = declaredResults;
      this.saveData(data);
      return { success: true, message: 'Result declared successfully' };
    }
    
    return { success: false, message: 'Result already declared' };
  }

  declareGroupResult(groupEventId) {
    const data = this.getData();
    const declaredResults = data.declaredResults || [];
    
    // Check if already declared
    const existingIndex = declaredResults.findIndex(
      r => r.groupEventId === groupEventId
    );
    
    if (existingIndex === -1) {
      declaredResults.push({
        groupEventId,
        declaredAt: new Date().toISOString(),
        declaredBy: 'admin'
      });
      
      data.declaredResults = declaredResults;
      this.saveData(data);
      return { success: true, message: 'Group result declared successfully' };
    }
    
    return { success: false, message: 'Group result already declared' };
  }

  declareAllResults() {
    const data = this.getData();
    const declaredResults = data.declaredResults || [];
    const events = this.getEvents();
    const categories = ['Junior', 'Intermediate', 'Senior', 'Super Senior'];
    let declaredCount = 0;
    let alreadyDeclaredCount = 0;
    
    // Check all event-category combinations that are locked
    events.forEach(event => {
      categories.forEach(category => {
        if (this.areAllJudgesLocked(event.id, category)) {
          // Check if not already declared
          const exists = declaredResults.some(
            r => r.eventId === event.id && r.category === category
          );
          
          if (!exists) {
            declaredResults.push({
              eventId: event.id,
              category,
              declaredAt: new Date().toISOString(),
              declaredBy: 'admin'
            });
            declaredCount++;
          } else {
            alreadyDeclaredCount++;
          }
        }
      });
    });
    
    if (declaredCount > 0) {
      data.declaredResults = declaredResults;
      this.saveData(data);
      return { 
        success: true, 
        message: `Successfully declared ${declaredCount} result(s). ${alreadyDeclaredCount} already declared.`,
        declaredCount,
        alreadyDeclaredCount
      };
    }
    
    return { 
      success: false, 
      message: alreadyDeclaredCount > 0 
        ? `All locked results (${alreadyDeclaredCount}) are already declared.`
        : 'No locked results available to declare.',
      declaredCount: 0,
      alreadyDeclaredCount
    };
  }

  revertAllDeclarations() {
    const data = this.getData();
    const declaredCount = (data.declaredResults || []).filter(r => r.eventId).length;
    
    if (declaredCount > 0) {
      // Keep only group event declarations, remove individual event declarations
      data.declaredResults = (data.declaredResults || []).filter(r => r.groupEventId);
      this.saveData(data);
      return { 
        success: true, 
        message: `Successfully reverted ${declaredCount} declaration(s).`,
        revertedCount: declaredCount
      };
    }
    
    return { 
      success: false, 
      message: 'No declared results to revert.',
      revertedCount: 0
    };
  }

  revertDeclaration(eventId, category) {
    const data = this.getData();
    const declaredResults = data.declaredResults || [];
    
    const index = declaredResults.findIndex(
      r => r.eventId === eventId && r.category === category
    );
    
    if (index !== -1) {
      declaredResults.splice(index, 1);
      data.declaredResults = declaredResults;
      this.saveData(data);
      return { success: true, message: 'Declaration reverted successfully' };
    }
    
    return { success: false, message: 'Result not declared' };
  }

  revertGroupDeclaration(groupEventId) {
    const data = this.getData();
    const declaredResults = data.declaredResults || [];
    
    const index = declaredResults.findIndex(
      r => r.groupEventId === groupEventId
    );
    
    if (index !== -1) {
      declaredResults.splice(index, 1);
      data.declaredResults = declaredResults;
      this.saveData(data);
      return { success: true, message: 'Group declaration reverted successfully' };
    }
    
    return { success: false, message: 'Group result not declared' };
  }

  isResultDeclared(eventId, category) {
    const data = this.getData();
    const declaredResults = data.declaredResults || [];
    return declaredResults.some(
      r => r.eventId === eventId && r.category === category
    );
  }

  isGroupResultDeclared(groupEventId) {
    const data = this.getData();
    const declaredResults = data.declaredResults || [];
    return declaredResults.some(r => r.groupEventId === groupEventId);
  }

  getDeclaredResults() {
    const data = this.getData();
    return data.declaredResults || [];
  }

  getDeclaredIndividualEvents() {
    const declaredResults = this.getDeclaredResults();
    return declaredResults.filter(r => r.eventId !== undefined);
  }

  getDeclaredGroupEvents() {
    const declaredResults = this.getDeclaredResults();
    return declaredResults.filter(r => r.groupEventId !== undefined);
  }
}

export default new StorageService();
