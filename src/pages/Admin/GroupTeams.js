import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import StorageService from '../../services/StorageService';
import './GroupTeams.css';

const GroupTeams = () => {
  const [groupEvents, setGroupEvents] = useState([]);
  const [sections, setSections] = useState([]);
  const [teams, setTeams] = useState([]);
  const [showTeamForm, setShowTeamForm] = useState(false);
  const [editingTeam, setEditingTeam] = useState(null);
  const [teamFormData, setTeamFormData] = useState({
    groupEventId: '',
    sectionId: '',
    teamName: '',
    chestNumber: '',
    participants: ['']
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
    const data = StorageService.getData();
    setGroupEvents(data.groupEvents || []);
    setSections(StorageService.getSections());
    setTeams(data.groupTeams || []);
  };

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  const handleTeamFormChange = (e) => {
    const { name, value } = e.target;
    setTeamFormData(prev => ({
      ...prev,
      [name]: name === 'groupEventId' || name === 'sectionId' ? parseInt(value) : value
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
    setTeamFormData(prev => ({
      ...prev,
      participants: prev.participants.filter((_, i) => i !== index)
    }));
  };

  const handleAddTeam = () => {
    setShowTeamForm(true);
    setEditingTeam(null);
    setTeamFormData({
      groupEventId: '',
      sectionId: '',
      teamName: '',
      chestNumber: '',
      participants: ['']
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
      participants: team.participants.length > 0 ? team.participants : ['']
    });
  };

  const generateChestNumber = (groupEventId, sectionId) => {
    const data = StorageService.getData();
    const allTeams = data.groupTeams || [];
    
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

  const handleAutoGenerateChestNumber = () => {
    if (!teamFormData.groupEventId || !teamFormData.sectionId) {
      alert('Please select event and section first');
      return;
    }
    
    const chestNumber = generateChestNumber(teamFormData.groupEventId, teamFormData.sectionId);
    setTeamFormData(prev => ({
      ...prev,
      chestNumber
    }));
  };

  const handleSubmitTeam = (e) => {
    e.preventDefault();

    if (!teamFormData.groupEventId || !teamFormData.sectionId || !teamFormData.teamName || !teamFormData.chestNumber) {
      alert('Please fill in all required fields');
      return;
    }

    const validParticipants = teamFormData.participants.filter(p => p.trim());
    if (validParticipants.length === 0) {
      alert('Please add at least one participant');
      return;
    }

    const data = StorageService.getData();

    // Check if section already has a team for this event (one team per section rule)
    const existingTeam = (data.groupTeams || []).find(t => 
      t.groupEventId === teamFormData.groupEventId && 
      t.sectionId === teamFormData.sectionId &&
      t.id !== editingTeam?.id
    );

    if (existingTeam) {
      alert('This section already has a team for this event. Only one team per section is allowed.');
      return;
    }

    if (!data.groupTeams) data.groupTeams = [];

    if (editingTeam) {
      // Update existing team
      const teamIndex = data.groupTeams.findIndex(t => t.id === editingTeam.id);
      if (teamIndex !== -1) {
        data.groupTeams[teamIndex] = {
          ...data.groupTeams[teamIndex],
          groupEventId: teamFormData.groupEventId,
          sectionId: teamFormData.sectionId,
          teamName: teamFormData.teamName,
          chestNumber: teamFormData.chestNumber,
          participants: validParticipants
        };
      }
    } else {
      // Add new team
      const newTeam = {
        id: Math.max(...(data.groupTeams.map(t => t.id)), 0) + 1,
        groupEventId: teamFormData.groupEventId,
        sectionId: teamFormData.sectionId,
        teamName: teamFormData.teamName,
        chestNumber: teamFormData.chestNumber,
        participants: validParticipants,
        scores: [] // Will be populated by judges
      };
      data.groupTeams.push(newTeam);
    }

    StorageService.saveData(data);
    loadData();
    setShowTeamForm(false);
    setEditingTeam(null);
  };

  const handleDeleteTeam = (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      const data = StorageService.getData();
      data.groupTeams = (data.groupTeams || []).filter(t => t.id !== teamId);
      StorageService.saveData(data);
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

  const handleGenerateAllChestNumbers = () => {
    const data = StorageService.getData();
    const teamsToUpdate = (data.groupTeams || []).filter(t => !t.chestNumber);
    
    if (teamsToUpdate.length === 0) {
      alert('All teams already have chest numbers assigned!');
      return;
    }
    
    if (window.confirm(`Generate chest numbers for ${teamsToUpdate.length} team(s)?`)) {
      teamsToUpdate.forEach(team => {
        const chestNumber = generateChestNumber(team.groupEventId, team.sectionId);
        const teamIndex = data.groupTeams.findIndex(t => t.id === team.id);
        if (teamIndex !== -1) {
          data.groupTeams[teamIndex].chestNumber = chestNumber;
        }
      });
      
      StorageService.saveData(data);
      loadData();
      alert(`Successfully assigned ${teamsToUpdate.length} chest numbers!`);
    }
  };

  return (
    <div className="group-teams-view">
      <div className="dashboard-header">
        <div>
          <h1>👥 Group Teams Management</h1>
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
