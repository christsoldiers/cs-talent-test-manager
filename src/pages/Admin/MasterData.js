import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StorageService from '../../services/StorageService';
import './MasterData.css';

const MasterData = () => {
  const [events, setEvents] = useState([]);
  const [groupEvents, setGroupEvents] = useState([]);
  const [sections, setSections] = useState([]);
  const [judges, setJudges] = useState([]);
  const [pointsConfig, setPointsConfig] = useState({
    individual: { first: 5, second: 3, third: 1 },
    group: { first: 10, second: 5, third: 3 }
  });
  const [activeTab, setActiveTab] = useState('events');
  const [showEventForm, setShowEventForm] = useState(false);
  const [showGroupEventForm, setShowGroupEventForm] = useState(false);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [showJudgeForm, setShowJudgeForm] = useState(false);
  const [editingEvent, setEditingEvent] = useState(null);
  const [editingGroupEvent, setEditingGroupEvent] = useState(null);
  const [editingSection, setEditingSection] = useState(null);
  const [editingJudge, setEditingJudge] = useState(null);
  const [eventFormData, setEventFormData] = useState({
    name: '',
    description: '',
    ageGroups: [],
    scoringType: 'all-judges'
  });
  const [groupEventFormData, setGroupEventFormData] = useState({
    name: '',
    description: '',
    maxParticipants: 10,
    scoringType: 'judge',
    questionsCount: 0
  });
  const [sectionFormData, setSectionFormData] = useState({
    name: '',
    churches: [''],
    username: '',
    password: '',
    presbyter: {
      name: '',
      contact: ''
    },
    csPresident: {
      name: '',
      contact: ''
    },
    csSecretary: {
      name: '',
      contact: ''
    },
    csTreasurer: {
      name: '',
      contact: ''
    }
  });
  const [judgeFormData, setJudgeFormData] = useState({
    username: '',
    password: '',
    name: '',
    contact: '',
    email: ''
  });
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
    setEvents(StorageService.getEvents());
    setSections(StorageService.getSections());
    const data = StorageService.getData();
    setGroupEvents(data.groupEvents || []);
    setJudges(data.judgeCredentials || []);
    setPointsConfig(data.pointsConfig || {
      individual: { first: 5, second: 3, third: 1 },
      group: { first: 10, second: 5, third: 3 }
    });
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  // Event Form Handlers
  const handleEventFormChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (type === 'checkbox') {
      setEventFormData(prev => ({
        ...prev,
        ageGroups: checked
          ? [...prev.ageGroups, value]
          : prev.ageGroups.filter(g => g !== value)
      }));
    } else {
      setEventFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleAddEvent = () => {
    setShowEventForm(true);
    setEditingEvent(null);
    setEventFormData({
      name: '',
      description: '',
      ageGroups: [],
      scoringType: 'all-judges'
    });
  };

  const handleEditEvent = (event) => {
    setShowEventForm(true);
    setEditingEvent(event);
    setEventFormData({
      name: event.name,
      description: event.description,
      ageGroups: event.ageGroups || [],
      scoringType: event.scoringType || 'all-judges'
    });
  };

  const handleSubmitEvent = (e) => {
    e.preventDefault();
    
    if (!eventFormData.name || eventFormData.ageGroups.length === 0) {
      alert('Please fill in all required fields');
      return;
    }

    const data = StorageService.getData();
    
    if (editingEvent) {
      // Update existing event
      const eventIndex = data.events.findIndex(e => e.id === editingEvent.id);
      if (eventIndex !== -1) {
        data.events[eventIndex] = {
          ...data.events[eventIndex],
          name: eventFormData.name,
          description: eventFormData.description,
          ageGroups: eventFormData.ageGroups,
          scoringType: eventFormData.scoringType
        };
      }
    } else {
      // Add new event
      const newEvent = {
        id: Math.max(...data.events.map(e => e.id), 0) + 1,
        name: eventFormData.name,
        description: eventFormData.description,
        ageGroups: eventFormData.ageGroups,
        scoringType: eventFormData.scoringType
      };
      data.events.push(newEvent);
    }
    
    StorageService.saveData(data);
    loadData();
    setShowEventForm(false);
    setEditingEvent(null);
  };

  const handleDeleteEvent = (eventId) => {
    if (window.confirm('Are you sure you want to delete this event? This will also remove all associated participant registrations and scores.')) {
      const data = StorageService.getData();
      data.events = data.events.filter(e => e.id !== eventId);
      
      // Remove event from participants
      data.participants = data.participants.map(p => ({
        ...p,
        eventIds: (p.eventIds || []).filter(id => id !== eventId)
      }));
      
      // Remove scores for this event
      data.scores = data.scores.filter(s => s.eventId !== eventId);
      
      StorageService.saveData(data);
      loadData();
    }
  };

  // Group Event Form Handlers
  const handleGroupEventFormChange = (e) => {
    const { name, value } = e.target;
    setGroupEventFormData(prev => ({
      ...prev,
      [name]: name === 'maxParticipants' || name === 'questionsCount' ? parseInt(value) || 0 : value
    }));
  };

  const handleAddGroupEvent = () => {
    setShowGroupEventForm(true);
    setEditingGroupEvent(null);
    setGroupEventFormData({
      name: '',
      description: '',
      maxParticipants: 10,
      scoringType: 'judge',
      questionsCount: 0
    });
  };

  const handleEditGroupEvent = (groupEvent) => {
    setShowGroupEventForm(true);
    setEditingGroupEvent(groupEvent);
    setGroupEventFormData({
      name: groupEvent.name,
      description: groupEvent.description,
      maxParticipants: groupEvent.maxParticipants || 10,
      scoringType: groupEvent.scoringType || 'judge',
      questionsCount: groupEvent.questionsCount || 0
    });
  };

  const handleSubmitGroupEvent = (e) => {
    e.preventDefault();
    
    if (!groupEventFormData.name) {
      alert('Please fill in the event name');
      return;
    }

    const data = StorageService.getData();
    
    if (editingGroupEvent) {
      // Update existing group event
      const eventIndex = data.groupEvents.findIndex(e => e.id === editingGroupEvent.id);
      if (eventIndex !== -1) {
        data.groupEvents[eventIndex] = {
          ...data.groupEvents[eventIndex],
          name: groupEventFormData.name,
          description: groupEventFormData.description,
          maxParticipants: groupEventFormData.maxParticipants,
          scoringType: groupEventFormData.scoringType,
          questionsCount: groupEventFormData.questionsCount
        };
      }
    } else {
      // Add new group event
      const newGroupEvent = {
        id: Math.max(...(data.groupEvents || []).map(e => e.id), 0) + 1,
        name: groupEventFormData.name,
        description: groupEventFormData.description,
        maxParticipants: groupEventFormData.maxParticipants,
        scoringType: groupEventFormData.scoringType,
        questionsCount: groupEventFormData.questionsCount
      };
      if (!data.groupEvents) data.groupEvents = [];
      data.groupEvents.push(newGroupEvent);
    }
    
    StorageService.saveData(data);
    loadData();
    setShowGroupEventForm(false);
    setEditingGroupEvent(null);
  };

  const handleDeleteGroupEvent = (groupEventId) => {
    if (window.confirm('Are you sure you want to delete this group event? This will also remove all associated teams and scores.')) {
      const data = StorageService.getData();
      data.groupEvents = (data.groupEvents || []).filter(e => e.id !== groupEventId);
      
      // Remove teams for this event
      if (data.groupTeams) {
        data.groupTeams = data.groupTeams.filter(t => t.groupEventId !== groupEventId);
      }
      
      StorageService.saveData(data);
      loadData();
    }
  };

  // Section Form Handlers
  const handleSectionFormChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields (presbyter, csPresident, etc.)
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setSectionFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setSectionFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleChurchChange = (index, field, value) => {
    const newChurches = [...sectionFormData.churches];
    
    if (typeof newChurches[index] === 'string') {
      // Convert to object format if it's still a string
      newChurches[index] = {
        name: newChurches[index],
        pastor: { name: '', contact: '' }
      };
    }
    
    if (field.includes('.')) {
      const [parent, child] = field.split('.');
      newChurches[index] = {
        ...newChurches[index],
        [parent]: {
          ...newChurches[index][parent],
          [child]: value
        }
      };
    } else {
      newChurches[index] = {
        ...newChurches[index],
        [field]: value
      };
    }
    
    setSectionFormData(prev => ({
      ...prev,
      churches: newChurches
    }));
  };

  const handleAddChurchField = () => {
    setSectionFormData(prev => ({
      ...prev,
      churches: [...prev.churches, { name: '', pastor: { name: '', contact: '' } }]
    }));
  };

  const handleRemoveChurchField = (index) => {
    setSectionFormData(prev => ({
      ...prev,
      churches: prev.churches.filter((_, i) => i !== index)
    }));
  };

  const handleAddSection = () => {
    setShowSectionForm(true);
    setEditingSection(null);
    setSectionFormData({
      name: '',
      churches: [{ name: '', pastor: { name: '', contact: '' } }],
      username: '',
      password: '',
      presbyter: { name: '', contact: '' },
      csPresident: { name: '', contact: '' },
      csSecretary: { name: '', contact: '' },
      csTreasurer: { name: '', contact: '' }
    });
  };

  const handleEditSection = (section) => {
    setShowSectionForm(true);
    setEditingSection(section);
    
    // Convert old string-based churches to object format
    const churches = (section.churches || []).map(church => {
      if (typeof church === 'string') {
        return { name: church, pastor: { name: '', contact: '' } };
      }
      return church;
    });
    
    // Find credentials for this section
    const data = StorageService.getData();
    const sectionCredential = data.sectionCredentials?.find(sc => sc.section === section.name) || {};
    
    setSectionFormData({
      name: section.name,
      churches: churches.length > 0 ? churches : [{ name: '', pastor: { name: '', contact: '' } }],
      username: sectionCredential.username || '',
      password: sectionCredential.password || '',
      presbyter: section.presbyter || { name: '', contact: '' },
      csPresident: section.csPresident || { name: '', contact: '' },
      csSecretary: section.csSecretary || { name: '', contact: '' },
      csTreasurer: section.csTreasurer || { name: '', contact: '' }
    });
  };

  const handleSubmitSection = (e) => {
    e.preventDefault();
    
    const validChurches = sectionFormData.churches.filter(c => {
      if (typeof c === 'string') return c.trim();
      return c.name && c.name.trim();
    });
    
    if (!sectionFormData.name || validChurches.length === 0) {
      alert('Please fill in section name and at least one church');
      return;
    }
    
    if (!sectionFormData.username || !sectionFormData.password) {
      alert('Please provide username and password for section credentials');
      return;
    }

    const data = StorageService.getData();
    
    // Check for duplicate username (exclude current section when editing)
    const duplicateCredential = data.sectionCredentials?.find(sc => 
      sc.username === sectionFormData.username && 
      sc.section !== (editingSection?.name || '')
    );
    
    if (duplicateCredential) {
      alert('Username already exists. Please choose a different username.');
      return;
    }
    
    if (editingSection) {
      // Update existing section
      const sectionIndex = data.sections.findIndex(s => s.id === editingSection.id);
      if (sectionIndex !== -1) {
        data.sections[sectionIndex] = {
          ...data.sections[sectionIndex],
          name: sectionFormData.name,
          churches: validChurches,
          presbyter: sectionFormData.presbyter,
          csPresident: sectionFormData.csPresident,
          csSecretary: sectionFormData.csSecretary,
          csTreasurer: sectionFormData.csTreasurer
        };
      }
      
      // Update credentials
      const credIndex = data.sectionCredentials.findIndex(sc => sc.section === editingSection.name);
      if (credIndex !== -1) {
        data.sectionCredentials[credIndex] = {
          username: sectionFormData.username,
          password: sectionFormData.password,
          section: sectionFormData.name
        };
      } else {
        data.sectionCredentials.push({
          username: sectionFormData.username,
          password: sectionFormData.password,
          section: sectionFormData.name
        });
      }
    } else {
      // Add new section
      const newSection = {
        id: Math.max(...data.sections.map(s => s.id), 0) + 1,
        name: sectionFormData.name,
        churches: validChurches,
        presbyter: sectionFormData.presbyter,
        csPresident: sectionFormData.csPresident,
        csSecretary: sectionFormData.csSecretary,
        csTreasurer: sectionFormData.csTreasurer
      };
      data.sections.push(newSection);
      
      // Add credentials
      data.sectionCredentials.push({
        username: sectionFormData.username,
        password: sectionFormData.password,
        section: sectionFormData.name
      });
    }
    
    StorageService.saveData(data);
    loadData();
    setShowSectionForm(false);
    setEditingSection(null);
  };

  const handleDeleteSection = (sectionId) => {
    if (window.confirm('Are you sure you want to delete this section? This will affect all participants from this section.')) {
      const data = StorageService.getData();
      const sectionToDelete = data.sections.find(s => s.id === sectionId);
      
      // Remove section
      data.sections = data.sections.filter(s => s.id !== sectionId);
      
      // Remove associated credentials
      if (sectionToDelete) {
        data.sectionCredentials = data.sectionCredentials.filter(sc => sc.section !== sectionToDelete.name);
      }
      
      StorageService.saveData(data);
      loadData();
    }
  };

  // Judge Form Handlers
  const handleJudgeFormChange = (e) => {
    const { name, value } = e.target;
    setJudgeFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAddJudge = () => {
    setShowJudgeForm(true);
    setEditingJudge(null);
    setJudgeFormData({
      username: '',
      password: '',
      name: '',
      contact: '',
      email: ''
    });
  };

  const handleEditJudge = (judge) => {
    setShowJudgeForm(true);
    setEditingJudge(judge);
    setJudgeFormData({
      username: judge.username,
      password: judge.password,
      name: judge.name || '',
      contact: judge.contact || '',
      email: judge.email || ''
    });
  };

  const handleSubmitJudge = (e) => {
    e.preventDefault();
    
    if (!judgeFormData.username || !judgeFormData.password) {
      alert('Username and password are required');
      return;
    }

    const data = StorageService.getData();
    
    if (editingJudge) {
      // Update existing judge
      const judgeIndex = data.judgeCredentials.findIndex(j => j.username === editingJudge.username);
      if (judgeIndex !== -1) {
        data.judgeCredentials[judgeIndex] = {
          username: judgeFormData.username,
          password: judgeFormData.password,
          name: judgeFormData.name,
          contact: judgeFormData.contact,
          email: judgeFormData.email
        };
      }
    } else {
      // Check if username already exists
      if (data.judgeCredentials.find(j => j.username === judgeFormData.username)) {
        alert('Username already exists. Please choose a different username.');
        return;
      }
      
      // Add new judge
      data.judgeCredentials.push({
        username: judgeFormData.username,
        password: judgeFormData.password,
        name: judgeFormData.name,
        contact: judgeFormData.contact,
        email: judgeFormData.email
      });
    }
    
    StorageService.saveData(data);
    loadData();
    setShowJudgeForm(false);
    setEditingJudge(null);
  };

  const handleDeleteJudge = (username) => {
    if (window.confirm('Are you sure you want to delete this judge? This will also remove all scores submitted by this judge.')) {
      const data = StorageService.getData();
      data.judgeCredentials = data.judgeCredentials.filter(j => j.username !== username);
      
      // Remove scores submitted by this judge
      data.scores = data.scores.filter(s => s.judgeName !== username);
      
      // Remove judge locks
      data.judgeLocks = data.judgeLocks.filter(l => l.judgeName !== username);
      
      StorageService.saveData(data);
      loadData();
    }
  };

  const ageGroupOptions = ['Junior', 'Intermediate', 'Senior', 'Super Senior'];

  return (
    <div className="master-data-view">
      <div className="dashboard-header">
        <div>
          <h1>🗂️ Master Data Management</h1>
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

      <div className="tabs">
        <button
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          📅 Events
        </button>
        <button
          className={`tab ${activeTab === 'groupEvents' ? 'active' : ''}`}
          onClick={() => setActiveTab('groupEvents')}
        >
          👥 Group Events
        </button>
        <button
          className={`tab ${activeTab === 'sections' ? 'active' : ''}`}
          onClick={() => setActiveTab('sections')}
        >
          📍 Sections & Churches
        </button>
        <button
          className={`tab ${activeTab === 'judges' ? 'active' : ''}`}
          onClick={() => setActiveTab('judges')}
        >
          👨‍⚖️ Judges
        </button>
        <button
          className={`tab ${activeTab === 'points' ? 'active' : ''}`}
          onClick={() => setActiveTab('points')}
        >
          🏆 Points Configuration
        </button>
      </div>

      {/* Events Tab */}
      {activeTab === 'events' && (
        <div className="card">
          <div className="card-header-actions">
            <h2>Event Management</h2>
            <button onClick={handleAddEvent} className="btn btn-primary">
              + Add Event
            </button>
          </div>

          {showEventForm && (
            <div className="form-container">
              <h3>{editingEvent ? 'Edit Event' : 'Add New Event'}</h3>
              <form onSubmit={handleSubmitEvent}>
                <div className="form-group">
                  <label htmlFor="eventName">Event Name *</label>
                  <input
                    type="text"
                    id="eventName"
                    name="name"
                    value={eventFormData.name}
                    onChange={handleEventFormChange}
                    placeholder="e.g., Solo Music (Male)"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="eventDescription">Description</label>
                  <textarea
                    id="eventDescription"
                    name="description"
                    value={eventFormData.description}
                    onChange={handleEventFormChange}
                    rows="3"
                    placeholder="Brief description of the event..."
                  />
                </div>

                <div className="form-group">
                  <label>Age Groups * (Select at least one)</label>
                  <div className="checkbox-group">
                    {ageGroupOptions.map(group => (
                      <label key={group} className="checkbox-label">
                        <input
                          type="checkbox"
                          name="ageGroups"
                          value={group}
                          checked={eventFormData.ageGroups.includes(group)}
                          onChange={handleEventFormChange}
                        />
                        {group}
                      </label>
                    ))}
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="scoringType">Scoring Type *</label>
                  <select
                    id="scoringType"
                    name="scoringType"
                    value={eventFormData.scoringType}
                    onChange={handleEventFormChange}
                    required
                  >
                    <option value="all-judges">All Judges (Average of all judge scores)</option>
                    <option value="single-judge">Single Judge (One judge scores per participant)</option>
                  </select>
                  <small className="field-hint">
                    {eventFormData.scoringType === 'all-judges' 
                      ? 'All judges must score each participant. Final score is the average.' 
                      : 'Only one judge scores each participant. Suitable for written/judged events.'}
                  </small>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingEvent ? 'Update Event' : 'Add Event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowEventForm(false);
                      setEditingEvent(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Event Name</th>
                  <th>Description</th>
                  <th>Age Groups</th>
                  <th>Scoring Type</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {events.map(event => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td><strong>{event.name}</strong></td>
                    <td>{event.description}</td>
                    <td>
                      <div className="age-groups">
                        {event.ageGroups.map(group => (
                          <span key={group} className="age-group-badge">{group}</span>
                        ))}
                      </div>
                    </td>
                    <td>
                      <span className={`scoring-type-badge ${event.scoringType === 'all-judges' ? 'all-judges' : 'single-judge'}`}>
                        {event.scoringType === 'all-judges' ? 'All Judges' : 'Single Judge'}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditEvent(event)}
                          className="btn-small btn-info"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
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
        </div>
      )}

      {/* Group Events Tab */}
      {activeTab === 'groupEvents' && (
        <div className="card">
          <div className="card-header-actions">
            <h2>Group Events Management</h2>
            <button onClick={handleAddGroupEvent} className="btn btn-primary">
              + Add Group Event
            </button>
          </div>

          {showGroupEventForm && (
            <div className="form-container">
              <h3>{editingGroupEvent ? 'Edit Group Event' : 'Add New Group Event'}</h3>
              <form onSubmit={handleSubmitGroupEvent}>
                <div className="form-group">
                  <label htmlFor="groupEventName">Event Name *</label>
                  <input
                    type="text"
                    id="groupEventName"
                    name="name"
                    value={groupEventFormData.name}
                    onChange={handleGroupEventFormChange}
                    placeholder="e.g., Group Song, Group Bible Quiz"
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="groupEventDescription">Description</label>
                  <textarea
                    id="groupEventDescription"
                    name="description"
                    value={groupEventFormData.description}
                    onChange={handleGroupEventFormChange}
                    placeholder="Enter event description"
                    rows="3"
                  />
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="maxParticipants">Max Participants per Team *</label>
                    <input
                      type="number"
                      id="maxParticipants"
                      name="maxParticipants"
                      value={groupEventFormData.maxParticipants}
                      onChange={handleGroupEventFormChange}
                      min="1"
                      max="20"
                      required
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="scoringType">Scoring Type *</label>
                    <select
                      id="scoringType"
                      name="scoringType"
                      value={groupEventFormData.scoringType}
                      onChange={handleGroupEventFormChange}
                      required
                    >
                      <option value="judge">Judge Scoring</option>
                      <option value="quiz">Quiz (Per Question)</option>
                    </select>
                  </div>
                </div>

                {groupEventFormData.scoringType === 'quiz' && (
                  <div className="form-group">
                    <label htmlFor="questionsCount">Total Questions *</label>
                    <input
                      type="number"
                      id="questionsCount"
                      name="questionsCount"
                      value={groupEventFormData.questionsCount}
                      onChange={handleGroupEventFormChange}
                      min="1"
                      placeholder="e.g., 50"
                      required
                    />
                    <small style={{ color: '#718096', marginTop: '5px', display: 'block' }}>
                      Each correct answer = 1 mark
                    </small>
                  </div>
                )}

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingGroupEvent ? 'Update Group Event' : 'Add Group Event'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowGroupEventForm(false);
                      setEditingGroupEvent(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Event Name</th>
                  <th>Description</th>
                  <th>Max Participants</th>
                  <th>Scoring Type</th>
                  <th>Questions</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {groupEvents.map(event => (
                  <tr key={event.id}>
                    <td>{event.id}</td>
                    <td><strong>{event.name}</strong></td>
                    <td>{event.description}</td>
                    <td>{event.maxParticipants}</td>
                    <td>
                      <span className={`badge ${event.scoringType === 'quiz' ? 'badge-info' : 'badge-success'}`}>
                        {event.scoringType === 'quiz' ? 'Quiz' : 'Judge Scoring'}
                      </span>
                    </td>
                    <td>{event.scoringType === 'quiz' ? event.questionsCount : '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditGroupEvent(event)}
                          className="btn-small btn-info"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteGroupEvent(event.id)}
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
        </div>
      )}

      {/* Sections Tab */}
      {activeTab === 'sections' && (
        <div className="card">
          <div className="card-header-actions">
            <h2>Section & Church Management</h2>
            <button onClick={handleAddSection} className="btn btn-primary">
              + Add Section
            </button>
          </div>

          {showSectionForm && (
            <div className="form-container">
              <h3>{editingSection ? 'Edit Section' : 'Add New Section'}</h3>
              <form onSubmit={handleSubmitSection}>
                <div className="form-group">
                  <label htmlFor="sectionName">Section Name *</label>
                  <input
                    type="text"
                    id="sectionName"
                    name="name"
                    value={sectionFormData.name}
                    onChange={handleSectionFormChange}
                    placeholder="e.g., Pathanapuram"
                    required
                  />
                </div>

                <h4 style={{ marginTop: '30px', marginBottom: '15px', color: '#2d3748' }}>Section Credentials</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="sectionUsername">Username *</label>
                    <input
                      type="text"
                      id="sectionUsername"
                      name="username"
                      value={sectionFormData.username}
                      onChange={handleSectionFormChange}
                      placeholder="Enter username"
                      disabled={editingSection}
                      required
                    />
                    {editingSection && (
                      <small style={{ color: '#718096', marginTop: '5px', display: 'block' }}>
                        Username cannot be changed while editing
                      </small>
                    )}
                  </div>
                  <div className="form-group">
                    <label htmlFor="sectionPassword">Password *</label>
                    <input
                      type="password"
                      id="sectionPassword"
                      name="password"
                      value={sectionFormData.password}
                      onChange={handleSectionFormChange}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Churches *</label>
                  {sectionFormData.churches.map((church, index) => {
                    const churchData = typeof church === 'string' 
                      ? { name: church, pastor: { name: '', contact: '' } }
                      : church;
                    
                    return (
                      <div key={index} className="church-group">
                        <div className="church-input-row">
                          <input
                            type="text"
                            value={churchData.name}
                            onChange={(e) => handleChurchChange(index, 'name', e.target.value)}
                            placeholder="Church name"
                            style={{ flex: 2 }}
                          />
                          {sectionFormData.churches.length > 1 && (
                            <button
                              type="button"
                              onClick={() => handleRemoveChurchField(index)}
                              className="btn-small btn-danger"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                        <div className="pastor-fields">
                          <input
                            type="text"
                            value={churchData.pastor?.name || ''}
                            onChange={(e) => handleChurchChange(index, 'pastor.name', e.target.value)}
                            placeholder="Pastor name"
                            style={{ flex: 1 }}
                          />
                          <input
                            type="text"
                            value={churchData.pastor?.contact || ''}
                            onChange={(e) => handleChurchChange(index, 'pastor.contact', e.target.value)}
                            placeholder="Pastor contact number"
                            style={{ flex: 1 }}
                          />
                        </div>
                      </div>
                    );
                  })}
                  <button
                    type="button"
                    onClick={handleAddChurchField}
                    className="btn-small btn-secondary"
                    style={{ marginTop: '10px' }}
                  >
                    + Add Another Church
                  </button>
                </div>

                <h4 style={{ marginTop: '30px', marginBottom: '15px', color: '#2d3748' }}>Section Officers</h4>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="presbyterName">Presbyter Name</label>
                    <input
                      type="text"
                      id="presbyterName"
                      name="presbyter.name"
                      value={sectionFormData.presbyter.name}
                      onChange={handleSectionFormChange}
                      placeholder="Enter presbyter name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="presbyterContact">Presbyter Contact</label>
                    <input
                      type="text"
                      id="presbyterContact"
                      name="presbyter.contact"
                      value={sectionFormData.presbyter.contact}
                      onChange={handleSectionFormChange}
                      placeholder="Contact number"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="csPresidentName">CS President Name</label>
                    <input
                      type="text"
                      id="csPresidentName"
                      name="csPresident.name"
                      value={sectionFormData.csPresident.name}
                      onChange={handleSectionFormChange}
                      placeholder="Enter president name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="csPresidentContact">CS President Contact</label>
                    <input
                      type="text"
                      id="csPresidentContact"
                      name="csPresident.contact"
                      value={sectionFormData.csPresident.contact}
                      onChange={handleSectionFormChange}
                      placeholder="Contact number"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="csSecretaryName">CS Secretary Name</label>
                    <input
                      type="text"
                      id="csSecretaryName"
                      name="csSecretary.name"
                      value={sectionFormData.csSecretary.name}
                      onChange={handleSectionFormChange}
                      placeholder="Enter secretary name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="csSecretaryContact">CS Secretary Contact</label>
                    <input
                      type="text"
                      id="csSecretaryContact"
                      name="csSecretary.contact"
                      value={sectionFormData.csSecretary.contact}
                      onChange={handleSectionFormChange}
                      placeholder="Contact number"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="csTreasurerName">CS Treasurer Name</label>
                    <input
                      type="text"
                      id="csTreasurerName"
                      name="csTreasurer.name"
                      value={sectionFormData.csTreasurer.name}
                      onChange={handleSectionFormChange}
                      placeholder="Enter treasurer name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="csTreasurerContact">CS Treasurer Contact</label>
                    <input
                      type="text"
                      id="csTreasurerContact"
                      name="csTreasurer.contact"
                      value={sectionFormData.csTreasurer.contact}
                      onChange={handleSectionFormChange}
                      placeholder="Contact number"
                    />
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingSection ? 'Update Section' : 'Add Section'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSectionForm(false);
                      setEditingSection(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Section Name</th>
                  <th>Officers</th>
                  <th>Churches</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sections.map(section => (
                  <tr key={section.id}>
                    <td>{section.id}</td>
                    <td><strong>{section.name}</strong></td>
                    <td>
                      <div className="officers-list">
                        {section.presbyter?.name && (
                          <div className="officer-item">
                            <strong>Presbyter:</strong> {section.presbyter.name}
                            {section.presbyter.contact && <span> ({section.presbyter.contact})</span>}
                          </div>
                        )}
                        {section.csPresident?.name && (
                          <div className="officer-item">
                            <strong>President:</strong> {section.csPresident.name}
                            {section.csPresident.contact && <span> ({section.csPresident.contact})</span>}
                          </div>
                        )}
                        {section.csSecretary?.name && (
                          <div className="officer-item">
                            <strong>Secretary:</strong> {section.csSecretary.name}
                            {section.csSecretary.contact && <span> ({section.csSecretary.contact})</span>}
                          </div>
                        )}
                        {section.csTreasurer?.name && (
                          <div className="officer-item">
                            <strong>Treasurer:</strong> {section.csTreasurer.name}
                            {section.csTreasurer.contact && <span> ({section.csTreasurer.contact})</span>}
                          </div>
                        )}
                      </div>
                    </td>
                    <td>
                      <div className="churches-list">
                        {section.churches.map((church, index) => {
                          const churchData = typeof church === 'string' 
                            ? { name: church }
                            : church;
                          return (
                            <div key={index} className="church-item">
                              <div><strong>{churchData.name}</strong></div>
                              {churchData.pastor?.name && (
                                <div className="pastor-info">
                                  Pastor: {churchData.pastor.name}
                                  {churchData.pastor.contact && <span> ({churchData.pastor.contact})</span>}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditSection(section)}
                          className="btn-small btn-info"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section.id)}
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
        </div>
      )}

      {/* Judges Tab */}
      {activeTab === 'judges' && (
        <div className="card">
          <div className="card-header-actions">
            <h2>Judge Management</h2>
            <button onClick={handleAddJudge} className="btn btn-primary">
              + Add Judge
            </button>
          </div>

          {showJudgeForm && (
            <div className="form-container">
              <h3>{editingJudge ? 'Edit Judge' : 'Add New Judge'}</h3>
              <form onSubmit={handleSubmitJudge}>
                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="judgeUsername">Username *</label>
                    <input
                      type="text"
                      id="judgeUsername"
                      name="username"
                      value={judgeFormData.username}
                      onChange={handleJudgeFormChange}
                      placeholder="e.g., judge1"
                      required
                      disabled={editingJudge !== null}
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="judgePassword">Password *</label>
                    <input
                      type="password"
                      id="judgePassword"
                      name="password"
                      value={judgeFormData.password}
                      onChange={handleJudgeFormChange}
                      placeholder="Enter password"
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label htmlFor="judgeName">Full Name</label>
                    <input
                      type="text"
                      id="judgeName"
                      name="name"
                      value={judgeFormData.name}
                      onChange={handleJudgeFormChange}
                      placeholder="Enter judge's full name"
                    />
                  </div>
                  <div className="form-group">
                    <label htmlFor="judgeContact">Contact Number</label>
                    <input
                      type="text"
                      id="judgeContact"
                      name="contact"
                      value={judgeFormData.contact}
                      onChange={handleJudgeFormChange}
                      placeholder="Enter contact number"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="judgeEmail">Email</label>
                  <input
                    type="email"
                    id="judgeEmail"
                    name="email"
                    value={judgeFormData.email}
                    onChange={handleJudgeFormChange}
                    placeholder="Enter email address"
                  />
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn btn-primary">
                    {editingJudge ? 'Update Judge' : 'Add Judge'}
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowJudgeForm(false);
                      setEditingJudge(null);
                    }}
                    className="btn btn-secondary"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="table-container">
            <table className="table">
              <thead>
                <tr>
                  <th>Username</th>
                  <th>Full Name</th>
                  <th>Contact</th>
                  <th>Email</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {judges.map(judge => (
                  <tr key={judge.username}>
                    <td><strong>{judge.username}</strong></td>
                    <td>{judge.name || '-'}</td>
                    <td>{judge.contact || '-'}</td>
                    <td>{judge.email || '-'}</td>
                    <td>
                      <div className="action-buttons">
                        <button
                          onClick={() => handleEditJudge(judge)}
                          className="btn-small btn-info"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteJudge(judge.username)}
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
        </div>
      )}

      {/* Points Configuration Tab */}
      {activeTab === 'points' && (
        <div className="card">
          <div className="card-header-actions">
            <h2>Points Configuration</h2>
          </div>

          <div className="points-config-container">
            <div className="points-section">
              <h3>Individual Events Points</h3>
              <p className="points-description">Configure points awarded for top 3 positions in individual events</p>
              
              <div className="points-form">
                <div className="form-group">
                  <label>1st Place Points</label>
                  <input
                    type="number"
                    min="0"
                    value={pointsConfig.individual.first}
                    onChange={(e) => setPointsConfig(prev => ({
                      ...prev,
                      individual: { ...prev.individual, first: parseInt(e.target.value) || 0 }
                    }))}
                    className="points-input"
                  />
                  <span className="medal-icon">🥇</span>
                </div>

                <div className="form-group">
                  <label>2nd Place Points</label>
                  <input
                    type="number"
                    min="0"
                    value={pointsConfig.individual.second}
                    onChange={(e) => setPointsConfig(prev => ({
                      ...prev,
                      individual: { ...prev.individual, second: parseInt(e.target.value) || 0 }
                    }))}
                    className="points-input"
                  />
                  <span className="medal-icon">🥈</span>
                </div>

                <div className="form-group">
                  <label>3rd Place Points</label>
                  <input
                    type="number"
                    min="0"
                    value={pointsConfig.individual.third}
                    onChange={(e) => setPointsConfig(prev => ({
                      ...prev,
                      individual: { ...prev.individual, third: parseInt(e.target.value) || 0 }
                    }))}
                    className="points-input"
                  />
                  <span className="medal-icon">🥉</span>
                </div>
              </div>
            </div>

            <div className="points-section">
              <h3>Group Events Points</h3>
              <p className="points-description">Configure points awarded for top 3 positions in group events</p>
              
              <div className="points-form">
                <div className="form-group">
                  <label>1st Place Points</label>
                  <input
                    type="number"
                    min="0"
                    value={pointsConfig.group.first}
                    onChange={(e) => setPointsConfig(prev => ({
                      ...prev,
                      group: { ...prev.group, first: parseInt(e.target.value) || 0 }
                    }))}
                    className="points-input"
                  />
                  <span className="medal-icon">🥇</span>
                </div>

                <div className="form-group">
                  <label>2nd Place Points</label>
                  <input
                    type="number"
                    min="0"
                    value={pointsConfig.group.second}
                    onChange={(e) => setPointsConfig(prev => ({
                      ...prev,
                      group: { ...prev.group, second: parseInt(e.target.value) || 0 }
                    }))}
                    className="points-input"
                  />
                  <span className="medal-icon">🥈</span>
                </div>

                <div className="form-group">
                  <label>3rd Place Points</label>
                  <input
                    type="number"
                    min="0"
                    value={pointsConfig.group.third}
                    onChange={(e) => setPointsConfig(prev => ({
                      ...prev,
                      group: { ...prev.group, third: parseInt(e.target.value) || 0 }
                    }))}
                    className="points-input"
                  />
                  <span className="medal-icon">🥉</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                const data = StorageService.getData();
                data.pointsConfig = pointsConfig;
                StorageService.saveData(data);
                alert('Points configuration saved successfully!');
              }}
              className="btn btn-primary"
              style={{ marginTop: '20px' }}
            >
              Save Points Configuration
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterData;
