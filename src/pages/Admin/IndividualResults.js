import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FirebaseService from '../../services/FirebaseService';
import './IndividualResults.css';

const IndividualResults = () => {
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [sections, setSections] = useState([]);
  const [allScores, setAllScores] = useState([]);
  const [groupTeams, setGroupTeams] = useState([]);
  const [groupEvents, setGroupEvents] = useState([]);
  const [pointsConfig, setPointsConfig] = useState({
    individual: { first: 5, second: 3, third: 1 },
    group: { first: 10, second: 5, third: 3 }
  });
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedChurch, setSelectedChurch] = useState('');
  const [filteredResults, setFilteredResults] = useState([]);
  const [sectionGroupResults, setSectionGroupResults] = useState([]);
  const [availableChurches, setAvailableChurches] = useState([]);
  const [loading, setLoading] = useState(false);
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
      sections: allSections,
      participants: allParticipants,
      scores,
      groupTeams: allGroupTeams,
      groupEvents: allGroupEvents,
      pointsConfig
    } = await FirebaseService.getLeaderboardData();

    setEvents(allEvents);
    setSections(allSections);
    setParticipants(allParticipants);
    setAllScores(scores);
    setGroupTeams(allGroupTeams);
    setGroupEvents(allGroupEvents);
    setPointsConfig(pointsConfig);

    const churches = [...new Set(allParticipants.map(p => p.churchName).filter(Boolean))].sort();
    setAvailableChurches(churches);
  };

  const calculateFilteredResults = async () => {
    if (!selectedSection && !selectedChurch) {
      setFilteredResults([]);
      return;
    }

    setLoading(true);

    const [declaredResults, data, judges] = await Promise.all([
      FirebaseService.getDeclaredResults(),
      FirebaseService.getData(),
      FirebaseService.getJudges()
    ]);

    const allEvents = data.events || events;

    let filteredParticipants = participants;
    if (selectedSection) {
      filteredParticipants = filteredParticipants.filter(p => p.section === selectedSection);
    }
    if (selectedChurch) {
      filteredParticipants = filteredParticipants.filter(p => p.churchName === selectedChurch);
    }

    const participantPoints = {};

    for (const participant of filteredParticipants) {
      const eventIds = participant.eventIds || (participant.eventId ? [parseInt(participant.eventId)] : []);

      for (const eventId of eventIds) {
        const category = participant.ageCategory;

        const isDeclared = declaredResults.some(
          r => r.eventId === eventId && r.category === category
        );

        if (!isDeclared) continue;

        const isLocked = await FirebaseService.areAllJudgesLocked(eventId, category);

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
                totalPoints: 0,
                eventResults: []
              };
            }

            participantPoints[participant.id].totalPoints += points;

            const event = allEvents.find(e => e.id === eventId);
            if (event && rank <= 3) {
              participantPoints[participant.id].eventResults.push({
                eventName: event.name,
                rank: rank,
                position: rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd'
              });
            }
          }
        });
      }
    }

    const individualArray = Object.values(participantPoints)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .map((item, index) => ({ ...item, rank: index + 1 }));

    setFilteredResults(individualArray);

    if (selectedSection && !selectedChurch) {
      await calculateSectionGroupResults(selectedSection);
    } else {
      setSectionGroupResults([]);
    }

    setLoading(false);
  };

  const calculateSectionGroupResults = async (sectionName) => {
    const declaredResults = await FirebaseService.getDeclaredResults();
    const groupLocks = await FirebaseService.getGroupEventLocks();
    const judges = await FirebaseService.getJudges();

    const section = sections.find(s => s.name === sectionName);
    if (!section) {
      setSectionGroupResults([]);
      return;
    }

    const groupResults = [];

    for (const groupEvent of groupEvents) {
      const isDeclared = declaredResults.some(r => String(r.groupEventId) === String(groupEvent.id));
      if (!isDeclared) continue;

      let isLocked = false;
      if (groupEvent.scoringType === 'quiz') {
        isLocked = groupLocks.some(lock =>
          String(lock.groupEventId) === String(groupEvent.id) && lock.locked
        );
      } else {
        isLocked = judges.length > 0 && judges.every(judge =>
          groupLocks.some(lock =>
            lock.judgeName === judge.username &&
            String(lock.groupEventId) === String(groupEvent.id) &&
            lock.locked
          )
        );
      }

      if (!isLocked) continue;

      const sectionTeams = groupTeams.filter(t =>
        String(t.groupEventId) === String(groupEvent.id) &&
        String(t.sectionId) === String(section.id)
      );

      sectionTeams.forEach(team => {
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

        const allEventTeams = groupTeams.filter(t => String(t.groupEventId) === String(groupEvent.id));
        const allResults = allEventTeams.map(t => {
          const scores = t.scores || [];
          let total = 0;
          let count = 0;

          if (groupEvent.scoringType === 'quiz') {
            const qScore = scores.find(s => s.score !== undefined && s.score !== null);
            total = qScore ? parseFloat(qScore.score) : 0;
            count = qScore ? 1 : 0;
          } else {
            scores.forEach(s => {
              if (s.score !== undefined && s.score !== null) {
                total += parseFloat(s.score);
                count++;
              }
            });
          }

          return {
            teamId: t.id,
            avg: count > 0 ? (groupEvent.scoringType === 'quiz' ? total : total / count) : 0
          };
        });

        allResults.sort((a, b) => b.avg - a.avg);
        const rank = allResults.findIndex(r => r.teamId === team.id) + 1;

        let points = 0;
        if (rank === 1) points = pointsConfig.group.first;
        else if (rank === 2) points = pointsConfig.group.second;
        else if (rank === 3) points = pointsConfig.group.third;

        if (rank <= 3) {
          groupResults.push({
            eventName: groupEvent.name,
            teamName: team.teamName,
            rank: rank,
            position: rank === 1 ? '1st' : rank === 2 ? '2nd' : '3rd',
            points: points,
            averageScore: averageScore.toFixed(2)
          });
        }
      });
    }

    setSectionGroupResults(groupResults);
  };

  const handleFilterChange = () => {
    if (selectedSection) {
      const sectionParticipants = participants.filter(p => p.section === selectedSection);
      const churches = [...new Set(sectionParticipants.map(p => p.churchName).filter(Boolean))].sort();
      setAvailableChurches(churches);
    } else {
      const churches = [...new Set(participants.map(p => p.churchName).filter(Boolean))].sort();
      setAvailableChurches(churches);
    }
  };

  useEffect(() => {
    handleFilterChange();
  }, [selectedSection]);

  const handlePrintResults = () => {
    const resultsData = filteredResults;
    const filterText = selectedSection || selectedChurch ?
      ` - ${selectedSection || 'All Sections'}${selectedChurch ? ` - ${selectedChurch}` : ''}` : '';

    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Individual Results${filterText}</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
            max-width: 1200px;
            margin: 0 auto;
          }
          h1 {
            text-align: center;
            color: #2d3748;
            margin-bottom: 10px;
          }
          .subtitle {
            text-align: center;
            color: #718096;
            margin-bottom: 20px;
          }
          .print-info {
            text-align: center;
            color: #a0aec0;
            font-size: 12px;
            margin-bottom: 30px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #cbd5e0;
            padding: 10px;
            text-align: left;
          }
          th {
            background: #edf2f7;
            font-weight: 600;
            color: #2d3748;
          }
          tr:nth-child(even) {
            background: #f7fafc;
          }
          .rank-1 { background: #fef3c7 !important; }
          .rank-2 { background: #e5e7eb !important; }
          .rank-3 { background: #fed7aa !important; }
          .rank-number {
            font-weight: bold;
            color: #667eea;
          }
          .total-points {
            font-weight: bold;
            color: #48bb78;
          }
          .medal {
            font-size: 18px;
            margin-left: 5px;
          }
          tfoot {
            background: #edf2f7;
            font-weight: bold;
          }
          tfoot td {
            border-top: 3px solid #2d3748;
            padding: 15px 10px;
          }
          .total-label {
            text-align: right;
            font-size: 1.1rem;
            color: #2d3748;
          }
          .total-value {
            font-size: 1.2rem;
            color: #48bb78;
          }
          .group-results-header {
            background: #667eea;
            color: white;
          }
          .group-result-row {
            background: #f0f4ff !important;
          }
          @media print {
            body { padding: 10px; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <h1>🏆 Individual Results${filterText}</h1>
        <div class="subtitle">Christ Soldiers Talent Test</div>
        <div class="print-info">Generated on ${new Date().toLocaleString()}</div>
        
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Chest No.</th>
              <th>Name</th>
              <th>Age</th>
              <th>Category</th>
              <th>Section</th>
              <th>Church</th>
              <th>Event Results</th>
              <th>Total Points</th>
            </tr>
          </thead>
          <tbody>
            ${resultsData.map(item => `
              <tr class="${item.rank <= 3 ? `rank-${item.rank}` : ''}">
                <td>
                  <span class="rank-number">#${item.rank}</span>
                  ${item.rank === 1 ? '<span class="medal">🥇</span>' : ''}
                  ${item.rank === 2 ? '<span class="medal">🥈</span>' : ''}
                  ${item.rank === 3 ? '<span class="medal">🥉</span>' : ''}
                </td>
                <td>${item.participant.chestNumber || 'N/A'}</td>
                <td><strong>${item.participant.name}</strong></td>
                <td>${item.participant.age}</td>
                <td>${item.participant.ageCategory}</td>
                <td>${item.participant.section}</td>
                <td>${item.participant.churchName || 'N/A'}</td>
                <td>
                  ${item.eventResults && item.eventResults.length > 0 ?
                    item.eventResults.map(r => `${r.eventName} (${r.position})`).join(', ') :
                    'No achievements'}
                </td>
                <td><span class="total-points">${item.totalPoints}</span></td>
              </tr>
            `).join('')}
            
            ${selectedSection && !selectedChurch && sectionGroupResults.length > 0 ? `
              <tr class="group-results-header">
                <td colspan="9" style="padding: 12px; font-weight: bold; text-align: center;">
                  👥 Group Event Results for ${selectedSection}
                </td>
              </tr>
              ${sectionGroupResults.map(g => `
                <tr class="group-result-row">
                  <td>
                    <span class="rank-number">#${g.rank}</span>
                    ${g.rank === 1 ? '<span class="medal">🥇</span>' : ''}
                    ${g.rank === 2 ? '<span class="medal">🥈</span>' : ''}
                    ${g.rank === 3 ? '<span class="medal">🥉</span>' : ''}
                  </td>
                  <td colspan="2"><strong>👥 ${g.teamName}</strong></td>
                  <td colspan="5">${g.eventName}</td>
                  <td><span class="total-points">${g.points}</span></td>
                </tr>
              `).join('')}
            ` : ''}
          </tbody>
          <tfoot>
            <tr>
              <td colspan="8" class="total-label">
                ${selectedSection && selectedChurch ? `Total for ${selectedChurch} (${selectedSection})` :
                  selectedSection ? `Total for ${selectedSection} Section` :
                  selectedChurch ? `Total for ${selectedChurch}` :
                  'Grand Total'}
              </td>
              <td class="total-value">
                ${resultsData.reduce((sum, item) => sum + item.totalPoints, 0) +
                  (selectedSection && !selectedChurch ? sectionGroupResults.reduce((sum, g) => sum + g.points, 0) : 0)} pts
              </td>
            </tr>
          </tfoot>
        </table>
        
        <script>
          window.onload = function() {
            window.print();
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const handleLogout = () => {
    logout();
    startTransition(() => {
      navigate('/admin/login');
    });
  };

  const handleBackToLeaderboard = () => {
    if (eventId) {
      navigate('/admin/leaderboard', { state: { eventId } });
    } else {
      navigate('/admin/leaderboard');
    }
  };

  return (
    <div className="individual-results-view">
      <div className="dashboard-header">
        <div>
          <h1>🔍 Individual Results
            {selectedSection && (
              <span> - {selectedSection}</span>
            )}
            {selectedChurch && (
              <span> ({selectedChurch})</span>
            )}
          </h1>
          <p>
            {selectedSection || selectedChurch
              ? `Showing results for ${selectedSection || 'All Sections'}${selectedChurch ? ` - ${selectedChurch}` : ''}`
              : 'Filter and view detailed individual results by section and church'}
          </p>
        </div>
        <div className="header-actions">
          <button onClick={handleBackToLeaderboard} className="btn-secondary">
            ← Back to Leaderboard
          </button>
          <button onClick={handleLogout} className="btn-secondary">
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="sectionFilter">Section:</label>
            <select
              id="sectionFilter"
              value={selectedSection}
              onChange={(e) => {
                setSelectedSection(e.target.value);
                setSelectedChurch('');
              }}
              className="filter-select"
            >
              <option value="">Select Section</option>
              {sections.map(section => (
                <option key={section.id} value={section.name}>{section.name}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="churchFilter">Church:</label>
            <select
              id="churchFilter"
              value={selectedChurch}
              onChange={(e) => setSelectedChurch(e.target.value)}
              className="filter-select"
              disabled={!selectedSection}
            >
              <option value="">All Churches</option>
              {availableChurches.map(church => (
                <option key={church} value={church}>{church}</option>
              ))}
            </select>
          </div>

          <button
            onClick={calculateFilteredResults}
            className="action-button search-button"
            disabled={!selectedSection && !selectedChurch}
          >
            🔍 Search Results
          </button>

          <button
            onClick={handlePrintResults}
            className="action-button print-button"
            disabled={filteredResults.length === 0}
          >
            🖨️ Print Results
          </button>
        </div>

        {(selectedSection || selectedChurch) && (
          <div className="active-filters">
            <span className="filter-label">Active Filters:</span>
            {selectedSection && (
              <span className="filter-badge">
                Section: {selectedSection}
                <button onClick={() => setSelectedSection('')} className="remove-filter">×</button>
              </span>
            )}
            {selectedChurch && (
              <span className="filter-badge">
                Church: {selectedChurch}
                <button onClick={() => setSelectedChurch('')} className="remove-filter">×</button>
              </span>
            )}
          </div>
        )}

        {loading && (
          <div className="loading-message">
            <p>Loading results... Please wait.</p>
          </div>
        )}

        {!loading && filteredResults.length === 0 && (selectedSection || selectedChurch) && (
          <div className="no-data">
            No results found. Click "Search Results" to load data.
          </div>
        )}

        {!loading && filteredResults.length === 0 && !selectedSection && !selectedChurch && (
          <div className="no-data">
            Please select a section or church filter and click "Search Results".
          </div>
        )}

        {!loading && filteredResults.length > 0 && (
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
                {filteredResults.map((item) => (
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

                {selectedSection && !selectedChurch && sectionGroupResults.length > 0 && (
                  <>
                    <tr className="group-results-header">
                      <td colSpan="8" style={{ padding: '12px', fontWeight: 'bold', textAlign: 'center' }}>
                        👥 Group Event Results for {selectedSection}
                      </td>
                    </tr>
                    {sectionGroupResults.map((groupResult, idx) => (
                      <tr key={`group-${idx}`} className="group-result-row">
                        <td>
                          <strong className="rank-number">#{groupResult.rank}</strong>
                          {groupResult.rank === 1 && <span className="medal">🥇</span>}
                          {groupResult.rank === 2 && <span className="medal">🥈</span>}
                          {groupResult.rank === 3 && <span className="medal">🥉</span>}
                        </td>
                        <td colSpan="2">
                          <strong>👥 {groupResult.teamName}</strong>
                        </td>
                        <td colSpan="4">{groupResult.eventName}</td>
                        <td>
                          <span className="points-badge-lg">{groupResult.points} pts</span>
                        </td>
                      </tr>
                    ))}
                  </>
                )}
              </tbody>
              <tfoot>
                <tr>
                  <td colSpan="7" className="total-label">
                    {selectedSection && selectedChurch
                      ? `Total for ${selectedChurch} (${selectedSection})`
                      : selectedSection
                      ? `Total for ${selectedSection} Section`
                      : selectedChurch
                      ? `Total for ${selectedChurch}`
                      : 'Grand Total'}
                  </td>
                  <td>
                    <span className="total-value">
                      {filteredResults.reduce((sum, item) => sum + item.totalPoints, 0) +
                        (selectedSection && !selectedChurch ? sectionGroupResults.reduce((sum, g) => sum + g.points, 0) : 0)} pts
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default IndividualResults;
