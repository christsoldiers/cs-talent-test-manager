import React, { useState, useEffect } from 'react';
import FirebaseService from '../services/FirebaseService';
import './Events.css';

const Events = () => {
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [talentTestEvents, setTalentTestEvents] = useState([]);
  const [ageCategories, setAgeCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadEventsData();
  }, []);

  const loadEventsData = async () => {
    setLoading(true);
    try {
      const [events, categories, ages] = await Promise.all([
        FirebaseService.getUpcomingEvents(),
        FirebaseService.getEvents(),
        FirebaseService.getCategories()
      ]);
      setUpcomingEvents(events);
      setTalentTestEvents(categories);
      setAgeCategories(ages.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error('Error loading events data:', error);
    } finally {
      setLoading(false);
    }
  };

  const trimContent = (text, maxLength = 150) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength).trim() + '...';
  };

  const openEventModal = (event) => {
    setSelectedEvent(event);
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
  };

  const formatEventDateRange = (event) => {
    if (!event.startDate) return 'Date TBA';
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : null;
    
    if (!end || start.getTime() === end.getTime()) {
      return start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
    }
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }
    
    return `${start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;
  };

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Events</h1>
        <p>Join us in our exciting programs and activities</p>
      </div>

      <section className="events-section">
        <h2>Upcoming Events</h2>
        {loading ? (
          <div className="loading-placeholder">Loading events...</div>
        ) : upcomingEvents.length > 0 ? (
          <div className="events-list">
            {upcomingEvents.map(event => (
              <div key={event.id} className="event-item">
                <h3>{event.title}</h3>
                <div className="event-info">
                  <div className="event-info-item">
                    <span className="icon">📅</span>
                    <span>{formatEventDateRange(event)}</span>
                  </div>
                  {event.time && (
                    <div className="event-info-item">
                      <span className="icon">⏰</span>
                      <span>{event.time}</span>
                    </div>
                  )}
                  {event.location && (
                    <div className="event-info-item">
                      <span className="icon">📍</span>
                      <span>{event.location}</span>
                    </div>
                  )}
                </div>
                <p className="event-description">{trimContent(event.description)}</p>
                <button className="event-details-btn" onClick={() => openEventModal(event)}>
                  View Details →
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No upcoming events at the moment. Check back soon!</p>
          </div>
        )}
      </section>

      <section className="talent-test-section">
        <h2>Talent Test Event Categories</h2>
        <p className="section-description">
          Our annual talent test features the following categories across all age groups:
        </p>
        {loading ? (
          <div className="loading-placeholder">Loading categories...</div>
        ) : talentTestEvents.length > 0 ? (
          <div className="talent-test-grid">
            {talentTestEvents.map((event, index) => (
              <div key={event.id || index} className="talent-event-card">
                <h4>{event.name}</h4>
                <p>{event.description}</p>
                {ageCategories.length > 0 && (
                  <div className="age-groups">
                    <strong>Age Categories:</strong>
                    <div className="age-badges">
                      {ageCategories.map((category) => (
                        <span key={category.id} className="age-badge">
                          {category.name} ({category.minAge}-{category.maxAge})
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>Talent test categories will be announced soon.</p>
          </div>
        )}
      </section>

      <section className="info-section">
        <div className="info-box">
          <h3>Want to Participate?</h3>
          <p>
            Registration for our events is managed through our admin portal. Contact your 
            group leader or church administrator to register for upcoming events.
          </p>
        </div>
      </section>

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="event-modal-overlay" onClick={closeEventModal}>
          <div className="event-modal" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeEventModal}>
              ✕
            </button>
            <div className="modal-header">
              <h2>{selectedEvent.title}</h2>
            </div>
            <div className="modal-body">
              <div className="modal-info-grid">
                <div className="modal-info-item">
                  <span className="icon">📅</span>
                  <div>
                    <strong>Date</strong>
                    <p>{formatEventDateRange(selectedEvent)}</p>
                  </div>
                </div>
                {selectedEvent.time && (
                  <div className="modal-info-item">
                    <span className="icon">⏰</span>
                    <div>
                      <strong>Time</strong>
                      <p>{selectedEvent.time}</p>
                    </div>
                  </div>
                )}
                {selectedEvent.location && (
                  <div className="modal-info-item">
                    <span className="icon">📍</span>
                    <div>
                      <strong>Location</strong>
                      <p>
                        {selectedEvent.googleMapsUrl ? (
                          <a href={selectedEvent.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="location-link">
                            {selectedEvent.location} ↗
                          </a>
                        ) : (
                          selectedEvent.location
                        )}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="modal-description">
                <h3>Event Details</h3>
                <div className="preserve-formatting">{selectedEvent.description}</div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Events;
