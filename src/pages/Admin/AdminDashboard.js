import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FirebaseService from '../../services/FirebaseService';
import './AdminDashboard.css';

const AdminDashboard = () => {
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    } else {
      loadParticipants();
    }
  }, [user, navigate]);

  const loadParticipants = async () => {
    const allEvents = await FirebaseService.getEvents();
    setEvents(allEvents);
    const allCategories = await FirebaseService.getCategories();
    setCategories(allCategories.sort((a, b) => (a.order || 0) - (b.order || 0)));
    const allParticipants = await FirebaseService.getParticipants();
    setParticipants(allParticipants);
    setFilteredParticipants([]);
    setSelectedCategory(null);
    setSelectedEvent(null);
  };

  const applyFilters = () => {
    let filtered = [...participants];
    
    // If no filters selected at all, show nothing
    if (!selectedCategory && !selectedEvent) {
      setFilteredParticipants([]);
      return;
    }
    
    // Apply filters
    if (selectedCategory) {
      filtered = filtered.filter(p => p.ageCategory === selectedCategory);
    }
    
    if (selectedEvent) {
      filtered = filtered.filter(p => {
        const eventIds = p.eventIds || (p.eventId ? [p.eventId] : []);
        return eventIds.includes(selectedEvent);
      });
    }
    
    setFilteredParticipants(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedCategory, selectedEvent]);

  const handleCategoryFilter = (category) => {
    if (selectedCategory === category) {
      // Unfilter if clicking the same category
      setSelectedCategory(null);
    } else {
      // Filter by selected category
      setSelectedCategory(category);
    }
  };

  const handleEventFilter = (eventId) => {
    if (selectedEvent === eventId) {
      setSelectedEvent(null);
    } else {
      setSelectedEvent(eventId);
    }
  };

  const clearFilters = () => {
    setSelectedCategory(null);
    setSelectedEvent(null);
  };

  const handlePrintChestNumber = (participant) => {
    if (!participant.chestNumber) {
      alert('Please assign a chest number first!');
      return;
    }

    // Create printable content
    const eventNames = getEventNames(participant);
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Chest Number - ${participant.chestNumber}</title>
        <style>
          @media print {
            @page {
              size: A6 landscape;
              margin: 0;
            }
            body {
              margin: 0;
              padding: 0;
            }
          }
          
          body {
            font-family: Arial, sans-serif;
            margin: 0;
            padding: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 100vh;
            background: #f5f5f5;
          }
          
          .chest-card {
            width: 148mm;
            height: 105mm;
            background: white;
            border: 3px solid #667eea;
            border-radius: 12px;
            padding: 20px;
            box-sizing: border-box;
            display: flex;
            flex-direction: column;
            page-break-after: always;
          }
          
          .header {
            text-align: center;
            border-bottom: 2px solid #667eea;
            padding-bottom: 15px;
            margin-bottom: 15px;
          }
          
          .header h1 {
            margin: 0 0 5px 0;
            color: #2d3748;
            font-size: 24px;
          }
          
          .header h2 {
            margin: 0;
            color: #667eea;
            font-size: 18px;
            font-weight: normal;
          }
          
          .chest-number-display {
            text-align: center;
            margin: 20px 0;
          }
          
          .chest-number-large {
            font-size: 72px;
            font-weight: bold;
            color: #667eea;
            line-height: 1;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.1);
          }
          
          .participant-details {
            flex: 1;
          }
          
          .detail-row {
            display: flex;
            margin-bottom: 8px;
            font-size: 14px;
          }
          
          .detail-label {
            font-weight: bold;
            color: #4a5568;
            width: 120px;
            flex-shrink: 0;
          }
          
          .detail-value {
            color: #2d3748;
          }
          
          .programs-section {
            margin-top: 10px;
            padding-top: 10px;
            border-top: 1px solid #e2e8f0;
          }
          
          .programs-title {
            font-weight: bold;
            color: #667eea;
            margin-bottom: 8px;
            font-size: 16px;
          }
          
          .program-list {
            list-style: none;
            padding: 0;
            margin: 0;
          }
          
          .program-item {
            padding: 6px 12px;
            background: #f7fafc;
            border-left: 3px solid #667eea;
            margin-bottom: 6px;
            font-size: 13px;
          }
          
          .category-badge {
            display: inline-block;
            background: #667eea;
            color: white;
            padding: 4px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
          }
          
          .print-button {
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 24px;
            background: #667eea;
            color: white;
            border: none;
            border-radius: 6px;
            cursor: pointer;
            font-size: 16px;
            font-weight: bold;
            box-shadow: 0 2px 8px rgba(0,0,0,0.2);
          }
          
          .print-button:hover {
            background: #5568d3;
          }
          
          @media print {
            .print-button {
              display: none;
            }
          }
        </style>
      </head>
      <body>
        <button class="print-button" onclick="window.print()">🖨️ Print</button>
        <div class="chest-card">
          <div class="header">
            <h1>Christ Soldiers</h1>
            <h2>Talent Test 2026</h2>
          </div>
          
          <div class="chest-number-display">
            <div class="chest-number-large">${participant.chestNumber}</div>
          </div>
          
          <div class="participant-details">
            <div class="detail-row">
              <span class="detail-label">Name:</span>
              <span class="detail-value">${participant.name}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Age:</span>
              <span class="detail-value">${participant.age} years</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Category:</span>
              <span class="detail-value"><span class="category-badge">${participant.ageCategory}</span></span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Section:</span>
              <span class="detail-value">${participant.section || '-'}</span>
            </div>
            <div class="detail-row">
              <span class="detail-label">Church:</span>
              <span class="detail-value">${participant.churchName || '-'}</span>
            </div>
          </div>
          
          <div class="programs-section">
            <div class="programs-title">Registered Programs:</div>
            <ul class="program-list">
              ${eventNames.split(', ').map(event => `<li class="program-item">${event}</li>`).join('')}
            </ul>
          </div>
        </div>
      </body>
      </html>
    `;
    
    printWindow.document.write(printContent);
    printWindow.document.close();
  };

  const getEventNames = (participant) => {
    // Handle both old single eventId and new eventIds array
    const eventIds = participant.eventIds 
      ? participant.eventIds 
      : (participant.eventId ? [participant.eventId] : []);
    
    return eventIds
      .map(eventId => {
        const event = events.find(e => e.id === eventId);
        return event ? event.name : 'Unknown';
      })
      .join(', ');
  };

  const handleLogout = () => {
    logout();
    startTransition(() => {
      navigate('/admin/login');
    });
  };

  const stats = {
    total: participants.length,
    byCategory: categories.reduce((acc, cat) => {
      acc[cat.name] = participants.filter(p => p.ageCategory === cat.name).length;
      return acc;
    }, {})
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>Admin Dashboard</h1>
          <p>Welcome, {user?.username}</p>
        </div>
        <div className="header-actions">
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      {/* Navigation Menu */}
      <div className="admin-menu-grid">
        <button 
          onClick={() => navigate('/admin/talent-test-events')} 
          className="menu-card"
        >
          <div className="menu-icon">🎭</div>
          <div className="menu-title">Talent Test Events</div>
          <div className="menu-subtitle">Create & Manage Events</div>
        </button>

        <button 
          onClick={() => navigate('/admin/participants')} 
          className="menu-card"
        >
          <div className="menu-icon">📍</div>
          <div className="menu-title">Participants</div>
          <div className="menu-subtitle">View by Location</div>
        </button>
        
        <button 
          onClick={() => navigate('/admin/master-data')} 
          className="menu-card"
        >
          <div className="menu-icon">🗂️</div>
          <div className="menu-title">Master Data</div>
          <div className="menu-subtitle">Manage Events & Sections</div>
        </button>

        <button 
          onClick={() => navigate('/admin/group-teams')} 
          className="menu-card"
        >
          <div className="menu-icon">👥</div>
          <div className="menu-title">Group Teams</div>
          <div className="menu-subtitle">Manage Team Registration</div>
        </button>

        <button 
          onClick={() => navigate('/admin/results')} 
          className="menu-card"
        >
          <div className="menu-icon">📊</div>
          <div className="menu-title">View Results</div>
          <div className="menu-subtitle">Individual Event Results</div>
        </button>

        <button 
          onClick={() => navigate('/admin/group-results')} 
          className="menu-card"
        >
          <div className="menu-icon">🏅</div>
          <div className="menu-title">Group Results</div>
          <div className="menu-subtitle">Team Event Results</div>
        </button>

        <button 
          onClick={() => navigate('/admin/leaderboard')} 
          className="menu-card"
        >
          <div className="menu-icon">🏆</div>
          <div className="menu-title">Leaderboard</div>
          <div className="menu-subtitle">Overall Rankings</div>
        </button>

        <button 
          onClick={() => navigate('/admin/printable-results')} 
          className="menu-card"
        >
          <div className="menu-icon">🖨️</div>
          <div className="menu-title">Print Results</div>
          <div className="menu-subtitle">Printable Summary</div>
        </button>

        <button 
          onClick={() => navigate('/admin/migration')} 
          className="menu-card"
        >
          <div className="menu-icon">🔄</div>
          <div className="menu-title">Firebase Migration</div>
          <div className="menu-subtitle">Data Migration Utility</div>
        </button>
      </div>

      <div className="stats-grid">
        <div 
          className={`stat-card ${selectedCategory === null && selectedEvent === null ? 'active' : ''}`}
          onClick={() => {
            setSelectedCategory(null);
            setSelectedEvent(null);
          }}
          style={{ cursor: 'pointer' }}
        >
          <h3>Total Participants</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        {categories.map(category => (
          <div 
            key={category.id}
            className={`stat-card ${selectedCategory === category.name ? 'active' : ''}`}
            onClick={() => handleCategoryFilter(category.name)}
            style={{ cursor: 'pointer' }}
          >
            <h3>{category.name} ({category.minAge}-{category.maxAge})</h3>
            <p className="stat-number">{stats.byCategory[category.name] || 0}</p>
          </div>
        ))}
      </div>

      {/* Event Filter Section */}
      <div className="card filter-card">
        <h3>Filter by Event</h3>
        <div className="event-filter-grid">
          <button
            onClick={clearFilters}
            className={`event-filter-btn ${!selectedEvent && !selectedCategory ? 'active' : ''}`}
          >
            All Events
          </button>
          {events.map(event => (
            <button
              key={event.id}
              onClick={() => handleEventFilter(event.id)}
              className={`event-filter-btn ${selectedEvent === event.id ? 'active' : ''}`}
            >
              {event.name}
            </button>
          ))}
        </div>
      </div>

      {/* Active Filters Display */}
      {(selectedCategory || selectedEvent) && (
        <div className="card">
          <div className="active-filters">
            <span className="filter-label">Active Filters:</span>
            {selectedCategory && (
              <span className="filter-tag">
                Category: {selectedCategory}
                <button onClick={() => setSelectedCategory(null)} className="filter-remove">×</button>
              </span>
            )}
            {selectedEvent && (
              <span className="filter-tag">
                Event: {events.find(e => e.id === selectedEvent)?.name}
                <button onClick={() => setSelectedEvent(null)} className="filter-remove">×</button>
              </span>
            )}
            <button onClick={clearFilters} className="btn btn-secondary btn-small">
              Clear All Filters
            </button>
          </div>
        </div>
      )}

      <div className="card">
        <h2>
          Registered Participants
          {selectedCategory && (
            <span className="filter-badge">
              Filtered by: {selectedCategory} ({filteredParticipants.length})
            </span>
          )}
        </h2>
        {participants.length === 0 ? (
          <p className="no-data">No participants registered yet.</p>
        ) : !selectedCategory && !selectedEvent ? (
          <p className="no-data">Please select a category or event to view participants.</p>
        ) : filteredParticipants.length === 0 ? (
          <p className="no-data">No participants found matching the selected filters.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Chest No.</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Category</th>
                  <th>Section</th>
                  <th>Gender</th>
                  <th>Events</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredParticipants.map(participant => (
                  <tr key={participant.id}>
                    <td>
                      {participant.chestNumber ? (
                        <span className="chest-number">{participant.chestNumber}</span>
                      ) : (
                        <span className="no-chest-number">-</span>
                      )}
                    </td>
                    <td>{participant.name}</td>
                    <td>{participant.age}</td>
                    <td>
                      <span className="category-badge">{participant.ageCategory}</span>
                    </td>
                    <td>{participant.section || '-'}</td>
                    <td>{participant.gender}</td>
                    <td>{getEventNames(participant)}</td>
                    <td>
                      {participant.email && <div>{participant.email}</div>}
                      {participant.phone && <div>{participant.phone}</div>}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {!participant.chestNumber ? (
                          <span className="no-chest-number">Not Assigned</span>
                        ) : (
                          <button
                            onClick={() => handlePrintChestNumber(participant)}
                            className="btn-small btn-info"
                            title="Print Chest Number"
                          >
                            Print
                          </button>
                        )}
                      </div>
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

export default AdminDashboard;
