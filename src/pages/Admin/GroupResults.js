import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StorageService from '../../services/StorageService';
import './GroupResults.css';

const GroupResults = () => {
  const [groupEvents, setGroupEvents] = useState([]);
  const [groupTeams, setGroupTeams] = useState([]);
  const [sections, setSections] = useState([]);
  const [selectedGroupEventId, setSelectedGroupEventId] = useState('');
  const [declaredResults, setDeclaredResults] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    } else {
      const data = StorageService.getData();
      setGroupEvents(data.groupEvents || []);
      setGroupTeams(data.groupTeams || []);
      setSections(StorageService.getSections());
      setDeclaredResults(StorageService.getDeclaredResults());
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleDeclareGroupResult = () => {
    if (!selectedGroupEventId) return;
    
    const result = StorageService.declareGroupResult(parseInt(selectedGroupEventId));
    if (result.success) {
      setDeclaredResults(StorageService.getDeclaredResults());
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleRevertGroupDeclaration = () => {
    if (!selectedGroupEventId) return;
    
    const result = StorageService.revertGroupDeclaration(parseInt(selectedGroupEventId));
    if (result.success) {
      setDeclaredResults(StorageService.getDeclaredResults());
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const isGroupResultDeclared = () => {
    if (!selectedGroupEventId) return false;
    return StorageService.isGroupResultDeclared(parseInt(selectedGroupEventId));
  };

  const getGroupEventName = (eventId) => {
    const event = groupEvents.find(e => e.id === parseInt(eventId));
    return event ? event.name : 'Unknown';
  };

  const getSectionName = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : 'Unknown';
  };

  const isGroupEventFullyLocked = (groupEventId) => {
    const data = StorageService.getData();
    const locks = data.groupEventLocks || [];
    const judges = ['judge1', 'judge2', 'judge3'];
    
    // Find the event to check its type
    const event = groupEvents.find(e => e.id === groupEventId);
    
    // For Group Bible Quiz (scoringType: 'quiz'), only need one judge to lock
    if (event && event.scoringType === 'quiz') {
      return locks.some(lock => lock.groupEventId === groupEventId && lock.locked);
    }
    
    // For other events (like Group Song), require all judges to lock
    return judges.every(judge =>
      locks.some(lock => lock.judgeName === judge && lock.groupEventId === groupEventId && lock.locked)
    );
  };

  const getResults = () => {
    if (!selectedGroupEventId) return [];

    const eventId = parseInt(selectedGroupEventId);
    const event = groupEvents.find(e => e.id === eventId);
    
    // Check if judges have locked this group event
    const isLocked = isGroupEventFullyLocked(eventId);
    
    if (!isLocked) {
      return null; // Not locked yet
    }

    // Get all teams for this event
    const eventTeams = groupTeams.filter(t => t.groupEventId === eventId);

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
  const isLocked = selectedGroupEventId 
    ? isGroupEventFullyLocked(parseInt(selectedGroupEventId))
    : false;

  return (
    <div className="group-results-view">
      <div className="dashboard-header">
        <div>
          <h1>Group Event Results</h1>
          <p>Admin: {user?.username}</p>
        </div>
        <div className="header-actions">
          <button onClick={handleBackToDashboard} className="btn btn-secondary">
            Back to Dashboard
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

        {selectedGroupEventId && !isLocked && (
          <div className="warning-message">
            {(() => {
              const event = groupEvents.find(e => e.id === parseInt(selectedGroupEventId));
              if (event && event.scoringType === 'quiz') {
                return '⚠️ No judge has locked their scores yet. Results will be available once a judge completes scoring.';
              }
              return '⚠️ All judges have not locked their scores yet. Results will be available once all judges complete their scoring.';
            })()}
          </div>
        )}

        {results && results.length > 0 && (
          <>
            <div className="results-header">
              <h3>Results: {getGroupEventName(parseInt(selectedGroupEventId))}</h3>
              
              {/* Declaration Controls */}
              <div className="declaration-controls">
                {isGroupResultDeclared() ? (
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
