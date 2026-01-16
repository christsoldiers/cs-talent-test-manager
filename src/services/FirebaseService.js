import { db } from '../config/firebase';
import { 
  collection, 
  doc, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc,
  deleteField,
  query,
  where,
  orderBy,
  setDoc,
  writeBatch
} from 'firebase/firestore';
import MockDataService from './MockDataService';
import { createLoadingProxy } from './LoadingInterceptor';

// Check if demo mode is enabled
const IS_DEMO = process.env.REACT_APP_IS_DEMO === 'true';

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
      config: 'config',
      talentTestEvents: 'talentTestEvents',
      categories: 'categories'
    };
    
    // Use mock service in demo mode
    if (IS_DEMO) {
      console.log('🎭 Running in DEMO mode - using mock data');
      return MockDataService;
    }
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
      const docRef = doc(db, this.collections.participants, String(id));
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

  async addGroupEvent(groupEventData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.groupEvents), {
        ...groupEventData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...groupEventData };
    } catch (error) {
      console.error('Error adding group event:', error);
      throw error;
    }
  }

  async updateGroupEvent(id, groupEventData) {
    try {
      const docRef = doc(db, this.collections.groupEvents, String(id));
      await updateDoc(docRef, {
        ...groupEventData,
        updatedAt: new Date().toISOString()
      });
      return { id, ...groupEventData };
    } catch (error) {
      console.error('Error updating group event:', error);
      throw error;
    }
  }

  async deleteGroupEvent(id) {
    try {
      await deleteDoc(doc(db, this.collections.groupEvents, String(id)));
      return true;
    } catch (error) {
      console.error('Error deleting group event:', error);
      throw error;
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
      const docRef = doc(db, this.collections.groupTeams, String(id));
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

  async getChurchesBySection(sectionName) {
    try {
      const sections = await this.getSections();
      const section = sections.find(s => s.name === sectionName);
      return section ? section.churches : [];
    } catch (error) {
      console.error('Error fetching churches:', error);
      return [];
    }
  }

  // ===== AGE CATEGORIES =====

  async getCategories() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collections.categories));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching categories:', error);
      return [];
    }
  }

  async addCategory(categoryData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.categories), {
        ...categoryData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...categoryData };
    } catch (error) {
      console.error('Error adding category:', error);
      throw error;
    }
  }

  async updateCategory(id, categoryData) {
    try {
      const docRef = doc(db, this.collections.categories, id);
      await updateDoc(docRef, {
        ...categoryData,
        updatedAt: new Date().toISOString()
      });
      return { id, ...categoryData };
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  async deleteCategory(id) {
    try {
      await deleteDoc(doc(db, this.collections.categories, id));
      return true;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  async getChurchesBySection(sectionName) {
    try {
      const sections = await this.getSections();
      const section = sections.find(s => s.name === sectionName);
      return section ? section.churches : [];
    } catch (error) {
      console.error('Error fetching churches by section:', error);
      return [];
    }
  }

  async getParticipantsBySection(sectionName) {
    try {
      const participants = await this.getParticipants();
      return participants.filter(p => p.section === sectionName);
    } catch (error) {
      console.error('Error fetching participants by section:', error);
      return [];
    }
  }

  // ===== TALENT TEST EVENTS =====
  
  async getTalentTestEvents() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collections.talentTestEvents));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching talent test events:', error);
      return [];
    }
  }

  async getTalentTestEventById(id) {
    try {
      const docRef = doc(db, this.collections.talentTestEvents, String(id));
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (error) {
      console.error('Error fetching talent test event:', error);
      return null;
    }
  }

  async addTalentTestEvent(eventData) {
    try {
      const docRef = await addDoc(collection(db, this.collections.talentTestEvents), {
        ...eventData,
        createdAt: new Date().toISOString()
      });
      return { id: docRef.id, ...eventData };
    } catch (error) {
      console.error('Error adding talent test event:', error);
      throw error;
    }
  }

  async updateTalentTestEvent(id, eventData) {
    try {
      const docRef = doc(db, this.collections.talentTestEvents, id);
      await updateDoc(docRef, {
        ...eventData,
        updatedAt: new Date().toISOString()
      });
      return { id, ...eventData };
    } catch (error) {
      console.error('Error updating talent test event:', error);
      throw error;
    }
  }

  async deleteTalentTestEvent(id) {
    try {
      await deleteDoc(doc(db, this.collections.talentTestEvents, id));
      return true;
    } catch (error) {
      console.error('Error deleting talent test event:', error);
      throw error;
    }
  }

  async getActiveTalentTestEvent() {
    try {
      const events = await this.getTalentTestEvents();
      const now = new Date();
      return events.find(event => {
        if (!event.startDate || !event.registrationOpen) return false;
        const start = new Date(event.startDate);
        const end = event.endDate ? new Date(event.endDate) : new Date('2099-12-31');
        return now >= start && now <= end && event.registrationOpen;
      });
    } catch (error) {
      console.error('Error fetching active talent test event:', error);
      return null;
    }
  }

  // ===== JUDGES =====
  
  async getJudges() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collections.judges));
      const judges = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      
      // If judges collection is empty, fall back to judgeCredentials in config
      if (judges.length === 0) {
        const docRef = doc(db, this.collections.config, 'judgeCredentials');
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const credentials = docSnap.data();
          return (credentials.judges || []).map(jc => ({
            username: jc.username,
            password: jc.password
          }));
        }
      }
      
      return judges;
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

  // ===== SCORES / RESULTS =====
  
  async getScores() {
    try {
      const querySnapshot = await getDocs(collection(db, this.collections.results));
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching scores:', error);
      return [];
    }
  }

  async addScore(scoreData) {
    try {
      const scoreId = `${scoreData.participantId}-${scoreData.eventId}-${scoreData.judgeName}`;
      const docRef = doc(db, this.collections.results, scoreId);
      const newScore = {
        ...scoreData,
        id: scoreId,
        submittedDate: new Date().toISOString()
      };
      await setDoc(docRef, newScore);
      return newScore;
    } catch (error) {
      console.error('Error adding score:', error);
      throw error;
    }
  }

  async updateScore(participantId, eventId, judgeName, updatedScore) {
    try {
      const scoreId = `${participantId}-${eventId}-${judgeName}`;
      const docRef = doc(db, this.collections.results, scoreId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const existingScore = docSnap.data();
        const updated = {
          ...existingScore,
          ...updatedScore,
          updatedDate: new Date().toISOString()
        };
        await setDoc(docRef, updated);
        return updated;
      } else {
        // If not found, add as new score
        return await this.addScore({ participantId, eventId, judgeName, ...updatedScore });
      }
    } catch (error) {
      console.error('Error updating score:', error);
      throw error;
    }
  }

  async getScoresByParticipant(participantId) {
    try {
      const q = query(
        collection(db, this.collections.results),
        where('participantId', '==', participantId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching scores by participant:', error);
      return [];
    }
  }

  async getScoresByEvent(eventId) {
    try {
      const q = query(
        collection(db, this.collections.results),
        where('eventId', '==', eventId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching scores by event:', error);
      return [];
    }
  }

  async getScoresByJudge(judgeName) {
    try {
      const q = query(
        collection(db, this.collections.results),
        where('judgeName', '==', judgeName)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching scores by judge:', error);
      return [];
    }
  }

  async getScoresByParticipantAndEvent(participantId, eventId) {
    try {
      const q = query(
        collection(db, this.collections.results),
        where('participantId', '==', participantId),
        where('eventId', '==', eventId)
      );
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      console.error('Error fetching scores by participant and event:', error);
      return [];
    }
  }

  async deleteScoresByJudge(judgeName) {
    try {
      const scores = await this.getScoresByJudge(judgeName);
      const batch = writeBatch(db);
      
      scores.forEach(score => {
        const docRef = doc(db, this.collections.results, score.id);
        batch.delete(docRef);
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error deleting scores by judge:', error);
      throw error;
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
  
  async getAgeCategory(age) {
    try {
      const categories = await this.getCategories();
      // Sort by order to check in the correct sequence
      const sortedCategories = categories.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      for (const category of sortedCategories) {
        if (age >= category.minAge && age <= category.maxAge) {
          return category.name;
        }
      }
      return null;
    } catch (error) {
      console.error('Error getting age category:', error);
      return null;
    }
  }

  async getMinMaxAge() {
    try {
      const categories = await this.getCategories();
      if (categories.length === 0) {
        return { minAge: 6, maxAge: 25 }; // Fallback defaults
      }
      const minAge = Math.min(...categories.map(c => c.minAge));
      const maxAge = Math.max(...categories.map(c => c.maxAge));
      return { minAge, maxAge };
    } catch (error) {
      console.error('Error getting min/max age:', error);
      return { minAge: 6, maxAge: 25 }; // Fallback defaults
    }
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
      const prefix = await this.getCategoryPrefix(category);
      
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
      const participantRef = doc(db, this.collections.participants, participantId);
      const participant = await getDoc(participantRef);
      if (!participant.exists()) return false;
      
      // Use updateDoc with deleteField to properly remove the field from Firestore
      await updateDoc(participantRef, {
        chestNumber: deleteField()
      });
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

  async getCategoryPrefix(category) {
    try {
      const categories = await this.getCategories();
      const found = categories.find(c => c.name === category);
      
      if (!found) return 'X';
      
      // Generate prefix from category name
      // If single word: use first letter (e.g., "Junior" -> "J")
      // If multiple words: use first letter of each word (e.g., "Super Senior" -> "SS")
      const words = found.name.trim().split(/\s+/);
      const prefix = words.map(word => word.charAt(0).toUpperCase()).join('');
      
      return prefix;
    } catch (error) {
      console.error('Error getting category prefix:', error);
      return 'X';
    }
  }

  // ===== AUTHENTICATION =====

  async validateAdmin(username, password) {
    try {
      const docRef = doc(db, this.collections.config, 'adminCredentials');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const credentials = docSnap.data();
        return credentials.username === username && credentials.password === password;
      }
      
      // Fallback to default credentials if not set
      return username === 'admin' && password === 'admin123';
    } catch (error) {
      console.error('Error validating admin:', error);
      return false;
    }
  }

  // ===== JUDGE CREDENTIALS =====

  async getJudgeCredentials() {
    try {
      const docRef = doc(db, this.collections.config, 'judgeCredentials');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const credentials = docSnap.data();
        return credentials.judges || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching judge credentials:', error);
      return [];
    }
  }

  async saveJudgeCredentials(judges) {
    try {
      const docRef = doc(db, this.collections.config, 'judgeCredentials');
      await setDoc(docRef, { judges });
      return true;
    } catch (error) {
      console.error('Error saving judge credentials:', error);
      throw error;
    }
  }

  async validateJudge(username, password) {
    try {
      // First, validate credentials from master data
      const judges = await this.getJudgeCredentials();
      
      let isValidCredentials = false;
      
      if (judges.length > 0) {
        isValidCredentials = judges.some(judge => judge.username === username && judge.password === password);
      } else {
        // Fallback to default credentials
        const defaultJudges = [
          { username: 'judge1', password: 'judge123' },
          { username: 'judge2', password: 'judge123' },
          { username: 'judge3', password: 'judge123' }
        ];
        isValidCredentials = defaultJudges.some(judge => judge.username === username && judge.password === password);
      }
      
      if (!isValidCredentials) {
        return { valid: false };
      }
      
      // Find which talent test event this judge is assigned to
      const eventsSnapshot = await getDocs(collection(db, this.collections.talentTestEvents));
      let assignedEvent = null;
      
      eventsSnapshot.forEach(doc => {
        const event = { id: doc.id, ...doc.data() };
        if (event.judges && event.judges.includes(username)) {
          assignedEvent = event;
        }
      });
      
      if (!assignedEvent) {
        return { valid: false, error: 'Not assigned to any talent test event' };
      }
      
      return { 
        valid: true, 
        talentTestEventId: assignedEvent.id,
        talentTestEventName: assignedEvent.name
      };
    } catch (error) {
      console.error('Error validating judge:', error);
      return { valid: false, error: error.message };
    }
  }

  // ===== SECTION CREDENTIALS =====

  async getSectionCredentials() {
    try {
      const docRef = doc(db, this.collections.config, 'sectionCredentials');
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        const credentials = docSnap.data();
        return credentials.sections || [];
      }
      
      return [];
    } catch (error) {
      console.error('Error fetching section credentials:', error);
      return [];
    }
  }

  async saveSectionCredentials(sections) {
    try {
      const docRef = doc(db, this.collections.config, 'sectionCredentials');
      await setDoc(docRef, { sections });
      return true;
    } catch (error) {
      console.error('Error saving section credentials:', error);
      throw error;
    }
  }

  async validateSection(username, password) {
    try {
      const sections = await this.getSectionCredentials();
      
      if (sections.length > 0) {
        const section = sections.find(sec => sec.username === username && sec.password === password);
        return section ? { valid: true, section: section.section } : { valid: false };
      }
      
      // Fallback to default credentials
      const defaultSections = [
        { username: 'pathanapuram', password: 'pathanapuram123', section: 'Pathanapuram' },
        { username: 'kollam', password: 'kollam123', section: 'Kollam' },
        { username: 'alappuzha', password: 'alappuzha123', section: 'Alappuzha' },
        { username: 'kottayam', password: 'kottayam123', section: 'Kottayam' }
      ];
      const section = defaultSections.find(sec => sec.username === username && sec.password === password);
      return section ? { valid: true, section: section.section } : { valid: false };
    } catch (error) {
      console.error('Error validating section:', error);
      return { valid: false };
    }
  }

  // ===== JUDGE LOCKS =====

  async getJudgeLocks() {
    try {
      const docRef = doc(db, this.collections.config, 'judgeLocks');
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data().locks || []) : [];
    } catch (error) {
      console.error('Error fetching judge locks:', error);
      return [];
    }
  }

  async saveJudgeLocks(locks) {
    try {
      await setDoc(doc(db, this.collections.config, 'judgeLocks'), { locks });
      return true;
    } catch (error) {
      console.error('Error saving judge locks:', error);
      throw error;
    }
  }

  async deleteJudgeLocksByJudge(judgeName) {
    try {
      const locks = await this.getJudgeLocks();
      const updatedLocks = locks.filter(l => l.judgeName !== judgeName);
      await this.saveJudgeLocks(updatedLocks);
      return true;
    } catch (error) {
      console.error('Error deleting judge locks:', error);
      throw error;
    }
  }

  async lockScores(judgeName, eventId, category) {
    try {
      const locks = await this.getJudgeLocks();
      
      const lockIndex = locks.findIndex(
        l => l.judgeName === judgeName && l.eventId === eventId && l.category === category
      );
      
      if (lockIndex !== -1) {
        locks[lockIndex].locked = true;
        locks[lockIndex].lockedDate = new Date().toISOString();
      } else {
        locks.push({
          judgeName,
          eventId,
          category,
          locked: true,
          lockedDate: new Date().toISOString()
        });
      }
      
      await setDoc(doc(db, this.collections.config, 'judgeLocks'), { locks });
      return true;
    } catch (error) {
      console.error('Error locking scores:', error);
      throw error;
    }
  }

  async unlockScores(judgeName, eventId, category) {
    try {
      const locks = await this.getJudgeLocks();
      
      const lockIndex = locks.findIndex(
        l => l.judgeName === judgeName && l.eventId === eventId && l.category === category
      );
      
      if (lockIndex !== -1) {
        locks[lockIndex].locked = false;
      }
      
      await setDoc(doc(db, this.collections.config, 'judgeLocks'), { locks });
      return true;
    } catch (error) {
      console.error('Error unlocking scores:', error);
      throw error;
    }
  }

  async isScoreLocked(judgeName, eventId, category) {
    try {
      const locks = await this.getJudgeLocks();
      const lock = locks.find(
        l => l.judgeName === judgeName && l.eventId === eventId && l.category === category
      );
      return lock ? lock.locked : false;
    } catch (error) {
      console.error('Error checking score lock:', error);
      return false;
    }
  }

  async areAllJudgesLocked(eventId, category) {
    try {
      const locks = await this.getJudgeLocks();
      const events = await this.getEvents();
      const event = events.find(e => e.id === eventId);
      
      // For single-judge events, check if at least one judge has locked
      if (event && event.scoringType === 'single-judge') {
        const lockedJudges = locks.filter(
          l => l.eventId === eventId && l.category === category && l.locked
        );
        return lockedJudges.length > 0;
      }
      
      // For all-judges events, check if all judges have locked
      const docRef = doc(db, this.collections.config, 'judgeCredentials');
      const docSnap = await getDoc(docRef);
      let judgeCount = 3; // default
      
      if (docSnap.exists()) {
        const credentials = docSnap.data();
        judgeCount = (credentials.judges || []).length;
      }
      
      const lockedJudges = locks.filter(
        l => l.eventId === eventId && l.category === category && l.locked
      );
      
      return lockedJudges.length === judgeCount;
    } catch (error) {
      console.error('Error checking all judges locked:', error);
      return false;
    }
  }

  // ===== GROUP EVENT LOCKS =====

  async getGroupEventLocks() {
    try {
      const docRef = doc(db, this.collections.config, 'groupEventLocks');
      const docSnap = await getDoc(docRef);
      return docSnap.exists() ? (docSnap.data().locks || []) : [];
    } catch (error) {
      console.error('Error fetching group event locks:', error);
      return [];
    }
  }

  async saveGroupEventLocks(locks) {
    try {
      await setDoc(doc(db, this.collections.config, 'groupEventLocks'), { locks });
      return true;
    } catch (error) {
      console.error('Error saving group event locks:', error);
      throw error;
    }
  }

  // ===== LEGACY COMPATIBILITY METHODS =====
  
  // These methods provide compatibility with the old StorageService
  async getData() {
    try {
      const [
        participants,
        events,
        groupEvents,
        groupTeams,
        sections,
        judges,
        scores,
        pointsConfig,
        declaredResults,
        judgeLocks,
        groupEventLocks
      ] = await Promise.all([
        this.getParticipants(),
        this.getEvents(),
        this.getGroupEvents(),
        this.getGroupTeams(),
        this.getSections(),
        this.getJudges(),
        this.getScores(),
        this.getPointsConfig(),
        this.getDeclaredResults(),
        this.getJudgeLocks(),
        this.getGroupEventLocks()
      ]);

      return {
        participants,
        events,
        groupEvents,
        groupTeams,
        sections,
        judges,
        scores,
        pointsConfig,
        declaredResults,
        judgeLocks,
        groupEventLocks,
        // Legacy credentials for compatibility
        adminCredentials: { username: 'admin', password: 'admin123' },
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
        ]
      };
    } catch (error) {
      console.error('Error getting all data:', error);
      return {
        participants: [],
        events: [],
        groupEvents: [],
        groupTeams: [],
        sections: [],
        judges: [],
        scores: [],
        pointsConfig: {
          individual: { first: 5, second: 3, third: 1 },
          group: { first: 10, second: 5, third: 3 }
        },
        declaredResults: [],
        judgeLocks: [],
        groupEventLocks: [],
        adminCredentials: { username: 'admin', password: 'admin123' },
        judgeCredentials: [],
        sectionCredentials: []
      };
    }
  }

  async saveData(data) {
    // This is a legacy method for compatibility
    // In Firebase, we save data individually through specific methods
    console.warn('saveData is a legacy method. Data should be saved using specific Firebase methods.');
    
    try {
      // Batch update group teams if modified
      if (data.groupTeams) {
        const batch = writeBatch(db);
        data.groupTeams.forEach(team => {
          if (team.id) {
            const docRef = doc(db, this.collections.groupTeams, team.id.toString());
            batch.set(docRef, team, { merge: true });
          }
        });
        await batch.commit();
      }

      // Update points config if modified
      if (data.pointsConfig) {
        await this.savePointsConfig(data.pointsConfig);
      }

      // Update declared results if modified
      if (data.declaredResults) {
        await setDoc(doc(db, this.collections.config, 'declaredResults'), {
          results: data.declaredResults
        });
      }

      // Update judge locks if modified
      if (data.judgeLocks) {
        await setDoc(doc(db, this.collections.config, 'judgeLocks'), {
          locks: data.judgeLocks
        });
      }

      // Update group event locks if modified
      if (data.groupEventLocks) {
        await setDoc(doc(db, this.collections.config, 'groupEventLocks'), {
          locks: data.groupEventLocks
        });
      }

      return true;
    } catch (error) {
      console.error('Error in saveData:', error);
      throw error;
    }
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
        r => String(r.groupEventId) === String(groupEventId)
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
        r => String(r.groupEventId) !== String(groupEventId)
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
      const categoriesData = await this.getCategories();
      const categories = categoriesData.map(c => c.name);
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
      console.log('Debug - Checking isGroupResultDeclared for:', groupEventId);
      console.log('Debug - All declared results:', declaredResults);
      const result = declaredResults.some(r => String(r.groupEventId) === String(groupEventId));
      console.log('Debug - Result:', result);
      return result;
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

const firebaseServiceInstance = new FirebaseService();

// Export unwrapped instance for pages that don't need loading overlay (like Home)
export const FirebaseServiceWithoutLoading = firebaseServiceInstance;

// Export with loading wrapper as default
export default createLoadingProxy(firebaseServiceInstance);


