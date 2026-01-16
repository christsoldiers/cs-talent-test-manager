import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FirebaseService from '../../services/FirebaseService';
import './EventDetailView.css';

const SectionEventDetailView = () => {
  const [event, setEvent] = useState(null);
  const [stats, setStats] = useState({ participants: 0 });
  const { eventId } = useParams();
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'section') {
      navigate('/section/login');
    } else {
      loadEventData();
    }
  }, [user, navigate, eventId]);

  const loadEventData = async () => {
    try {
      const eventData = await FirebaseService.getTalentTestEventById(eventId);
      setEvent(eventData);

      // Load stats for this event (filtered by section)
      const participants = await FirebaseService.getParticipantsBySection(user.section);
      const eventParticipants = participants.filter(p => p.talentTestEventId === eventId);

      setStats({
        participants: eventParticipants.length
      });
    } catch (error) {
      console.error('Error loading event:', error);
      navigate('/section/dashboard');
    }
  };

  const handleLogout = () => {
    logout();
    startTransition(() => {
      navigate('/section/login');
    });
  };

  const handleBackToDashboard = () => {
    navigate('/section/dashboard');
  };

  const handleViewParticipants = () => {
    navigate('/section/participants', { state: { eventId, eventName: event.name } });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (!event) {
    return (
      <div className="event-detail-container">
        <div className="loading">Loading event details...</div>
      </div>
    );
  }

  return (
    <div className="event-detail-container">
      <div className="header">
        <div>
          <button onClick={handleBackToDashboard} className="btn-back">
            ← Back to Events
          </button>
          <h1>{event.name}</h1>
          <p>{user?.section} Section: {user?.username}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-logout">
          Logout
        </button>
      </div>

      <div className="event-info-section">
        <div className="info-card">
          <h3>Event Details</h3>
          {event.description && (
            <p className="event-description">{event.description}</p>
          )}
          <div className="info-grid">
            <div className="info-item">
              <span className="info-label">Start Date:</span>
              <span className="info-value">{formatDate(event.startDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">End Date:</span>
              <span className="info-value">{formatDate(event.endDate)}</span>
            </div>
            <div className="info-item">
              <span className="info-label">Registration:</span>
              <span className={`info-value ${event.registrationOpen ? 'status-open' : 'status-closed'}`}>
                {event.registrationOpen ? 'Open' : 'Closed'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="stats-section">
        <h2>Section Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-icon">👥</div>
            <div className="stat-content">
              <h3>Participants</h3>
              <p className="stat-number">{stats.participants}</p>
              <span className="stat-label">From {user?.section} Section</span>
            </div>
          </div>
        </div>
      </div>

      <div className="actions-section">
        <h2>Manage Registrations</h2>
        <div className="action-cards">
          <div className="action-card" onClick={handleViewParticipants}>
            <div className="action-icon">👥</div>
            <h3>Participants</h3>
            <p>View and manage individual participants from your section</p>
            <div className="action-stat">{stats.participants} registered</div>
            <button className="btn btn-primary">View Participants →</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionEventDetailView;
