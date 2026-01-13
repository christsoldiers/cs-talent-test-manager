import React from 'react';
import './Events.css';

const Events = () => {
  const upcomingEvents = [
    {
      id: 1,
      title: 'Annual Talent Test 2025',
      date: 'January 15, 2025',
      time: '10:00 AM - 5:00 PM',
      location: 'Bethel Gospel Assembly Church',
      description: 'Showcase your God-given talents in various categories including Solo Music, Story Writing, Poem Writing, and Bible Verse Competition.',
      categories: ['Solo Music (Male)', 'Solo Music (Female)', 'Story Writing', 'Poem Writing', 'Bible Verse Competition'],
      status: 'Registration Open'
    },
    {
      id: 2,
      title: 'Youth Retreat 2025',
      date: 'January 22-24, 2025',
      time: 'Friday - Sunday',
      location: 'Mountain View Retreat Center',
      description: 'A weekend filled with worship, teaching, fellowship, and outdoor activities designed to deepen your relationship with God.',
      categories: ['Worship Sessions', 'Workshops', 'Team Building', 'Prayer Meetings'],
      status: 'Coming Soon'
    },
    {
      id: 3,
      title: 'Community Outreach Day',
      date: 'February 5, 2025',
      time: '2:00 PM - 6:00 PM',
      location: 'Local Community Center',
      description: 'Join us as we serve our community through various outreach activities, food distribution, and sharing the love of Christ.',
      categories: ['Food Distribution', 'Medical Camp', 'Children\'s Program', 'Prayer Ministry'],
      status: 'Planning Stage'
    },
    {
      id: 4,
      title: 'Worship Night',
      date: 'February 12, 2025',
      time: '6:00 PM - 9:00 PM',
      location: 'Bethel Gospel Assembly Church',
      description: 'An evening dedicated to worship, praise, and experiencing God\'s presence through music and prayer.',
      categories: ['Live Worship', 'Prayer & Intercession', 'Testimonies'],
      status: 'Coming Soon'
    },
    {
      id: 5,
      title: 'Leadership Training Workshop',
      date: 'February 19, 2025',
      time: '9:00 AM - 4:00 PM',
      location: 'Church Hall',
      description: 'Equip yourself with essential leadership skills and biblical principles for effective ministry and service.',
      categories: ['Leadership Principles', 'Team Management', 'Conflict Resolution', 'Vision Casting'],
      status: 'Registration Opens Soon'
    }
  ];

  const talentTestEvents = [
    {
      name: 'Solo Music (Male)',
      description: 'Individual singing performance for male participants',
      ageGroups: ['Junior', 'Intermediate', 'Senior', 'Super Senior']
    },
    {
      name: 'Solo Music (Female)',
      description: 'Individual singing performance for female participants',
      ageGroups: ['Junior', 'Intermediate', 'Senior', 'Super Senior']
    },
    {
      name: 'Story Writing',
      description: 'Creative story writing competition based on biblical themes',
      ageGroups: ['Junior', 'Intermediate', 'Senior', 'Super Senior']
    },
    {
      name: 'Poem Writing',
      description: 'Poetry composition on faith, hope, and Christian values',
      ageGroups: ['Junior', 'Intermediate', 'Senior', 'Super Senior']
    },
    {
      name: 'Bible Verse Competition',
      description: 'Scripture memorization and recitation competition',
      ageGroups: ['Junior', 'Intermediate', 'Senior', 'Super Senior']
    }
  ];

  return (
    <div className="events-page">
      <div className="events-header">
        <h1>Events</h1>
        <p>Join us in our exciting programs and activities</p>
      </div>

      <section className="events-section">
        <h2>Upcoming Events</h2>
        <div className="events-list">
          {upcomingEvents.map(event => (
            <div key={event.id} className="event-item">
              <div className="event-status-badge" data-status={event.status}>
                {event.status}
              </div>
              <h3>{event.title}</h3>
              <div className="event-info">
                <div className="event-info-item">
                  <span className="icon">📅</span>
                  <span>{event.date}</span>
                </div>
                <div className="event-info-item">
                  <span className="icon">⏰</span>
                  <span>{event.time}</span>
                </div>
                <div className="event-info-item">
                  <span className="icon">📍</span>
                  <span>{event.location}</span>
                </div>
              </div>
              <p className="event-description">{event.description}</p>
              <div className="event-categories">
                {event.categories.map((category, index) => (
                  <span key={index} className="category-badge">{category}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="talent-test-section">
        <h2>Talent Test Event Categories</h2>
        <p className="section-description">
          Our annual talent test features the following categories across all age groups:
        </p>
        <div className="talent-test-grid">
          {talentTestEvents.map((event, index) => (
            <div key={index} className="talent-event-card">
              <h4>{event.name}</h4>
              <p>{event.description}</p>
              <div className="age-groups">
                <strong>Age Groups:</strong>
                <div className="age-badges">
                  {event.ageGroups.map((age, idx) => (
                    <span key={idx} className="age-badge">{age}</span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
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
    </div>
  );
};

export default Events;
