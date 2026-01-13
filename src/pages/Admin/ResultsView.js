import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StorageService from '../../services/StorageService';
import './ResultsView.css';

const ResultsView = () => {
  const [participants, setParticipants] = useState([]);
  const [events] = useState(StorageService.getEvents());
  const [allScores, setAllScores] = useState([]);
  const [pointsConfig, setPointsConfig] = useState({
    individual: { first: 5, second: 3, third: 1 },
    group: { first: 10, second: 5, third: 3 }
  });
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [declaredResults, setDeclaredResults] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    } else {
      setParticipants(StorageService.getParticipants());
      setAllScores(StorageService.getScores());
      setDeclaredResults(StorageService.getDeclaredResults());
      const data = StorageService.getData();
      setPointsConfig(data.pointsConfig || {
        individual: { first: 5, second: 3, third: 1 },
        group: { first: 10, second: 5, third: 3 }
      });
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleDeclareResult = () => {
    if (!selectedEvent || !selectedCategory) return;
    
    const result = StorageService.declareResult(parseInt(selectedEvent), selectedCategory);
    if (result.success) {
      setDeclaredResults(StorageService.getDeclaredResults());
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleRevertDeclaration = () => {
    if (!selectedEvent || !selectedCategory) return;
    
    const result = StorageService.revertDeclaration(parseInt(selectedEvent), selectedCategory);
    if (result.success) {
      setDeclaredResults(StorageService.getDeclaredResults());
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleDeclareAllResults = () => {
    if (!window.confirm('Declare all locked results? This will publish all events and categories where all judges have locked their scores.')) {
      return;
    }
    
    const result = StorageService.declareAllResults();
    setDeclaredResults(StorageService.getDeclaredResults());
    alert(result.message);
  };

  const handleRevertAllDeclarations = () => {
    if (!window.confirm('Revert ALL declared results? This will unpublish all individual event results. This action cannot be undone.')) {
      return;
    }
    
    const result = StorageService.revertAllDeclarations();
    setDeclaredResults(StorageService.getDeclaredResults());
    alert(result.message);
  };

  const isResultDeclared = () => {
    if (!selectedEvent || !selectedCategory) return false;
    return StorageService.isResultDeclared(parseInt(selectedEvent), selectedCategory);
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.id === parseInt(eventId));
    return event ? event.name : 'Unknown';
  };

  const getResults = () => {
    if (!selectedEvent || !selectedCategory) return [];

    const eventId = parseInt(selectedEvent);
    
    // Check if all judges have locked this event-category combination
    const isLocked = StorageService.areAllJudgesLocked(eventId, selectedCategory);
    
    if (!isLocked) {
      return null; // Not all judges locked yet
    }

    // Get participants for this event and category
    const eventParticipants = participants.filter(p => {
      const eventIds = p.eventIds || (p.eventId ? [parseInt(p.eventId)] : []);
      return eventIds.includes(eventId) && p.ageCategory === selectedCategory;
    });

    // Calculate results
    const results = eventParticipants.map(participant => {
      const participantScores = allScores.filter(
        s => s.participantId === participant.id && s.eventId === eventId
      );

      const judgeScores = participantScores.map(s => ({
        judgeName: s.judgeName,
        totalScore: s.totalScore,
        criteria1: s.criteria1,
        criteria2: s.criteria2,
        criteria3: s.criteria3,
        criteria4: s.criteria4,
        criteria5: s.criteria5,
        comments: s.comments
      }));

      const totalScore = judgeScores.reduce((sum, score) => sum + score.totalScore, 0);
      const averageScore = judgeScores.length > 0 ? totalScore / judgeScores.length : 0;

      return {
        participant,
        judgeScores,
        totalScore,
        averageScore
      };
    });

    // Sort by average score descending
    results.sort((a, b) => b.averageScore - a.averageScore);

    // Assign ranks and points
    results.forEach((result, index) => {
      result.rank = index + 1;
      // Assign points based on configuration
      if (result.rank === 1) {
        result.points = pointsConfig.individual.first;
      } else if (result.rank === 2) {
        result.points = pointsConfig.individual.second;
      } else if (result.rank === 3) {
        result.points = pointsConfig.individual.third;
      } else {
        result.points = 0;
      }
    });

    return results;
  };

  const results = getResults();
  const isLocked = selectedEvent && selectedCategory 
    ? StorageService.areAllJudgesLocked(parseInt(selectedEvent), selectedCategory)
    : false;

  const judgeCredentials = StorageService.getData().judgeCredentials;

  // Debug logging
  useEffect(() => {
    if (results && results.length > 0) {
      console.log('Results:', results);
      console.log('Judge Credentials:', judgeCredentials);
      console.log('Sample result judgeScores:', results[0]?.judgeScores);
    }
  }, [results]);

  return (
    <div className="results-view">
      <div className="dashboard-header">
        <div>
          <h1>Results View</h1>
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
        <div className="results-view-header">
          <h2>View Competition Results</h2>
          <div className="bulk-actions">
            <button 
              onClick={handleDeclareAllResults} 
              className="btn btn-success"
              title="Declare all locked results at once"
            >
              📢 Declare All Results
            </button>
            <button 
              onClick={handleRevertAllDeclarations} 
              className="btn btn-warning"
              title="Revert all declared results at once"
            >
              ↩️ Revert All Declarations
            </button>
          </div>
        </div>
        
        <div className="filter-section">
          <div className="form-group">
            <label htmlFor="selectedEvent">Select Event:</label>
            <select
              id="selectedEvent"
              value={selectedEvent}
              onChange={(e) => setSelectedEvent(e.target.value)}
            >
              <option value="">-- Choose Event --</option>
              {events.map(event => (
                <option key={event.id} value={event.id}>
                  {event.name}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="selectedCategory">Select Category:</label>
            <select
              id="selectedCategory"
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
            >
              <option value="">-- Choose Category --</option>
              <option value="Junior">Junior (6-10)</option>
              <option value="Intermediate">Intermediate (11-15)</option>
              <option value="Senior">Senior (16-20)</option>
              <option value="Super Senior">Super Senior (21-25)</option>
            </select>
          </div>
        </div>

        {selectedEvent && selectedCategory && !isLocked && (
          <div className="warning-message">
            <p>⚠️ Results are not available yet. Not all judges have locked their scores for this event and category.</p>
            <p>Please ensure all judges complete and lock their scoring before viewing results.</p>
          </div>
        )}

        {selectedEvent && selectedCategory && isLocked && results && results.length > 0 && (
          <div className="results-container">
            <div className="results-header">
              <h3>Results: {getEventName(parseInt(selectedEvent))} - {selectedCategory}</h3>
              
              {/* Declaration Controls */}
              <div className="declaration-controls">
                {isResultDeclared() ? (
                  <div className="declaration-status">
                    <span className="status-badge declared">✓ Result Declared</span>
                    <button 
                      onClick={handleRevertDeclaration} 
                      className="btn btn-warning"
                    >
                      Revert Declaration
                    </button>
                  </div>
                ) : (
                  <div className="declaration-status">
                    <span className="status-badge not-declared">⚠ Not Declared</span>
                    <button 
                      onClick={handleDeclareResult} 
                      className="btn btn-success"
                    >
                      Declare Result
                    </button>
                  </div>
                )}
              </div>
            </div>
            
            {/* Top 3 Podium */}
            <div className="podium">
              {results.slice(0, 3).map((result, index) => (
                <div key={result.participant.id} className={`podium-place place-${index + 1}`}>
                  <div className="podium-medal">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : '🥉'}
                  </div>
                  <div className="podium-rank">#{index + 1}</div>
                  <div className="podium-chest">{result.participant.chestNumber || 'N/A'}</div>
                  <div className="podium-name">{result.participant.name}</div>
                  <div className="podium-score">{result.averageScore.toFixed(2)}</div>
                  <div className="podium-points">{result.points} pts</div>
                </div>
              ))}
            </div>

            {/* Detailed Results Table */}
            <div className="table-container">
              <table className="table results-table">
                <thead>
                  <tr>
                    <th>Rank</th>
                    <th>Chest No.</th>
                    <th>Name</th>
                    <th>Age</th>
                    {judgeCredentials && judgeCredentials.map(judge => (
                      <th key={judge.username}>{judge.username}</th>
                    ))}
                    <th>Total</th>
                    <th>Average</th>
                    <th>Points</th>
                  </tr>
                </thead>
                <tbody>
                  {results && results.map((result) => {
                    const isTopThree = result.rank <= 3;
                    return (
                      <tr key={result.participant.id} className={isTopThree ? `rank-${result.rank}` : ''}>
                        <td>
                          <strong>#{result.rank}</strong>
                          {isTopThree && (
                            <span className="medal-small">
                              {result.rank === 1 ? '🥇' : result.rank === 2 ? '🥈' : '🥉'}
                            </span>
                          )}
                        </td>
                        <td>
                          <span className="chest-number">{result.participant.chestNumber || 'N/A'}</span>
                        </td>
                        <td><strong>{result.participant.name}</strong></td>
                        <td>{result.participant.age}</td>
                        {judgeCredentials && judgeCredentials.map(judge => {
                          const judgeScore = result.judgeScores?.find(s => s.judgeName === judge.username);
                          return (
                            <td key={judge.username}>
                              <strong>{judgeScore ? judgeScore.totalScore : '-'}</strong>
                            </td>
                          );
                        })}
                        <td><strong>{result.totalScore || 0}</strong></td>
                        <td><strong className="average-score">{result.averageScore?.toFixed(2) || '0.00'}</strong></td>
                        <td>
                          {result.points > 0 ? (
                            <strong className="points-badge">{result.points} pts</strong>
                          ) : (
                            <span className="no-points">-</span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {selectedEvent && selectedCategory && isLocked && results && results.length === 0 && (
          <p className="no-data">No participants found for this event and category.</p>
        )}
      </div>
    </div>
  );
};

export default ResultsView;
