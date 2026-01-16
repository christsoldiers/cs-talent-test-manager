import React, { useState, useEffect, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import FirebaseService from '../../services/FirebaseService';
import './EventDashboard.css';

const EventDashboard = () => {
  const [talentTestEvents, setTalentTestEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({});
  const [lockedEvents, setLockedEvents] = useState({});
  const [declaredEvents, setDeclaredEvents] = useState({});
  const [pendingEvents, setPendingEvents] = useState({});
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
    const events = await FirebaseService.getTalentTestEvents();
    setTalentTestEvents(events);
    
    // Load categories for sorting
    const allCategories = await FirebaseService.getCategories();
    const sortedCategories = allCategories.sort((a, b) => (a.order || 0) - (b.order || 0));
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

    // Calculate stats for each event
    const allParticipants = await FirebaseService.getParticipants();
    const allTeams = await FirebaseService.getGroupTeams();
    const allEvents = await FirebaseService.getEvents();
    const allGroupEvents = await FirebaseService.getGroupEvents();
    const declaredResults = await FirebaseService.getDeclaredResults();

    const eventStats = {};
    const eventLocks = {};
    const eventDeclared = {};
    const eventPending = {};
    
    // Cache for status to avoid redundant API calls
    const lockedCache = new Map();
    const groupLockedCache = new Map();
    
    // Build a map of event-category combinations that exist
    const eventCategoryCombos = new Map();
    const eventGroupCombos = new Map();
    
    for (const event of events) {
      const eventParticipants = allParticipants.filter(p => p.talentTestEventId === event.id);
      const eventTeams = allTeams.filter(t => t.talentTestEventId === event.id);
      
      eventStats[event.id] = {
        participants: eventParticipants.length,
        teams: eventTeams.length,
        total: eventParticipants.length + eventTeams.length
      };

      // Build unique event-category combinations for this talent test event
      const combos = new Set();
      for (const p of eventParticipants) {
        const pEventIds = p.eventIds || (p.eventId ? [p.eventId] : []);
        for (const eventId of pEventIds) {
          const key = `${eventId}-${p.ageCategory}`;
          combos.add(key);
        }
      }
      eventCategoryCombos.set(event.id, combos);
      
      // Build group event combinations
      const groupCombos = new Set();
      for (const team of eventTeams) {
        if (team.groupEventId) {
          groupCombos.add(String(team.groupEventId));
        }
      }
      eventGroupCombos.set(event.id, groupCombos);
    }

    // Batch check all unique event-category combinations across all talent test events
    const allCombosToCheck = new Set();
    for (const combos of eventCategoryCombos.values()) {
      for (const combo of combos) {
        allCombosToCheck.add(combo);
      }
    }

    // Check locked status for all combinations in parallel
    const lockCheckPromises = Array.from(allCombosToCheck).map(async (combo) => {
      const [eventId, category] = combo.split('-');
      const isLocked = await FirebaseService.areAllJudgesLocked(eventId, category);
      const isDeclared = declaredResults.some(
        r => r.eventId === eventId && r.category === category
      );
      
      lockedCache.set(combo, { isLocked, isDeclared });
    });

    await Promise.all(lockCheckPromises);

    // Check group event locks
    const allGroupCombosToCheck = new Set();
    for (const combos of eventGroupCombos.values()) {
      for (const combo of combos) {
        allGroupCombosToCheck.add(combo);
      }
    }
    
    // Fetch judges once for all group events
    const judges = await FirebaseService.getJudges();
    const groupEventLocks = await FirebaseService.getGroupEventLocks();
    
    console.log('Debug - Group Event Locks:', groupEventLocks);
    console.log('Debug - Declared Results:', declaredResults);
    console.log('Debug - All Group Combos:', Array.from(allGroupCombosToCheck));
    
    const groupLockCheckPromises = Array.from(allGroupCombosToCheck).map(async (groupEventId) => {
      const groupEvent = allGroupEvents.find(ge => String(ge.id) === String(groupEventId));
      if (!groupEvent) {
        console.log(`Debug - Group event not found for ID: ${groupEventId}`);
        return;
      }
      
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
      
      console.log(`Debug - Group Event ${groupEvent.name} (ID: ${groupEventId}): locked=${isLocked}, declared=${isDeclared}`);
      
      groupLockedCache.set(groupEventId, { isLocked, isDeclared });
    });
    
    await Promise.all(groupLockCheckPromises);

    // Now build the locked, declared, and pending events for each talent test event using the cache
    for (const event of events) {
      const combos = eventCategoryCombos.get(event.id);
      const groupCombos = eventGroupCombos.get(event.id);
      const lockedCombinations = new Set();
      const declaredCombinations = new Set();
      const pendingCombinations = new Set();
      
      // Process individual events
      for (const combo of combos) {
        const status = lockedCache.get(combo);
        if (status) {
          const [eventId, category] = combo.split('-');
          const individualEvent = allEvents.find(e => e.id === eventId);
          if (individualEvent) {
            const eventName = `${individualEvent.name} (${category})`;
            
            if (status.isDeclared) {
              declaredCombinations.add(eventName);
            } else if (status.isLocked) {
              lockedCombinations.add(eventName);
            } else {
              // Not locked and not declared - show as pending
              pendingCombinations.add(eventName);
            }
          }
        }
      }
      
      // Process group events
      for (const groupEventId of groupCombos) {
        const status = groupLockedCache.get(groupEventId);
        const groupEvent = allGroupEvents.find(ge => String(ge.id) === String(groupEventId));
        if (status && groupEvent) {
          const eventName = `${groupEvent.name} (Group)`;
          
          if (status.isDeclared) {
            declaredCombinations.add(eventName);
          } else if (status.isLocked) {
            lockedCombinations.add(eventName);
          } else {
            pendingCombinations.add(eventName);
          }
        }
      }

      eventLocks[event.id] = sortEventsByCategory(Array.from(lockedCombinations));
      eventDeclared[event.id] = sortEventsByCategory(Array.from(declaredCombinations));
      eventPending[event.id] = sortEventsByCategory(Array.from(pendingCombinations));
    }
    
    setStats(eventStats);
    setLockedEvents(eventLocks);
    setDeclaredEvents(eventDeclared);
    setPendingEvents(eventPending);
  };

  const handleLogout = () => {
    logout();
    startTransition(() => {
      navigate('/admin/login');
    });
  };

  const handleEventClick = (eventId) => {
    navigate(`/admin/event/${eventId}`);
  };

  const handleManageEvents = () => {
    navigate('/admin/talent-test-events');
  };

  const handleMasterData = () => {
    navigate('/admin/master-data');
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
          <p>Admin: {user?.username}</p>
        </div>
        <div className="header-actions">
          <button onClick={handleMasterData} className="btn btn-secondary">
            📊 Master Data
          </button>
          <button onClick={handleManageEvents} className="btn btn-primary">
            ⚙️ Manage Events
          </button>
          <button onClick={handleLogout} className="btn btn-logout">
            Logout
          </button>
        </div>
      </div>

      {talentTestEvents.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🎭</div>
          <h2>No Talent Test Events</h2>
          <p>Create your first talent test event to get started</p>
          <button onClick={handleManageEvents} className="btn btn-primary btn-large">
            + Create Event
          </button>
        </div>
      ) : (
        <div className="events-grid">
          {talentTestEvents.map(event => {
            const status = getEventStatus(event);
            const badge = getStatusBadge(status);
            const eventStat = stats[event.id] || { participants: 0, teams: 0, total: 0 };
            const locked = lockedEvents[event.id] || [];
            const declared = declaredEvents[event.id] || [];
            const pending = pendingEvents[event.id] || [];

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

                <div className="event-details">
                  <div className="detail-row">
                    <span className="detail-label">📅 Start:</span>
                    <span className="detail-value">{formatDate(event.startDate)}</span>
                  </div>
                  <div className="detail-row">
                    <span className="detail-label">📅 End:</span>
                    <span className="detail-value">{formatDate(event.endDate)}</span>
                  </div>
                  {event.venue && (
                    <div className="detail-row">
                      <span className="detail-label">📍 Venue:</span>
                      <span className="detail-value">{event.venue}</span>
                    </div>
                  )}
                </div>

                <div className="event-stats">
                  <div className="stat-item">
                    <span className="stat-number">{eventStat.participants}</span>
                    <span className="stat-label">Participants</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{eventStat.teams}</span>
                    <span className="stat-label">Teams</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">{eventStat.total}</span>
                    <span className="stat-label">Total</span>
                  </div>
                </div>

                {(pending.length > 0 || locked.length > 0 || declared.length > 0) && (
                  <div className="notifications-grid">
                    {pending.length > 0 && (
                      <div className="pending-notification">
                        <div className="notification-icon">⏳</div>
                        <div className="notification-content">
                          <strong>{pending.length}</strong>
                          <p className="notification-text">Pending</p>
                        </div>
                      </div>
                    )}

                    {locked.length > 0 && (
                      <div className="locked-notification">
                        <div className="notification-icon">🔒</div>
                        <div className="notification-content">
                          <strong>{locked.length}</strong>
                          <p className="notification-text">Locked</p>
                        </div>
                      </div>
                    )}

                    {declared.length > 0 && (
                      <div className="declared-notification">
                        <div className="notification-icon">✅</div>
                        <div className="notification-content">
                          <strong>{declared.length}</strong>
                          <p className="notification-text">Declared</p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="event-footer">
                  <button className="btn-view">
                    View Details →
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EventDashboard;
