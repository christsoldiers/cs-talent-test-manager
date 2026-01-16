import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FirebaseService from '../../services/FirebaseService';
import './TalentTestEvents.css';

const TalentTestEvents = () => {
  const [talentTestEvents, setTalentTestEvents] = useState([]);
  const [showEventForm, setShowEventForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    registrationOpen: true,
    venue: '',
    maxParticipants: 0,
    judges: []
  });
  const [participants, setParticipants] = useState([]);
  const [groupTeams, setGroupTeams] = useState([]);
  const [judges, setJudges] = useState([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [unmappedCount, setUnmappedCount] = useState({ participants: 0, teams: 0 });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    } else {
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    const [events, allParticipants, allTeams, judgeCredentials] = await Promise.all([
      FirebaseService.getTalentTestEvents(),
      FirebaseService.getParticipants(),
      FirebaseService.getGroupTeams(),
      FirebaseService.getJudgeCredentials()
    ]);
    
    setTalentTestEvents(events);
    setParticipants(allParticipants);
    setGroupTeams(allTeams);
    setJudges(judgeCredentials);
    
    // Count unmapped items
    const unmappedParticipants = allParticipants.filter(p => !p.talentTestEventId).length;
    const unmappedTeams = allTeams.filter(t => !t.talentTestEventId).length;
    setUnmappedCount({ participants: unmappedParticipants, teams: unmappedTeams });
  };

  const handleLogout = () => {
    logout();
    startTransition(() => {
      navigate('/admin/login');
    });
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    setEventFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : (name === 'maxParticipants' ? parseInt(value) || 0 : value)
    }));
  };

  const handleAddEvent = () => {
    setShowEventForm(true);
    setEditingEvent(null);
    setEventFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      registrationOpen: true,
      venue: '',
      maxParticipants: 0,
      judges: []
    });
  };

  const handleEditEvent = (event) => {
    setShowEventForm(true);
    setEditingEvent(event);
    setEventFormData({
      name: event.name,
      description: event.description,
      startDate: event.startDate || '',
      endDate: event.endDate || '',
      registrationOpen: event.registrationOpen !== false,
      venue: event.venue || '',
      maxParticipants: event.maxParticipants || 0,
      judges: event.judges || []
    });
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    
    if (!eventFormData.name || !eventFormData.startDate) {
      alert('Please fill in event name and start date');
      return;
    }

    try {
      if (editingEvent) {
        await FirebaseService.updateTalentTestEvent(editingEvent.id, eventFormData);
      } else {
        await FirebaseService.addTalentTestEvent(eventFormData);
      }
      
      loadData();
      setShowEventForm(false);
      setEditingEvent(null);
    } catch (error) {
      alert('Error saving event: ' + error.message);
    }
  };

  const handleDeleteEvent = async (eventId) => {
    if (window.confirm('Are you sure you want to delete this talent test event? All participant mappings will be removed.')) {
      try {
        await FirebaseService.deleteTalentTestEvent(eventId);
        
        // Remove talent test event ID from participants
        const allParticipants = await FirebaseService.getParticipants();
        for (const participant of allParticipants) {
          if (participant.talentTestEventId === eventId) {
            await FirebaseService.updateParticipant(participant.id, {
              ...participant,
              talentTestEventId: null
            });
          }
        }
        
        loadData();
      } catch (error) {
        alert('Error deleting event: ' + error.message);
      }
    }
  };

  const handleToggleRegistration = async (eventId, currentStatus) => {
    const action = currentStatus ? 'close' : 'open';
    if (window.confirm(`Are you sure you want to ${action} registration for this event?`)) {
      try {
        const event = talentTestEvents.find(e => e.id === eventId);
        await FirebaseService.updateTalentTestEvent(eventId, {
          ...event,
          registrationOpen: !currentStatus
        });
        loadData();
      } catch (error) {
        alert('Error updating registration status: ' + error.message);
      }
    }
  };

  const getParticipantCountForEvent = (eventId) => {
    return participants.filter(p => p.talentTestEventId === eventId).length;
  };

  const getEventParticipants = (eventId) => {
    return participants.filter(p => p.talentTestEventId === eventId);
  };

  const getEventTeams = (eventId) => {
    return groupTeams.filter(t => t.talentTestEventId === eventId);
  };

  const handleMapUnmapped = async (eventId) => {
    if (!window.confirm('Map all unmapped participants and group teams to this event?')) {
      return;
    }

    try {
      let mappedCount = 0;

      // Map unmapped participants
      const unmappedParticipants = participants.filter(p => !p.talentTestEventId);
      for (const participant of unmappedParticipants) {
        await FirebaseService.updateParticipant(participant.id, {
          ...participant,
          talentTestEventId: eventId
        });
        mappedCount++;
      }

      // Map unmapped group teams
      const unmappedTeams = groupTeams.filter(t => !t.talentTestEventId);
      for (const team of unmappedTeams) {
        await FirebaseService.updateGroupTeam(team.id, {
          ...team,
          talentTestEventId: eventId
        });
        mappedCount++;
      }

      alert(`Successfully mapped ${mappedCount} items to this event.`);
      loadData();
    } catch (error) {
      alert('Error mapping items: ' + error.message);
    }
  };

  const handleViewParticipants = (eventId) => {
    setSelectedEventId(selectedEventId === eventId ? '' : eventId);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric' 
    });
  };

  const isEventActive = (event) => {
    if (!event.startDate || !event.endDate) return false;
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    return now >= start && now <= end;
  };

  const isEventUpcoming = (event) => {
    if (!event.startDate) return false;
    const now = new Date();
    const start = new Date(event.startDate);
    return now < start;
  };

  const isEventCompleted = (event) => {
    if (!event.endDate) return false;
    const now = new Date();
    const end = new Date(event.endDate);
    return now > end;
  };

  return (
    <div className="talent-test-events-container">
      <div className="header">
        <h1>🎭 Talent Test Events Management</h1>
        <div className="header-actions">
          <button onClick={handleBackToDashboard} className="btn-back">
            ← Back to Dashboard
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="actions-bar">
        <button onClick={handleAddEvent} className="btn-add">
          + Create New Event
        </button>
        {(unmappedCount.participants > 0 || unmappedCount.teams > 0) && (
          <div className="unmapped-warning">
            ⚠️ {unmappedCount.participants} unmapped participant(s) and {unmappedCount.teams} unmapped team(s)
          </div>
        )}
      </div>

      {showEventForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingEvent ? 'Edit Talent Test Event' : 'Create New Talent Test Event'}</h2>
            <form onSubmit={handleSubmitEvent}>
              <div className="form-group">
                <label>Event Name *</label>
                <input
                  type="text"
                  name="name"
                  value={eventFormData.name}
                  onChange={handleFormChange}
                  placeholder="e.g., Annual Talent Test 2026"
                  required
                />
              </div>

              <div className="form-group">
                <label>Description</label>
                <textarea
                  name="description"
                  value={eventFormData.description}
                  onChange={handleFormChange}
                  placeholder="Event description"
                  rows="3"
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label>Start Date *</label>
                  <input
                    type="date"
                    name="startDate"
                    value={eventFormData.startDate}
                    onChange={handleFormChange}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>End Date</label>
                  <input
                    type="date"
                    name="endDate"
                    value={eventFormData.endDate}
                    onChange={handleFormChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Venue</label>
                <input
                  type="text"
                  name="venue"
                  value={eventFormData.venue}
                  onChange={handleFormChange}
                  placeholder="Event venue"
                />
              </div>

              <div className="form-group">
                <label>Max Participants (0 for unlimited)</label>
                <input
                  type="number"
                  name="maxParticipants"
                  value={eventFormData.maxParticipants}
                  onChange={handleFormChange}
                  min="0"
                />
              </div>

              <div className="form-group">
                <label className="checkbox-label">
                  <input
                    type="checkbox"
                    name="registrationOpen"
                    checked={eventFormData.registrationOpen}
                    onChange={handleFormChange}
                  />
                  Registration Open
                </label>
              </div>

              <div className="form-group">
                <label>Assign Judges</label>
                <div className="judges-selection">
                  {judges.length === 0 ? (
                    <p className="no-judges-warning">No judges available. Please add judges in Master Data first.</p>
                  ) : (
                    judges.map((judge, index) => (
                      <label key={index} className="checkbox-label">
                        <input
                          type="checkbox"
                          checked={eventFormData.judges.includes(judge.username)}
                          onChange={(e) => {
                            const updatedJudges = e.target.checked
                              ? [...eventFormData.judges, judge.username]
                              : eventFormData.judges.filter(j => j !== judge.username);
                            setEventFormData(prev => ({ ...prev, judges: updatedJudges }));
                          }}
                        />
                        {judge.name || judge.username} ({judge.username})
                      </label>
                    ))
                  )}
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-submit">
                  {editingEvent ? 'Update Event' : 'Create Event'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowEventForm(false);
                    setEditingEvent(null);
                  }}
                  className="btn-cancel"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="events-list">
        {talentTestEvents.length === 0 ? (
          <div className="no-events">
            <p>No talent test events created yet. Click "Create New Event" to get started.</p>
          </div>
        ) : (
          talentTestEvents.map(event => (
            <div key={event.id} className={`event-card ${isEventActive(event) ? 'active' : ''} ${isEventCompleted(event) ? 'completed' : ''}`}>
              <div className="event-header">
                <div className="event-title-section">
                  <h3>{event.name}</h3>
                  <div className="event-badges">
                    {isEventActive(event) && <span className="badge badge-active">Active</span>}
                    {isEventUpcoming(event) && <span className="badge badge-upcoming">Upcoming</span>}
                    {isEventCompleted(event) && <span className="badge badge-completed">Completed</span>}
                    <span className={`badge ${event.registrationOpen ? 'badge-open' : 'badge-closed'}`}>
                      Registration {event.registrationOpen ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
                <div className="event-actions">
                  <button onClick={() => handleEditEvent(event)} className="btn-icon" title="Edit">
                    ✏️
                  </button>
                  <button onClick={() => handleDeleteEvent(event.id)} className="btn-icon" title="Delete">
                    🗑️
                  </button>
                </div>
              </div>

              {event.description && (
                <p className="event-description">{event.description}</p>
              )}

              <div className="event-details">
                <div className="detail-item">
                  <span className="detail-label">📅 Start Date:</span>
                  <span className="detail-value">{formatDate(event.startDate)}</span>
                </div>
                {event.endDate && (
                  <div className="detail-item">
                    <span className="detail-label">📅 End Date:</span>
                    <span className="detail-value">{formatDate(event.endDate)}</span>
                  </div>
                )}
                {event.venue && (
                  <div className="detail-item">
                    <span className="detail-label">📍 Venue:</span>
                    <span className="detail-value">{event.venue}</span>
                  </div>
                )}
                <div className="detail-item">
                  <span className="detail-label">👥 Participants:</span>
                  <span className="detail-value">
                    {getParticipantCountForEvent(event.id)}
                    {event.maxParticipants > 0 && ` / ${event.maxParticipants}`}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">🏆 Group Teams:</span>
                  <span className="detail-value">{getEventTeams(event.id).length}</span>
                </div>
                {event.judges && event.judges.length > 0 && (
                  <div className="detail-item">
                    <span className="detail-label">👨‍⚖️ Assigned Judges:</span>
                    <span className="detail-value">{event.judges.join(', ')}</span>
                  </div>
                )}
              </div>

              <div className="event-footer">
                {(unmappedCount.participants > 0 || unmappedCount.teams > 0) && (
                  <button
                    onClick={() => handleMapUnmapped(event.id)}
                    className="btn-map"
                    title="Map all unmapped participants and teams to this event"
                  >
                    📌 Map Unmapped ({unmappedCount.participants + unmappedCount.teams})
                  </button>
                )}
                <button
                  onClick={() => handleToggleRegistration(event.id, event.registrationOpen)}
                  className={`btn-toggle ${event.registrationOpen ? 'btn-close' : 'btn-open'}`}
                >
                  {event.registrationOpen ? '🔒 Close Registration' : '🔓 Open Registration'}
                </button>
                <button
                  onClick={() => handleViewParticipants(event.id)}
                  className="btn-view-participants"
                >
                  {selectedEventId === event.id ? '▼ Hide Details' : '▶ View Details'}
                </button>
              </div>

              {selectedEventId === event.id && (
                <div className="participants-list">
                  <h4>Participants & Teams</h4>
                  
                  <div style={{ marginBottom: '20px' }}>
                    <h5>Registered Participants ({getEventParticipants(event.id).length})</h5>
                    {getEventParticipants(event.id).length === 0 ? (
                      <p className="no-participants">No participants registered yet.</p>
                    ) : (
                      <table className="participants-table">
                        <thead>
                          <tr>
                            <th>Chest No.</th>
                            <th>Name</th>
                            <th>Age</th>
                            <th>Category</th>
                            <th>Section</th>
                            <th>Church</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getEventParticipants(event.id).map(participant => (
                            <tr key={participant.id}>
                              <td>{participant.chestNumber || '-'}</td>
                              <td>{participant.name}</td>
                              <td>{participant.age}</td>
                              <td>{participant.ageCategory}</td>
                              <td>{participant.section}</td>
                              <td>{participant.churchName}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>

                  <div>
                    <h5>Registered Group Teams ({getEventTeams(event.id).length})</h5>
                    {getEventTeams(event.id).length === 0 ? (
                      <p className="no-participants">No group teams registered yet.</p>
                    ) : (
                      <table className="participants-table">
                        <thead>
                          <tr>
                            <th>Team Name</th>
                            <th>Section</th>
                            <th>Church</th>
                            <th>Event</th>
                            <th>Members</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getEventTeams(event.id).map(team => (
                            <tr key={team.id}>
                              <td>{team.teamName}</td>
                              <td>{team.section}</td>
                              <td>{team.churchName}</td>
                              <td>{team.groupEventName}</td>
                              <td>{team.participants?.length || 0}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TalentTestEvents;

