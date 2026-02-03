import React, { useState, useEffect, useCallback, startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FirebaseService from '../../services/FirebaseService';
import './ResultsView.css';

const ResultsView = () => {
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [allScores, setAllScores] = useState([]);
  const [sections, setSections] = useState([]);
  const [pointsConfig, setPointsConfig] = useState({
    individual: { first: 5, second: 3, third: 1 },
    group: { first: 10, second: 5, third: 3 }
  });
  const [selectedEvent, setSelectedEvent] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [declaredResults, setDeclaredResults] = useState([]);
  const [isCurrentEventDeclared, setIsCurrentEventDeclared] = useState(false);
  const [isCurrentEventLocked, setIsCurrentEventLocked] = useState(false);
  const [judgeLockStatus, setJudgeLockStatus] = useState([]);
  const [results, setResults] = useState([]);
  const [hasParticipants, setHasParticipants] = useState(true);
  const [judges, setJudges] = useState([]);
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
    const {
      events: allEvents,
      categories: allCategories,
      participants: allParticipants,
      sections: allSections,
      judges: allJudges,
      scores,
      declaredResults,
      pointsConfig
    } = await FirebaseService.getResultsViewData();
    
    setEvents(allEvents);
    setCategories(allCategories);
    setParticipants(allParticipants);
    setSections(allSections);
    setJudges(allJudges);
    setAllScores(scores);
    setDeclaredResults(declaredResults);
    setPointsConfig(pointsConfig);
  };

  useEffect(() => {
    const checkEventStatus = async () => {
      if (!selectedEvent || !selectedCategory) {
        setIsCurrentEventDeclared(false);
        setIsCurrentEventLocked(false);
        setJudgeLockStatus([]);
        return;
      }

      const eventId = selectedEvent;
      const declared = await FirebaseService.isResultDeclared(eventId, selectedCategory);
      setIsCurrentEventDeclared(declared);

      const locked = await FirebaseService.areAllJudgesLocked(eventId, selectedCategory);
      setIsCurrentEventLocked(locked);

      // Get individual judge lock status
      const judges = await FirebaseService.getJudges();
      const judgeLocks = await FirebaseService.getJudgeLocks();
      
      console.log('Debug - Selected Event ID:', eventId);
      console.log('Debug - Selected Category:', selectedCategory);
      console.log('Debug - All Judges:', judges);
      console.log('Debug - All Judge Locks:', judgeLocks);
      
      const lockStatusList = judges.map(judge => {
        const lock = judgeLocks.find(
          l => {
            console.log(`Checking judge ${judge.username}: lock.eventId=${l.eventId}, eventId=${eventId}, lock.category=${l.category}, selectedCategory=${selectedCategory}`);
            return l.judgeName === judge.username && 
                   String(l.eventId) === String(eventId) && 
                   l.category === selectedCategory;
          }
        );
        console.log(`Judge ${judge.username} lock found:`, lock);
        return {
          judgeName: judge.username,
          isLocked: lock ? lock.locked : false
        };
      });
      
      console.log('Debug - Lock Status List:', lockStatusList);
      setJudgeLockStatus(lockStatusList);
    };

    checkEventStatus();
  }, [selectedEvent, selectedCategory, declaredResults]);

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

  const handleDeclareResult = async () => {
    if (!selectedEvent || !selectedCategory) return;
    
    const result = await FirebaseService.declareResult(selectedEvent, selectedCategory);
    if (result.success) {
      const declaredResults = await FirebaseService.getDeclaredResults();
      setDeclaredResults(declaredResults);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleRevertDeclaration = async () => {
    if (!selectedEvent || !selectedCategory) return;
    
    const result = await FirebaseService.revertDeclaration(selectedEvent, selectedCategory);
    if (result.success) {
      const declaredResults = await FirebaseService.getDeclaredResults();
      setDeclaredResults(declaredResults);
      alert(result.message);
    } else {
      alert(result.message);
    }
  };

  const handleDeclareAllResults = async () => {
    if (!window.confirm('Declare all locked results? This will publish all events and categories where all judges have locked their scores.')) {
      return;
    }
    
    const result = await FirebaseService.declareAllResults();
    const declaredResults = await FirebaseService.getDeclaredResults();
    setDeclaredResults(declaredResults);
    alert(result.message);
  };

  const handleRevertAllDeclarations = async () => {
    if (!window.confirm('Revert ALL declared results? This will unpublish all individual event results. This action cannot be undone.')) {
      return;
    }
    
    const result = await FirebaseService.revertAllDeclarations();
    const declaredResults = await FirebaseService.getDeclaredResults();
    setDeclaredResults(declaredResults);
    alert(result.message);
  };

  const getEventName = (eventId) => {
    const event = events.find(e => e.id === eventId);
    return event ? event.name : 'Unknown';
  };

  const getSectionName = (sectionId) => {
    const section = sections.find(s => String(s.id) === String(sectionId));
    return section ? section.name : 'Unknown';
  };

  const getResults = () => {
    if (!selectedEvent || !selectedCategory) return [];

    const eventId = selectedEvent;
    
    // Get participants for this event and category
    const eventParticipants = participants.filter(p => {
      const eventIds = p.eventIds || (p.eventId ? [p.eventId] : []);
      return eventIds.includes(eventId) && p.ageCategory === selectedCategory;
    });

    // Update hasParticipants state
    setHasParticipants(eventParticipants.length > 0);
    
    // Check if all judges have locked this event-category combination using state
    if (!isCurrentEventLocked) {
      return []; // Not all judges locked yet
    }

    // Calculate results
    const results = eventParticipants.map(participant => {
      const participantScores = allScores.filter(
        s => s.participantId === participant.id && String(s.eventId) === String(eventId)
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

  // Load results when event, category, or lock status changes
  useEffect(() => {
    const loadResults = () => {
      const calculatedResults = getResults();
      setResults(calculatedResults);
    };
    
    loadResults();
  }, [selectedEvent, selectedCategory, isCurrentEventLocked]);

  // Debug logging
  useEffect(() => {
    if (results && results.length > 0) {
      console.log('Results:', results);
      console.log('Judges:', judges);
      console.log('Sample result judgeScores:', results[0]?.judgeScores);
    }
  }, [results, judges]);

  return (
    <div className="results-view">
      <div className="dashboard-header">
        <div>
          <h1>Results View</h1>
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
              {categories.map(category => (
                <option key={category.id} value={category.name}>
                  {category.name} ({category.minAge}-{category.maxAge})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Step 1: Check if no participants exist */}
        {selectedEvent && selectedCategory && !hasParticipants && (
          <div className="warning-message">
            <p>⚠️ No participants found for this event and category combination.</p>
          </div>
        )}

        {/* Step 2: If participants exist, show judge lock status */}
        {selectedEvent && selectedCategory && hasParticipants && (
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
                    ✅ All judges have locked their scores
                  </div>
                )}
              </>
            ) : (
              <p className="no-data">Loading judge status...</p>
            )}
          </div>
        )}

        {/* Step 3: If not all judges locked, show warning */}
        {selectedEvent && selectedCategory && hasParticipants && !isCurrentEventLocked && (
          <div className="warning-message">
            <p>⚠️ Results are not available yet. Not all judges have locked their scores for this event and category.</p>
            <p>Please ensure all judges complete and lock their scoring before viewing results.</p>
          </div>
        )}

        {/* Step 4: If all judges locked, show results */}
        {selectedEvent && selectedCategory && hasParticipants && isCurrentEventLocked && (
          <div className="results-container">`
              <div className="results-header">
                <h3>Results: {getEventName(selectedEvent)} - {selectedCategory}</h3>
              
              {/* Declaration Controls */}
              <div className="declaration-controls">
                {isCurrentEventDeclared ? (
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
                    <th>Church</th>
                    <th>Age</th>
                    {judges && judges.map(judge => (
                      <th key={judge.id}>{judge.username}</th>
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
                        <td>
                          {result.participant.churchName || 'N/A'}
                          {result.participant.section && ` (${result.participant.section})`}
                        </td>
                        <td>{result.participant.age}</td>
                        {judges && judges.map(judge => {
                          const judgeScore = result.judgeScores?.find(s => s.judgeName === judge.username);
                          return (
                            <td key={judge.id}>
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
      </div>
    </div>
  );
};

export default ResultsView;
