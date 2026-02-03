import React, { useState, useEffect } from 'react';
import { FirebaseServiceWithoutLoading as FirebaseService } from '../services/FirebaseService';
import './Presentation.css';

const Presentation = () => {
  const [sectionLeaderboard, setSectionLeaderboard] = useState([]);
  const [churchLeaderboard, setChurchLeaderboard] = useState([]);
  const [currentView, setCurrentView] = useState('section'); // 'section' or 'church'
  const [animate, setAnimate] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [autoSwitch, setAutoSwitch] = useState(true);

  useEffect(() => {
    loadData();
    
    // Auto-refresh data every 10 minutes (600000 ms)
    const dataRefreshInterval = setInterval(() => {
      loadData();
    }, 600000);
    
    // Auto-switch between views every 15 seconds (only if autoSwitch is enabled)
    let viewSwitchInterval;
    if (autoSwitch) {
      viewSwitchInterval = setInterval(() => {
        setAnimate(true);
        setTimeout(() => {
          setCurrentView(prev => prev === 'section' ? 'church' : 'section');
          setAnimate(false);
        }, 500);
      }, 15000);
    }

    return () => {
      clearInterval(dataRefreshInterval);
      if (viewSwitchInterval) clearInterval(viewSwitchInterval);
    };
  }, [autoSwitch]);

  const loadData = async () => {
    const {
      participants,
      scores: allScores,
      sections,
      declaredResults,
      groupTeams,
      groupEvents,
      pointsConfig,
      groupEventLocks,
      judges
    } = await FirebaseService.getPresentationData();

    // Pre-fetch all judge locks to avoid repeated API calls
    const judgeLocks = await FirebaseService.getJudgeLocks();
    
    // Create a cache for lock status by event-category
    const lockStatusCache = {};
    
    // Helper function to check if all judges are locked (cached)
    const areAllJudgesLockedCached = (eventId, category) => {
      const key = `${eventId}-${category}`;
      if (lockStatusCache[key] !== undefined) {
        return lockStatusCache[key];
      }
      
      // Get all unique judges who have scored this event-category
      const judgesWhoScored = [...new Set(
        allScores
          .filter(s => s.eventId === eventId)
          .map(s => s.judgeName)
      )];
      
      if (judgesWhoScored.length === 0) {
        lockStatusCache[key] = false;
        return false;
      }
      
      // Check if all judges have locked
      const allLocked = judgesWhoScored.every(judgeName =>
        judgeLocks.some(lock =>
          lock.judgeName === judgeName &&
          lock.eventId === eventId &&
          lock.category === category &&
          lock.locked
        )
      );
      
      lockStatusCache[key] = allLocked;
      return allLocked;
    };

    // Calculate points for each participant
    const participantPoints = {};
    
    for (const participant of participants) {
      const eventIds = participant.eventIds || (participant.eventId ? [parseInt(participant.eventId)] : []);
      
      for (const eventId of eventIds) {
        const category = participant.ageCategory;
        
        const isDeclared = declaredResults.some(
          r => r.eventId === eventId && r.category === category
        );
        
        if (!isDeclared) continue;
        
        const isLocked = areAllJudgesLockedCached(eventId, category);
        
        if (!isLocked) continue;
        
        const eventParticipants = participants.filter(p => {
          const pEventIds = p.eventIds || (p.eventId ? [parseInt(p.eventId)] : []);
          return pEventIds.includes(eventId) && p.ageCategory === category;
        });
        
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
        
        results.sort((a, b) => b.averageScore - a.averageScore);
        
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
                totalPoints: 0
              };
            }
            
            participantPoints[participant.id].totalPoints += points;
          }
        });
      }
    }

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
    // groupEventLocks already loaded from getPresentationData
    // judges already loaded from getPresentationData
    
    groupEvents.forEach(groupEvent => {
      const isDeclared = declaredResults.some(r => String(r.groupEventId) === String(groupEvent.id));
      
      if (!isDeclared) return;
      
      let isLocked = false;
      if (groupEvent.scoringType === 'quiz') {
        isLocked = groupEventLocks.some(lock => 
          String(lock.groupEventId) === String(groupEvent.id) && lock.locked
        );
      } else {
        isLocked = judges.length > 0 && judges.every(judge =>
          groupEventLocks.some(lock => 
            lock.judgeName === judge.username && 
            String(lock.groupEventId) === String(groupEvent.id) && 
            lock.locked
          )
        );
      }
      
      if (!isLocked) return;
      
      const eventTeams = groupTeams.filter(t => String(t.groupEventId) === String(groupEvent.id));
      
      const results = eventTeams.map(team => {
        const teamScores = team.scores || [];
        let totalScore = 0;
        let judgeCount = 0;
        
        if (groupEvent.scoringType === 'quiz') {
          const quizScore = teamScores.find(s => s.score !== undefined && s.score !== null);
          totalScore = quizScore ? parseFloat(quizScore.score) : 0;
          judgeCount = quizScore ? 1 : 0;
        } else {
          teamScores.forEach(score => {
            if (score.score !== undefined && score.score !== null) {
              totalScore += parseFloat(score.score);
              judgeCount++;
            }
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
      
      results.sort((a, b) => b.averageScore - a.averageScore);
      
      results.forEach((result, index) => {
        const rank = index + 1;
        let points = 0;
        
        if (rank === 1) points = pointsConfig.group.first;
        else if (rank === 2) points = pointsConfig.group.second;
        else if (rank === 3) points = pointsConfig.group.third;
        
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
  };

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const handleViewChange = (view) => {
    setAnimate(true);
    setTimeout(() => {
      setCurrentView(view);
      setAnimate(false);
      setShowMenu(false);
    }, 300);
  };

  const toggleMenu = () => {
    setShowMenu(!showMenu);
  };

  const handleRefresh = () => {
    loadData();
    setShowMenu(false);
  };

  return (
    <div className="presentation-view">
      {/* Menu Toggle Button */}
      <button className="menu-toggle" onClick={toggleMenu}>
        ⚙️
      </button>

      {/* Control Menu */}
      {showMenu && (
        <div className="control-menu">
          <div className="menu-header">
            <h3>Presentation Controls</h3>
            <button className="close-menu" onClick={() => setShowMenu(false)}>×</button>
          </div>
          
          <div className="menu-section">
            <h4>View</h4>
            <button 
              className={`menu-btn ${currentView === 'section' ? 'active' : ''}`}
              onClick={() => handleViewChange('section')}
            >
              📍 Section Leaderboard
            </button>
            <button 
              className={`menu-btn ${currentView === 'church' ? 'active' : ''}`}
              onClick={() => handleViewChange('church')}
            >
              ⛪ Church Leaderboard
            </button>
          </div>

          <div className="menu-section">
            <h4>Auto-Switch</h4>
            <label className="switch">
              <input 
                type="checkbox" 
                checked={autoSwitch}
                onChange={(e) => setAutoSwitch(e.target.checked)}
              />
              <span className="slider"></span>
            </label>
            <span className="switch-label">
              {autoSwitch ? 'Enabled (15s)' : 'Disabled'}
            </span>
          </div>

          <div className="menu-section">
            <button className="menu-btn refresh-btn" onClick={handleRefresh}>
              🔄 Refresh Data
            </button>
          </div>

          <div className="menu-info">
            <small>Auto-refresh: Every 10 minutes</small>
          </div>
        </div>
      )}

      <div className="presentation-header">
        <h1 className="presentation-title">
          🏆 Christ Soldiers Talent Test 2026 🏆
        </h1>
        <h2 className="presentation-subtitle">Leaderboard</h2>
      </div>

      <div className={`presentation-content ${animate ? 'fade-out' : 'fade-in'}`}>
        {currentView === 'section' ? (
          <div className="leaderboard-section">
            <h2 className="section-title">📍 Section Leaderboard</h2>
            <div className="leaderboard-grid">
              {sectionLeaderboard.map((item, index) => (
                <div 
                  key={item.section} 
                  className={`leaderboard-item rank-${item.rank} slide-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="rank-badge">
                    <span className="rank-number">#{item.rank}</span>
                    <span className="medal">{getMedalEmoji(item.rank)}</span>
                  </div>
                  <div className="item-content">
                    <h3 className="item-name">{item.section}</h3>
                    <div className="points-breakdown">
                      <span className="individual-points">Individual: {item.totalPoints - item.groupPoints}</span>
                      <span className="group-points">Group: {item.groupPoints}</span>
                    </div>
                  </div>
                  <div className="total-points">
                    <span className="points-value">{item.totalPoints}</span>
                    <span className="points-label">points</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="leaderboard-section">
            <h2 className="section-title">⛪ Church Leaderboard</h2>
            <div className="leaderboard-grid">
              {churchLeaderboard.slice(0, 10).map((item, index) => (
                <div 
                  key={item.church} 
                  className={`leaderboard-item rank-${item.rank} slide-in`}
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="rank-badge">
                    <span className="rank-number">#{item.rank}</span>
                    <span className="medal">{getMedalEmoji(item.rank)}</span>
                  </div>
                  <div className="item-content">
                    <h3 className="item-name">{item.church}</h3>
                    <p className="item-section">{item.section}</p>
                  </div>
                  <div className="total-points">
                    <span className="points-value">{item.totalPoints}</span>
                    <span className="points-label">points</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="presentation-footer">
        <div className="footer-animation">
          <span className="sparkle">✨</span>
          <span className="footer-text">Congratulations to all participants!</span>
          <span className="sparkle">✨</span>
        </div>
      </div>
    </div>
  );
};

export default Presentation;
