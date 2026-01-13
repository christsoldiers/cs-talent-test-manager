import React from 'react';
import './Gallery.css';

const Gallery = () => {
  const galleryImages = [
    {
      id: 1,
      title: 'Christmas Celebration 2024',
      description: 'Youth gathering for Christmas celebration with worship and fellowship',
      category: 'Events'
    },
    {
      id: 2,
      title: 'Talent Test 2024',
      description: 'Participants showcasing their talents in music and writing',
      category: 'Talent Test'
    },
    {
      id: 3,
      title: 'Youth Retreat',
      description: 'Mountain retreat with worship, teaching, and outdoor activities',
      category: 'Retreat'
    },
    {
      id: 4,
      title: 'Community Outreach',
      description: 'Serving the community with love and compassion',
      category: 'Outreach'
    },
    {
      id: 5,
      title: 'Worship Night',
      description: 'Evening of praise and worship with live music',
      category: 'Worship'
    },
    {
      id: 6,
      title: 'Bible Study Session',
      description: 'Youth gathering for in-depth Bible study and discussion',
      category: 'Bible Study'
    },
    {
      id: 7,
      title: 'Solo Music Performance',
      description: 'Participants performing in the solo music category',
      category: 'Talent Test'
    },
    {
      id: 8,
      title: 'Award Ceremony',
      description: 'Recognizing and celebrating talented youth',
      category: 'Events'
    },
    {
      id: 9,
      title: 'Prayer Meeting',
      description: 'Youth united in prayer and intercession',
      category: 'Prayer'
    }
  ];

  const categories = ['All', 'Events', 'Talent Test', 'Retreat', 'Outreach', 'Worship', 'Bible Study', 'Prayer'];
  const [selectedCategory, setSelectedCategory] = React.useState('All');

  const filteredImages = selectedCategory === 'All' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  return (
    <div className="gallery-page">
      <div className="gallery-header">
        <h1>Gallery</h1>
        <p>Memories from our events and activities</p>
      </div>

      <section className="gallery-section">
        <div className="filter-section">
          <h3>Filter by Category:</h3>
          <div className="filter-buttons">
            {categories.map(category => (
              <button
                key={category}
                className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        <div className="gallery-grid">
          {filteredImages.map(image => (
            <div key={image.id} className="gallery-item">
              <div className="image-placeholder">
                <span className="placeholder-icon">🖼️</span>
                <div className="image-overlay">
                  <h4>{image.title}</h4>
                  <p>{image.description}</p>
                  <span className="image-category">{image.category}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="no-results">
            <p>No images found in this category.</p>
          </div>
        )}
      </section>

      <section className="upload-info">
        <div className="info-card">
          <h3>Want to Share Your Photos?</h3>
          <p>
            If you have photos from our events that you'd like to share, please contact 
            our admin team. We'd love to feature them in our gallery!
          </p>
        </div>
      </section>
    </div>
  );
};

export default Gallery;
