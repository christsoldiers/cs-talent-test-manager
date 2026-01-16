import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FirebaseService from '../../services/FirebaseService';
import './EventDashboard.css';

const SectionEventDashboard = () => {
  const [talentTestEvents, setTalentTestEvents] = useState([]);
  const [stats, setStats] = useState({});
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'section') {
      navigate('/section/login');
    } else {
      loadData();
    }
  }, [user, navigate]);

  const loadData = async () => {
    const events = await FirebaseService.getTalentTestEvents();
    setTalentTestEvents(events);

    // Calculate stats for each event (filtered by section)
    const allParticipants = await FirebaseService.getParticipantsBySection(user.section);

    const eventStats = {};
    events.forEach(event => {
      const eventParticipants = allParticipants.filter(p => p.talentTestEventId === event.id);
      
      eventStats[event.id] = {
        participants: eventParticipants.length,
        total: eventParticipants.length
      };
    });

    setStats(eventStats);
  };

  const handleLogout = () => {
    logout();
    startTransition(() => {
      navigate('/section/login');
    });
  };

  const handleEventClick = (eventId) => {
    navigate(`/section/event/${eventId}`);
  };

  const getEventStatus = (event) => {
    if (!event.startDate || !event.endDate) return 'draft';
    
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  const getStatusBadge = (status) => {
    const badges = {
      active: { text: 'Active', className: 'status-active' },
      upcoming: { text: 'Upcoming', className: 'status-upcoming' },
      completed: { text: 'Completed', className: 'status-completed' },
      draft: { text: 'Draft', className: 'status-draft' }
    };
    return badges[status] || badges.draft;
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="event-dashboard-container">
      <div className="header">
        <div>
          <h1>🎭 Talent Test Events</h1>
          <p>{user?.section} Section: {user?.username}</p>
        </div>
        <div className="header-actions">
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </div>

      {talentTestEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎭</div>
          <h2>No Talent Test Events</h2>
          <p>No events available at the moment</p>
        </div>
      ) : (
        <div className="events-grid">
          {talentTestEvents.map(event => {
            const status = getEventStatus(event);
            const badge = getStatusBadge(status);
            const eventStat = stats[event.id] || { participants: 0, total: 0 };

            return (
              <div
                key={event.id}
                className="event-card"
                onClick={() => handleEventClick(event.id)}
              >
                <div className="event-header">
                  <h3>{event.name}</h3>
                  <div className="event-badges">
                    <span className={`status-badge ${badge.className}`}>
                      {badge.text}
                    </span>
                    {event.registrationOpen && status !== 'completed' && (
                      <span className="status-badge registration-open">
                        Registration Open
                      </span>
                    )}
                  </div>
                </div>

                {event.description && (
                  <p className="event-description">{event.description}</p>
                )}

                <div className="event-dates">
                  <div className="date-item">
                    <span className="date-label">Start:</span>
                    <span className="date-value">{formatDate(event.startDate)}</span>
                  </div>
                  <div className="date-item">
                    <span className="date-label">End:</span>
                    <span className="date-value">{formatDate(event.endDate)}</span>
                  </div>
                </div>

                <div className="event-stats">
                  <div className="stat-item">
                    <span className="stat-label">Participants</span>
                    <span className="stat-value">{eventStat.participants}</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-label">From {user?.section}</span>
                  </div>
                </div>

                <div className="event-footer">
                  <span className="view-details">Click to view details →</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default SectionEventDashboard;
