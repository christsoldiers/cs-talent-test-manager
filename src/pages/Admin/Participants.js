import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StorageService from '../../services/StorageService';
import './Participants.css';

const Participants = () => {
  const [participants, setParticipants] = useState([]);
  const [filteredParticipants, setFilteredParticipants] = useState([]);
  const [selectedSection, setSelectedSection] = useState('');
  const [selectedChurch, setSelectedChurch] = useState('');
  const [sections] = useState(StorageService.getSections());
  const [events] = useState(StorageService.getEvents());
  const [filterChurches, setFilterChurches] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingParticipant, setEditingParticipant] = useState(null);
  const [availableChurches, setAvailableChurches] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    gender: '',
    email: '',
    phone: '',
    eventIds: [],
    churchName: '',
    section: ''
  });
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    } else {
      loadParticipants();
    }
  }, [user, navigate]);

  const loadParticipants = () => {
    const allParticipants = StorageService.getParticipants();
    setParticipants(allParticipants);
    setFilteredParticipants(allParticipants);
  };

  const applyFilters = () => {
    let filtered = [...participants];
    
    if (selectedSection) {
      filtered = filtered.filter(p => p.section === selectedSection);
    }
    
    if (selectedChurch) {
      filtered = filtered.filter(p => p.churchName === selectedChurch);
    }
    
    setFilteredParticipants(filtered);
  };

  useEffect(() => {
    applyFilters();
  }, [selectedSection, selectedChurch, participants]);

  useEffect(() => {
    // Update available churches when section changes
    if (selectedSection) {
      const section = sections.find(s => s.name === selectedSection);
      setFilterChurches(section ? section.churches : []);
      // Clear church filter if it's not in the new section
      if (selectedChurch && section && !section.churches.includes(selectedChurch)) {
        setSelectedChurch('');
      }
    } else {
      // Show all churches from all sections
      const allChurches = sections.reduce((acc, section) => {
        return [...acc, ...section.churches];
      }, []);
      setFilterChurches(allChurches);
    }
  }, [selectedSection, sections, selectedChurch]);

  const clearFilters = () => {
    setSelectedSection('');
    setSelectedChurch('');
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

    // Update available churches when section changes
    if (name === 'section') {
      const churches = StorageService.getChurchesBySection(value);
      setAvailableChurches(churches);
      setFormData(prev => ({
        ...prev,
        section: value,
        churchName: '' // Reset church selection when section changes
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const age = parseInt(formData.age);
    const ageCategory = StorageService.getAgeCategory(age);

    if (!ageCategory) {
      alert('Age must be between 6 and 25 years');
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
      StorageService.updateParticipant(editingParticipant.id, participantData);
      setEditingParticipant(null);
    } else {
      StorageService.addParticipant(participantData);
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

  const handleEdit = (participant) => {
    setEditingParticipant(participant);
    const participantSection = participant.section || '';
    const churches = StorageService.getChurchesBySection(participantSection);
    setAvailableChurches(churches);
    
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

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this participant?')) {
      StorageService.deleteParticipant(id);
      loadParticipants();
    }
  };

  const handleAssignChestNumber = (participantId) => {
    const chestNumber = StorageService.assignChestNumber(participantId);
    if (chestNumber) {
      alert(`Chest number ${chestNumber} assigned successfully!`);
      loadParticipants();
    }
  };

  const handleRemoveChestNumber = (participantId) => {
    if (window.confirm('Are you sure you want to remove the chest number?')) {
      StorageService.removeChestNumber(participantId);
      loadParticipants();
    }
  };

  const handleGenerateAllChestNumbers = () => {
    const unassignedCount = participants.filter(p => !p.chestNumber).length;
    
    if (unassignedCount === 0) {
      alert('All participants already have chest numbers assigned!');
      return;
    }
    
    if (window.confirm(`Generate chest numbers for ${unassignedCount} participant(s)?\n\nChest numbers will be assigned by category:\n- Junior: J-001, J-002...\n- Intermediate: I-001, I-002...\n- Senior: S-001, S-002...\n- Super Senior: SS-001, SS-002...`)) {
      const assignedCount = StorageService.assignAllChestNumbers();
      alert(`Successfully assigned ${assignedCount} chest numbers!`);
      loadParticipants();
    }
  };

  const getEventNames = (participant) => {
    const events = StorageService.getEvents();
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
    navigate('/admin/login');
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
        <h1>Participants by Location</h1>
        <div className="header-actions">
          <button onClick={() => navigate('/admin/dashboard')} className="btn-secondary">
            Back to Dashboard
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Section:</label>
          <select 
            value={selectedSection}
            onChange={(e) => setSelectedSection(e.target.value)}
            className="filter-select"
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
            {filterChurches.map(church => (
              <option key={church} value={church}>
                {church}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-actions">
          {(selectedSection || selectedChurch) && (
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
          className="btn-primary"
        >
          {showAddForm ? 'Cancel' : '+ Add New Participant'}
        </button>
        <button onClick={handleGenerateAllChestNumbers} className="btn-secondary">
          Generate All Chest Numbers
        </button>
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
                  min="6"
                  max="25"
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
                  {availableChurches.map((church, index) => (
                    <option key={index} value={church}>
                      {church}
                    </option>
                  ))}
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
                  {!participant.chestNumber ? (
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
