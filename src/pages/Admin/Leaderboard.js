import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StorageService from '../../services/StorageService';
import './Leaderboard.css';

const Leaderboard = () => {
  const [participants, setParticipants] = useState([]);
  const [events] = useState(StorageService.getEvents());
  const [sections] = useState(StorageService.getSections());
  const [allScores, setAllScores] = useState([]);
  const [groupTeams, setGroupTeams] = useState([]);
  const [groupEvents, setGroupEvents] = useState([]);
  const [pointsConfig, setPointsConfig] = useState({
    individual: { first: 5, second: 3, third: 1 },
    group: { first: 10, second: 5, third: 3 }
  });
  const [sectionLeaderboard, setSectionLeaderboard] = useState([]);
  const [churchLeaderboard, setChurchLeaderboard] = useState([]);
  const [individualLeaderboard, setIndividualLeaderboard] = useState([]);
  const [championsDeclared, setChampionsDeclared] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    } else {
      setParticipants(StorageService.getParticipants());
      setAllScores(StorageService.getScores());
      const data = StorageService.getData();
      setGroupTeams(data.groupTeams || []);
      setGroupEvents(data.groupEvents || []);
      setChampionsDeclared(data.championsDeclared || false);
      setPointsConfig(data.pointsConfig || {
        individual: { first: 5, second: 3, third: 1 },
        group: { first: 10, second: 5, third: 3 }
      });
    }
  }, [user, navigate]);

  useEffect(() => {
    if (participants.length > 0 && allScores.length > 0) {
      calculateLeaderboards();
    }
  }, [participants, allScores, groupTeams]);

  const calculateLeaderboards = () => {
    // Get declared results
    const declaredResults = StorageService.getDeclaredResults();
    
    // Calculate points for each participant across all events
    const participantPoints = {};
    
    participants.forEach(participant => {
      const eventIds = participant.eventIds || (participant.eventId ? [parseInt(participant.eventId)] : []);
      
      eventIds.forEach(eventId => {
        const category = participant.ageCategory;
        
        // Check if this event-category is declared
        const isDeclared = declaredResults.some(
          r => r.eventId === eventId && r.category === category
        );
        
        if (!isDeclared) return; // Skip if result not declared
        
        // Check if this event-category is locked by all judges
        const isLocked = StorageService.areAllJudgesLocked(eventId, category);
        
        if (!isLocked) return; // Skip if not all judges locked
        
        // Get participants for this event and category
        const eventParticipants = participants.filter(p => {
          const pEventIds = p.eventIds || (p.eventId ? [parseInt(p.eventId)] : []);
          return pEventIds.includes(eventId) && p.ageCategory === category;
        });
        
        // Calculate results
        const results = eventParticipants.map(p => {
          const participantScores = allScores.filter(
            s => s.participantId === p.id && s.eventId === eventId
          );
          
          const judgeScores = participantScores.map(s => s.totalScore);
          const totalScore = judgeScores.reduce((sum, score) => sum + score, 0);
          const averageScore = judgeScores.length > 0 ? totalScore / judgeScores.length : 0;
          
          return {
            participantId: p.id,
            averageScore
          };
        });
        
        // Sort by average score
        results.sort((a, b) => b.averageScore - a.averageScore);
        
        // Assign points based on rank
        results.forEach((result, index) => {
          if (result.participantId === participant.id) {
            const rank = index + 1;
            let points = 0;
            
            if (rank === 1) points = pointsConfig.individual.first;
            else if (rank === 2) points = pointsConfig.individual.second;
            else if (rank === 3) points = pointsConfig.individual.third;
            
            if (!participantPoints[participant.id]) {
              participantPoints[participant.id] = {
                participant,
                totalPoints: 0,
                eventResults: [] // Track event results with ranks
              };
            }
            
            participantPoints[participant.id].totalPoints += points;
            
            // Add event result with rank
            const event = events.find(e => e.id === eventId);
            if (event && rank <= 3) { // Only show top 3 positions
              participantPoints[participant.id].eventResults.push({
                eventName: event.name,
                rank: rank,
                position: rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'
              });
            }
          }
        });
      });
    });
    
    // Calculate section leaderboard
    const sectionScores = {};
    sections.forEach(section => {
      sectionScores[section.name] = {
        section: section.name,
        totalPoints: 0,
        participantCount: 0,
        groupPoints: 0
      };
    });
    
    // Add individual event points
    Object.values(participantPoints).forEach(({ participant, totalPoints }) => {
      if (participant.section && sectionScores[participant.section]) {
        sectionScores[participant.section].totalPoints += totalPoints;
        sectionScores[participant.section].participantCount += 1;
      }
    });
    
    // Add group event points
    const data = StorageService.getData();
    const groupLocks = data.groupEventLocks || [];
    
    groupEvents.forEach(groupEvent => {
      // Check if this group event is declared
      const isDeclared = declaredResults.some(r => r.groupEventId === groupEvent.id);
      
      if (!isDeclared) return;
      
      // Check if all judges have locked this group event
      const judgeCredentials = data.judgeCredentials || [];
      const isLocked = judgeCredentials.every(judge =>
        groupLocks.some(lock => 
          lock.judgeName === judge.username && 
          lock.groupEventId === groupEvent.id && 
          lock.locked
        )
      );
      
      if (!isLocked) return;
      
      // Get all teams for this event
      const eventTeams = groupTeams.filter(t => t.groupEventId === groupEvent.id);
      
      // Calculate results
      const results = eventTeams.map(team => {
        const teamScores = team.scores || [];
        let totalScore = 0;
        let judgeCount = 0;
        
        if (groupEvent.scoringType === 'quiz') {
          const quizScore = teamScores.find(s => s.score !== undefined);
          totalScore = quizScore ? parseFloat(quizScore.score) : 0;
          judgeCount = quizScore ? 1 : 0;
        } else {
          teamScores.forEach(score => {
            totalScore += parseFloat(score.score);
            judgeCount++;
          });
        }
        
        const averageScore = judgeCount > 0 ? 
          (groupEvent.scoringType === 'quiz' ? totalScore : totalScore / judgeCount) : 0;
        
        return {
          teamId: team.id,
          sectionId: team.sectionId,
          averageScore
        };
      });
      
      // Sort by average score
      results.sort((a, b) => b.averageScore - a.averageScore);
      
      // Assign points based on rank
      results.forEach((result, index) => {
        const rank = index + 1;
        let points = 0;
        
        if (rank === 1) points = pointsConfig.group.first;
        else if (rank === 2) points = pointsConfig.group.second;
        else if (rank === 3) points = pointsConfig.group.third;
        
        // Find section name for this team
        const section = sections.find(s => s.id === result.sectionId);
        if (section && sectionScores[section.name]) {
          sectionScores[section.name].groupPoints += points;
          sectionScores[section.name].totalPoints += points;
        }
      });
    });
    
    const sectionArray = Object.values(sectionScores)
      .filter(s => s.participantCount > 0 || s.groupPoints > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((s, index) => ({ ...s, rank: index + 1 }));
    
    setSectionLeaderboard(sectionArray);
    
    // Calculate church leaderboard
    const churchScores = {};
    
    Object.values(participantPoints).forEach(({ participant, totalPoints }) => {
      if (participant.churchName) {
        if (!churchScores[participant.churchName]) {
          churchScores[participant.churchName] = {
            church: participant.churchName,
            section: participant.section,
            totalPoints: 0,
            participantCount: 0
          };
        }
        
        churchScores[participant.churchName].totalPoints += totalPoints;
        churchScores[participant.churchName].participantCount += 1;
      }
    });
    
    const churchArray = Object.values(churchScores)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((c, index) => ({ ...c, rank: index + 1 }));
    
    setChurchLeaderboard(churchArray);
    
    // Calculate individual champion leaderboard
    const individualArray = Object.values(participantPoints)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((item, index) => ({ ...item, rank: index + 1 }));
    
    setIndividualLeaderboard(individualArray);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleDeclareChampions = () => {
    if (sectionLeaderboard.length < 3) {
      alert('Not enough sections to declare champions. Need at least 3 sections with points.');
      return;
    }

    const topThree = sectionLeaderboard.slice(0, 3);
    const confirmMsg = `Declare Final Champions?\n\n🥇 Champion: ${topThree[0].section} (${topThree[0].totalPoints} pts)\n🥈 Runner-up: ${topThree[1].section} (${topThree[1].totalPoints} pts)\n🥉 Second Runner-up: ${topThree[2].section} (${topThree[2].totalPoints} pts)\n\nThis will finalize the competition results.`;
    
    if (window.confirm(confirmMsg)) {
      const data = StorageService.getData();
      data.championsDeclared = true;
      data.finalChampions = {
        champion: topThree[0],
        runnerUp: topThree[1],
        secondRunnerUp: topThree[2],
        declaredAt: new Date().toISOString(),
        declaredBy: user?.username || 'admin'
      };
      StorageService.saveData(data);
      setChampionsDeclared(true);
      alert('Champions declared successfully! 🎉');
    }
  };

  const handleRevertChampions = () => {
    if (window.confirm('Revert Champions Declaration?\n\nThis will unpublish the final champions. Are you sure?')) {
      const data = StorageService.getData();
      data.championsDeclared = false;
      delete data.finalChampions;
      StorageService.saveData(data);
      setChampionsDeclared(false);
      alert('Champions declaration reverted.');
    }
  };

  return (
    <div className="leaderboard-view">
      <div className="dashboard-header">
        <div>
          <h1>🏆 Leaderboard</h1>
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

      {/* Section Leaderboard */}
      <div className="card">
        <div className="leaderboard-header">
          <div>
            <h2>📍 Section Leaderboard</h2>
            <p className="leaderboard-description">Rankings based on total points earned by all participants from each section</p>
          </div>
          {sectionLeaderboard.length >= 3 && (
            <div className="champions-controls">
              {championsDeclared ? (
                <>
                  <span className="champions-badge declared">✓ Champions Declared</span>
                  <button onClick={handleRevertChampions} className="btn btn-warning">
                    Revert Declaration
                  </button>
                </>
              ) : (
                <>
                  <span className="champions-badge not-declared">⚠ Not Declared</span>
                  <button onClick={handleDeclareChampions} className="btn btn-success">
                    🏆 Declare Final Champions
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        
        {sectionLeaderboard.length === 0 ? (
          <p className="no-data">No data available yet. Results will appear once judges complete scoring and lock their scores.</p>
        ) : (
          <div className="table-container">
            <table className="table leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Section</th>
                  <th>Individual Points</th>
                  <th>Group Points</th>
                  <th>Total Points</th>
                  <th>Participants</th>
                </tr>
              </thead>
              <tbody>
                {sectionLeaderboard.map((item) => (
                  <tr key={item.section} className={item.rank <= 3 ? `rank-${item.rank}` : ''}>
                    <td>
                      <strong className="rank-number">#{item.rank}</strong>
                      {item.rank === 1 && <span className="medal">🥇</span>}
                      {item.rank === 2 && <span className="medal">🥈</span>}
                      {item.rank === 3 && <span className="medal">🥉</span>}
                    </td>
                    <td>
                      <strong className="section-name">{item.section}</strong>
                    </td>
                    <td>
                      <span className="points-badge-sm">{item.totalPoints - item.groupPoints} pts</span>
                    </td>
                    <td>
                      <span className="points-badge-sm group-points">{item.groupPoints || 0} pts</span>
                    </td>
                    <td>
                      <span className="points-badge-lg">{item.totalPoints} pts</span>
                    </td>
                    <td>{item.participantCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Church Leaderboard */}
      <div className="card">
        <h2>⛪ Local Church Leaderboard</h2>
        <p className="leaderboard-description">Rankings based on total points earned by all participants from each local church</p>
        
        {churchLeaderboard.length === 0 ? (
          <p className="no-data">No data available yet. Results will appear once judges complete scoring and lock their scores.</p>
        ) : (
          <div className="table-container">
            <table className="table leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Church Name</th>
                  <th>Section</th>
                  <th>Total Points</th>
                  <th>Participants</th>
                </tr>
              </thead>
              <tbody>
                {churchLeaderboard.map((item) => (
                  <tr key={item.church} className={item.rank <= 3 ? `rank-${item.rank}` : ''}>
                    <td>
                      <strong className="rank-number">#{item.rank}</strong>
                      {item.rank === 1 && <span className="medal">🥇</span>}
                      {item.rank === 2 && <span className="medal">🥈</span>}
                      {item.rank === 3 && <span className="medal">🥉</span>}
                    </td>
                    <td>
                      <strong className="church-name">{item.church}</strong>
                    </td>
                    <td>{item.section}</td>
                    <td>
                      <span className="points-badge-lg">{item.totalPoints} pts</span>
                    </td>
                    <td>{item.participantCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Individual Champion Leaderboard */}
      <div className="card">
        <h2>👑 Individual Champion Leaderboard (Top 10)</h2>
        <p className="leaderboard-description">Top performers ranked by total points earned across all events</p>
        
        {individualLeaderboard.length === 0 ? (
          <p className="no-data">No data available yet. Results will appear once judges complete scoring and lock their scores.</p>
        ) : (
          <div className="table-container">
            <table className="table leaderboard-table">
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Chest No.</th>
                  <th>Name & Achievements</th>
                  <th>Age</th>
                  <th>Category</th>
                  <th>Section</th>
                  <th>Church</th>
                  <th>Total Points</th>
                </tr>
              </thead>
              <tbody>
                {individualLeaderboard.slice(0, 10).map((item) => (
                  <tr key={item.participant.id} className={item.rank <= 3 ? `rank-${item.rank}` : ''}>
                    <td>
                      <strong className="rank-number">#{item.rank}</strong>
                      {item.rank === 1 && <span className="medal">🥇</span>}
                      {item.rank === 2 && <span className="medal">🥈</span>}
                      {item.rank === 3 && <span className="medal">🥉</span>}
                    </td>
                    <td>
                      <span className="chest-number">{item.participant.chestNumber || 'N/A'}</span>
                    </td>
                    <td>
                      <div className="participant-info">
                        <strong className="participant-name">{item.participant.name}</strong>
                        {item.eventResults && item.eventResults.length > 0 && (
                          <div className="event-achievements">
                            {item.eventResults.map((result, idx) => (
                              <span key={idx} className="achievement-badge">
                                {result.eventName} - {result.position}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>{item.participant.age}</td>
                    <td>
                      <span className="category-badge">{item.participant.ageCategory}</span>
                    </td>
                    <td>{item.participant.section}</td>
                    <td className="church-cell">{item.participant.churchName}</td>
                    <td>
                      <span className="points-badge-lg">{item.totalPoints} pts</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leaderboard;
