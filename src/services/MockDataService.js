// Mock data for demo purposes
import { createLoadingProxy } from './LoadingInterceptor';

const mockData = {
  participants: [],
  events: [],
  groupEvents: [],
  groupTeams: [],
  sections: [],
  judges: [],
  scores: [],
  talentTestEvents: [],
  pointsConfig: {
    individual: { first: 5, second: 3, third: 1 },
    group: { first: 10, second: 5, third: 3 }
  },
  declaredResults: [],
  judgeLocks: [],
  groupEventLocks: [],
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

let nextParticipantId = 1;
let nextEventId = 1;
let nextSectionId = 1;
let nextJudgeId = 1;
let nextGroupTeamId = 1;
let nextGroupEventId = 1;
let nextTalentTestEventId = 1;

class MockDataService {
  // ===== PARTICIPANTS =====
  
  async getParticipants() {
    return Promise.resolve([...mockData.participants]);
  }

  async addParticipant(participantData) {
    const newParticipant = { id: String(nextParticipantId++), ...participantData };
    mockData.participants.push(newParticipant);
    return Promise.resolve(newParticipant);
  }

  async updateParticipant(id, participantData) {
    const index = mockData.participants.findIndex(p => p.id === id);
    if (index !== -1) {
      mockData.participants[index] = { ...mockData.participants[index], ...participantData };
      return Promise.resolve(mockData.participants[index]);
    }
    return Promise.reject(new Error('Participant not found'));
  }

  async deleteParticipant(id) {
    const index = mockData.participants.findIndex(p => p.id === id);
    if (index !== -1) {
      mockData.participants.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  // ===== EVENTS =====
  
  async getEvents() {
    return Promise.resolve([...mockData.events]);
  }

  async addEvent(eventData) {
    const newEvent = { id: String(nextEventId++), ...eventData };
    mockData.events.push(newEvent);
    return Promise.resolve(newEvent);
  }

  async updateEvent(id, eventData) {
    const index = mockData.events.findIndex(e => e.id === id);
    if (index !== -1) {
      mockData.events[index] = { ...mockData.events[index], ...eventData };
      return Promise.resolve(mockData.events[index]);
    }
    return Promise.reject(new Error('Event not found'));
  }

  async deleteEvent(id) {
    const index = mockData.events.findIndex(e => e.id === id);
    if (index !== -1) {
      mockData.events.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  // ===== GROUP EVENTS =====
  
  async getGroupEvents() {
    return Promise.resolve([...mockData.groupEvents]);
  }

  // ===== GROUP TEAMS =====
  
  async getGroupTeams() {
    return Promise.resolve([...mockData.groupTeams]);
  }

  async addGroupTeam(teamData) {
    const newTeam = { id: nextGroupTeamId++, ...teamData };
    mockData.groupTeams.push(newTeam);
    return Promise.resolve(newTeam);
  }

  async updateGroupTeam(id, teamData) {
    const index = mockData.groupTeams.findIndex(t => t.id === id);
    if (index !== -1) {
      mockData.groupTeams[index] = { ...mockData.groupTeams[index], ...teamData };
      return Promise.resolve(mockData.groupTeams[index]);
    }
    return Promise.reject(new Error('Team not found'));
  }

  async deleteGroupTeam(id) {
    const index = mockData.groupTeams.findIndex(t => t.id === id);
    if (index !== -1) {
      mockData.groupTeams.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  // ===== SECTIONS =====
  
  async getSections() {
    return Promise.resolve([...mockData.sections]);
  }

  async addSection(sectionData) {
    const newSection = { id: nextSectionId++, ...sectionData };
    mockData.sections.push(newSection);
    return Promise.resolve(newSection);
  }

  async updateSection(id, sectionData) {
    const index = mockData.sections.findIndex(s => s.id === id);
    if (index !== -1) {
      mockData.sections[index] = { ...mockData.sections[index], ...sectionData };
      return Promise.resolve(mockData.sections[index]);
    }
    return Promise.reject(new Error('Section not found'));
  }

  async deleteSection(id) {
    const index = mockData.sections.findIndex(s => s.id === id);
    if (index !== -1) {
      mockData.sections.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  async getChurchesBySection(sectionName) {
    const section = mockData.sections.find(s => s.name === sectionName);
    return Promise.resolve(section ? section.churches : []);
  }

  async getParticipantsBySection(sectionName) {
    const filtered = mockData.participants.filter(p => p.section === sectionName);
    return Promise.resolve(filtered);
  }

  // ===== TALENT TEST EVENTS =====
  
  async getTalentTestEvents() {
    return Promise.resolve([...mockData.talentTestEvents]);
  }

  async addTalentTestEvent(eventData) {
    const newEvent = { 
      id: String(nextTalentTestEventId++), 
      ...eventData,
      createdAt: new Date().toISOString()
    };
    mockData.talentTestEvents.push(newEvent);
    return Promise.resolve(newEvent);
  }

  async updateTalentTestEvent(id, eventData) {
    const index = mockData.talentTestEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      mockData.talentTestEvents[index] = { 
        ...mockData.talentTestEvents[index], 
        ...eventData,
        updatedAt: new Date().toISOString()
      };
      return Promise.resolve(mockData.talentTestEvents[index]);
    }
    return Promise.reject(new Error('Talent test event not found'));
  }

  async deleteTalentTestEvent(id) {
    const index = mockData.talentTestEvents.findIndex(e => e.id === id);
    if (index !== -1) {
      mockData.talentTestEvents.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  async getActiveTalentTestEvent() {
    const now = new Date();
    const activeEvent = mockData.talentTestEvents.find(event => {
      if (!event.startDate || !event.registrationOpen) return false;
      const start = new Date(event.startDate);
      const end = event.endDate ? new Date(event.endDate) : new Date('2099-12-31');
      return now >= start && now <= end && event.registrationOpen;
    });
    return Promise.resolve(activeEvent || null);
  }

  // ===== JUDGES =====
  
  async getJudges() {
    return Promise.resolve([...mockData.judges]);
  }

  async addJudge(judgeData) {
    const newJudge = { id: String(nextJudgeId++), ...judgeData };
    mockData.judges.push(newJudge);
    return Promise.resolve(newJudge);
  }

  async updateJudge(id, judgeData) {
    const index = mockData.judges.findIndex(j => j.id === id);
    if (index !== -1) {
      mockData.judges[index] = { ...mockData.judges[index], ...judgeData };
      return Promise.resolve(mockData.judges[index]);
    }
    return Promise.reject(new Error('Judge not found'));
  }

  async deleteJudge(id) {
    const index = mockData.judges.findIndex(j => j.id === id);
    if (index !== -1) {
      mockData.judges.splice(index, 1);
      return Promise.resolve(true);
    }
    return Promise.resolve(false);
  }

  // ===== SCORES / RESULTS =====
  
  async getScores() {
    return Promise.resolve([...mockData.scores]);
  }

  async addScore(scoreData) {
    const scoreId = `${scoreData.participantId}-${scoreData.eventId}-${scoreData.judgeName}`;
    const newScore = { id: scoreId, ...scoreData };
    const index = mockData.scores.findIndex(s => s.id === scoreId);
    if (index !== -1) {
      mockData.scores[index] = newScore;
    } else {
      mockData.scores.push(newScore);
    }
    return Promise.resolve(newScore);
  }

  async updateScore(participantId, eventId, judgeName, updatedScore) {
    const scoreId = `${participantId}-${eventId}-${judgeName}`;
    const index = mockData.scores.findIndex(s => s.id === scoreId);
    if (index !== -1) {
      mockData.scores[index] = { ...mockData.scores[index], ...updatedScore };
      return Promise.resolve(mockData.scores[index]);
    }
    return this.addScore({ participantId, eventId, judgeName, ...updatedScore });
  }

  async getScoresByParticipant(participantId) {
    const filtered = mockData.scores.filter(s => s.participantId === participantId);
    return Promise.resolve(filtered);
  }

  async getScoresByEvent(eventId) {
    const filtered = mockData.scores.filter(s => s.eventId === eventId);
    return Promise.resolve(filtered);
  }

  async getScoresByJudge(judgeName) {
    const filtered = mockData.scores.filter(s => s.judgeName === judgeName);
    return Promise.resolve(filtered);
  }

  async getScoresByParticipantAndEvent(participantId, eventId) {
    const filtered = mockData.scores.filter(
      s => s.participantId === participantId && s.eventId === eventId
    );
    return Promise.resolve(filtered);
  }

  async saveResult(resultData) {
    return this.addScore(resultData);
  }

  async getResults() {
    return this.getScores();
  }

  async getResultsByEvent(eventId) {
    return this.getScoresByEvent(eventId);
  }

  // ===== CONFIGURATION =====
  
  async getPointsConfig() {
    return Promise.resolve({ ...mockData.pointsConfig });
  }

  async savePointsConfig(config) {
    mockData.pointsConfig = { ...config };
    return Promise.resolve(config);
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
    const participant = mockData.participants.find(p => p.id === participantId);
    if (!participant) return null;
    
    if (participant.chestNumber) return participant.chestNumber;

    const category = participant.ageCategory;
    const prefix = this.getCategoryPrefix(category);
    
    const categoryParticipants = mockData.participants.filter(p => 
      p.ageCategory === category && p.chestNumber && p.chestNumber.startsWith(prefix)
    );
    
    let maxNumber = 0;
    categoryParticipants.forEach(p => {
      const match = p.chestNumber.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0]);
        if (num > maxNumber) maxNumber = num;
      }
    });
    
    const chestNumber = `${prefix}-${String(maxNumber + 1).padStart(3, '0')}`;
    await this.updateParticipant(participantId, { chestNumber });
    
    return chestNumber;
  }

  async removeChestNumber(participantId) {
    const participant = mockData.participants.find(p => p.id === participantId);
    if (!participant) return false;
    
    delete participant.chestNumber;
    return Promise.resolve(true);
  }

  async assignAllChestNumbers() {
    const unassigned = mockData.participants.filter(p => !p.chestNumber);
    
    let count = 0;
    for (const participant of unassigned) {
      await this.assignChestNumber(participant.id);
      count++;
    }
    
    return Promise.resolve(count);
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

  // ===== AUTHENTICATION =====

  async validateAdmin(username, password) {
    return Promise.resolve(
      mockData.adminCredentials.username === username && 
      mockData.adminCredentials.password === password
    );
  }

  async validateJudge(username, password) {
    return Promise.resolve(
      mockData.judgeCredentials.some(j => j.username === username && j.password === password)
    );
  }

  async validateSection(username, password) {
    const section = mockData.sectionCredentials.find(
      s => s.username === username && s.password === password
    );
    return Promise.resolve(section ? { valid: true, section: section.section } : { valid: false });
  }

  // ===== JUDGE LOCKS =====

  async getJudgeLocks() {
    return Promise.resolve([...mockData.judgeLocks]);
  }

  async lockScores(judgeName, eventId, category) {
    const lockIndex = mockData.judgeLocks.findIndex(
      l => l.judgeName === judgeName && l.eventId === eventId && l.category === category
    );
    
    if (lockIndex !== -1) {
      mockData.judgeLocks[lockIndex].locked = true;
      mockData.judgeLocks[lockIndex].lockedDate = new Date().toISOString();
    } else {
      mockData.judgeLocks.push({
        judgeName,
        eventId,
        category,
        locked: true,
        lockedDate: new Date().toISOString()
      });
    }
    
    return Promise.resolve(true);
  }

  async unlockScores(judgeName, eventId, category) {
    const lockIndex = mockData.judgeLocks.findIndex(
      l => l.judgeName === judgeName && l.eventId === eventId && l.category === category
    );
    
    if (lockIndex !== -1) {
      mockData.judgeLocks[lockIndex].locked = false;
    }
    
    return Promise.resolve(true);
  }

  async isScoreLocked(judgeName, eventId, category) {
    const lock = mockData.judgeLocks.find(
      l => l.judgeName === judgeName && l.eventId === eventId && l.category === category
    );
    return Promise.resolve(lock ? lock.locked : false);
  }

  async areAllJudgesLocked(eventId, category) {
    const event = mockData.events.find(e => e.id === eventId);
    
    if (event && event.scoringType === 'single-judge') {
      const lockedJudges = mockData.judgeLocks.filter(
        l => l.eventId === eventId && l.category === category && l.locked
      );
      return Promise.resolve(lockedJudges.length > 0);
    }
    
    const judgeCount = mockData.judgeCredentials.length;
    const lockedJudges = mockData.judgeLocks.filter(
      l => l.eventId === eventId && l.category === category && l.locked
    );
    
    return Promise.resolve(lockedJudges.length === judgeCount);
  }

  // ===== LEGACY COMPATIBILITY =====
  
  async getData() {
    return Promise.resolve({
      participants: [...mockData.participants],
      events: [...mockData.events],
      groupEvents: [...mockData.groupEvents],
      groupTeams: [...mockData.groupTeams],
      sections: [...mockData.sections],
      judges: [...mockData.judges],
      scores: [...mockData.scores],
      pointsConfig: { ...mockData.pointsConfig },
      declaredResults: [...mockData.declaredResults],
      judgeLocks: [...mockData.judgeLocks],
      groupEventLocks: [...mockData.groupEventLocks],
      adminCredentials: { ...mockData.adminCredentials },
      judgeCredentials: [...mockData.judgeCredentials],
      sectionCredentials: [...mockData.sectionCredentials]
    });
  }

  async saveData(data) {
    if (data.groupTeams) mockData.groupTeams = [...data.groupTeams];
    if (data.pointsConfig) mockData.pointsConfig = { ...data.pointsConfig };
    if (data.declaredResults) mockData.declaredResults = [...data.declaredResults];
    if (data.judgeLocks) mockData.judgeLocks = [...data.judgeLocks];
    if (data.groupEventLocks) mockData.groupEventLocks = [...data.groupEventLocks];
    return Promise.resolve(true);
  }

  // ===== RESULT DECLARATION =====

  async getDeclaredResults() {
    return Promise.resolve([...mockData.declaredResults]);
  }

  async declareResult(eventId, category) {
    const exists = mockData.declaredResults.some(
      r => r.eventId === eventId && r.category === category
    );
    
    if (!exists) {
      mockData.declaredResults.push({
        eventId,
        category,
        declaredAt: new Date().toISOString(),
        declaredBy: 'admin'
      });
      return Promise.resolve({ success: true, message: 'Result declared successfully' });
    }
    
    return Promise.resolve({ success: false, message: 'Result already declared' });
  }

  async declareGroupResult(groupEventId) {
    const exists = mockData.declaredResults.some(r => r.groupEventId === groupEventId);
    
    if (!exists) {
      mockData.declaredResults.push({
        groupEventId,
        declaredAt: new Date().toISOString(),
        declaredBy: 'admin'
      });
      return Promise.resolve({ success: true, message: 'Group result declared successfully' });
    }
    
    return Promise.resolve({ success: false, message: 'Group result already declared' });
  }

  async revertDeclaration(eventId, category) {
    const filtered = mockData.declaredResults.filter(
      r => !(r.eventId === eventId && r.category === category)
    );
    
    if (filtered.length < mockData.declaredResults.length) {
      mockData.declaredResults = filtered;
      return Promise.resolve({ success: true, message: 'Declaration reverted successfully' });
    }
    
    return Promise.resolve({ success: false, message: 'Declaration not found' });
  }

  async revertGroupDeclaration(groupEventId) {
    const filtered = mockData.declaredResults.filter(r => r.groupEventId !== groupEventId);
    
    if (filtered.length < mockData.declaredResults.length) {
      mockData.declaredResults = filtered;
      return Promise.resolve({ success: true, message: 'Group declaration reverted successfully' });
    }
    
    return Promise.resolve({ success: false, message: 'Group declaration not found' });
  }

  async declareAllResults() {
    const categories = ['Junior', 'Intermediate', 'Senior', 'Super Senior'];
    let declaredCount = 0;
    let alreadyDeclaredCount = 0;
    
    for (const event of mockData.events) {
      for (const category of categories) {
        const exists = mockData.declaredResults.some(
          r => r.eventId === event.id && r.category === category
        );
        
        if (!exists) {
          mockData.declaredResults.push({
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
      return Promise.resolve({
        success: true,
        message: `Successfully declared ${declaredCount} result(s). ${alreadyDeclaredCount} already declared.`,
        declaredCount,
        alreadyDeclaredCount
      });
    }
    
    return Promise.resolve({
      success: false,
      message: alreadyDeclaredCount > 0
        ? `All locked results (${alreadyDeclaredCount}) are already declared.`
        : 'No locked results available to declare.',
      declaredCount: 0,
      alreadyDeclaredCount
    });
  }

  async revertAllDeclarations() {
    const individualResults = mockData.declaredResults.filter(r => r.eventId);
    const groupResults = mockData.declaredResults.filter(r => r.groupEventId);
    const declaredCount = individualResults.length;
    
    if (declaredCount > 0) {
      mockData.declaredResults = groupResults;
      return Promise.resolve({
        success: true,
        message: `Successfully reverted ${declaredCount} declaration(s).`,
        revertedCount: declaredCount
      });
    }
    
    return Promise.resolve({
      success: false,
      message: 'No declared results to revert.',
      revertedCount: 0
    });
  }

  async isResultDeclared(eventId, category) {
    return Promise.resolve(
      mockData.declaredResults.some(r => r.eventId === eventId && r.category === category)
    );
  }

  async isGroupResultDeclared(groupEventId) {
    return Promise.resolve(
      mockData.declaredResults.some(r => r.groupEventId === groupEventId)
    );
  }

  // ===== CHAMPIONS =====

  async getChampionsStatus() {
    return Promise.resolve({ championsDeclared: false });
  }

  async declareChampions(championData) {
    return Promise.resolve({ success: true });
  }

  async revertChampions() {
    return Promise.resolve({ success: true });
  }

  // ===== DATA MIGRATION =====
  
  async migrateMockData(data) {
    if (data.events) mockData.events = [...data.events];
    if (data.groupEvents) mockData.groupEvents = [...data.groupEvents];
    if (data.sections) mockData.sections = [...data.sections];
    if (data.participants) mockData.participants = [...data.participants];
    if (data.groupTeams) mockData.groupTeams = [...data.groupTeams];
    if (data.judges) mockData.judges = [...data.judges];
    if (data.results) mockData.scores = [...data.results];
    if (data.pointsConfig) mockData.pointsConfig = { ...data.pointsConfig };
    return Promise.resolve(true);
  }
}

const mockServiceInstance = new MockDataService();

// Export with loading wrapper
export default createLoadingProxy(mockServiceInstance);


