import FirebaseService from './FirebaseService';

/**
 * Migration script to transfer data from localStorage to Firebase Firestore
 * Run this once to migrate all existing mock data to Firebase
 */
class DataMigration {
  async migrateAll() {
    try {
      console.log('Starting data migration from localStorage to Firebase...');
      
      // Get all data from localStorage via StorageService
      // This migration utility is for one-time use to migrate from localStorage to Firebase
      // Comment out these calls as StorageService no longer exists
      const mockData = {
        events: [], // StorageService.getEvents(),
        groupEvents: [], // StorageService.getGroupEvents(),
        sections: [], // StorageService.getSections(),
        participants: [], // StorageService.getParticipants(),
        groupTeams: [], // StorageService.getGroupTeams(),
        judges: this.getJudgesFromStorage(),
        results: this.getResultsFromStorage(),
        pointsConfig: {} // StorageService.getPointsConfig()
      };
      
      console.log('Mock data retrieved:', {
        events: mockData.events.length,
        groupEvents: mockData.groupEvents.length,
        sections: mockData.sections.length,
        participants: mockData.participants.length,
        groupTeams: mockData.groupTeams.length,
        judges: mockData.judges.length,
        results: mockData.results.length
      });
      
      // Migrate to Firebase
      await FirebaseService.migrateMockData(mockData);
      
      console.log('✅ Data migration completed successfully!');
      return {
        success: true,
        message: 'All data migrated to Firebase successfully',
        data: mockData
      };
      
    } catch (error) {
      console.error('❌ Data migration failed:', error);
      return {
        success: false,
        message: 'Migration failed: ' + error.message,
        error
      };
    }
  }
  
  getJudgesFromStorage() {
    // Extract judge data from localStorage
    const storageKey = 'christSoldiersData';
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    
    const judges = [];
    
    // Create judge records from judge credentials
    if (data.judgeCredentials) {
      data.judgeCredentials.forEach((cred, index) => {
        judges.push({
          id: `judge${index + 1}`,
          username: cred.username,
          password: cred.password,
          name: `Judge ${index + 1}`,
          lockedScores: this.getLockedScoresForJudge(data, `judge${index + 1}`)
        });
      });
    }
    
    return judges;
  }
  
  getLockedScoresForJudge(data, judgeId) {
    // Extract locked scores for a specific judge
    const locks = data.judgeLocks || {};
    const groupLocks = data.groupEventLocks || {};
    const lockedScores = [];
    
    // Individual event locks
    Object.keys(locks).forEach(key => {
      if (locks[key] && locks[key][judgeId]) {
        lockedScores.push(key);
      }
    });
    
    // Group event locks
    Object.keys(groupLocks).forEach(key => {
      if (groupLocks[key] && groupLocks[key][judgeId]) {
        lockedScores.push(`group-${key}`);
      }
    });
    
    return lockedScores;
  }
  
  getResultsFromStorage() {
    // Extract results from localStorage scores
    const storageKey = 'christSoldiersData';
    const data = JSON.parse(localStorage.getItem(storageKey) || '{}');
    const scores = data.scores || {};
    const results = [];
    
    // Individual event results
    Object.keys(scores).forEach(key => {
      const [eventId, category, participantId] = key.split('-');
      const judgeScores = scores[key];
      
      if (judgeScores) {
        Object.keys(judgeScores).forEach(judgeId => {
          results.push({
            judgeId,
            participantId,
            eventId: parseInt(eventId),
            category,
            score: judgeScores[judgeId],
            type: 'individual',
            createdAt: new Date().toISOString()
          });
        });
      }
    });
    
    // Group event results
    const groupTeams = data.groupTeams || [];
    groupTeams.forEach(team => {
      if (team.scores && Array.isArray(team.scores)) {
        team.scores.forEach(scoreObj => {
          results.push({
            judgeId: scoreObj.judgeId,
            teamId: team.id,
            eventId: team.groupEventId,
            section: team.section,
            score: scoreObj.score,
            type: 'group',
            createdAt: new Date().toISOString()
          });
        });
      }
    });
    
    return results;
  }
  
  async verifyMigration() {
    try {
      console.log('Verifying migration...');
      
      const events = await FirebaseService.getEvents();
      const participants = await FirebaseService.getParticipants();
      const sections = await FirebaseService.getSections();
      const judges = await FirebaseService.getJudges();
      const results = await FirebaseService.getResults();
      const groupTeams = await FirebaseService.getGroupTeams();
      
      console.log('Firebase data count:', {
        events: events.length,
        participants: participants.length,
        sections: sections.length,
        judges: judges.length,
        results: results.length,
        groupTeams: groupTeams.length
      });
      
      return {
        success: true,
        counts: {
          events: events.length,
          participants: participants.length,
          sections: sections.length,
          judges: judges.length,
          results: results.length,
          groupTeams: groupTeams.length
        }
      };
    } catch (error) {
      console.error('Verification failed:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

export default new DataMigration();
