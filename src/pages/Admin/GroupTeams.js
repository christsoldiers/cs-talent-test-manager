import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FirebaseService from '../../services/FirebaseService';
import './GroupTeams.css';

const GroupTeams = () => {
  const [groupEvents, setGroupEvents] = useState([]);
  const [talentTestEvents, setTalentTestEvents] = useState([]);
  const [sections, setSections] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [currentEvent, setCurrentEvent] = useState(null);
  const [teamFormData, setTeamFormData] = useState({
    groupEventId: '',
    sectionId: '',
    teamName: '',
    chestNumber: '',
    participants: [''],
    talentTestEventId: ''
  });
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
      groupEvents: allGroupEvents,
      sections: allSections,
      talentTestEvents: ttEvents,
      teams: allTeams,
      currentEvent: event,
      activeEvent
    } = await FirebaseService.getGroupTeamsData(eventId);
    
    setGroupEvents(allGroupEvents);
    setSections(allSections);
    setTalentTestEvents(ttEvents);
    
    if (eventId) {
      setCurrentEvent(event);
      setTeamFormData(prev => ({ ...prev, talentTestEventId: eventId }));
      
      // Filter teams by event
      const filtered = allTeams.filter(t => t.talentTestEventId === eventId);
      setTeams(filtered);
    } else {
      setTeams(allTeams);
      
      if (activeEvent && !teamFormData.talentTestEventId) {
        setTeamFormData(prev => ({ ...prev, talentTestEventId: activeEvent.id }));
      }
    }
  };

  const handleLogout = () => {
    logout();
    startTransition(() => {
      navigate('/admin/login');
    });
  };

  const handleBackToDashboard = () => {
    if (eventId) {
      navigate(`/admin/event/${eventId}`);
    } else {
      navigate('/admin/dashboard');
    }
  };

  const handleTeamFormChange = (e) => {
    const { name, value } = e.target;
    setTeamFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleParticipantChange = (index, value) => {
    const newParticipants = [...teamFormData.participants];
    newParticipants[index] = value;
    setTeamFormData(prev => ({
      ...prev,
      participants: newParticipants
    }));
  };

  const handleAddParticipant = () => {
    const event = groupEvents.find(e => e.id === teamFormData.groupEventId);
    if (event && teamFormData.participants.length < event.maxParticipants) {
      setTeamFormData(prev => ({
        ...prev,
        participants: [...prev.participants, '']
      }));
    } else {
      alert(`Maximum ${event?.maxParticipants || 10} participants allowed for this event`);
    }
  };

  const handleRemoveParticipant = (index) => {
    if (teamFormData.participants.length > 1) {
      const newParticipants = teamFormData.participants.filter((_, i) => i !== index);
      setTeamFormData(prev => ({
        ...prev,
        participants: newParticipants
      }));
    }
  };

  const handleAddTeam = () => {
    setShowTeamForm(true);
    setEditingTeam(null);
    // Auto-set talent test event ID from current event or active event
    const talentTestEventId = eventId || currentEvent?.id || talentTestEvents.find(e => e.registrationOpen)?.id || '';
    setTeamFormData({
      groupEventId: '',
      sectionId: '',
      teamName: '',
      chestNumber: '',
      participants: [''],
      talentTestEventId
    });
  };

  const handleEditTeam = (team) => {
    setShowTeamForm(true);
    setEditingTeam(team);
    setTeamFormData({
      groupEventId: team.groupEventId,
      sectionId: team.sectionId,
      teamName: team.teamName,
      chestNumber: team.chestNumber || '',
      participants: team.participants.length > 0 ? team.participants : [''],
      talentTestEventId: team.talentTestEventId || eventId || ''
    });
  };

  const generateChestNumber = async (groupEventId, sectionId) => {
    const allTeams = await FirebaseService.getGroupTeams();
    
    // Get the event to determine prefix
    const event = groupEvents.find(e => e.id === groupEventId);
    const section = sections.find(s => s.id === sectionId);
    
    if (!event || !section) return '';
    
    // Create prefix based on event name and section
    let prefix = '';
    if (event.name.includes('Song')) {
      prefix = 'GS'; // Group Song
    } else if (event.name.includes('Quiz')) {
      prefix = 'GQ'; // Group Quiz
    } else {
      prefix = 'GT'; // Group Team (generic)
    }
    
    // Add section initial
    const sectionInitial = section.name.charAt(0).toUpperCase();
    prefix = `${prefix}${sectionInitial}`;
    
    // Find the highest number for this prefix
    const teamsWithPrefix = allTeams.filter(t => 
      t.chestNumber && t.chestNumber.startsWith(prefix)
    );
    
    let maxNumber = 0;
    teamsWithPrefix.forEach(t => {
      const match = t.chestNumber.match(/\d+$/);
      if (match) {
        const num = parseInt(match[0]);
        if (num > maxNumber) maxNumber = num;
      }
    });
    
    return `${prefix}${String(maxNumber + 1).padStart(3, '0')}`;
  };

  const handleAutoGenerateChestNumber = async () => {
    if (!teamFormData.groupEventId || !teamFormData.sectionId) {
      alert('Please select event and section first');
      return;
    }
    
    const chestNumber = await generateChestNumber(teamFormData.groupEventId, teamFormData.sectionId);
    setTeamFormData(prev => ({
      ...prev,
      chestNumber
    }));
  };

  const handleSubmitTeam = async (e) => {
    e.preventDefault();

    if (!teamFormData.groupEventId || !teamFormData.sectionId || !teamFormData.teamName || !teamFormData.chestNumber) {
      alert('Please fill in all required fields');
      return;
    }

    if (!teamFormData.talentTestEventId) {
      alert('Talent Test Event is required');
      return;
    }

    const validParticipants = teamFormData.participants.filter(p => p.trim());
    if (validParticipants.length === 0) {
      alert('Please add at least one participant');
      return;
    }

    const allTeams = await FirebaseService.getGroupTeams();

    // Check if section already has a team for this event (one team per section rule)
    const existingTeam = allTeams.find(t => 
      t.groupEventId === teamFormData.groupEventId && 
      t.sectionId === teamFormData.sectionId &&
      t.talentTestEventId === teamFormData.talentTestEventId &&
      t.id !== editingTeam?.id
    );

    if (existingTeam) {
      alert('This section already has a team for this event. Only one team per section is allowed.');
      return;
    }

    if (editingTeam) {
      // Update existing team
      await FirebaseService.updateGroupTeam(editingTeam.id, {
        groupEventId: teamFormData.groupEventId,
        sectionId: teamFormData.sectionId,
        teamName: teamFormData.teamName,
        chestNumber: teamFormData.chestNumber,
        participants: validParticipants,
        talentTestEventId: teamFormData.talentTestEventId
      });
    } else {
      // Add new team
      await FirebaseService.addGroupTeam({
        groupEventId: teamFormData.groupEventId,
        sectionId: teamFormData.sectionId,
        teamName: teamFormData.teamName,
        chestNumber: teamFormData.chestNumber,
        participants: validParticipants,
        talentTestEventId: teamFormData.talentTestEventId,
        scores: []
      });
    }

    loadData();
    setShowTeamForm(false);
    setEditingTeam(null);
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      await FirebaseService.deleteGroupTeam(teamId);
      loadData();
    }
  };

  const getEventName = (eventId) => {
    const event = groupEvents.find(e => e.id === eventId);
    return event ? event.name : 'Unknown';
  };

  const getSectionName = (sectionId) => {
    const section = sections.find(s => s.id === sectionId);
    return section ? section.name : 'Unknown';
  };

  const handleGenerateAllChestNumbers = async () => {
    const allTeams = await FirebaseService.getGroupTeams();
    const teamsToUpdate = allTeams.filter(t => !t.chestNumber);
    
    if (teamsToUpdate.length === 0) {
      alert('All teams already have chest numbers assigned!');
      return;
    }
    
    if (window.confirm(`Generate chest numbers for ${teamsToUpdate.length} team(s)?`)) {
      for (const team of teamsToUpdate) {
        const chestNumber = await generateChestNumber(team.groupEventId, team.sectionId);
        await FirebaseService.updateGroupTeam(team.id, { chestNumber });
      }
      
      loadData();
      alert(`Successfully assigned ${teamsToUpdate.length} chest numbers!`);
    }
  };

  return (
    <div className="group-teams-view">
      <div className="dashboard-header">
        <div>
          {currentEvent && (
            <div className="breadcrumb">
              <button onClick={handleBackToDashboard} className="btn-link">
                ← {currentEvent.name}
              </button>
            </div>
          )}
          <h1>👥 Group Teams Management</h1>
          <p>Admin: {user?.username}</p>
          {currentEvent && (
            <p className="subtitle">Viewing teams for: {currentEvent.name}</p>
          )}
        </div>
        <div className="header-actions">
          <button onClick={handleBackToDashboard} className="btn btn-secondary">
            {eventId ? '← Back to Event' : '← Back to Events'}
          </button>
          <button onClick={handleLogout} className="btn btn-secondary">
            Logout
          </button>
        </div>
      </div>

      <div className="card">
        <div className="card-header-actions">
          <h2>Teams</h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={handleGenerateAllChestNumbers} className="btn btn-success">
              🔢 Generate All Chest Numbers
            </button>
            <button onClick={handleAddTeam} className="btn btn-primary">
              + Add Team
            </button>
          </div>
        </div>

        {showTeamForm && (
          <div className="form-container">
            <h3>{editingTeam ? 'Edit Team' : 'Add New Team'}</h3>
            <form onSubmit={handleSubmitTeam}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="groupEventId">Group Event *</label>
                  <select
                    id="groupEventId"
                    name="groupEventId"
                    value={teamFormData.groupEventId}
                    onChange={handleTeamFormChange}
                    required
                  >
                    <option value="">Select Event</option>
                    {groupEvents.map(event => (
                      <option key={event.id} value={event.id}>
                        {event.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label htmlFor="sectionId">Section *</label>
                  <select
                    id="sectionId"
                    name="sectionId"
                    value={teamFormData.sectionId}
                    onChange={handleTeamFormChange}
                    required
                  >
                    <option value="">Select Section</option>
                    {sections.map(section => (
                      <option key={section.id} value={section.id}>
                        {section.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="teamName">Team Name *</label>
                <input
                  type="text"
                  id="teamName"
                  name="teamName"
                  value={teamFormData.teamName}
                  onChange={handleTeamFormChange}
                  placeholder="e.g., Pathanapuram Warriors"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="chestNumber">Chest Number *</label>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <input
                    type="text"
                    id="chestNumber"
                    name="chestNumber"
                    value={teamFormData.chestNumber}
                    onChange={handleTeamFormChange}
                    placeholder="e.g., GSP001, GQK001"
                    required
                    style={{ flex: 1 }}
                  />
                  <button
                    type="button"
                    onClick={handleAutoGenerateChestNumber}
                    className="btn btn-secondary"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    🔢 Auto Generate
                  </button>
                </div>
                <small style={{ color: '#718096', fontSize: '0.85rem' }}>
                  Format: GSP001 (Group Song Pathanapuram), GQK001 (Group Quiz Kollam)
                </small>
              </div>

              <div className="form-group">
                <label>Participants *</label>
                {teamFormData.participants.map((participant, index) => (
                  <div key={index} className="participant-input-row">
                    <input
                      type="text"
                      value={participant}
                      onChange={(e) => handleParticipantChange(index, e.target.value)}
                      placeholder={`Participant ${index + 1} name`}
                      style={{ flex: 1 }}
                    />
                    {teamFormData.participants.length > 1 && (
                      <button
                        type="button"
                        onClick={() => handleRemoveParticipant(index)}
                        className="btn-small btn-danger"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                ))}
                <button
                  type="button"
                  onClick={handleAddParticipant}
                  className="btn-small btn-secondary"
                  style={{ marginTop: '10px' }}
                >
                  + Add Participant
                </button>
                {teamFormData.groupEventId && (
                  <small style={{ color: '#718096', marginTop: '5px', display: 'block' }}>
                    Max {groupEvents.find(e => e.id === teamFormData.groupEventId)?.maxParticipants || 10} participants allowed
                  </small>
                )}
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary">
                  {editingTeam ? 'Update Team' : 'Add Team'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowTeamForm(false);
                    setEditingTeam(null);
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
                <th>Event</th>
                <th>Section</th>
                <th>Team Name</th>
                <th>Chest Number</th>
                <th>Participants</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {teams.map(team => (
                <tr key={team.id}>
                  <td>{team.id}</td>
                  <td><strong>{getEventName(team.groupEventId)}</strong></td>
                  <td>{getSectionName(team.sectionId)}</td>
                  <td><strong>{team.teamName}</strong></td>
                  <td><span className="chest-number-badge">{team.chestNumber}</span></td>
                  <td>
                    <div className="participants-list">
                      {team.participants.map((p, i) => (
                        <span key={i} className="participant-badge">{p}</span>
                      ))}
                    </div>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        onClick={() => handleEditTeam(team)}
                        className="btn-small btn-info"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteTeam(team.id)}
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
    </div>
  );
};

export default GroupTeams;
