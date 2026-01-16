import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FirebaseService from '../../services/FirebaseService';
import './JudgeDashboard.css';

const JudgeDashboard = () => {
  const [viewMode, setViewMode] = useState('individual'); // 'individual' or 'group'
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [groupEvents, setGroupEvents] = useState([]);
  const [groupTeams, setGroupTeams] = useState([]);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedEventId, setSelectedEventId] = useState(null);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [selectedGroupEventId, setSelectedGroupEventId] = useState(null);
  const [scores, setScores] = useState({
    criteria1: 0,
    criteria2: 0,
    criteria3: 0,
    criteria4: 0,
    criteria5: 0,
    comments: ''
  });
  const [groupScore, setGroupScore] = useState({
    score: 0,
    comments: ''
  });
  const [filterEvent, setFilterEvent] = useState('');
  const [filterCategory, setFilterCategory] = useState('');
  const [allScores, setAllScores] = useState([]);
  const [judgeLocks, setJudgeLocks] = useState([]);
  const [groupEventLocks, setGroupEventLocks] = useState([]);
  const [declaredResults, setDeclaredResults] = useState([]);
  const [sections, setSections] = useState([]);
  const [eventCategoryCombinations, setEventCategoryCombinations] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'judge') {
      navigate('/judge/login');
    } else {
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    const allEvents = await FirebaseService.getEvents();
    setEvents(allEvents);
    const allCategories = await FirebaseService.getCategories();
    setCategories(allCategories.sort((a, b) => (a.order || 0) - (b.order || 0)));
    
    // Filter participants by assigned talent test event
    const allParticipants = await FirebaseService.getParticipants();
    const filteredParticipants = user?.talentTestEventId 
      ? allParticipants.filter(p => p.talentTestEventId === user.talentTestEventId)
      : allParticipants;
    setParticipants(filteredParticipants);
    
    const scores = await FirebaseService.getScores();
    setAllScores(scores);
    const locks = await FirebaseService.getJudgeLocks();
    setJudgeLocks(locks);
    const allGroupEvents = await FirebaseService.getGroupEvents();
    setGroupEvents(allGroupEvents);
    
    // Filter group teams by assigned talent test event
    const allGroupTeams = await FirebaseService.getGroupTeams();
    const filteredGroupTeams = user?.talentTestEventId
      ? allGroupTeams.filter(t => t.talentTestEventId === user.talentTestEventId)
      : allGroupTeams;
    setGroupTeams(filteredGroupTeams);
    
    const data = await FirebaseService.getData();
    setGroupEventLocks(data.groupEventLocks || []);
    const allDeclaredResults = await FirebaseService.getDeclaredResults();
    setDeclaredResults(allDeclaredResults);
    const allSections = await FirebaseService.getSections();
    setSections(allSections);
  };

  // Get judge's score for a specific participant and event
  const getJudgeScore = (participantId, eventId) => {
    const score = allScores.find(
      s => s.participantId === participantId && 
           s.eventId === eventId && 
           s.judgeName === user?.username
    );
    return score;
  };

  // Get scoring status for a participant
  const getScoringStatus = (participant) => {
    const eventIds = participant.eventIds 
      ? participant.eventIds 
      : (participant.eventId ? [participant.eventId] : []);
    
    const scoredEvents = eventIds.filter(eventId => 
      getJudgeScore(participant.id, eventId)
    );
    
    if (scoredEvents.length === 0) {
      return { status: 'not-scored', text: 'Not Scored', count: `0/${eventIds.length}` };
    } else if (scoredEvents.length === eventIds.length) {
      return { status: 'fully-scored', text: 'Completed', count: `${scoredEvents.length}/${eventIds.length}` };
    } else {
      return { status: 'partially-scored', text: 'Partial', count: `${scoredEvents.length}/${eventIds.length}` };
    }
  };

  const handleScoreChange = (e) => {
    const { name, value } = e.target;
    setScores({
      ...scores,
      [name]: name === 'comments' ? value : Math.min(10, Math.max(0, parseInt(value) || 0))
    });
  };

  const handleSubmitScore = async (e) => {
    e.preventDefault();
    
    if (!selectedEventId) {
      alert('Please select an event to score');
      return;
    }

    // Check if judge already scored this participant for this event
    const existingScore = getJudgeScore(selectedParticipant.id, selectedEventId);
    
    const totalScore = 
      scores.criteria1 + 
      scores.criteria2 + 
      scores.criteria3 + 
      scores.criteria4 + 
      scores.criteria5;

    const scoreData = {
      participantId: selectedParticipant.id,
      eventId: selectedEventId,
      judgeName: user.username,
      criteria1: scores.criteria1,
      criteria2: scores.criteria2,
      criteria3: scores.criteria3,
      criteria4: scores.criteria4,
      criteria5: scores.criteria5,
      totalScore,
      comments: scores.comments
    };

    if (existingScore) {
      // Update existing score
      await FirebaseService.updateScore(
        selectedParticipant.id,
        selectedEventId,
        user.username,
        scoreData
      );
      alert('Score updated successfully!');
    } else {
      // Add new score
      await FirebaseService.addScore(scoreData);
      alert('Score submitted successfully!');
    }
    
    // Refresh scores
    const allScores = await FirebaseService.getScores();
    setAllScores(allScores);
    
    // Close modal
    handleCloseScoring();
  };

  const handleLogout = () => {
    logout();
    startTransition(() => {
      navigate('/judge/login');
    });
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.name : 'Unknown';
  };

  // Handle selecting a participant to score
  const handleSelectParticipant = async (participant, eventId) => {
    // Check if result is declared for this event-category
    const isDeclared = await FirebaseService.isResultDeclared(eventId, participant.ageCategory);
    
    if (isDeclared) {
      alert('Results have been declared for this event. Scoring is no longer available.');
      return;
    }
    
    setSelectedParticipant(participant);
    setSelectedEventId(eventId);
    
    // Load existing score if available
    const existingScore = getJudgeScore(participant.id, eventId);
    if (existingScore) {
      setScores({
        criteria1: existingScore.criteria1 || 0,
        criteria2: existingScore.criteria2 || 0,
        criteria3: existingScore.criteria3 || 0,
        criteria4: existingScore.criteria4 || 0,
        criteria5: existingScore.criteria5 || 0,
        comments: existingScore.comments || ''
      });
    } else {
      setScores({
        criteria1: 0,
        criteria2: 0,
        criteria3: 0,
        criteria4: 0,
        criteria5: 0,
        comments: ''
      });
    }
  };

  const handleCloseScoring = () => {
    setSelectedParticipant(null);
    setSelectedEventId(null);
    setScores({
      criteria1: 0,
      criteria2: 0,
      criteria3: 0,
      criteria4: 0,
      criteria5: 0,
      comments: ''
    });
  };

  const handleCloseGroupScoring = () => {
    setSelectedTeam(null);
    setSelectedGroupEventId(null);
    setGroupScore({
      score: 0,
      comments: ''
    });
  };

  // Create flattened list of participant-event combinations
  const getParticipantEventRows = () => {
    const rows = [];
    
    participants.forEach(participant => {
      // Skip participants without chest numbers
      if (!participant.chestNumber) return;
      
      const eventIds = participant.eventIds 
        ? participant.eventIds 
        : (participant.eventId ? [participant.eventId] : []);
      
      eventIds.forEach(eventId => {
        // Apply filters
        if (filterEvent && filterEvent !== eventId) return;
        if (filterCategory && participant.ageCategory !== filterCategory) return;
        
        const score = getJudgeScore(participant.id, eventId);
        
        rows.push({
          participantId: participant.id,
          participant: participant,
          eventId: eventId,
          eventName: getEventName(eventId),
          score: score,
          totalScore: score ? score.totalScore : null
        });
      });
    });
    
    // Sort by score descending (highest first)
    rows.sort((a, b) => {
      if (a.totalScore === null && b.totalScore === null) return 0;
      if (a.totalScore === null) return 1;
      if (b.totalScore === null) return -1;
      return b.totalScore - a.totalScore;
    });
    
    // Assign ranks to scored entries
    let currentRank = 0;
    let previousScore = null;
    let sameScoreCount = 0;
    
    rows.forEach((row, index) => {
      if (row.totalScore !== null) {
        if (previousScore === null || row.totalScore < previousScore) {
          currentRank = index + 1;
          sameScoreCount = 1;
          previousScore = row.totalScore;
        } else {
          sameScoreCount++;
        }
        row.rank = currentRank;
      } else {
        row.rank = null;
      }
    });
    
    return rows;
  };

  // Update event category combinations when data changes
  useEffect(() => {
    const updateEventCategoryCombinations = async () => {
      const rows = getParticipantEventRows();
      const combinations = new Map();
      
      for (const row of rows) {
        const key = `${row.eventId}-${row.participant.ageCategory}`;
        if (!combinations.has(key)) {
          const isLocked = await FirebaseService.isScoreLocked(
            user?.username,
            row.eventId,
            row.participant.ageCategory
          );
          
          // Check if all participants have scores for this event-category combination
          const participantsInCombo = rows.filter(
            r => r.eventId === row.eventId && r.participant.ageCategory === row.participant.ageCategory
          );
          const allScoresEntered = participantsInCombo.every(r => r.totalScore !== null);
          
          combinations.set(key, {
            eventId: row.eventId,
            eventName: row.eventName,
            category: row.participant.ageCategory,
            isLocked,
            allScoresEntered
          });
        }
      }
      
      setEventCategoryCombinations(Array.from(combinations.values()));
    };

    if (user?.username && participants.length > 0) {
      updateEventCategoryCombinations();
    } else {
      setEventCategoryCombinations([]);
    }
  }, [participants, filterEvent, filterCategory, allScores, judgeLocks, user]);

  const participantEventRows = getParticipantEventRows();

  const handleToggleLock = async (eventId, category, isCurrentlyLocked) => {
    // Check if result is declared
    const isDeclared = await FirebaseService.isResultDeclared(eventId, category);
    
    if (isDeclared) {
      alert('Results have been declared for this event. Lock status cannot be changed.');
      return;
    }
    
    if (isCurrentlyLocked) {
      if (window.confirm(`Are you sure you want to unlock your scores for ${getEventName(eventId)} - ${category}? This will allow you to edit scores again.`)) {
        await FirebaseService.unlockScores(user.username, eventId, category);
        const locks = await FirebaseService.getJudgeLocks();
        setJudgeLocks(locks);
      }
    } else {
      if (window.confirm(`Are you sure you want to lock your scores for ${getEventName(eventId)} - ${category}? You can unlock them later if needed.`)) {
        await FirebaseService.lockScores(user.username, eventId, category);
        const locks = await FirebaseService.getJudgeLocks();
        setJudgeLocks(locks);
      }
    }
  };

  const isEventCategoryLocked = (eventId, category) => {
    const combo = eventCategoryCombinations.find(
      c => c.eventId === eventId && c.category === category
    );
    return combo ? combo.isLocked : false;
  };

  const isResultDeclared = (eventId, category) => {
    return declaredResults.some(r => r.eventId === eventId && r.category === category);
  };

  const isGroupResultDeclared = (groupEventId) => {
    return declaredResults.some(r => r.groupEventId === groupEventId);
  };

  const handleToggleGroupEventLock = async (groupEventId, isCurrentlyLocked) => {
    const groupEvent = groupEvents.find(e => e.id === groupEventId);
    const eventName = groupEvent?.name || 'Unknown';
    
    // Check if result is declared
    const isDeclared = await FirebaseService.isGroupResultDeclared(groupEventId);
    
    if (isDeclared) {
      alert('Results have been declared for this event. Lock status cannot be changed.');
      return;
    }
    
    if (isCurrentlyLocked) {
      if (window.confirm(`Are you sure you want to unlock your scores for ${eventName}? This will allow you to edit scores again.`)) {
        const data = await FirebaseService.getData();
        if (!data.groupEventLocks) data.groupEventLocks = [];
        
        // Remove lock
        data.groupEventLocks = data.groupEventLocks.filter(
          lock => !(lock.judgeName === user.username && lock.groupEventId === groupEventId)
        );
        
        await FirebaseService.saveData(data);
        
        // Reload locks
        const updatedData = await FirebaseService.getData();
        setGroupEventLocks(updatedData.groupEventLocks || []);
      }
    } else {
      if (window.confirm(`Are you sure you want to lock your scores for ${eventName}? You can unlock them later if needed.`)) {
        const data = await FirebaseService.getData();
        if (!data.groupEventLocks) data.groupEventLocks = [];
        
        // Add lock
        data.groupEventLocks.push({
          judgeName: user.username,
          groupEventId: groupEventId,
          locked: true,
          lockedDate: new Date().toISOString()
        });
        
        await FirebaseService.saveData(data);
        
        // Reload locks
        const updatedData = await FirebaseService.getData();
        setGroupEventLocks(updatedData.groupEventLocks || []);
      }
    }
  };

  const isGroupEventLocked = (groupEventId) => {
    return groupEventLocks.some(
      lock => lock.judgeName === user?.username && lock.groupEventId === groupEventId && lock.locked
    );
  };

  const isGroupEventFullyLocked = (groupEventId) => {
    const groupEvent = groupEvents.find(e => e.id === groupEventId);
    
    // For Group Bible Quiz (scoringType: 'quiz'), only need one judge to lock
    if (groupEvent && groupEvent.scoringType === 'quiz') {
      return groupEventLocks.some(lock => lock.groupEventId === groupEventId && lock.locked);
    }
    
    // For other events, require all judges to lock
    const judges = ['judge1', 'judge2', 'judge3'];
    return judges.every(judge =>
      groupEventLocks.some(lock => lock.judgeName === judge && lock.groupEventId === groupEventId && lock.locked)
    );
  };

  const criteriaLabels = [
    'Presentation / Performance Quality',
    'Content / Creativity',
    'Technical Skills',
    'Stage Presence / Confidence',
    'Overall Impact'
  ];

  return (
    <div className="judge-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Judge Dashboard</h1>
          <p>Welcome, {user?.username}</p>
          {user?.talentTestEventName && (
            <p className="event-assignment">📋 Assigned Event: <strong>{user.talentTestEventName}</strong></p>
          )}
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div className="view-mode-switcher">
        <button 
          className={`mode-btn ${viewMode === 'individual' ? 'active' : ''}`}
          onClick={() => setViewMode('individual')}
        >
          📋 Individual Events
        </button>
        <button 
          className={`mode-btn ${viewMode === 'group' ? 'active' : ''}`}
          onClick={() => setViewMode('group')}
        >
          👥 Group Events
        </button>
      </div>

      {viewMode === 'individual' && (
      <div className="card">
        <h2>Participant List</h2>
        
        <div className="filter-section">
          <div className="form-group">
            <label htmlFor="filterEvent">Filter by Event:</label>
            <select
              id="filterEvent"
              value={filterEvent}
              onChange={(e) => setFilterEvent(e.target.value)}
            >
              <option value="">All Events</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="filterCategory">Filter by Category:</label>
            <select
              id="filterCategory"
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
            >
              <option value="">All Categories</option>
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name} ({category.minAge}-{category.maxAge})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Lock Status Section */}
        {eventCategoryCombinations.length > 0 && (
          <div className="lock-status-section">
            <h3>Score Lock Status</h3>
            <div className="lock-status-grid">
              {eventCategoryCombinations.map((combo) => (
                <div key={`${combo.eventId}-${combo.category}`} className="lock-status-item">
                  <div className="lock-info">
                    <strong>{combo.eventName}</strong>
                    <span className="category-label">{combo.category}</span>
                  </div>
                  <div className="lock-actions">
                    {isResultDeclared(combo.eventId, combo.category) && (
                      <span className="declared-badge">✓ Declared</span>
                    )}
                    <button
                      onClick={() => handleToggleLock(combo.eventId, combo.category, combo.isLocked)}
                      className={`btn-lock ${combo.isLocked ? 'locked' : 'unlocked'}`}
                      disabled={isResultDeclared(combo.eventId, combo.category) || (!combo.isLocked && !combo.allScoresEntered)}
                      title={
                        isResultDeclared(combo.eventId, combo.category) 
                          ? 'Cannot change lock status - Results have been declared' 
                          : !combo.allScoresEntered && !combo.isLocked
                          ? 'Please enter scores for all participants before locking'
                          : combo.isLocked 
                          ? 'Click to unlock scores' 
                          : 'Click to lock scores'
                      }
                    >
                      {combo.isLocked ? '🔓 Unlock' : '🔒 Lock'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {participantEventRows.length === 0 ? (
          <p className="no-data">
            {!filterEvent && !filterCategory
              ? 'Please select an event or category filter to view participants.'
              : participants.length === 0 
              ? 'No participants found.'
              : 'No participants match the selected filters or no chest numbers have been assigned yet.'}
          </p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Chest No.</th>
                  <th>Age</th>
                  <th>Category</th>
                  <th>Event</th>
                  <th>Your Score</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {participantEventRows.map((row, index) => {
                  const isScored = row.score !== null;
                  const isTopThree = row.rank && row.rank <= 3;
                  const rowClass = isTopThree ? `rank-${row.rank}` : '';
                  const isLocked = isEventCategoryLocked(row.eventId, row.participant.ageCategory);
                  
                  return (
                  <tr key={`${row.participantId}-${row.eventId}-${index}`} className={rowClass}>
                    <td>
                      {row.participant.chestNumber ? (
                        <span className="chest-number">{row.participant.chestNumber}</span>
                      ) : (
                        <span className="no-chest-number">-</span>
                      )}
                    </td>
                    <td>{row.participant.age}</td>
                    <td>
                      <span className="category-badge">{row.participant.ageCategory}</span>
                    </td>
                    <td>
                      {row.eventName}
                      {isLocked && <span className="locked-indicator" title="Scores locked">🔒</span>}
                    </td>
                    <td>
                      {isScored ? (
                        <div className="score-with-rank">
                          <span className="score-display scored">
                            {row.totalScore}/50
                          </span>
                          {isTopThree && (
                            <span className={`rank-badge rank-${row.rank}`}>
                              {row.rank === 1 ? '🥇' : row.rank === 2 ? '🥈' : '🥉'} #{row.rank}
                            </span>
                          )}
                        </div>
                      ) : (
                        <span className="score-display not-scored">
                          Not Scored
                        </span>
                      )}
                    </td>
                    <td>
                      <button
                        onClick={() => handleSelectParticipant(row.participant, row.eventId)}
                        className="btn-small btn-primary"
                        disabled={isLocked || isResultDeclared(row.eventId, row.participant.ageCategory)}
                        title={
                          isResultDeclared(row.eventId, row.participant.ageCategory) 
                            ? 'Results have been declared - Scoring is no longer available'
                            : isLocked 
                            ? 'Scores are locked for this event/category' 
                            : isScored 
                            ? 'Click to update score' 
                            : 'Click to score participant'
                        }
                      >
                        {isResultDeclared(row.eventId, row.participant.ageCategory) ? 'Declared' : isScored ? 'Update' : 'Score'}
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
      )}

      {viewMode === 'individual' && selectedParticipant && selectedEventId && (
        <div className="modal-overlay" onClick={handleCloseScoring}>
          <div className="modal-content scoring-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseScoring}>
              ×
            </button>
            
            <h2>Score Participant</h2>
            <div className="participant-info">
              <p><strong>Chest Number:</strong> {selectedParticipant.chestNumber || 'Not Assigned'}</p>
              <p><strong>Age:</strong> {selectedParticipant.age} ({selectedParticipant.ageCategory})</p>
              <p><strong>Event:</strong> {getEventName(selectedEventId)}</p>
            </div>

            <form onSubmit={handleSubmitScore} className="scoring-form">
              <p className="scoring-instruction">
                Rate each criterion from 0 to 10 points:
              </p>

              {[1, 2, 3, 4, 5].map((num) => (
                <div key={num} className="score-group">
                  <label htmlFor={`criteria${num}`}>
                    {criteriaLabels[num - 1]}
                  </label>
                  <div className="score-input-container">
                    <input
                      type="range"
                      id={`criteria${num}`}
                      name={`criteria${num}`}
                      min="0"
                      max="10"
                      value={scores[`criteria${num}`]}
                      onChange={handleScoreChange}
                      className="score-slider"
                    />
                    <input
                      type="number"
                      name={`criteria${num}`}
                      min="0"
                      max="10"
                      value={scores[`criteria${num}`]}
                      onChange={handleScoreChange}
                      className="score-number"
                    />
                  </div>
                </div>
              ))}

              <div className="total-score">
                <strong>Total Score:</strong> 
                <span className="score-value">
                  {scores.criteria1 + scores.criteria2 + scores.criteria3 + scores.criteria4 + scores.criteria5} / 50
                </span>
              </div>

              <div className="form-group">
                <label htmlFor="comments">Comments (Optional)</label>
                <textarea
                  id="comments"
                  name="comments"
                  value={scores.comments}
                  onChange={handleScoreChange}
                  rows="4"
                  placeholder="Add any additional comments or feedback..."
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  Submit Score
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseScoring} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {viewMode === 'group' && (
        <div className="card">
          <h2>Group Teams</h2>
          
          <div className="group-events-list">
            {groupEvents.map(event => {
              const eventTeams = groupTeams.filter(t => t.groupEventId === event.id);
              
              // Check if all teams have scores from this judge
              const allTeamsScored = eventTeams.length > 0 && eventTeams.every(team => 
                team.scores?.some(s => s.judgeName === user?.username)
              );
              
              return (
                <div key={event.id} className="group-event-section">
                  <div className="group-event-header">
                    <div>
                      <h3>{event.name}</h3>
                      <p className="event-description">{event.description}</p>
                    </div>
                    <div className="lock-controls">
                      <button
                        onClick={() => handleToggleGroupEventLock(event.id, isGroupEventLocked(event.id))}
                        className={`btn-lock ${isGroupEventLocked(event.id) ? 'locked' : 'unlocked'}`}
                        disabled={isGroupResultDeclared(event.id) || (!isGroupEventLocked(event.id) && !allTeamsScored)}
                        title={
                          isGroupResultDeclared(event.id) 
                            ? 'Cannot change lock status - Results have been declared' 
                            : !allTeamsScored && !isGroupEventLocked(event.id)
                            ? 'Please score all teams before locking'
                            : isGroupEventLocked(event.id) 
                            ? 'Click to unlock scores' 
                            : 'Click to lock scores'
                        }
                      >
                        {isGroupEventLocked(event.id) ? '🔓 Unlock' : '🔒 Lock'}
                      </button>
                      {isGroupResultDeclared(event.id) && (
                        <span className="declared-badge">✓ Declared</span>
                      )}
                      {isGroupEventFullyLocked(event.id) && (
                        <span className="fully-locked-badge">
                          {event.scoringType === 'quiz' ? '✓ Locked' : '✓ All Judges Locked'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  {eventTeams.length === 0 ? (
                    <p className="no-teams">No teams registered for this event yet.</p>
                  ) : (
                    <>
                      {isGroupEventLocked(event.id) && (
                        <div className="locked-notice">
                          🔒 This event is locked. Unlock to edit scores.
                        </div>
                      )}
                      <div className="teams-grid">
                        {eventTeams.map(team => {
                          const teamScore = team.scores?.find(s => s.judgeName === user?.username);
                          const hasScored = !!teamScore;
                          const eventLocked = isGroupEventLocked(event.id);
                          
                          return (
                            <div key={team.id} className={`team-card ${eventLocked ? 'locked' : ''}`}>
                              <div className="team-header">
                                <h4>Chest No: {team.chestNumber}</h4>
                                <span className="section-badge">{sections.find(s => s.id === team.sectionId)?.name}</span>
                              </div>
                              {hasScored ? (
                                <div className="scored-info">
                                  <span className="score-badge">✓ Scored: {teamScore.score}</span>
                                  {teamScore.comments && (
                                    <p className="score-comments">{teamScore.comments}</p>
                                  )}
                                  {!eventLocked && (
                                    <button
                                      onClick={() => {
                                        // Check if result is declared for this group event
                                        const isDeclared = isGroupResultDeclared(event.id);
                                        if (isDeclared) {
                                          alert('Results have been declared for this event. Scoring is no longer available.');
                                          return;
                                        }
                                        
                                        setSelectedTeam(team);
                                        setSelectedGroupEventId(event.id);
                                        setGroupScore({ 
                                          score: teamScore.score, 
                                          comments: teamScore.comments 
                                        });
                                      }}
                                      className="btn btn-small btn-info"
                                      style={{ marginTop: '10px' }}
                                      disabled={isGroupResultDeclared(event.id)}
                                      title={isGroupResultDeclared(event.id) ? 'Results have been declared - Scoring is no longer available' : 'Click to update team score'}
                                    >
                                      Update Score
                                    </button>
                                  )}
                                </div>
                              ) : (
                                <button
                                  onClick={() => {
                                    // Check if result is declared for this group event
                                    const isDeclared = isGroupResultDeclared(event.id);
                                    if (isDeclared) {
                                      alert('Results have been declared for this event. Scoring is no longer available.');
                                      return;
                                    }
                                    
                                    setSelectedTeam(team);
                                    setSelectedGroupEventId(event.id);
                                    setGroupScore({ score: 0, comments: '' });
                                  }}
                                  className="btn btn-primary"
                                  disabled={eventLocked || isGroupResultDeclared(event.id)}
                                  title={isGroupResultDeclared(event.id) ? 'Results have been declared - Scoring is no longer available' : eventLocked ? 'You have locked this event' : 'Click to score this team'}
                                >
                                  {eventLocked ? 'Locked' : isGroupResultDeclared(event.id) ? 'Declared' : 'Score Team'}
                                </button>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {selectedTeam && viewMode === 'group' && (
        <div className="modal-overlay" onClick={handleCloseGroupScoring}>
          <div className="modal-content scoring-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close-btn" onClick={handleCloseGroupScoring}>×</button>
            <h2>Score Team: {selectedTeam.teamName}</h2>
            <form onSubmit={async (e) => {
              e.preventDefault();
              const groupEvent = groupEvents.find(ge => ge.id === selectedGroupEventId);
              
              if (groupEvent.scoringType === 'quiz') {
                // For quiz, score is based on correct answers
                if (groupScore.score < 0 || groupScore.score > groupEvent.questionsCount) {
                  alert(`Score must be between 0 and ${groupEvent.questionsCount}`);
                  return;
                }
              }
              
              // Get current team data
              const currentTeam = groupTeams.find(t => t.id === selectedTeam.id);
              if (!currentTeam) {
                alert('Team not found');
                return;
              }
              
              // Update scores array
              const scores = currentTeam.scores || [];
              const existingScoreIndex = scores.findIndex(s => s.judgeName === user.username);
              
              const scoreData = {
                judgeName: user.username,
                score: parseFloat(groupScore.score),
                comments: groupScore.comments,
                timestamp: new Date().toISOString()
              };
              
              if (existingScoreIndex !== -1) {
                scores[existingScoreIndex] = scoreData;
              } else {
                scores.push(scoreData);
              }
              
              // Update the team in Firebase
              await FirebaseService.updateGroupTeam(selectedTeam.id, {
                ...currentTeam,
                scores: scores
              });
              
              // Reload group teams to reflect changes
              const updatedTeams = await FirebaseService.getGroupTeams();
              const filteredGroupTeams = user?.talentTestEventId
                ? updatedTeams.filter(t => t.talentTestEventId === user.talentTestEventId)
                : updatedTeams;
              setGroupTeams(filteredGroupTeams);
              
              handleCloseGroupScoring();
              alert('Score submitted successfully!');
            }}>
              <div className="scoring-info">
                <p><strong>Chest Number:</strong> {selectedTeam.chestNumber}</p>
                <p><strong>Section:</strong> {sections.find(s => s.id === selectedTeam.sectionId)?.name}</p>
              </div>
              
              {groupEvents.find(ge => ge.id === selectedGroupEventId)?.scoringType === 'quiz' ? (
                <div className="form-group">
                  <label>Correct Answers (out of {groupEvents.find(ge => ge.id === selectedGroupEventId)?.questionsCount}):</label>
                  <input
                    type="number"
                    min="0"
                    max={groupEvents.find(ge => ge.id === selectedGroupEventId)?.questionsCount}
                    value={groupScore.score}
                    onChange={(e) => setGroupScore(prev => ({ ...prev, score: e.target.value }))}
                    required
                  />
                  <small>Each correct answer = 1 mark</small>
                </div>
              ) : (
                <div className="form-group">
                  <label>Overall Score (0-50):</label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={groupScore.score}
                    onChange={(e) => setGroupScore(prev => ({ ...prev, score: e.target.value }))}
                    required
                  />
                </div>
              )}
              
              <div className="form-group">
                <label>Comments:</label>
                <textarea
                  value={groupScore.comments}
                  onChange={(e) => setGroupScore(prev => ({ ...prev, comments: e.target.value }))}
                  rows="3"
                />
              </div>
              
              <div className="form-actions">
                <button type="submit" className="btn btn-success">
                  Submit Score
                </button>
                <button 
                  type="button" 
                  onClick={handleCloseGroupScoring} 
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default JudgeDashboard;
