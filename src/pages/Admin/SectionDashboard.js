import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FirebaseService from '../../services/FirebaseService';
import './SectionDashboard.css';

const SectionDashboard = () => {
  const [participants, setParticipants] = useState([]);
  const [events, setEvents] = useState([]);
  const [talentTestEvents, setTalentTestEvents] = useState([]);
  const [activeEvent, setActiveEvent] = useState(null);
  const [availableChurches, setAvailableChurches] = useState([]);
  const [ageLimits, setAgeLimits] = useState({ minAge: 6, maxAge: 25 });
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    phone: '',
    eventIds: [],
    churchName: '',
    section: '',
    talentTestEventId: ''
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'section') {
      navigate('/section/login');
    } else {
      // Set section in form data
      setFormData(prev => ({ ...prev, section: user.section }));
      // Load data
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    const {
      events: allEvents,
      ageLimits: limits,
      talentTestEvents: ttEvents,
      activeEvent: active,
      churches: churchNames,
      participants: sectionParticipants
    } = await FirebaseService.getSectionDashboardData(user.section);
    
    setEvents(allEvents);
    setAgeLimits(limits);
    setTalentTestEvents(ttEvents);
    setActiveEvent(active);
    
    // Set default talent test event if available
    if (active && !formData.talentTestEventId) {
      setFormData(prev => ({ ...prev, talentTestEventId: active.id }));
    }
    
    setAvailableChurches(churchNames);
    setParticipants(sectionParticipants);
  };

  const loadParticipants = async () => {
    if (user && user.section) {
      const sectionParticipants = await FirebaseService.getParticipantsBySection(user.section);
      setParticipants(sectionParticipants);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox for events
    if (type === 'checkbox' && name === 'eventIds') {
      const eventId = parseInt(value);
      const updatedEventIds = checked
        ? [...formData.eventIds, eventId]
        : formData.eventIds.filter(id => id !== eventId);
      
      setFormData({
        ...formData,
        eventIds: updatedEventIds
      });
      return;
    }
    
    // Update form data
    const updatedFormData = {
      ...formData,
      [name]: value
    };

    // If gender changes, filter out incompatible Solo Music events
    if (name === 'gender') {
      const filteredEventIds = formData.eventIds.filter(eventId => {
        const event = events.find(e => e.id === eventId);
        if (!event) return false;
        if (event.name === 'Solo Music (Male)') return value === 'Male';
        if (event.name === 'Solo Music (Female)') return value === 'Female';
        return true;
      });
      updatedFormData.eventIds = filteredEventIds;
    }

    setFormData(updatedFormData);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const age = parseInt(formData.age);
    const ageCategory = await FirebaseService.getAgeCategory(age);

    if (!ageCategory) {
      const { minAge, maxAge } = await FirebaseService.getMinMaxAge();
      alert(`Age must be between ${minAge} and ${maxAge} years`);
      return;
    }

    if (formData.eventIds.length === 0) {
      alert('Please select at least one event');
      return;
    }

    const participantData = {
      ...formData,
      age,
      ageCategory,
      section: user.section
    };

    if (editingParticipant) {
      await FirebaseService.updateParticipant(editingParticipant.id, participantData);
      setEditingParticipant(null);
    } else {
      await FirebaseService.addParticipant(participantData);
    }

    resetForm();
    loadParticipants();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      age: '',
      gender: '',
      email: '',
      phone: '',
      eventIds: [],
      churchName: '',
      section: user.section,
      talentTestEventId: activeEvent ? activeEvent.id : ''
    });
    setShowAddForm(false);
    setEditingParticipant(null);
  };

  const handleEdit = (participant) => {
    setEditingParticipant(participant);
    
    // Handle both old single eventId and new eventIds array
    const eventIds = participant.eventIds 
      ? participant.eventIds 
      : (participant.eventId ? [parseInt(participant.eventId)] : []);
    
    setFormData({
      name: participant.name,
      age: participant.age.toString(),
      gender: participant.gender,
      email: participant.email,
      phone: participant.phone,
      eventIds: eventIds,
      churchName: participant.churchName,
      section: user.section,
      talentTestEventId: participant.talentTestEventId || (activeEvent ? activeEvent.id : '')
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this participant?')) {
      await FirebaseService.deleteParticipant(id);
      loadParticipants();
    }
  };

  const handlePrintChestNumber = (participant) => {
    if (!participant.chestNumber) {
      alert('Please contact admin to assign a chest number first!');
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
      : (participant.eventId ? [parseInt(participant.eventId)] : []);
    
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
      navigate('/section/login');
    });
  };

  const stats = {
    total: participants.length,
    junior: participants.filter(p => p.ageCategory === 'Junior').length,
    intermediate: participants.filter(p => p.ageCategory === 'Intermediate').length,
    senior: participants.filter(p => p.ageCategory === 'Senior').length,
    superSenior: participants.filter(p => p.ageCategory === 'Super Senior').length
  };

  return (
    <div className="section-dashboard">
      <div className="dashboard-header">
        <div>
          <h1>{user?.section} Section Dashboard</h1>
          <p>Welcome, {user?.username}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-secondary">
          Logout
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <h3>Total Participants</h3>
          <p className="stat-number">{stats.total}</p>
        </div>
        <div className="stat-card">
          <h3>Junior (6-10)</h3>
          <p className="stat-number">{stats.junior}</p>
        </div>
        <div className="stat-card">
          <h3>Intermediate (11-15)</h3>
          <p className="stat-number">{stats.intermediate}</p>
        </div>
        <div className="stat-card">
          <h3>Senior (16-20)</h3>
          <p className="stat-number">{stats.senior}</p>
        </div>
        <div className="stat-card">
          <h3>Super Senior (21-25)</h3>
          <p className="stat-number">{stats.superSenior}</p>
        </div>
      </div>

      <div className="dashboard-actions">
        <button 
          onClick={() => setShowAddForm(!showAddForm)} 
          className="btn btn-primary"
        >
          {showAddForm ? 'Cancel' : 'Add New Participant'}
        </button>
      </div>

      {showAddForm && (
        <div className="card">
          <h2>{editingParticipant ? 'Edit Participant' : 'Add New Participant'}</h2>
          <form onSubmit={handleSubmit} className="participant-form">
            <div className="form-group">
              <label htmlFor="talentTestEventId">Talent Test Event *</label>
              <select
                id="talentTestEventId"
                name="talentTestEventId"
                value={formData.talentTestEventId}
                onChange={handleChange}
                required
              >
                <option value="">Select Event</option>
                {talentTestEvents
                  .filter(e => e.registrationOpen)
                  .map(event => (
                    <option key={event.id} value={event.id}>
                      {event.name} {event.id === activeEvent?.id && '(Active)'}
                    </option>
                  ))}
              </select>
              {!activeEvent && talentTestEvents.filter(e => e.registrationOpen).length === 0 && (
                <p style={{ color: '#dc3545', fontSize: '14px', marginTop: '5px' }}>
                  ⚠️ No talent test events with open registration
                </p>
              )}
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="name">Full Name *</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="age">Age *</label>
                <input
                  type="number"
                  id="age"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  min={ageLimits.minAge}
                  max={ageLimits.maxAge}
                  required
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="gender">Gender *</label>
                <select
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Gender</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Events * (Select one or more)</label>
              <div className="checkbox-group">
                {events.map(event => {
                  // Determine if event should be disabled based on gender
                  const isDisabled = 
                    (event.name === 'Solo Music (Male)' && formData.gender !== 'Male') ||
                    (event.name === 'Solo Music (Female)' && formData.gender !== 'Female');
                  
                  return (
                    <label 
                      key={event.id} 
                      className={`checkbox-label ${isDisabled ? 'disabled' : ''}`}
                      title={isDisabled ? 'Select appropriate gender first' : ''}
                    >
                      <input
                        type="checkbox"
                        name="eventIds"
                        value={event.id}
                        checked={formData.eventIds.includes(event.id)}
                        onChange={handleChange}
                        disabled={isDisabled}
                      />
                      {event.name}
                    </label>
                  );
                })}
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="email">Email</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
              <div className="form-group">
                <label htmlFor="phone">Phone</label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="churchName">Church Name *</label>
                <select
                  id="churchName"
                  name="churchName"
                  value={formData.churchName}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select Church</option>
                  {availableChurches.map((church, index) => {
                    const churchName = typeof church === 'string' ? church : church.name;
                    return (
                      <option key={index} value={churchName}>
                        {churchName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary">
                {editingParticipant ? 'Update Participant' : 'Add Participant'}
              </button>
              <button type="button" onClick={resetForm} className="btn btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <h2>Registered Participants from {user?.section}</h2>
        {participants.length === 0 ? (
          <p className="no-data">No participants registered yet.</p>
        ) : (
          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Chest No.</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Category</th>
                  <th>Church</th>
                  <th>Gender</th>
                  <th>Events</th>
                  <th>Contact</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {participants.map(participant => (
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
                    <td>{participant.churchName}</td>
                    <td>{participant.gender}</td>
                    <td>{getEventNames(participant)}</td>
                    <td>
                      {participant.email && <div>{participant.email}</div>}
                      {participant.phone && <div>{participant.phone}</div>}
                    </td>
                    <td>
                      <div className="action-buttons">
                        {participant.chestNumber && (
                          <button
                            onClick={() => handlePrintChestNumber(participant)}
                            className="btn-small btn-info"
                            title="Print Chest Number"
                          >
                            Print
                          </button>
                        )}
                        <button
                          onClick={() => handleEdit(participant)}
                          className="btn-small btn-primary"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDelete(participant.id)}
                          className="btn-small btn-danger"
                        >
                          Delete
                        </button>
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

export default SectionDashboard;
