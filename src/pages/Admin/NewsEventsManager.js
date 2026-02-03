import React, { useState, useEffect } from 'react';
import FirebaseService from '../../services/FirebaseService';
import './NewsEventsManager.css';

const NewsEventsManager = () => {
  const [activeTab, setActiveTab] = useState('news');
  const [news, setNews] = useState([]);
  const [upcomingEvents, setUpcomingEvents] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [formData, setFormData] = useState({});

  const emptyNewsForm = {
    title: '',
    date: '',
    content: '',
    icon: '📝',
    badge: '',
    isFeatured: false
  };

  const emptyEventForm = {
    title: '',
    startDate: '',
    endDate: '',
    description: '',
    time: '',
    location: '',
    googleMapsUrl: '',
    icon: '📖',
    type: 'talent-event'
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const [newsData, eventsData] = await Promise.all([
      FirebaseService.getNews(),
      FirebaseService.getUpcomingEvents()
    ]);
    setNews(newsData);
    setUpcomingEvents(eventsData);
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmitNews = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await FirebaseService.updateNews(editingItem.id, formData);
      } else {
        await FirebaseService.addNews(formData);
      }
      setFormData({});
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error('Error saving news:', error);
      alert('Failed to save news');
    }
  };

  const handleSubmitEvent = async (e) => {
    e.preventDefault();
    try {
      if (editingItem) {
        await FirebaseService.updateUpcomingEvent(editingItem.id, formData);
      } else {
        await FirebaseService.addUpcomingEvent(formData);
      }
      setFormData({});
      setEditingItem(null);
      loadData();
    } catch (error) {
      console.error('Error saving event:', error);
      alert('Failed to save event');
    }
  };

  const handleEdit = (item) => {
    setEditingItem(item);
    setFormData(item);
  };

  const handleDelete = async (id, type) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    
    try {
      if (type === 'news') {
        await FirebaseService.deleteNews(id);
      } else {
        await FirebaseService.deleteUpcomingEvent(id);
      }
      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
      alert('Failed to delete item');
    }
  };

  const handleCancel = () => {
    setEditingItem(null);
    setFormData({});
  };

  const handleNewItem = () => {
    setEditingItem(null);
    setFormData(activeTab === 'news' ? emptyNewsForm : emptyEventForm);
  };

  return (
    <div className="news-events-manager">
      <div className="manager-header">
        <h2>📰 News & Events Manager</h2>
        <p>Manage news articles and upcoming events displayed on the home page</p>
      </div>

      <div className="tabs">
        <button 
          className={`tab ${activeTab === 'news' ? 'active' : ''}`}
          onClick={() => setActiveTab('news')}
        >
          📰 News ({news.length})
        </button>
        <button 
          className={`tab ${activeTab === 'events' ? 'active' : ''}`}
          onClick={() => setActiveTab('events')}
        >
          📅 Events ({upcomingEvents.length})
        </button>
      </div>

      {activeTab === 'news' && (
        <div className="tab-content">
          <div className="action-bar">
            <button className="btn-primary" onClick={handleNewItem}>
              ➕ Add News Article
            </button>
          </div>

          {(Object.keys(formData).length > 0) && (
            <div className="form-card">
              <h3>{editingItem ? 'Edit News Article' : 'New News Article'}</h3>
              <form onSubmit={handleSubmitNews}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      required
                      placeholder="Enter news title"
                    />
                  </div>
                  <div className="form-group">
                    <label>Date *</label>
                    <input
                      type="date"
                      name="date"
                      value={formData.date || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Icon</label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.icon || ''}
                      onChange={handleInputChange}
                      placeholder="📝"
                      maxLength="2"
                    />
                  </div>
                  <div className="form-group">
                    <label>Badge (Optional)</label>
                    <input
                      type="text"
                      name="badge"
                      value={formData.badge || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Featured, New"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Content *</label>
                  <textarea
                    name="content"
                    value={formData.content || ''}
                    onChange={handleInputChange}
                    required
                    rows="8"
                    placeholder="Enter news content. Formatting (spaces, line breaks, bullet points) will be preserved as you type."
                    className="preserve-format"
                  />
                  <small className="form-hint">
                    💡 Paste text directly - all formatting, spaces, and line breaks will be preserved automatically
                  </small>
                </div>

                <div className="form-group checkbox-group">
                  <label>
                    <input
                      type="checkbox"
                      name="isFeatured"
                      checked={formData.isFeatured || false}
                      onChange={handleInputChange}
                    />
                    Featured (Show with 🔥 badge)
                  </label>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingItem ? 'Update' : 'Create'} News
                  </button>
                  <button type="button" className="btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="items-list">
            {news.map(item => (
              <div key={item.id} className="item-card">
                <div className="item-header">
                  <div className="item-title">
                    <span className="item-icon">{item.icon}</span>
                    <h4>{item.title}</h4>
                    {item.isFeatured && <span className="badge featured">🔥 Featured</span>}
                    {item.badge && <span className="badge">{item.badge}</span>}
                  </div>
                  <div className="item-actions">
                    <button className="btn-edit" onClick={() => handleEdit(item)}>
                      ✏️ Edit
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(item.id, 'news')}>
                      🗑️ Delete
                    </button>
                  </div>
                </div>
                <div className="item-meta">
                  <span>📅 {new Date(item.date).toLocaleDateString()}</span>
                </div>
                <p className="item-content">{item.content}</p>
              </div>
            ))}
            {news.length === 0 && (
              <div className="empty-state">
                <p>No news articles yet. Click "Add News Article" to create one.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'events' && (
        <div className="tab-content">
          <div className="action-bar">
            <button className="btn-primary" onClick={handleNewItem}>
              ➕ Add Event
            </button>
          </div>

          {(Object.keys(formData).length > 0) && (
            <div className="form-card">
              <h3>{editingItem ? 'Edit Event' : 'New Event'}</h3>
              <form onSubmit={handleSubmitEvent}>
                <div className="form-row">
                  <div className="form-group">
                    <label>Event Title *</label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title || ''}
                      onChange={handleInputChange}
                      required
                      placeholder="e.g., Annual Talent Test"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Start Date *</label>
                    <input
                      type="date"
                      name="startDate"
                      value={formData.startDate || ''}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>End Date</label>
                    <input
                      type="date"
                      name="endDate"
                      value={formData.endDate || ''}
                      onChange={handleInputChange}
                      placeholder="Leave empty for single day event"
                    />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Location</label>
                    <input
                      type="text"
                      name="location"
                      value={formData.location || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., Church Main Hall, 123 Main St, City"
                    />
                  </div>
                  <div className="form-group">
                    <label>Icon</label>
                    <input
                      type="text"
                      name="icon"
                      value={formData.icon || ''}
                      onChange={handleInputChange}
                      placeholder="📖"
                      maxLength="2"
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label>Google Maps URL</label>
                  <input
                    type="url"
                    name="googleMapsUrl"
                    value={formData.googleMapsUrl || ''}
                    onChange={handleInputChange}
                    placeholder="e.g., https://maps.google.com/?q=..."
                  />
                  <small className="form-hint">
                    💡 Paste the Google Maps share link for this location
                  </small>
                </div>

                <div className="form-group">
                  <label>Description *</label>
                  <textarea
                    name="description"
                    value={formData.description || ''}
                    onChange={handleInputChange}
                    required
                    rows="6"
                    placeholder="Brief description of the event. Formatting will be preserved."
                    className="preserve-format"
                  />
                  <small className="form-hint">
                    💡 Paste text directly - all formatting, spaces, and line breaks will be preserved automatically
                  </small>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Time</label>
                    <input
                      type="text"
                      name="time"
                      value={formData.time || ''}
                      onChange={handleInputChange}
                      placeholder="e.g., 10:00 AM - 5:00 PM"
                    />
                  </div>
                  <div className="form-group">
                    <label>Type (CSS class)</label>
                    <select
                      name="type"
                      value={formData.type || 'talent-event'}
                      onChange={handleInputChange}
                    >
                      <option value="talent-event">Talent Event</option>
                      <option value="retreat-event">Retreat</option>
                      <option value="outreach-event">Outreach</option>
                    </select>
                  </div>
                </div>

                <div className="form-actions">
                  <button type="submit" className="btn-primary">
                    {editingItem ? 'Update' : 'Create'} Event
                  </button>
                  <button type="button" className="btn-secondary" onClick={handleCancel}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          <div className="items-list">
            {upcomingEvents.map(item => {
              const formatDateRange = () => {
                if (!item.startDate) return 'No date set';
                const start = new Date(item.startDate);
                const end = item.endDate ? new Date(item.endDate) : null;
                
                if (!end || start.getTime() === end.getTime()) {
                  return start.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
                }
                
                const startMonth = start.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                const endFormatted = end.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                
                if (start.getMonth() === end.getMonth() && start.getFullYear() === end.getFullYear()) {
                  return `${start.toLocaleDateString('en-US', { month: 'long' })} ${start.getDate()} - ${end.getDate()}, ${start.getFullYear()}`;
                }
                
                return `${startMonth} - ${endFormatted}`;
              };
              
              return (
                <div key={item.id} className="item-card event-card-preview">
                  <div className="item-header">
                    <div className="item-title">
                      <div className="event-date-badge">
                        <span className="day">{item.day}</span>
                        <span className="month">{item.month}</span>
                      </div>
                      <div>
                        <h4>
                          <span className="item-icon">{item.icon}</span>
                          {item.title}
                        </h4>
                        <span className="event-type-badge">{item.type}</span>
                        <p className="event-date-range">📅 {formatDateRange()}</p>
                      </div>
                    </div>
                    <div className="item-actions">
                      <button className="btn-edit" onClick={() => handleEdit(item)}>
                        ✏️ Edit
                      </button>
                      <button className="btn-delete" onClick={() => handleDelete(item.id, 'event')}>
                        🗑️ Delete
                      </button>
                    </div>
                  </div>
                  <p className="item-content">{item.description}</p>
                  {item.time && (
                    <div className="item-meta">
                      <span>⏰ {item.time}</span>
                    </div>
                  )}
                </div>
              );
            })}
            {upcomingEvents.length === 0 && (
              <div className="empty-state">
                <p>No upcoming events yet. Click "Add Event" to create one.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default NewsEventsManager;
