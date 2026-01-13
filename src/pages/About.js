import React from 'react';
import './About.css';

const About = () => {
  return (
    <div className="about-page">
      <div className="about-header">
        <h1>About Christ Soldiers</h1>
        <p>Youth Wing of Bethel Gospel Assembly Church</p>
      </div>

      <section className="about-section">
        <div className="about-content">
          <div className="about-card">
            <h2>Our Mission</h2>
            <p>
              Christ Soldiers is dedicated to nurturing and equipping young believers to become 
              passionate followers of Christ. We strive to create an environment where youth can 
              grow spiritually, develop their God-given talents, and learn to serve Christ with 
              dedication and purpose.
            </p>
            <p>
              Through various programs, events, and activities, we aim to empower the next 
              generation to impact their communities and the world with the Gospel of Jesus Christ.
            </p>
          </div>

          <div className="about-card">
            <h2>Our Vision</h2>
            <p>
              We envision a generation of Christ-centered youth who are:
            </p>
            <ul>
              <li>Firmly rooted in their faith and Biblical knowledge</li>
              <li>Passionate about worship and prayer</li>
              <li>Committed to serving God and their community</li>
              <li>Equipped with skills and talents for Kingdom work</li>
              <li>Leaders who will transform their world through Christ's love</li>
            </ul>
          </div>

          <div className="about-card">
            <h2>Our History</h2>
            <p>
              Christ Soldiers was established as the youth wing of Bethel Gospel Assembly Church 
              with the purpose of bringing together young people from different backgrounds to 
              worship, learn, and grow together in Christ.
            </p>
            <p>
              Over the years, we have witnessed countless young lives transformed by the power 
              of God's Word and the fellowship of believers. Our ministry has grown to include 
              various programs such as:
            </p>
            <ul>
              <li>Weekly youth meetings and Bible studies</li>
              <li>Annual talent competitions and cultural events</li>
              <li>Community outreach and service projects</li>
              <li>Leadership training and mentorship programs</li>
              <li>Worship nights and prayer gatherings</li>
            </ul>
          </div>

          <div className="about-card">
            <h2>What We Believe</h2>
            <ul>
              <li>The Bible is the inspired and infallible Word of God</li>
              <li>Jesus Christ is the Son of God and the only way to salvation</li>
              <li>The Holy Spirit empowers believers for service and witness</li>
              <li>Every believer is called to be a disciple and make disciples</li>
              <li>The Church is the body of Christ, united in love and purpose</li>
            </ul>
          </div>

          <div className="about-card">
            <h2>Age Categories</h2>
            <p>
              We organize our participants into age-appropriate groups to ensure relevant 
              and engaging activities:
            </p>
            <div className="categories-grid">
              <div className="category-item">
                <h3>Junior</h3>
                <p>6-10 years</p>
              </div>
              <div className="category-item">
                <h3>Intermediate</h3>
                <p>11-15 years</p>
              </div>
              <div className="category-item">
                <h3>Senior</h3>
                <p>16-20 years</p>
              </div>
              <div className="category-item">
                <h3>Super Senior</h3>
                <p>21-25 years</p>
              </div>
            </div>
          </div>

          <div className="about-card">
            <h2>Join Us</h2>
            <p>
              We invite all young people to join us in this exciting journey of faith, 
              fellowship, and service. Whether you're looking to grow spiritually, develop 
              your talents, or make a difference in your community, Christ Soldiers is the 
              place for you!
            </p>
            <p>
              Contact us today to learn more about our programs and how you can get involved.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default About;
