import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  setDoc,
  writeBatch
} from 'firebase/firestore';

class FirebaseService {
  constructor() {
    this.collections = {
      participants: 'participants',
      events: 'events',
      groupEvents: 'groupEvents',
      groupTeams: 'groupTeams',
      sections: 'sections',
      judges: 'judges',
      results: 'results',
      config: 'config'
    };
  }

  // ===== PARTICIPANTS =====
  
  async getParticipants() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collections.participants));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching participants:', error);
      return [];
    }
  }

  async addParticipant(participantData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.participants), {
        ...participantData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...participantData };
    } catch (error) {
      console.error('Error adding participant:', error);
      throw error;
    }
  }

  async updateParticipant(id, participantData) {
    try {
      const docRef = doc(db, this.collections.participants, id);
      await updateDoc(docRef, {
        ...participantData,
        updatedAt: new Date().toISOString()
      });
      return { id, ...participantData };
    } catch (error) {
      console.error('Error updating participant:', error);
      throw error;
    }
  }

  async deleteParticipant(id) {
    try {
      await deleteDoc(doc(db, this.collections.participants, id));
      return true;
    } catch (error) {
      console.error('Error deleting participant:', error);
      throw error;
    }
  }

  // ===== EVENTS =====
  
  async getEvents() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collections.events));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching events:', error);
      return [];
    }
  }

  async addEvent(eventData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.events), eventData);
      return { id: docRef.id, ...eventData };
    } catch (error) {
      console.error('Error adding event:', error);
      throw error;
    }
  }

  async updateEvent(id, eventData) {
    try {
      const docRef = doc(db, this.collections.events, id);
      await updateDoc(docRef, eventData);
      return { id, ...eventData };
    } catch (error) {
      console.error('Error updating event:', error);
      throw error;
    }
  }

  async deleteEvent(id) {
    try {
      await deleteDoc(doc(db, this.collections.events, id));
      return true;
    } catch (error) {
      console.error('Error deleting event:', error);
      throw error;
    }
  }

  // ===== GROUP EVENTS =====
  
  async getGroupEvents() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collections.groupEvents));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching group events:', error);
      return [];
    }
  }

  // ===== GROUP TEAMS =====
  
  async getGroupTeams() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collections.groupTeams));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching group teams:', error);
      return [];
    }
  }

  async addGroupTeam(teamData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.groupTeams), {
        ...teamData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...teamData };
    } catch (error) {
      console.error('Error adding group team:', error);
      throw error;
    }
  }

  async updateGroupTeam(id, teamData) {
    try {
      const docRef = doc(db, this.collections.groupTeams, id);
      await updateDoc(docRef, {
        ...teamData,
        updatedAt: new Date().toISOString()
      });
      return { id, ...teamData };
    } catch (error) {
      console.error('Error updating group team:', error);
      throw error;
    }
  }

  async deleteGroupTeam(id) {
    try {
      await deleteDoc(doc(db, this.collections.groupTeams, id));
      return true;
    } catch (error) {
      console.error('Error deleting group team:', error);
      throw error;
    }
  }

  // ===== SECTIONS =====
  
  async getSections() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collections.sections));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching sections:', error);
      return [];
    }
  }

  async addSection(sectionData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.sections), sectionData);
      return { id: docRef.id, ...sectionData };
    } catch (error) {
      console.error('Error adding section:', error);
      throw error;
    }
  }

  async updateSection(id, sectionData) {
    try {
      const docRef = doc(db, this.collections.sections, id);
      await updateDoc(docRef, sectionData);
      return { id, ...sectionData };
    } catch (error) {
      console.error('Error updating section:', error);
      throw error;
    }
  }

  async deleteSection(id) {
    try {
      await deleteDoc(doc(db, this.collections.sections, id));
      return true;
    } catch (error) {
      console.error('Error deleting section:', error);
      throw error;
    }
  }

  getChurchesBySection(sectionName) {
    // This will be called synchronously, so we need to handle it differently
    // For now, return empty array - components should load sections first
    return [];
  }

  // ===== JUDGES =====
  
  async getJudges() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collections.judges));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching judges:', error);
      return [];
    }
  }

  async addJudge(judgeData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.judges), judgeData);
      return { id: docRef.id, ...judgeData };
    } catch (error) {
      console.error('Error adding judge:', error);
      throw error;
    }
  }

  async updateJudge(id, judgeData) {
    try {
      const docRef = doc(db, this.collections.judges, id);
      await updateDoc(docRef, judgeData);
      return { id, ...judgeData };
    } catch (error) {
      console.error('Error updating judge:', error);
      throw error;
    }
  }

  async deleteJudge(id) {
    try {
      await deleteDoc(doc(db, this.collections.judges, id));
      return true;
    } catch (error) {
      console.error('Error deleting judge:', error);
      throw error;
    }
  }

  async lockJudgeScores(judgeId, eventId, category) {
    try {
      const docRef = doc(db, this.collections.judges, judgeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const judgeData = docSnap.data();
        const lockedScores = judgeData.lockedScores || [];
        const lockKey = `${eventId}-${category}`;
        
        if (!lockedScores.includes(lockKey)) {
          lockedScores.push(lockKey);
          await updateDoc(docRef, { lockedScores });
        }
      }
      return true;
    } catch (error) {
      console.error('Error locking judge scores:', error);
      throw error;
    }
  }

  async isJudgeScoresLocked(judgeId, eventId, category) {
    try {
      const docRef = doc(db, this.collections.judges, judgeId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const judgeData = docSnap.data();
        const lockedScores = judgeData.lockedScores || [];
        const lockKey = `${eventId}-${category}`;
        return lockedScores.includes(lockKey);
      }
      return false;
    } catch (error) {
      console.error('Error checking lock status:', error);
      return false;
    }
  }

  // ===== RESULTS =====
  
  async saveResult(resultData) {
    try {
      const resultId = `${resultData.judgeId}-${resultData.participantId || resultData.teamId}-${resultData.eventId}`;
      const docRef = doc(db, this.collections.results, resultId);
      await setDoc(docRef, {
        ...resultData,
        updatedAt: new Date().toISOString()
      });
      return { id: resultId, ...resultData };
    } catch (error) {
      console.error('Error saving result:', error);
      throw error;
    }
  }

  async getResults() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collections.results));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching results:', error);
      return [];
    }
  }

  async getResultsByEvent(eventId) {
    try {
      const q = query(
        collection(db, this.collections.results),
        where('eventId', '==', eventId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching results by event:', error);
      return [];
    }
  }

  // ===== CONFIGURATION =====
  
  async getPointsConfig() {
    try {
      const docRef = doc(db, this.collections.config, 'pointsConfig');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        return docSnap.data();
      }
      
      // Return default config
      return {
        individual: { first: 5, second: 3, third: 1 },
        group: { first: 10, second: 5, third: 3 }
      };
    } catch (error) {
      console.error('Error fetching points config:', error);
      return {
        individual: { first: 5, second: 3, third: 1 },
        group: { first: 10, second: 5, third: 3 }
      };
    }
  }

  async savePointsConfig(config) {
    try {
      const docRef = doc(db, this.collections.config, 'pointsConfig');
      await setDoc(docRef, config);
      return config;
    } catch (error) {
      console.error('Error saving points config:', error);
      throw error;
    }
  }

  // ===== HELPER FUNCTIONS =====
  
  getAgeCategory(age) {
    if (age >= 6 && age <= 10) return 'Junior';
    if (age >= 11 && age <= 15) return 'Intermediate';
    if (age >= 16 && age <= 20) return 'Senior';
    if (age >= 21 && age <= 25) return 'Super Senior';
    return null;
  }

  async assignChestNumber(participantId) {
    try {
      const participant = await getDoc(doc(db, this.collections.participants, participantId));
      if (!participant.exists()) return null;
      
      const participantData = participant.data();
      if (participantData.chestNumber) {
        return participantData.chestNumber;
      }

      const category = participantData.ageCategory;
      const prefix = this.getCategoryPrefix(category);
      
      // Get all participants with chest numbers in the same category
      const allParticipants = await this.getParticipants();
      const categoryParticipants = allParticipants.filter(p => 
        p.ageCategory === category && p.chestNumber && p.chestNumber.startsWith(prefix)
      );
      
      // Find the highest number
      let maxNumber = 0;
      categoryParticipants.forEach(p => {
        const match = p.chestNumber.match(/\d+$/);
        if (match) {
          const num = parseInt(match[0]);
          if (num > maxNumber) maxNumber = num;
        }
      });
      
      const chestNumber = `${prefix}-${String(maxNumber + 1).padStart(3, '0')}`;
      await this.updateParticipant(participantId, { 
        ...participantData,
        chestNumber 
      });
      
      return chestNumber;
    } catch (error) {
      console.error('Error assigning chest number:', error);
      throw error;
    }
  }

  async removeChestNumber(participantId) {
    try {
      const participant = await getDoc(doc(db, this.collections.participants, participantId));
      if (!participant.exists()) return false;
      
      const participantData = participant.data();
      delete participantData.chestNumber;
      
      await this.updateParticipant(participantId, participantData);
      return true;
    } catch (error) {
      console.error('Error removing chest number:', error);
      throw error;
    }
  }

  async assignAllChestNumbers() {
    try {
      const participants = await this.getParticipants();
      const unassigned = participants.filter(p => !p.chestNumber);
      
      let count = 0;
      for (const participant of unassigned) {
        await this.assignChestNumber(participant.id);
        count++;
      }
      
      return count;
    } catch (error) {
      console.error('Error assigning all chest numbers:', error);
      throw error;
    }
  }

  getCategoryPrefix(category) {
    const prefixes = {
      'Junior': 'J',
      'Intermediate': 'I',
      'Senior': 'S',
      'Super Senior': 'SS'
    };
    return prefixes[category] || 'X';
  }

  // ===== RESULT DECLARATION =====

  async getDeclaredResults() {
    try {
      const configDoc = await getDoc(doc(db, this.collections.config, 'declaredResults'));
      return configDoc.exists() ? (configDoc.data().results || []) : [];
    } catch (error) {
      console.error('Error fetching declared results:', error);
      return [];
    }
  }

  async declareResult(eventId, category) {
    try {
      const declaredResults = await this.getDeclaredResults();
      
      const existingIndex = declaredResults.findIndex(
        r => r.eventId === eventId && r.category === category
      );
      
      if (existingIndex === -1) {
        declaredResults.push({
          eventId,
          category,
          declaredAt: new Date().toISOString(),
          declaredBy: 'admin'
        });
        
        await setDoc(doc(db, this.collections.config, 'declaredResults'), {
          results: declaredResults
        });
        
        return { success: true, message: 'Result declared successfully' };
      }
      
      return { success: false, message: 'Result already declared' };
    } catch (error) {
      console.error('Error declaring result:', error);
      return { success: false, message: error.message };
    }
  }

  async declareGroupResult(groupEventId) {
    try {
      const declaredResults = await this.getDeclaredResults();
      
      const existingIndex = declaredResults.findIndex(
        r => r.groupEventId === groupEventId
      );
      
      if (existingIndex === -1) {
        declaredResults.push({
          groupEventId,
          declaredAt: new Date().toISOString(),
          declaredBy: 'admin'
        });
        
        await setDoc(doc(db, this.collections.config, 'declaredResults'), {
          results: declaredResults
        });
        
        return { success: true, message: 'Group result declared successfully' };
      }
      
      return { success: false, message: 'Group result already declared' };
    } catch (error) {
      console.error('Error declaring group result:', error);
      return { success: false, message: error.message };
    }
  }

  async revertDeclaration(eventId, category) {
    try {
      const declaredResults = await this.getDeclaredResults();
      const filteredResults = declaredResults.filter(
        r => !(r.eventId === eventId && r.category === category)
      );
      
      if (filteredResults.length < declaredResults.length) {
        await setDoc(doc(db, this.collections.config, 'declaredResults'), {
          results: filteredResults
        });
        
        return { success: true, message: 'Declaration reverted successfully' };
      }
      
      return { success: false, message: 'Declaration not found' };
    } catch (error) {
      console.error('Error reverting declaration:', error);
      return { success: false, message: error.message };
    }
  }

  async revertGroupDeclaration(groupEventId) {
    try {
      const declaredResults = await this.getDeclaredResults();
      const filteredResults = declaredResults.filter(
        r => r.groupEventId !== groupEventId
      );
      
      if (filteredResults.length < declaredResults.length) {
        await setDoc(doc(db, this.collections.config, 'declaredResults'), {
          results: filteredResults
        });
        
        return { success: true, message: 'Group declaration reverted successfully' };
      }
      
      return { success: false, message: 'Group declaration not found' };
    } catch (error) {
      console.error('Error reverting group declaration:', error);
      return { success: false, message: error.message };
    }
  }

  async declareAllResults() {
    try {
      const events = await this.getEvents();
      const categories = ['Junior', 'Intermediate', 'Senior', 'Super Senior'];
      const declaredResults = await this.getDeclaredResults();
      let declaredCount = 0;
      let alreadyDeclaredCount = 0;
      
      for (const event of events) {
        for (const category of categories) {
          // Check if already declared
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
      }
      
      if (declaredCount > 0) {
        await setDoc(doc(db, this.collections.config, 'declaredResults'), {
          results: declaredResults
        });
        
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
    } catch (error) {
      console.error('Error declaring all results:', error);
      return { success: false, message: error.message };
    }
  }

  async revertAllDeclarations() {
    try {
      const declaredResults = await this.getDeclaredResults();
      const individualResults = declaredResults.filter(r => r.eventId);
      const groupResults = declaredResults.filter(r => r.groupEventId);
      const declaredCount = individualResults.length;
      
      if (declaredCount > 0) {
        await setDoc(doc(db, this.collections.config, 'declaredResults'), {
          results: groupResults
        });
        
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
    } catch (error) {
      console.error('Error reverting all declarations:', error);
      return { success: false, message: error.message };
    }
  }

  async isResultDeclared(eventId, category) {
    try {
      const declaredResults = await this.getDeclaredResults();
      return declaredResults.some(
        r => r.eventId === eventId && r.category === category
      );
    } catch (error) {
      console.error('Error checking result declaration:', error);
      return false;
    }
  }

  async isGroupResultDeclared(groupEventId) {
    try {
      const declaredResults = await this.getDeclaredResults();
      return declaredResults.some(r => r.groupEventId === groupEventId);
    } catch (error) {
      console.error('Error checking group result declaration:', error);
      return false;
    }
  }

  // ===== CHAMPIONS DECLARATION =====

  async getChampionsStatus() {
    try {
      const configDoc = await getDoc(doc(db, this.collections.config, 'champions'));
      return configDoc.exists() ? configDoc.data() : { championsDeclared: false };
    } catch (error) {
      console.error('Error fetching champions status:', error);
      return { championsDeclared: false };
    }
  }

  async declareChampions(championData) {
    try {
      await setDoc(doc(db, this.collections.config, 'champions'), {
        championsDeclared: true,
        finalChampions: championData,
        declaredAt: new Date().toISOString()
      });
      return { success: true };
    } catch (error) {
      console.error('Error declaring champions:', error);
      return { success: false, message: error.message };
    }
  }

  async revertChampions() {
    try {
      await setDoc(doc(db, this.collections.config, 'champions'), {
        championsDeclared: false
      });
      return { success: true };
    } catch (error) {
      console.error('Error reverting champions:', error);
      return { success: false, message: error.message };
    }
  }

  // ===== DATA MIGRATION =====
  
  async migrateMockData(mockData) {
    try {
      const batch = writeBatch(db);
      
      // Migrate events
      if (mockData.events) {
        for (const event of mockData.events) {
          const docRef = doc(collection(db, this.collections.events));
          batch.set(docRef, event);
        }
      }
      
      // Migrate group events
      if (mockData.groupEvents) {
        for (const groupEvent of mockData.groupEvents) {
          const docRef = doc(collection(db, this.collections.groupEvents));
          batch.set(docRef, groupEvent);
        }
      }
      
      // Migrate sections
      if (mockData.sections) {
        for (const section of mockData.sections) {
          const docRef = doc(collection(db, this.collections.sections));
          batch.set(docRef, section);
        }
      }
      
      await batch.commit();
      
      // Migrate participants (in batches due to batch size limit)
      if (mockData.participants) {
        await this.migrateLargeCollection(mockData.participants, this.collections.participants);
      }
      
      // Migrate group teams
      if (mockData.groupTeams) {
        await this.migrateLargeCollection(mockData.groupTeams, this.collections.groupTeams);
      }
      
      // Migrate judges
      if (mockData.judges) {
        await this.migrateLargeCollection(mockData.judges, this.collections.judges);
      }
      
      // Migrate results
      if (mockData.results) {
        await this.migrateLargeCollection(mockData.results, this.collections.results);
      }
      
      // Migrate points config
      if (mockData.pointsConfig) {
        await this.savePointsConfig(mockData.pointsConfig);
      }
      
      return true;
    } catch (error) {
      console.error('Error migrating mock data:', error);
      throw error;
    }
  }

  async migrateLargeCollection(items, collectionName) {
    const batchSize = 500;
    for (let i = 0; i < items.length; i += batchSize) {
      const batch = writeBatch(db);
      const batchItems = items.slice(i, i + batchSize);
      
      for (const item of batchItems) {
        const docRef = doc(collection(db, collectionName));
        batch.set(docRef, item);
      }
      
      await batch.commit();
    }
  }
}

export default new FirebaseService();
