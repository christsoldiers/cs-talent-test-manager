import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FirebaseServiceWithoutLoading as FirebaseService } from '../services/FirebaseService';
import './Home.css';

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

const Home = () => {
  const [resultsMarquee, setResultsMarquee] = useState({
    sectionChampions: [],
    churchChampions: [],
    individualChampions: []
  });
  const [showMarquee, setShowMarquee] = useState(false);
  const [news, setNews] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedNews, setSelectedNews] = useState(null);
  const [selectedEvent, setSelectedEvent] = useState(null);

  useEffect(() => {
    loadNewsAndEvents();
  }, []);

  const loadNewsAndEvents = async () => {
    try {
      // Show cached data immediately if available for better UX
      const cachedNews = localStorage.getItem('home_news');
      const cachedEvents = localStorage.getItem('home_events');
      
      if (cachedNews && cachedEvents) {
        setNews(JSON.parse(cachedNews));
        setUpcomingEvents(JSON.parse(cachedEvents));
        setLoading(false);
      }

      // Always fetch fresh data (stale-while-revalidate pattern)
      const [newsData, eventsData] = await Promise.all([
        FirebaseService.getNews(),
        FirebaseService.getUpcomingEvents()
      ]);

      // Update state with fresh data
      const freshNews = newsData.slice(0, 2); // Show only 2 news items
      const freshEvents = eventsData.slice(0, 3); // Show only 3 events
      
      setNews(freshNews);
      setUpcomingEvents(freshEvents);

      // Update cache
      localStorage.setItem('home_news', JSON.stringify(freshNews));
      localStorage.setItem('home_events', JSON.stringify(freshEvents));
      localStorage.setItem('home_cache_timestamp', Date.now().toString());
      
      setLoading(false);
    } catch (error) {
      console.error('Error loading news and events:', error);
      setLoading(false);
    }
  };

  // useEffect(() => {
  //   calculateResults();
  // }, []);

  const calculateResults = async () => {
    // Commented out to prevent API calls on home page load
    /*
    const {
      participants,
      scores: allScores,
      sections,
      declaredResults,
      groupTeams,
      groupEvents,
      pointsConfig,
      groupEventLocks,
      judges
    } = await FirebaseService.getPresentationData();

    // Calculate points for each participant
    const participantPoints = {};
    
    for (const participant of participants) {
      const eventIds = participant.eventIds || (participant.eventId ? [parseInt(participant.eventId)] : []);
      
      for (const eventId of eventIds) {
        const category = participant.ageCategory;
        
        // Check if this result is declared
        const isDeclared = declaredResults.some(
          r => r.eventId === eventId && r.category === category
        );
        
        if (!isDeclared) continue; // Skip if not declared
        
        const isLocked = await FirebaseService.areAllJudgesLocked(eventId, category);
        
        if (!isLocked) continue;
        
        const eventParticipants = participants.filter(p => {
          const pEventIds = p.eventIds || (p.eventId ? [parseInt(p.eventId)] : []);
          return pEventIds.includes(eventId) && p.ageCategory === category;
        });
        
        const results = eventParticipants.map(p => {
          const participantScores = allScores.filter(
            s => s.participantId === p.id && s.eventId === eventId
          );
          
          const judgeScores = participantScores.map(s => s.totalScore);
          const totalScore = judgeScores.reduce((sum, score) => sum + score, 0);
          const averageScore = judgeScores.length > 0 ? totalScore / judgeScores.length : 0;
          
          return {
            participantId: p.id,
            averageScore
          };
        });
        
        results.sort((a, b) => b.averageScore - a.averageScore);
        
        results.forEach((result, index) => {
          if (result.participantId === participant.id) {
            const rank = index + 1;
            let points = 0;
            
            if (rank === 1) points = pointsConfig.individual.first;
            else if (rank === 2) points = pointsConfig.individual.second;
            else if (rank === 3) points = pointsConfig.individual.third;
            
            if (!participantPoints[participant.id]) {
              participantPoints[participant.id] = {
                participant,
                totalPoints: 0
              };
            }
            
            participantPoints[participant.id].totalPoints += points;
          }
        });
      }
    }

    // Calculate section champions
    const sectionScores = {};
    sections.forEach(section => {
      sectionScores[section.name] = {
        section: section.name,
        totalPoints: 0
      };
    });
    
    // Add individual event points
    Object.values(participantPoints).forEach(({ participant, totalPoints }) => {
      if (participant.section && sectionScores[participant.section]) {
        sectionScores[participant.section].totalPoints += totalPoints;
      }
    });
    
    // Add group event points
    // groupEventLocks already loaded from getPresentationData
    // judges already loaded from getPresentationData
    
    console.log('Home - Group Events:', groupEvents.length);
    console.log('Home - Group Teams:', groupTeams.length);
    console.log('Home - Group Locks:', groupEventLocks);
    console.log('Home - Judges:', judges);
    console.log('Home - Declared Results:', declaredResults);
    
    groupEvents.forEach(groupEvent => {
      // Check if this group event is declared
      const isDeclared = declaredResults.some(r => String(r.groupEventId) === String(groupEvent.id));
      
      console.log(`Home - Group Event ${groupEvent.name} (ID: ${groupEvent.id}): isDeclared=${isDeclared}`);
      
      if (!isDeclared) return;
      
      // Check if all judges have locked this group event
      let isLocked = false;
      if (groupEvent.scoringType === 'quiz') {
        isLocked = groupEventLocks.some(lock => 
          String(lock.groupEventId) === String(groupEvent.id) && lock.locked
        );
      } else {
        isLocked = judges.length > 0 && judges.every(judge =>
          groupEventLocks.some(lock => 
            lock.judgeName === judge.username && 
            String(lock.groupEventId) === String(groupEvent.id) && 
            lock.locked
          )
        );
      }
      
      console.log(`Home - Group Event ${groupEvent.name}: isLocked=${isLocked}, scoringType=${groupEvent.scoringType}`);
      
      if (!isLocked) return;
      
      // Get all teams for this event
      const eventTeams = groupTeams.filter(t => String(t.groupEventId) === String(groupEvent.id));
      
      console.log(`Home - Teams for ${groupEvent.name}:`, eventTeams.length, eventTeams);
      
      // Calculate results
      const results = eventTeams.map(team => {
        const teamScores = team.scores || [];
        let totalScore = 0;
        let judgeCount = 0;
        
        if (groupEvent.scoringType === 'quiz') {
          const quizScore = teamScores.find(s => s.score !== undefined && s.score !== null);
          totalScore = quizScore ? parseFloat(quizScore.score) : 0;
          judgeCount = quizScore ? 1 : 0;
        } else {
          teamScores.forEach(score => {
            if (score.score !== undefined && score.score !== null) {
              totalScore += parseFloat(score.score);
              judgeCount++;
            }
          });
        }
        
        const averageScore = judgeCount > 0 ? 
          (groupEvent.scoringType === 'quiz' ? totalScore : totalScore / judgeCount) : 0;
        
        console.log(`Home - Team ${team.teamName} (Section: ${team.sectionId}): scores=${JSON.stringify(teamScores)}, total=${totalScore}, judges=${judgeCount}, avg=${averageScore}`);
        
        return {
          teamId: team.id,
          sectionId: team.sectionId,
          teamName: team.teamName,
          averageScore
        };
      });
      
      // Sort by average score
      results.sort((a, b) => b.averageScore - a.averageScore);
      
      console.log(`Home - Sorted results for ${groupEvent.name}:`, results);
      
      // Assign points based on rank
      results.forEach((result, index) => {
        const rank = index + 1;
        let points = 0;
        
        if (rank === 1) points = pointsConfig.group.first;
        else if (rank === 2) points = pointsConfig.group.second;
        else if (rank === 3) points = pointsConfig.group.third;
        
        console.log(`Home - Rank ${rank} - Team ${result.teamName}: ${points} points`);
        
        // Find section name for this team
        const section = sections.find(s => s.id === result.sectionId);
        if (section && sectionScores[section.name]) {
          console.log(`Home - Adding ${points} points to section ${section.name}`);
          sectionScores[section.name].totalPoints += points;
        } else {
          console.log(`Home - Section not found for sectionId: ${result.sectionId}, available sections:`, sections);
        }
      });
    });
    
    console.log('Home - Final Section Scores:', sectionScores);
    
    const sectionChampions = Object.values(sectionScores)
      .filter(s => s.totalPoints > 0)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 3);

    // Calculate church champions
    const churchScores = {};
    
    Object.values(participantPoints).forEach(({ participant, totalPoints }) => {
      if (participant.churchName) {
        if (!churchScores[participant.churchName]) {
          churchScores[participant.churchName] = {
            church: participant.churchName,
            section: participant.section,
            totalPoints: 0
          };
        }
        
        churchScores[participant.churchName].totalPoints += totalPoints;
      }
    });
    
    const churchChampions = Object.values(churchScores)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 3);

    // Calculate individual champions
    const individualChampions = Object.values(participantPoints)
      .sort((a, b) => b.totalPoints - a.totalPoints)
      .slice(0, 3);

    setResultsMarquee({
      sectionChampions,
      churchChampions,
      individualChampions
    });

    // Show marquee only if there are declared results
    const hasData = sectionChampions.length > 0 || 
                    churchChampions.length > 0 || 
                    individualChampions.length > 0;
    const hasDeclarations = declaredResults.length > 0;
    
    setShowMarquee(hasData && hasDeclarations);
    */
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '';
  };

  const trimContent = (content, maxLength = 120) => {
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength) + '...';
  };

  const createMarkup = (htmlContent) => {
    return { __html: htmlContent };
  };

  const stripHtmlTags = (html) => {
    // Just return the plain text without stripping, as we're not using HTML anymore
    return html;
  };

  const openNewsModal = (article) => {
    setSelectedNews(article);
    document.body.style.overflow = 'hidden';
  };

  const closeNewsModal = () => {
    setSelectedNews(null);
    document.body.style.overflow = 'auto';
  };

  const openEventModal = (event) => {
    setSelectedEvent(event);
    document.body.style.overflow = 'hidden';
  };

  const closeEventModal = () => {
    setSelectedEvent(null);
    document.body.style.overflow = 'auto';
  };

  const formatEventDateRange = (event) => {
    if (!event.startDate) return '';
    const start = new Date(event.startDate);
    const end = event.endDate ? new Date(event.endDate) : null;
    
    if (!end || start.getTime() === end.getTime()) {
      // Single day event
      return start.toLocaleDateString('en-US', { 
        weekday: 'long',
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
    
    // Multi-day event
    const startStr = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const endStr = end.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
    
    if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
      return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
    }
    
    return `${startStr} - ${endStr}`;
  };

  return (
    <div className="home-page">
      {/* Marquee section hidden - commented out API calls
      {showMarquee && (
        <div className="results-marquee-container">
          <div className="results-marquee">
            <div className="marquee-content">
              <span className="marquee-header">⭐ CHRIST SOLDIERS TALENT TEST RESULTS ⭐</span>
              <span className="marquee-separator">•</span>
              
              {resultsMarquee.sectionChampions.length > 0 && (
                <>
                  <span className="marquee-title">🏆 SECTION LEADERBOARD:</span>
                  {resultsMarquee.sectionChampions.map((item, index) => (
                    <span key={`section-${index}`} className="marquee-item">
                      {getMedalEmoji(index)} {item.section} - {item.totalPoints} pts
                    </span>
                  ))}
                  <span className="marquee-separator">•</span>
                </>
              )}
              
              {resultsMarquee.churchChampions.length > 0 && (
                <>
                  <span className="marquee-title">⛪ CHURCH LEADERBOARD:</span>
                  {resultsMarquee.churchChampions.map((item, index) => (
                    <span key={`church-${index}`} className="marquee-item">
                      {getMedalEmoji(index)} {item.church} - {item.totalPoints} pts
                    </span>
                  ))}
                  <span className="marquee-separator">•</span>
                </>
              )}
              
              {resultsMarquee.individualChampions.length > 0 && (
                <>
                  <span className="marquee-title">👤 INDIVIDUAL LEADERBOARD:</span>
                  {resultsMarquee.individualChampions.map((item, index) => (
                    <span key={`individual-${index}`} className="marquee-item">
                      {getMedalEmoji(index)} {item.participant.name} ({item.participant.section}) - {item.totalPoints} pts
                    </span>
                  ))}
                  <span className="marquee-separator">•</span>
                </>
              )}
              
              {/* Repeat content for seamless loop *\/}
              {resultsMarquee.sectionChampions.length > 0 && (
                <>
                  <span className="marquee-title">🏆 SECTION LEADERBOARD:</span>
                  {resultsMarquee.sectionChampions.map((item, index) => (
                    <span key={`section-repeat-${index}`} className="marquee-item">
                      {getMedalEmoji(index)} {item.section} - {item.totalPoints} pts
                    </span>
                  ))}
                  <span className="marquee-separator">•</span>
                </>
              )}
              
              {resultsMarquee.churchChampions.length > 0 && (
                <>
                  <span className="marquee-title">⛪ CHURCH LEADERBOARD:</span>
                  {resultsMarquee.churchChampions.map((item, index) => (
                    <span key={`church-repeat-${index}`} className="marquee-item">
                      {getMedalEmoji(index)} {item.church} - {item.totalPoints} pts
                    </span>
                  ))}
                  <span className="marquee-separator">•</span>
                </>
              )}
              
              {resultsMarquee.individualChampions.length > 0 && (
                <>
                  <span className="marquee-title">👤 INDIVIDUAL LEADERBOARD:</span>
                  {resultsMarquee.individualChampions.map((item, index) => (
                    <span key={`individual-repeat-${index}`} className="marquee-item">
                      {getMedalEmoji(index)} {item.participant.name} ({item.participant.section}) - {item.totalPoints} pts
                    </span>
                  ))}
                </>
              )}
            </div>
          </div>
        </div>
      )}
      */}

      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-icon">✨🕊️✨</div>
          <h1>Welcome to Christ Soldiers and Sunday School Association</h1>
          <p className="hero-subtitle">⛪ Youth Wing of Bethel Gospel Assembly Church</p>
          <p className="hero-description">
            Empowering young believers to serve Christ with passion and purpose
          </p>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-icon">👥</span>
              <span className="stat-number">500+</span>
              <span className="stat-label">Active Members</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <span className="stat-number">50+</span>
              <span className="stat-label">Events Annually</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">🏆</span>
              <span className="stat-number">15+</span>
              <span className="stat-label">Sections</span>
            </div>
          </div>
        </div>
      </section>

      <section className="info-section">
        <h2 className="section-title">🌟 About Christ Soldiers</h2>
        <div className="info-grid">
          <div className="info-card mission-card">
            <div className="card-icon">🎯</div>
            <h3>Our Mission</h3>
            <p>
              To nurture and equip young people to become passionate followers of Christ,
              dedicated to serving God and their community.
            </p>
          </div>
          <div className="info-card vision-card">
            <div className="card-icon">🔭</div>
            <h3>Our Vision</h3>
            <p>
              To raise a generation of Christ-centered youth who will impact the world
              through faith, love, and service.
            </p>
          </div>
          <div className="info-card involved-card">
            <div className="card-icon">🤝</div>
            <h3>Get Involved</h3>
            <p>
              Join us in our various programs, events, and activities designed to
              strengthen your faith and develop your talents.
            </p>
          </div>
        </div>
      </section>

      <section className="upcoming-events">
        <h2>📅 Upcoming Events</h2>
        {loading ? (
          <div className="loading-placeholder">Loading events...</div>
        ) : upcomingEvents.length > 0 ? (
          <div className="events-grid">
            {upcomingEvents.map(event => {
              const startDate = event.startDate ? new Date(event.startDate) : (event.date ? new Date(event.date) : null);
              
              return (
                <div key={event.id} className={`event-card ${event.type || 'talent-event'}`}>
                  <div className="event-details">
                    <div className="event-icon">{event.icon || '📅'}</div>
                    <h4>{event.title}</h4>
                    <p className="event-description">{trimContent(stripHtmlTags(event.description), 100)}</p>
                    <p className="event-date-range">📅 {formatEventDateRange(event)}</p>
                    {event.time && <span className="event-time">⏰ {event.time}</span>}
                    {event.location && <span className="event-location">📍 {event.location}</span>}
                    <button className="event-learn-more" onClick={() => openEventModal(event)}>Learn More</button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="empty-state">
            <p>No upcoming events at the moment. Check back soon!</p>
          </div>
        )}
      </section>

      <section className="news-section">
        <h2>📰 Recent News & Updates</h2>
        {loading ? (
          <div className="loading-placeholder">Loading news...</div>
        ) : news.length > 0 ? (
          <div className="news-grid">
            {news.map(article => (
              <article key={article.id} className={`news-item ${article.isFeatured ? 'featured-news' : ''}`}>
                {article.isFeatured && <div className="news-badge">🔥 Featured</div>}
                {!article.isFeatured && article.badge && <div className="news-badge">{article.badge}</div>}
                <div className="news-icon">{article.icon || '📝'}</div>
                <h4>{article.title}</h4>
                <p className="news-date">📅 {new Date(article.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                <p className="news-preview">{trimContent(stripHtmlTags(article.content))}</p>
                <button className="news-read-more" onClick={() => openNewsModal(article)}>Read More →</button>
              </article>
            ))}
          </div>
        ) : (
          <div className="empty-state">
            <p>No news available at the moment. Check back soon!</p>
          </div>
        )}
      </section>

      <section className="cta-section">
        <div className="cta-content">
          <h2>🌟 Join Our Community Today!</h2>
          <p>Be part of a vibrant community of young believers making a difference</p>
          <div className="cta-buttons">
            <button className="cta-button primary">Get Started</button>
            <button className="cta-button secondary">Learn More</button>
          </div>
        </div>
      </section>

      <section className="testimonials-section">
        <h2>💬 What Our Members Say</h2>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="quote-icon">❝</div>
            <p className="testimonial-text">
              "Christ Soldiers has been a blessing in my life. The talent test helped me discover and develop my God-given gifts!"
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">👤</div>
              <div className="author-info">
                <strong>Sarah Johnson</strong>
                <span>Active Member Since 2023</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="quote-icon">❝</div>
            <p className="testimonial-text">
              "The fellowship and spiritual growth I've experienced here is amazing. This ministry truly makes an impact!"
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">👤</div>
              <div className="author-info">
                <strong>David Martin</strong>
                <span>Youth Leader</span>
              </div>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="quote-icon">❝</div>
            <p className="testimonial-text">
              "From worship sessions to community outreach, every event is filled with purpose and joy. Highly recommend!"
            </p>
            <div className="testimonial-author">
              <div className="author-avatar">👤</div>
              <div className="author-info">
                <strong>Emily Thomas</strong>
                <span>Volunteer Coordinator</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* News Article Modal */}
      {selectedNews && (
        <div className="news-modal-overlay" onClick={closeNewsModal}>
          <div className="news-modal-paper" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeNewsModal}>
              ✕
            </button>
            <div className="paper-header">
              <div className="paper-icon">{selectedNews.icon || '📝'}</div>
              <h2 className="paper-title">{selectedNews.title}</h2>
              {selectedNews.isFeatured && <div className="paper-badge featured">🔥 Featured</div>}
              {!selectedNews.isFeatured && selectedNews.badge && (
                <div className="paper-badge">{selectedNews.badge}</div>
              )}
              <p className="paper-date">
                📅 {new Date(selectedNews.date).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'long', 
                  day: 'numeric' 
                })}
              </p>
            </div>
            <div className="paper-divider"></div>
            <div className="paper-content">
              <div className="preserve-whitespace">{selectedNews.content}</div>
            </div>
            <div className="paper-footer">
              <span>📰 Christ Soldiers News</span>
            </div>
          </div>
        </div>
      )}

      {/* Event Detail Modal */}
      {selectedEvent && (
        <div className="event-modal-overlay" onClick={closeEventModal}>
          <div className="event-modal-card" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={closeEventModal}>
              ✕
            </button>
            <div className="event-modal-header">
              <div className="event-modal-icon">{selectedEvent.icon || '📅'}</div>
              <h2 className="event-modal-title">{selectedEvent.title}</h2>
              <div className="event-modal-type-badge">{selectedEvent.type}</div>
            </div>
            <div className="event-modal-divider"></div>
            <div className="event-modal-details">
              <div className="event-modal-info-row">
                <span className="event-info-label">📅 Date</span>
                <span className="event-info-value">{formatEventDateRange(selectedEvent)}</span>
              </div>
              {selectedEvent.time && (
                <div className="event-modal-info-row">
                  <span className="event-info-label">⏰ Time</span>
                  <span className="event-info-value">{selectedEvent.time}</span>
                </div>
              )}
              {selectedEvent.location && (
                <div className="event-modal-info-row">
                  <span className="event-info-label">📍 Location</span>
                  <span className="event-info-value">
                    {selectedEvent.googleMapsUrl ? (
                      <a href={selectedEvent.googleMapsUrl} target="_blank" rel="noopener noreferrer" className="location-link">
                        {selectedEvent.location} <span className="external-link-icon">↗</span>
                      </a>
                    ) : (
                      selectedEvent.location
                    )}
                  </span>
                </div>
              )}
              <div className="event-modal-description">
                <h3>About This Event</h3>
                <div className="preserve-whitespace">{selectedEvent.description}</div>
              </div>
            </div>
            <div className="event-modal-footer">
              <button className="event-modal-register-btn">Register Now</button>
              <button className="event-modal-close-btn" onClick={closeEventModal}>Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer */}
      <footer className="home-footer">
        <div className="footer-content">
          <div className="footer-section">
            <h3>🕊️ Christ Soldiers & Sunday School Association</h3>
            <p>BGA Youth Wing - Empowering youth through faith and fellowship</p>
          </div>
          <div className="footer-section">
            <h4>Quick Links</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/events">Events</Link></li>
              <li><Link to="/gallery">Gallery</Link></li>
              <li><Link to="/contact">Contact</Link></li>
            </ul>
          </div>
          <div className="footer-section">
            <h4>Admin</h4>
            <Link to="/admin/login" className="admin-portal-link">
              🔐 Admin Portal
            </Link>
          </div>
        </div>
        <div className="footer-bottom">
          <p>&copy; {new Date().getFullYear()} Christ Soldiers & Sunday School Association. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Home;
