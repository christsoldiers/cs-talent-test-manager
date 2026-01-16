import React, { useState, useEffect } from 'react';
import { FirebaseServiceWithoutLoading as FirebaseService } from '../services/FirebaseService';
import './Home.css';

const Home = () => {
  const [resultsMarquee, setResultsMarquee] = useState({
    sectionChampions: [],
    churchChampions: [],
    individualChampions: []
  });
  const [showMarquee, setShowMarquee] = useState(false);

  useEffect(() => {
    calculateResults();
  }, []);

  const calculateResults = async () => {
    const participants = await FirebaseService.getParticipants();
    const allScores = await FirebaseService.getScores();
    const sections = await FirebaseService.getSections();
    const declaredResults = await FirebaseService.getDeclaredResults();
    const groupTeams = await FirebaseService.getGroupTeams();
    const groupEvents = await FirebaseService.getGroupEvents();
    const data = await FirebaseService.getData();
    const pointsConfig = data.pointsConfig || {
      individual: { first: 5, second: 3, third: 1 },
      group: { first: 10, second: 5, third: 3 }
    };

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
    const groupLocks = data.groupEventLocks || [];
    const judges = await FirebaseService.getJudges();
    
    console.log('Home - Group Events:', groupEvents.length);
    console.log('Home - Group Teams:', groupTeams.length);
    console.log('Home - Group Locks:', groupLocks);
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
        isLocked = groupLocks.some(lock => 
          String(lock.groupEventId) === String(groupEvent.id) && lock.locked
        );
      } else {
        isLocked = judges.length > 0 && judges.every(judge =>
          groupLocks.some(lock => 
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
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return '🥇';
    if (index === 1) return '🥈';
    if (index === 2) return '🥉';
    return '';
  };

  return (
    <div className="home-page">
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
              
              {/* Repeat content for seamless loop */}
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

      <section className="hero-section">
        <div className="hero-content">
          <h1>Welcome to Christ Soldiers</h1>
          <p className="hero-subtitle">Youth Wing of Bethel Gospel Assembly Church</p>
          <p className="hero-description">
            Empowering young believers to serve Christ with passion and purpose
          </p>
        </div>
      </section>

      <section className="info-section">
        <div className="info-grid">
          <div className="info-card">
            <h3>Our Mission</h3>
            <p>
              To nurture and equip young people to become passionate followers of Christ,
              dedicated to serving God and their community.
            </p>
          </div>
          <div className="info-card">
            <h3>Our Vision</h3>
            <p>
              To raise a generation of Christ-centered youth who will impact the world
              through faith, love, and service.
            </p>
          </div>
          <div className="info-card">
            <h3>Get Involved</h3>
            <p>
              Join us in our various programs, events, and activities designed to
              strengthen your faith and develop your talents.
            </p>
          </div>
        </div>
      </section>

      <section className="upcoming-events">
        <h2>Upcoming Events</h2>
        <div className="events-grid">
          <div className="event-card">
            <div className="event-date">
              <span className="day">15</span>
              <span className="month">JAN</span>
            </div>
            <div className="event-details">
              <h4>Annual Talent Test</h4>
              <p>Showcase your God-given talents in music, writing, and more!</p>
              <span className="event-time">10:00 AM - 5:00 PM</span>
            </div>
          </div>
          <div className="event-card">
            <div className="event-date">
              <span className="day">22</span>
              <span className="month">JAN</span>
            </div>
            <div className="event-details">
              <h4>Youth Retreat</h4>
              <p>A weekend of worship, fellowship, and spiritual growth</p>
              <span className="event-time">Friday - Sunday</span>
            </div>
          </div>
          <div className="event-card">
            <div className="event-date">
              <span className="day">05</span>
              <span className="month">FEB</span>
            </div>
            <div className="event-details">
              <h4>Community Outreach</h4>
              <p>Serve our community with love and compassion</p>
              <span className="event-time">2:00 PM - 6:00 PM</span>
            </div>
          </div>
        </div>
      </section>

      <section className="news-section">
        <h2>Recent News</h2>
        <div className="news-grid">
          <article className="news-item">
            <h4>Registration Open for Talent Test 2025</h4>
            <p className="news-date">December 20, 2025</p>
            <p>
              We're excited to announce that registration is now open for our Annual Talent Test.
              Participants can register through our admin portal.
            </p>
          </article>
          <article className="news-item">
            <h4>Successful Christmas Celebration</h4>
            <p className="news-date">December 25, 2025</p>
            <p>
              Our Christmas celebration was a tremendous blessing with over 200 youth in attendance.
              Thank you to everyone who participated!
            </p>
          </article>
        </div>
      </section>
    </div>
  );
};

export default Home;
