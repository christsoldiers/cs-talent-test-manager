import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FirebaseService from '../../services/FirebaseService';
import './GroupResults.css';

const GroupResults = () => {
  const [groupEvents, setGroupEvents] = useState([]);
  const [groupTeams, setGroupTeams] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedGroupEventId, setSelectedGroupEventId] = useState('');
  const [declaredResults, setDeclaredResults] = useState([]);
  const [isCurrentEventLocked, setIsCurrentEventLocked] = useState(false);
  const [isCurrentEventDeclared, setIsCurrentEventDeclared] = useState(false);
  const [hasTeams, setHasTeams] = useState(true);
  const [judgeLockStatus, setJudgeLockStatus] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const eventId = location.state?.eventId;

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    } else {
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    const allGroupEvents = await FirebaseService.getGroupEvents();
    setGroupEvents(allGroupEvents);
    const allGroupTeams = await FirebaseService.getGroupTeams();
    setGroupTeams(allGroupTeams);
    const allSections = await FirebaseService.getSections();
    setSections(allSections);
    const declaredResults = await FirebaseService.getDeclaredResults();
    setDeclaredResults(declaredResults);
  };

  useEffect(() => {
    const checkEventStatus = async () => {
      if (!selectedGroupEventId) {
        setIsCurrentEventLocked(false);
        setIsCurrentEventDeclared(false);
        setHasTeams(true);
        setJudgeLockStatus([]);
        return;
      }

      const eventId = parseInt(selectedGroupEventId);
      
      // Check if teams exist for this event (compare as both string and number)
      const eventTeams = groupTeams.filter(t => 
        String(t.groupEventId) === String(selectedGroupEventId) || 
        t.groupEventId === eventId
      );
      setHasTeams(eventTeams.length > 0);
      
      const declared = await FirebaseService.isGroupResultDeclared(selectedGroupEventId);
      console.log('Debug - Is Group Event Declared:', declared, 'for eventId:', selectedGroupEventId);
      setIsCurrentEventDeclared(declared);
      
      // Get individual judge lock status
      const judges = await FirebaseService.getJudges();
      const groupEventLocks = await FirebaseService.getGroupEventLocks();
      
      const event = groupEvents.find(e => String(e.id) === String(selectedGroupEventId) || e.id === eventId);
      
      console.log('Debug - Selected Event ID:', selectedGroupEventId);
      console.log('Debug - Parsed Event ID:', eventId);
      console.log('Debug - Event:', event);
      console.log('Debug - All Group Event Locks:', groupEventLocks);
      console.log('Debug - All Judges:', judges);
      
      const lockStatusList = judges.map(judge => {
        const lock = groupEventLocks.find(
          l => {
            console.log(`Checking judge ${judge.username}: lock.groupEventId=${l.groupEventId}, selectedGroupEventId=${selectedGroupEventId}, lock.locked=${l.locked}`);
            return l.judgeName === judge.username && 
                   (String(l.groupEventId) === String(selectedGroupEventId) || l.groupEventId === eventId) &&
                   l.locked;
          }
        );
        console.log(`Judge ${judge.username} lock found:`, lock);
        return {
          judgeName: judge.username,
          isLocked: !!lock
        };
      });
      
      setJudgeLockStatus(lockStatusList);
      
      // Check if event is fully locked
      let locked = false;
      if (event && event.scoringType === 'quiz') {
        locked = groupEventLocks.some(lock => 
          (String(lock.groupEventId) === String(selectedGroupEventId) || lock.groupEventId === eventId) && 
          lock.locked
        );
      } else {
        locked = judges.every(judge =>
          groupEventLocks.some(lock => 
            lock.judgeName === judge.username && 
            (String(lock.groupEventId) === String(selectedGroupEventId) || lock.groupEventId === eventId) && 
            lock.locked
          )
        );
      }
      
      console.log('Debug - Is Event Fully Locked:', locked);
      setIsCurrentEventLocked(locked);
    };

    checkEventStatus();
  }, [selectedGroupEventId, groupEvents, groupTeams, declaredResults]);

  const handleLogout = () => {
    logout();
    startTransition(() => {
      navigate('/admin/login');
    });
  };

  const handleBackToDashboard = () => {
    if (eventId) {
      navigate(`/admin/event/${eventId}`);
    } else {
      navigate('/admin/events');
    }
  };

  const handleDeclareGroupResult = async () => {
    if (!selectedGroupEventId) return;
    
    const result = await FirebaseService.declareGroupResult(selectedGroupEventId);
    if (result.success) {
      const declaredResults = await FirebaseService.getDeclaredResults();
      setDeclaredResults(declaredResults);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleRevertGroupDeclaration = async () => {
    if (!selectedGroupEventId) return;
    
    const result = await FirebaseService.revertGroupDeclaration(selectedGroupEventId);
    if (result.success) {
      const declaredResults = await FirebaseService.getDeclaredResults();
      setDeclaredResults(declaredResults);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const getGroupEventName = (eventId) => {
    const event = groupEvents.find(e => e.id === parseInt(eventId));
    return event ? event.name : 'Unknown';
  };

  const getSectionName = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : 'Unknown';
  };

  const isGroupEventFullyLocked = async (groupEventId) => {
    const locks = await FirebaseService.getGroupEventLocks();
    const judges = await FirebaseService.getJudges();
    
    // Find the event to check its type
    const event = groupEvents.find(e => e.id === groupEventId);
    
    // For Group Bible Quiz (scoringType: 'quiz'), only need one judge to lock
    if (event && event.scoringType === 'quiz') {
      return locks.some(lock => 
        (String(lock.groupEventId) === String(groupEventId) || lock.groupEventId === groupEventId) && 
        lock.locked
      );
    }
    
    // For other events (like Group Song), require all judges to lock
    return judges.every(judge =>
      locks.some(lock => 
        lock.judgeName === judge.username && 
        (String(lock.groupEventId) === String(groupEventId) || lock.groupEventId === groupEventId) && 
        lock.locked
      )
    );
  };

  const getResults = () => {
    if (!selectedGroupEventId) return [];

    const eventId = parseInt(selectedGroupEventId);
    const event = groupEvents.find(e => e.id === eventId);
    
    // Get all teams for this event (compare as both string and number)
    const eventTeams = groupTeams.filter(t => 
      String(t.groupEventId) === String(selectedGroupEventId) || 
      t.groupEventId === eventId
    );
    
    // Check if judges have locked this group event using state
    if (!isCurrentEventLocked) {
      return null; // Not locked yet
    }

    // Calculate results
    const results = eventTeams.map(team => {
      const teamScores = team.scores || [];
      
      let totalScore = 0;
      let judgeCount = 0;
      
      // For quiz events, use only one judge's score (the first one available)
      if (event && event.scoringType === 'quiz') {
        const quizScore = teamScores.find(s => s.score !== undefined);
        totalScore = quizScore ? parseFloat(quizScore.score) : 0;
        judgeCount = quizScore ? 1 : 0;
      } else {
        // For other events, calculate average from all judges
        teamScores.forEach(score => {
          totalScore += parseFloat(score.score);
          judgeCount++;
        });
      }

      const averageScore = judgeCount > 0 ? (event && event.scoringType === 'quiz' ? totalScore : totalScore / judgeCount) : 0;

      return {
        teamId: team.id,
        teamName: team.teamName,
        sectionId: team.sectionId,
        sectionName: getSectionName(team.sectionId),
        participants: team.participants,
        totalScore,
        averageScore,
        judgeCount
      };
    });

    // Sort by average score descending
    results.sort((a, b) => b.averageScore - a.averageScore);

    // Assign ranks and points
    results.forEach((result, index) => {
      result.rank = index + 1;
      // Assign points: 10 for 1st, 5 for 2nd, 3 for 3rd
      if (result.rank === 1) {
        result.points = 10;
      } else if (result.rank === 2) {
        result.points = 5;
      } else if (result.rank === 3) {
        result.points = 3;
      } else {
        result.points = 0;
      }
    });

    return results;
  };

  const results = getResults();

  return (
    <div className="group-results-view">
      <div className="dashboard-header">
        <div>
          <h1>Group Event Results</h1>
          <p>Admin: {user?.username}</p>
        </div>
        <div className="header-actions">
          <button onClick={handleBackToDashboard} className="btn btn-secondary">
            {eventId ? '← Back to Event' : '← Back to Events'}
          </button>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        <h2>Select Group Event</h2>
        
        <div className="filter-section">
          <div className="form-group">
            <label htmlFor="selectGroupEvent">Group Event:</label>
            <select
              id="selectGroupEvent"
              value={selectedGroupEventId}
              onChange={(e) => setSelectedGroupEventId(e.target.value)}
            >
              <option value="">Select a group event</option>
              {groupEvents.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 1: Check if no teams exist */}
        {selectedGroupEventId && !hasTeams && (
          <div className="warning-message">
            <p>⚠️ No teams found for this group event.</p>
          </div>
        )}

        {/* Step 2: If teams exist, show judge lock status */}
        {selectedGroupEventId && hasTeams && (
          <div className="judge-lock-status-section">
            <h3>Judge Lock Status</h3>
            {judgeLockStatus.length > 0 ? (
              <>
                <div className="judge-locks-grid">
                  {judgeLockStatus.map((judge, index) => (
                    <div key={index} className={`judge-lock-item ${judge.isLocked ? 'locked' : 'unlocked'}`}>
                      <div className="judge-lock-icon">
                        {judge.isLocked ? '🔒' : '🔓'}
                      </div>
                      <div className="judge-lock-info">
                        <span className="judge-name">{judge.judgeName}</span>
                        <span className={`lock-status ${judge.isLocked ? 'locked' : 'unlocked'}`}>
                          {judge.isLocked ? 'Locked' : 'Not Locked'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {isCurrentEventLocked && (
                  <div className="all-locked-badge">
                    ✅ {(() => {
                      const event = groupEvents.find(e => String(e.id) === String(selectedGroupEventId));
                      return event && event.scoringType === 'quiz' 
                        ? 'Judge has locked their scores'
                        : 'All judges have locked their scores';
                    })()}
                  </div>
                )}
              </>
            ) : (
              <p className="no-data">Loading judge status...</p>
            )}
          </div>
        )}

        {/* Step 3: If not all judges locked, show warning */}
        {selectedGroupEventId && hasTeams && !isCurrentEventLocked && (
          <div className="warning-message">
            <p>
              {(() => {
                const event = groupEvents.find(e => String(e.id) === String(selectedGroupEventId));
                if (event && event.scoringType === 'quiz') {
                  return '⚠️ Results are not available yet. No judge has locked their scores for this event.';
                }
                return '⚠️ Results are not available yet. Not all judges have locked their scores for this event.';
              })()}
            </p>
            <p>Please ensure all judges complete and lock their scoring before viewing results.</p>
          </div>
        )}

        {/* Step 4: If all judges locked, show results */}
        {selectedGroupEventId && hasTeams && isCurrentEventLocked && results && results.length > 0 && (
          <>
            <div className="results-header">
              <h3>Results: {getGroupEventName(parseInt(selectedGroupEventId))}</h3>
              
              {/* Declaration Controls */}
              <div className="declaration-controls">
                {isCurrentEventDeclared ? (
                  <div className="declaration-status">
                    <span className="status-badge declared">✓ Result Declared</span>
                    <button 
                      onClick={handleRevertGroupDeclaration} 
                      className="btn btn-warning"
                    >
                      Revert Declaration
                    </button>
                  </div>
                ) : (
                  <div className="declaration-status">
                    <span className="status-badge not-declared">⚠ Not Declared</span>
                    <button 
                      onClick={handleDeclareGroupResult} 
                      className="btn btn-success"
                    >
                      Declare Result
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="podium-section">
              <h3>Top 3 Teams</h3>
              <div className="podium">
                {results.slice(0, 3).map((result, index) => (
                  <div key={result.teamId} className={`podium-card rank-${result.rank}`}>
                    <div className="rank-badge">{result.rank}</div>
                    <div className="medal">{['🥇', '🥈', '🥉'][index]}</div>
                    <h4>{result.teamName}</h4>
                    <p className="section-name">{result.sectionName}</p>
                    <div className="score-info">
                      <div className="score-value">{result.averageScore.toFixed(2)}</div>
                      <div className="score-label">Average Score</div>
                    </div>
                    <div className="points-badge">{result.points} pts</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="results-table-section">
              <h3>All Teams - {getGroupEventName(selectedGroupEventId)}</h3>
              <table className="results-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Team Name</th>
                    <th>Section</th>
                    <th>Participants</th>
                    <th>Average Score</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map(result => (
                    <tr key={result.teamId} className={result.rank <= 3 ? `top-${result.rank}` : ''}>
                      <td className="rank-cell">
                        <span className="rank-number">{result.rank}</span>
                        {result.rank <= 3 && (
                          <span className="medal-small">{['🥇', '🥈', '🥉'][result.rank - 1]}</span>
                        )}
                      </td>
                      <td><strong>{result.teamName}</strong></td>
                      <td>{result.sectionName}</td>
                      <td>
                        <div className="participants-list">
                          {result.participants.map((p, i) => (
                            <span key={i} className="participant-tag">{p}</span>
                          ))}
                        </div>
                      </td>
                      <td>{result.averageScore.toFixed(2)}</td>
                      <td>
                        {result.points > 0 && (
                          <span className={`points-badge rank-${result.rank}`}>
                            {result.points} pts
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default GroupResults;
