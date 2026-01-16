import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FirebaseService from '../../services/FirebaseService';
import './Participants.css';

const Participants = () => {
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedChurch, setSelectedChurch] = useState('');
  const [searchName, setSearchName] = useState('');
  const [sections, setSections] = useState([]);
  const [events, setEvents] = useState([]);
  const [filterChurches, setFilterChurches] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [availableChurches, setAvailableChurches] = useState([]);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [talentTestEvents, setTalentTestEvents] = useState([]);
  const [ageLimits, setAgeLimits] = useState({ minAge: 6, maxAge: 25 });
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
  const location = useLocation();
  const eventId = location.state?.eventId;

  useEffect(() => {
    if (!user || (user.role !== 'admin' && user.role !== 'section')) {
      const loginPath = user?.role === 'section' ? '/section/login' : '/admin/login';
      navigate(loginPath);
    } else {
      loadParticipants();
    }
  }, [user, navigate]);

  const loadParticipants = async () => {
    const allSections = await FirebaseService.getSections();
    setSections(allSections);
    const allEvents = await FirebaseService.getEvents();
    setEvents(allEvents);
    
    // Load age limits from categories
    const limits = await FirebaseService.getMinMaxAge();
    setAgeLimits(limits);
    
    const ttEvents = await FirebaseService.getTalentTestEvents();
    setTalentTestEvents(ttEvents);
    
    if (eventId) {
      const event = await FirebaseService.getTalentTestEventById(eventId);
      setCurrentEvent(event);
      setFormData(prev => ({ ...prev, talentTestEventId: eventId }));
    }
    
    // Load participants based on user role
    let allParticipants;
    if (user.role === 'section') {
      allParticipants = await FirebaseService.getParticipantsBySection(user.section);
      // Pre-select the section filter for section users
      setSelectedSection(user.section);
      // Set section in form data
      setFormData(prev => ({ ...prev, section: user.section }));
      // Load churches for section user
      const churches = await FirebaseService.getChurchesBySection(user.section);
      const churchNames = churches.map(c => typeof c === 'string' ? c : c.name);
      setAvailableChurches(churchNames);
    } else {
      allParticipants = await FirebaseService.getParticipants();
    }
    
    // Filter by event if eventId is provided
    const filtered = eventId 
      ? allParticipants.filter(p => p.talentTestEventId === eventId)
      : allParticipants;
    
    setParticipants(filtered);
    setFilteredParticipants(filtered);
  };

  const applyFilters = () => {
    let filtered = [...participants];
    
    if (selectedSection) {
      filtered = filtered.filter(p => p.section === selectedSection);
    }
    
    if (selectedChurch) {
      filtered = filtered.filter(p => p.churchName === selectedChurch);
    }
    
    if (searchName) {
      filtered = filtered.filter(p => 
        p.name.toLowerCase().includes(searchName.toLowerCase())
      );
    }
    
    setFilteredParticipants(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedSection, selectedChurch, searchName, participants]);

  useEffect(() => {
    // Update available churches when section changes
    if (selectedSection) {
      const section = sections.find(s => s.name === selectedSection);
      const churches = section ? section.churches : [];
      // Extract church names if churches are objects
      const churchNames = churches.map(c => typeof c === 'string' ? c : c.name);
      setFilterChurches(churchNames);
      // Clear church filter if it's not in the new section
      if (selectedChurch && section && !churchNames.includes(selectedChurch)) {
        setSelectedChurch('');
      }
    } else {
      // Show all churches from all sections (ensure unique values)
      const allChurches = sections.reduce((acc, section) => {
        const churches = section.churches.map(c => typeof c === 'string' ? c : c.name);
        return [...acc, ...churches];
      }, []);
      setFilterChurches([...new Set(allChurches)]);
    }
  }, [selectedSection, sections, selectedChurch]);

  const clearFilters = () => {
    setSelectedSection('');
    setSelectedChurch('');
    setSearchName('');
  };

  const handleChange = async (e) => {
    const { name, value, type, checked } = e.target;
    
    // Handle checkbox for events
    if (type === 'checkbox' && name === 'eventIds') {
      const eventId = value; // Keep as string (Firebase document ID)
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

    // Update available churches when section changes
    if (name === 'section') {
      const churches = await FirebaseService.getChurchesBySection(value);
      const churchNames = churches.map(c => typeof c === 'string' ? c : c.name);
      setAvailableChurches(churchNames);
      setFormData(prev => ({
        ...prev,
        section: value,
        churchName: '' // Reset church selection when section changes
      }));
    }
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
      ageCategory
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
      section: ''
    });
    setAvailableChurches([]);
    setShowAddForm(false);
    setEditingParticipant(null);
  };

  const handleEdit = async (participant) => {
    setEditingParticipant(participant);
    const participantSection = participant.section || '';
    const churches = await FirebaseService.getChurchesBySection(participantSection);
    const churchNames = churches.map(c => typeof c === 'string' ? c : c.name);
    setAvailableChurches(churchNames);
    
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
      section: participantSection
    });
    setShowAddForm(true);
    // Scroll to top to see the form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this participant?')) {
      await FirebaseService.deleteParticipant(id);
      loadParticipants();
    }
  };

  const handleAssignChestNumber = async (participantId) => {
    const chestNumber = await FirebaseService.assignChestNumber(participantId);
    if (chestNumber) {
      alert(`Chest number ${chestNumber} assigned successfully!`);
      loadParticipants();
    }
  };

  const handleRemoveChestNumber = async (participantId) => {
    if (window.confirm('Are you sure you want to remove the chest number?')) {
      await FirebaseService.removeChestNumber(participantId);
      loadParticipants();
    }
  };

  const handleGenerateAllChestNumbers = async () => {
    const unassignedCount = participants.filter(p => !p.chestNumber).length;
    
    if (unassignedCount === 0) {
      alert('All participants already have chest numbers assigned!');
      return;
    }
    
    if (window.confirm(`Generate chest numbers for ${unassignedCount} participant(s)?\n\nChest numbers will be assigned by category:\n- Junior: J-001, J-002...\n- Intermediate: I-001, I-002...\n- Senior: S-001, S-002...\n- Super Senior: SS-001, SS-002...`)) {
      const assignedCount = await FirebaseService.assignAllChestNumbers();
      alert(`Successfully assigned ${assignedCount} chest numbers!`);
      loadParticipants();
    }
  };

  const getEventNames = (participant) => {
    const eventIds = participant.eventIds || (participant.eventId ? [parseInt(participant.eventId)] : []);
    return eventIds
      .map(id => {
        const event = events.find(e => e.id === id);
        return event ? event.name : '';
      })
      .filter(name => name)
      .join(', ');
  };

  const handleLogout = () => {
    logout();
    const loginPath = user?.role === 'section' ? '/section/login' : '/admin/login';
    startTransition(() => {
      navigate(loginPath);
    });
  };

  const handleBackToDashboard = () => {
    if (eventId) {
      const eventPath = user?.role === 'section' 
        ? `/section/event/${eventId}` 
        : `/admin/event/${eventId}`;
      navigate(eventPath);
    } else {
      const dashboardPath = user?.role === 'section' 
        ? '/section/events' 
        : '/admin/events';
      navigate(dashboardPath);
    }
  };

  const handlePrintList = () => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Participants List</title>
        <style>
          body {
            font-family: Arial, sans-serif;
            padding: 20px;
          }
          h1 {
            text-align: center;
            color: #667eea;
            margin-bottom: 10px;
          }
          .filter-info {
            text-align: center;
            margin-bottom: 20px;
            color: #4a5568;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 20px;
          }
          th, td {
            border: 1px solid #ddd;
            padding: 8px;
            text-align: left;
          }
          th {
            background-color: #667eea;
            color: white;
          }
          tr:nth-child(even) {
            background-color: #f2f2f2;
          }
          .count {
            margin-top: 20px;
            font-weight: bold;
            text-align: right;
          }
        </style>
      </head>
      <body>
        <h1>Christ Soldiers Talent Test - Participants List</h1>
        <div class="filter-info">
          ${selectedSection ? `Section: ${selectedSection}` : 'All Sections'}
          ${selectedChurch ? ` | Church: ${selectedChurch}` : ''}
        </div>
        <table>
          <thead>
            <tr>
              <th>Chest No.</th>
              <th>Name</th>
              <th>Age</th>
              <th>Category</th>
              <th>Gender</th>
              <th>Section</th>
              <th>Church</th>
              <th>Events</th>
            </tr>
          </thead>
          <tbody>
            ${filteredParticipants.map(p => `
              <tr>
                <td>${p.chestNumber || 'Not Assigned'}</td>
                <td>${p.name}</td>
                <td>${p.age}</td>
                <td>${p.ageCategory}</td>
                <td>${p.gender}</td>
                <td>${p.section}</td>
                <td>${p.churchName}</td>
                <td>${getEventNames(p)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        <div class="count">Total Participants: ${filteredParticipants.length}</div>
      </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="participants-container">
      <div className="participants-header">
        <div>
          {currentEvent && (
            <div className="breadcrumb">
              <button onClick={handleBackToDashboard} className="btn-link">
                ← {currentEvent.name}
              </button>
            </div>
          )}
          <h1>Participants by Location</h1>
          {currentEvent && (
            <p className="subtitle">Viewing participants for: {currentEvent.name}</p>
          )}
        </div>
        <div className="header-actions">
          <button onClick={handleBackToDashboard} className="btn-secondary">
            {eventId ? '← Back to Event' : '← Back to Events'}
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Search Name:</label>
          <input
            type="text"
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            placeholder="Search by participant name..."
            className="filter-input"
          />
        </div>

        <div className="filter-group">
          <label>Section:</label>
          <select 
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="filter-select"
            disabled={user?.role === 'section'}
          >
            <option value="">All Sections</option>
            {sections.map(section => (
              <option key={section.name} value={section.name}>
                {section.name}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Church:</label>
          <select 
            value={selectedChurch}
            onChange={(e) => setSelectedChurch(e.target.value)}
            className="filter-select"
          >
            <option value="">All Churches</option>
            {filterChurches.map((church, index) => {
              const churchName = typeof church === 'string' ? church : church.name;
              return (
                <option key={index} value={churchName}>
                  {churchName}
                </option>
              );
            })}
          </select>
        </div>

        <div className="filter-actions">
          {(selectedSection || selectedChurch || searchName) && (
            <button onClick={clearFilters} className="btn-clear">
              Clear Filters
            </button>
          )}
          <button onClick={handlePrintList} className="btn-print">
            Print List
          </button>
        </div>
      </div>

      {(selectedSection || selectedChurch) && (
        <div className="active-filters">
          <span className="filter-label">Active Filters:</span>
          {selectedSection && (
            <span className="filter-tag">
              Section: {selectedSection}
              <button onClick={() => setSelectedSection('')} className="remove-filter">×</button>
            </span>
          )}
          {selectedChurch && (
            <span className="filter-tag">
              Church: {selectedChurch}
              <button onClick={() => setSelectedChurch('')} className="remove-filter">×</button>
            </span>
          )}
        </div>
      )}

      <div className="action-bar">
        <button 
          onClick={() => {
            setShowAddForm(!showAddForm);
            if (!showAddForm) setEditingParticipant(null);
          }} 
          className="btn btn-primary"
          disabled={currentEvent && !currentEvent.registrationOpen}
          title={currentEvent && !currentEvent.registrationOpen ? 'Registration is closed for this event' : ''}
        >
          {showAddForm ? 'Cancel' : '+ Add New Participant'}
        </button>
        {currentEvent && !currentEvent.registrationOpen && (
          <span className="registration-closed-notice">
            ⚠️ Registration is closed
          </span>
        )}
        {user.role === 'admin' && (
          <button onClick={handleGenerateAllChestNumbers} className="btn btn-secondary">
            Generate All Chest Numbers
          </button>
        )}
      </div>

      {showAddForm && (
        <div className="participant-form-card">
          <h2>{editingParticipant ? 'Edit Participant' : 'Add New Participant'}</h2>
          <form onSubmit={handleSubmit} className="participant-form">
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
                <label htmlFor="section">Section *</label>
                <select
                  id="section"
                  name="section"
                  value={formData.section}
                  onChange={handleChange}
                  required
                  disabled={user?.role === 'section'}
                >
                  <option value="">Select Section</option>
                  {sections.map(section => (
                    <option key={section.id} value={section.name}>
                      {section.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="churchName">Church Name *</label>
                <select
                  id="churchName"
                  name="churchName"
                  value={formData.churchName}
                  onChange={handleChange}
                  required
                  disabled={!formData.section}
                >
                  <option value="">
                    {formData.section ? 'Select Church' : 'Select Section First'}
                  </option>
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

      <div className="participants-stats">
        <div className="stat-card">
          <div className="stat-number">{filteredParticipants.length}</div>
          <div className="stat-label">Total Participants</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {filteredParticipants.filter(p => p.gender === 'Male').length}
          </div>
          <div className="stat-label">Male</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {filteredParticipants.filter(p => p.gender === 'Female').length}
          </div>
          <div className="stat-label">Female</div>
        </div>
        <div className="stat-card">
          <div className="stat-number">
            {filteredParticipants.filter(p => p.chestNumber).length}
          </div>
          <div className="stat-label">With Chest Numbers</div>
        </div>
      </div>

      <div className="participants-table-container">
        <table className="participants-table">
          <thead>
            <tr>
              <th>Chest No.</th>
              <th>Name</th>
              <th>Age</th>
              <th>Category</th>
              <th>Gender</th>
              <th>Section</th>
              <th>Church</th>
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
                    <span className="not-assigned">Not Assigned</span>
                  )}
                </td>
                <td className="participant-name">{participant.name}</td>
                <td>{participant.age}</td>
                <td>
                  <span className={`category-badge ${participant.ageCategory.toLowerCase().replace(' ', '-')}`}>
                    {participant.ageCategory}
                  </span>
                </td>
                <td>{participant.gender}</td>
                <td>{participant.section}</td>
                <td>{participant.churchName}</td>
                <td className="events-cell">{getEventNames(participant)}</td>
                <td className="contact-cell">
                  <div>{participant.email}</div>
                  <div>{participant.phone}</div>
                </td>
                <td className="actions-cell">
                  <button
                    onClick={() => handleEdit(participant)}
                    className="btn-edit"
                    title="Edit participant"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(participant.id)}
                    className="btn-delete"
                    title="Delete participant"
                  >
                    Delete
                  </button>
                  {user.role === 'admin' && (
                    !participant.chestNumber ? (
                      <button
                        onClick={() => handleAssignChestNumber(participant.id)}
                        className="btn-assign"
                        title="Assign chest number"
                      >
                        Assign #
                      </button>
                    ) : (
                      <button
                        onClick={() => handleRemoveChestNumber(participant.id)}
                        className="btn-remove"
                        title="Remove chest number"
                      >
                        Remove #
                      </button>
                    )
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Participants;
