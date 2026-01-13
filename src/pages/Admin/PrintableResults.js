import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StorageService from '../../services/StorageService';
import './PrintableResults.css';

const PrintableResults = () => {
  const [events, setEvents] = useState([]);
  const [groupEvents, setGroupEvents] = useState([]);
  const [participants, setParticipants] = useState([]);
  const [groupTeams, setGroupTeams] = useState([]);
  const [allScores, setAllScores] = useState([]);
  const [sections, setSections] = useState([]);
  const [pointsConfig, setPointsConfig] = useState({
    individual: { first: 5, second: 3, third: 1 },
    group: { first: 10, second: 5, third: 3 }
  });
  const [results, setResults] = useState({});
  const [groupResults, setGroupResults] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    } else {
      loadData();
    }
  }, [user, navigate]);

  const loadData = () => {
    const data = StorageService.getData();
    setEvents(StorageService.getEvents());
    setGroupEvents(data.groupEvents || []);
    setParticipants(StorageService.getParticipants());
    setGroupTeams(data.groupTeams || []);
    setAllScores(StorageService.getScores());
    setSections(StorageService.getSections());
    setPointsConfig(data.pointsConfig || {
      individual: { first: 5, second: 3, third: 1 },
      group: { first: 10, second: 5, third: 3 }
    });
    calculateResults();
    calculateGroupResults(data.groupEvents || [], data.groupTeams || []);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const calculateResults = () => {
    const eventsList = StorageService.getEvents();
    const participantsList = StorageService.getParticipants();
    const scoresList = StorageService.getScores();
    const categories = ['Junior', 'Senior', 'Super Senior'];
    const resultsData = {};

    categories.forEach(category => {
      resultsData[category] = {};
      
      eventsList.forEach(event => {
        const categoryParticipants = participantsList.filter(p => {
          const eventIds = p.eventIds || (p.eventId ? [parseInt(p.eventId)] : []);
          return p.ageCategory === category && eventIds.includes(event.id);
        });

        const participantsWithScores = categoryParticipants.map(participant => {
          const participantScores = scoresList.filter(
            s => s.participantId === participant.id && s.eventId === event.id
          );

          if (participantScores.length === 0) {
            return null;
          }

          const totalScore = participantScores.reduce((sum, s) => sum + s.totalScore, 0);
          const averageScore = totalScore / participantScores.length;

          return {
            ...participant,
            averageScore,
            scoreCount: participantScores.length
          };
        }).filter(p => p !== null);

        participantsWithScores.sort((a, b) => b.averageScore - a.averageScore);

        if (participantsWithScores.length > 0) {
          if (!resultsData[category][event.id]) {
            resultsData[category][event.id] = {
              eventName: event.name,
              top3: participantsWithScores.slice(0, 3)
            };
          }
        }
      });
    });

    setResults(resultsData);
  };

  const calculateGroupResults = (groupEventsList, groupTeamsList) => {
    const groupResultsData = {};

    groupEventsList.forEach(event => {
      const eventTeams = groupTeamsList.filter(t => t.groupEventId === event.id);
      
      const teamsWithScores = eventTeams.map(team => {
        if (!team.scores || team.scores.length === 0) {
          return null;
        }

        let finalScore;
        if (event.scoringType === 'quiz') {
          finalScore = team.scores[0]?.score || 0;
        } else {
          const totalScore = team.scores.reduce((sum, s) => sum + (s.score || 0), 0);
          finalScore = totalScore / team.scores.length;
        }

        return {
          ...team,
          finalScore
        };
      }).filter(t => t !== null);

      teamsWithScores.sort((a, b) => b.finalScore - a.finalScore);

      if (teamsWithScores.length > 0) {
        groupResultsData[event.id] = {
          eventName: event.name,
          scoringType: event.scoringType,
          top3: teamsWithScores.slice(0, 3)
        };
      }
    });

    setGroupResults(groupResultsData);
  };

  const getSectionName = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : 'Unknown';
  };

  const getPoints = (position, isGroup = false) => {
    const config = isGroup ? pointsConfig.group : pointsConfig.individual;
    if (position === 0) return config.first;
    if (position === 1) return config.second;
    if (position === 2) return config.third;
    return 0;
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="printable-results-view">
      <div className="dashboard-header no-print">
        <div>
          <h1>🖨️ Printable Results Summary</h1>
          <p>Admin: {user?.username}</p>
        </div>
        <div className="header-actions">
          <button onClick={handlePrint} className="btn btn-primary">
            🖨️ Print Results
          </button>
          <button onClick={handleBackToDashboard} className="btn btn-secondary">
            Back to Dashboard
          </button>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      <div className="print-content">
        <div className="print-header">
          <h1>Christ Soldiers Talent Test 2026</h1>
          <h2>Official Results Summary</h2>
          <p className="print-date">Date: {new Date().toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}</p>
        </div>

        {/* Individual Events Results by Category */}
        <div className="results-section">
          <h2 className="section-title">Individual Events Results</h2>
          
          {['Junior', 'Senior', 'Super Senior'].map(category => (
            <div key={category} className="category-section">
              <h3 className="category-title">{category} Category</h3>
              
              {results[category] && Object.keys(results[category]).length > 0 ? (
                <div className="events-grid">
                  {Object.entries(results[category]).map(([eventId, eventData]) => (
                    <div key={eventId} className="event-results-card">
                      <h4 className="event-name">{eventData.eventName}</h4>
                      
                      <table className="results-table">
                        <thead>
                          <tr>
                            <th>Pos</th>
                            <th>Chest No</th>
                            <th>Name</th>
                            <th>Section</th>
                            <th>Score</th>
                            <th>Points</th>
                          </tr>
                        </thead>
                        <tbody>
                          {eventData.top3.map((participant, index) => (
                            <tr key={participant.id} className={`position-${index + 1}`}>
                              <td className="position-cell">
                                {index === 0 && '🥇'}
                                {index === 1 && '🥈'}
                                {index === 2 && '🥉'}
                              </td>
                              <td><strong>{participant.chestNumber}</strong></td>
                              <td>{participant.name}</td>
                              <td>{participant.section}</td>
                              <td>{participant.averageScore.toFixed(2)}</td>
                              <td><span className="points-badge">{getPoints(index, false)}</span></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="no-results">No results available for this category</p>
              )}
            </div>
          ))}
        </div>

        {/* Group Events Results */}
        <div className="results-section">
          <h2 className="section-title">Group Events Results</h2>
          
          {Object.keys(groupResults).length > 0 ? (
            <div className="events-grid">
              {Object.entries(groupResults).map(([eventId, eventData]) => (
                <div key={eventId} className="event-results-card">
                  <h4 className="event-name">{eventData.eventName}</h4>
                  
                  <table className="results-table">
                    <thead>
                      <tr>
                        <th>Pos</th>
                        <th>Chest No</th>
                        <th>Team Name</th>
                        <th>Section</th>
                        <th>Score</th>
                        <th>Points</th>
                      </tr>
                    </thead>
                    <tbody>
                      {eventData.top3.map((team, index) => (
                        <tr key={team.id} className={`position-${index + 1}`}>
                          <td className="position-cell">
                            {index === 0 && '🥇'}
                            {index === 1 && '🥈'}
                            {index === 2 && '🥉'}
                          </td>
                          <td><strong>{team.chestNumber}</strong></td>
                          <td>{team.teamName}</td>
                          <td>{getSectionName(team.sectionId)}</td>
                          <td>{team.finalScore.toFixed(2)}</td>
                          <td><span className="points-badge">{getPoints(index, true)}</span></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          ) : (
            <p className="no-results">No group events results available</p>
          )}
        </div>

        <div className="print-footer">
          <p>Christ Soldiers Talent Test Management System</p>
          <p>Official Document - Generated on {new Date().toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableResults;
