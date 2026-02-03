import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FirebaseService from '../../services/FirebaseService';
import './EventDetailView.css';

const EventDetailView = () => {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({
    participants: 0,
    teams: 0,
    totalParticipants: 0,
    totalTeams: 0
  });
  const [lockedScores, setLockedScores] = useState([]);
  const [declaredScores, setDeclaredScores] = useState([]);
  const [pendingScores, setPendingScores] = useState([]);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    } else {
      loadData();
    }
  }, [user, navigate, eventId]);

  const loadData = async () => {
    const {
      event: eventData,
      categories: allCategories,
      participants: allParticipants,
      groupTeams: allTeams,
      events: allEvents,
      groupEvents: allGroupEvents,
      declaredResults,
      judges,
      groupEventLocks
    } = await FirebaseService.getEventDetailViewData(eventId);
    
    setEvent(eventData);
    
    // Set sorted categories
    const sortedCategories = allCategories;
    setCategories(sortedCategories);
    
    // Build category order map
    const categoryOrder = {};
    sortedCategories.forEach((cat, index) => {
      categoryOrder[cat.name.toLowerCase()] = index + 1;
    });
    
    // Helper function to sort by category order
    const sortEventsByCategory = (eventNames) => {
      return [...eventNames].sort((a, b) => {
        // Extract category from event name - get the LAST set of parentheses
        const matchesA = a.match(/\(([^)]+)\)/g);
        const matchesB = b.match(/\(([^)]+)\)/g);
        
        const categoryA = matchesA ? matchesA[matchesA.length - 1].replace(/[()]/g, '').toLowerCase().trim() : '';
        const categoryB = matchesB ? matchesB[matchesB.length - 1].replace(/[()]/g, '').toLowerCase().trim() : '';
        
        const orderA = categoryOrder[categoryA] || 999;
        const orderB = categoryOrder[categoryB] || 999;
        
        // First sort by category order
        if (orderA !== orderB) {
          return orderA - orderB;
        }
        
        // If same category, sort alphabetically by full event name
        return a.localeCompare(b);
      });
    };

    const eventParticipants = allParticipants.filter(p => p.talentTestEventId === eventId);
    const eventTeams = allTeams.filter(t => t.talentTestEventId === eventId);

    setStats({
      participants: eventParticipants.length,
      teams: eventTeams.length,
      totalParticipants: allParticipants.length,
      totalTeams: allTeams.length
    });

    // Build unique event-category combinations for this talent test event
    const eventCategoryCombos = new Set();
    for (const p of eventParticipants) {
      const pEventIds = p.eventIds || (p.eventId ? [p.eventId] : []);
      for (const eventId of pEventIds) {
        const key = `${eventId}-${p.ageCategory}`;
        eventCategoryCombos.add(key);
      }
    }

    // Build unique group event IDs for this talent test event
    const eventGroupCombos = new Set();
    for (const team of eventTeams) {
      if (team.groupEventId) {
        eventGroupCombos.add(team.groupEventId);
      }
    }

    // Check status for all individual event combinations in parallel
    const lockCheckPromises = Array.from(eventCategoryCombos).map(async (combo) => {
      const [eventId, category] = combo.split('-');
      const isLocked = await FirebaseService.areAllJudgesLocked(eventId, category);
      const isDeclared = declaredResults.some(
        r => r.eventId === eventId && r.category === category
      );
      
      const individualEvent = allEvents.find(e => e.id === eventId);
      return {
        combo,
        isLocked,
        isDeclared,
        eventName: individualEvent?.name,
        category,
        isGroup: false
      };
    });

    const results = await Promise.all(lockCheckPromises);

    // Check group event locks (already loaded)
    
    const groupLockCheckPromises = Array.from(eventGroupCombos).map(async (groupEventId) => {
      const groupEvent = allGroupEvents.find(ge => String(ge.id) === String(groupEventId));
      if (!groupEvent) return null;
      
      let isLocked = false;
      if (groupEvent.scoringType === 'quiz') {
        isLocked = groupEventLocks.some(lock => 
          (String(lock.groupEventId) === String(groupEventId)) && lock.locked
        );
      } else {
        isLocked = judges.length > 0 && judges.every(judge =>
          groupEventLocks.some(lock => 
            lock.judgeName === judge.username && 
            (String(lock.groupEventId) === String(groupEventId)) && 
            lock.locked
          )
        );
      }
      
      const isDeclared = declaredResults.some(r => String(r.groupEventId) === String(groupEventId));
      
      return {
        combo: groupEventId,
        isLocked,
        isDeclared,
        eventName: groupEvent.name,
        category: null,
        isGroup: true
      };
    });
    
    const groupResults = (await Promise.all(groupLockCheckPromises)).filter(r => r !== null);
    
    // Combine individual and group results
    const allResults = [...results, ...groupResults];
    
    // Build pending, locked, and declared scores lists
    const pendingCombinations = allResults
      .filter(r => !r.isLocked && !r.isDeclared && r.eventName)
      .map(r => r.isGroup ? `${r.eventName} (Group)` : `${r.eventName} (${r.category})`);
    
    const lockedCombinations = allResults
      .filter(r => r.isLocked && !r.isDeclared && r.eventName)
      .map(r => r.isGroup ? `${r.eventName} (Group)` : `${r.eventName} (${r.category})`);
    
    const declaredCombinations = allResults
      .filter(r => r.isDeclared && r.eventName)
      .map(r => r.isGroup ? `${r.eventName} (Group)` : `${r.eventName} (${r.category})`);

    setPendingScores(sortEventsByCategory(pendingCombinations));
    setLockedScores(sortEventsByCategory(lockedCombinations));
    setDeclaredScores(sortEventsByCategory(declaredCombinations));
  };

  const handleLogout = () => {
    logout();
    startTransition(() => {
      navigate('/admin/login');
    });
  };

  const handleBack = () => {
    navigate('/admin/dashboard');
  };

  const navigateTo = (path) => {
    navigate(path, { state: { eventId } });
  };

  const handleDeclareChampions = () => {
    // Check if there are any pending or locked (but not declared) events
    const hasPendingEvents = pendingScores.length > 0;
    const hasLockedEvents = lockedScores.length > 0;
    const totalEvents = pendingScores.length + lockedScores.length + declaredScores.length;
    
    if (totalEvents === 0) {
      alert('⚠️ No Events Found\n\nThere are no events registered for this talent test. Please add events and participants before declaring champions.');
      return;
    }
    
    if (hasPendingEvents) {
      const pendingList = pendingScores.slice(0, 5).join('\n• ');
      const moreText = pendingScores.length > 5 ? `\n• ...and ${pendingScores.length - 5} more` : '';
      
      alert(
        `⚠️ Incomplete Events Detected\n\n` +
        `${pendingScores.length} event${pendingScores.length > 1 ? 's are' : ' is'} still in progress:\n\n` +
        `• ${pendingList}${moreText}\n\n` +
        `Please ensure all judges have completed scoring and locked their results before declaring champions.`
      );
      return;
    }
    
    if (hasLockedEvents) {
      const lockedList = lockedScores.slice(0, 5).join('\n• ');
      const moreText = lockedScores.length > 5 ? `\n• ...and ${lockedScores.length - 5} more` : '';
      
      alert(
        `⚠️ Results Not Declared\n\n` +
        `${lockedScores.length} event${lockedScores.length > 1 ? 's have' : ' has'} been locked but not officially declared:\n\n` +
        `• ${lockedList}${moreText}\n\n` +
        `Please declare the results for all events before declaring overall champions.`
      );
      return;
    }
    
    // All events are declared - show confirmation
    const confirmMessage = 
      `🏆 Declare Overall Champions?\n\n` +
      `✅ All ${declaredScores.length} event${declaredScores.length > 1 ? 's have' : ' has'} been declared\n\n` +
      `This will finalize the competition and declare:\n` +
      `• Section Champions\n` +
      `• Church Champions\n` +
      `• Individual Champions\n\n` +
      `Do you want to proceed to the leaderboard?`;
    
    if (window.confirm(confirmMessage)) {
      navigateTo('/admin/leaderboard');
    }
  };

  if (!event) {
    return (
      <div className="event-detail-container">
        <p>Loading...</p>
      </div>
    );
  }

  const getEventStatus = () => {
    if (!event.startDate || !event.endDate) return 'draft';
    
    const now = new Date();
    const start = new Date(event.startDate);
    const end = new Date(event.endDate);
    
    if (now < start) return 'upcoming';
    if (now > end) return 'completed';
    return 'active';
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not set';
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const status = getEventStatus();

  return (
    <div className="event-detail-container">
      <div className="header">
        <div>
          <button onClick={handleBack} className="btn-back">
            ← Back to Events
          </button>
          <h1>{event.name}</h1>
          <div className="event-meta">
            <span className={`status-badge status-${status}`}>
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
            {event.registrationOpen && status !== 'completed' && (
              <span className="status-badge registration-open">
                Registration Open
              </span>
            )}
          </div>
        </div>
        <div className="header-actions">
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </div>

      {(pendingScores.length > 0 || lockedScores.length > 0 || declaredScores.length > 0) && (
        <div className="notifications-banner-grid">
          {pendingScores.length > 0 && (
            <div className="pending-notification-banner">
              <div className="notification-icon">⏳</div>
              <div className="notification-content">
                <strong>{pendingScores.length} Event{pendingScores.length > 1 ? 's' : ''} In Progress</strong>
                <p>Judging in progress for the following events:</p>
                <ul className="locked-events-list">
                  {pendingScores.map((eventName, index) => (
                    <li key={index}>{eventName}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {lockedScores.length > 0 && (
            <div className="locked-notification-banner">
              <div className="notification-icon">🔒</div>
              <div className="notification-content">
                <strong>{lockedScores.length} Event{lockedScores.length > 1 ? 's' : ''} Locked by All Judges</strong>
                <p>The following events are ready for result declaration:</p>
                <ul className="locked-events-list">
                  {lockedScores.map((eventName, index) => (
                    <li key={index}>{eventName}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {declaredScores.length > 0 && (
            <div className="declared-notification-banner">
              <div className="notification-icon">✅</div>
              <div className="notification-content">
                <strong>{declaredScores.length} Event{declaredScores.length > 1 ? 's' : ''} Declared</strong>
                <p>Results have been officially declared for:</p>
                <ul className="locked-events-list">
                  {declaredScores.map((eventName, index) => (
                    <li key={index}>{eventName}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}

      {event.description && (
        <div className="event-info-card">
          <p className="event-description">{event.description}</p>
          <div className="event-details-grid">
            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <div>
                <div className="detail-label">Start Date</div>
                <div className="detail-value">{formatDate(event.startDate)}</div>
              </div>
            </div>
            <div className="detail-item">
              <span className="detail-icon">📅</span>
              <div>
                <div className="detail-label">End Date</div>
                <div className="detail-value">{formatDate(event.endDate)}</div>
              </div>
            </div>
            {event.venue && (
              <div className="detail-item">
                <span className="detail-icon">📍</span>
                <div>
                  <div className="detail-label">Venue</div>
                  <div className="detail-value">{event.venue}</div>
                </div>
              </div>
            )}
            {event.maxParticipants > 0 && (
              <div className="detail-item">
                <span className="detail-icon">👥</span>
                <div>
                  <div className="detail-label">Max Participants</div>
                  <div className="detail-value">{event.maxParticipants}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="stats-overview">
        <div className="stat-card">
          <div className="stat-icon">👤</div>
          <div className="stat-content">
            <div className="stat-number">{stats.participants}</div>
            <div className="stat-label">Participants</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-content">
            <div className="stat-number">{stats.teams}</div>
            <div className="stat-label">Group Teams</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-number">{stats.participants + stats.teams}</div>
            <div className="stat-label">Total Entries</div>
          </div>
        </div>
      </div>

      <div className="actions-grid">
        <div className="action-card" onClick={() => navigateTo('/admin/participants')}>
          <div className="action-icon">👤</div>
          <h3>Participants</h3>
          <p>Manage individual participants and their registrations</p>
          <div className="action-count">{stats.participants} registered</div>
        </div>

        <div className="action-card" onClick={() => navigateTo('/admin/group-teams')}>
          <div className="action-icon">👥</div>
          <h3>Group Teams</h3>
          <p>Manage team registrations and members</p>
          <div className="action-count">{stats.teams} teams</div>
        </div>

        <div className="action-card" onClick={() => navigateTo('/admin/results')}>
          <div className="action-icon">📊</div>
          <h3>Results View</h3>
          <p>View and manage competition results</p>
          <div className="action-badge">View Results</div>
        </div>

        <div className="action-card" onClick={() => navigateTo('/admin/group-results')}>
          <div className="action-icon">🏆</div>
          <h3>Group Results</h3>
          <p>View team competition results</p>
          <div className="action-badge">View Results</div>
        </div>

        <div className="action-card" onClick={() => navigateTo('/admin/leaderboard')}>
          <div className="action-icon">🥇</div>
          <h3>Leaderboard</h3>
          <p>View overall rankings and standings</p>
          <div className="action-badge">View Rankings</div>
        </div>

        <div className="action-card" onClick={() => navigateTo('/admin/individual-results')}>
          <div className="action-icon">🔍</div>
          <h3>Individual Results</h3>
          <p>Filter and view detailed individual results by section and church</p>
          <div className="action-badge">Search Results</div>
        </div>

        <div className="action-card highlight-card" onClick={handleDeclareChampions}>
          <div className="action-icon">👑</div>
          <h3>Declare Champions</h3>
          <p>Finalize and declare the overall champions</p>
          <div className="action-badge declare-badge">Declare Winners</div>
        </div>

        <div className="action-card" onClick={() => navigateTo('/admin/printable-results')}>
          <div className="action-icon">🖨️</div>
          <h3>Print Results</h3>
          <p>Generate printable result sheets</p>
          <div className="action-badge">Print</div>
        </div>
      </div>
    </div>
  );
};

export default EventDetailView;
