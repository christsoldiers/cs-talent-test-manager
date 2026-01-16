import React, { useState, startTransition } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import MockDataMigration from '../../services/MockDataMigration';
import './MigrationUtility.css';

const MockDataMigrationPage = () => {
  const [migrationStatus, setMigrationStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [verificationResult, setVerificationResult] = useState(null);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  React.useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/admin/login');
    }
  }, [user, navigate]);

  const handleMigrate = async () => {
    if (!window.confirm('Start Mock Data Migration?\n\nThis will populate Firebase with sample data. Continue?')) {
      return;
    }

    setLoading(true);
    setMigrationStatus(null);
    setVerificationResult(null);

    try {
      console.log('Starting migration...');
      const result = await MockDataMigration.migrateAll();
      setMigrationStatus(result);

      if (result.success) {
        // Auto-verify after successful migration
        const verification = await MockDataMigration.verifyMigration();
        setVerificationResult(verification);
      }
    } catch (error) {
      setMigrationStatus({
        success: false,
        message: 'Migration failed: ' + error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    setLoading(true);
    setVerificationResult(null);

    try {
      const result = await MockDataMigration.verifyMigration();
      setVerificationResult(result);
    } catch (error) {
      setVerificationResult({
        success: false,
        error: error.message
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    logout();
    startTransition(() => {
      navigate('/admin/login');
    });
  };

  const handleBackToDashboard = () => {
    navigate('/admin/dashboard');
  };

  return (
    <div className="migration-utility">
      <div className="dashboard-header">
        <div>
          <h1>🔄 Mock Data Migration</h1>
          <p>Admin: {user?.username}</p>
        </div>
        <div className="header-actions">
          <button onClick={handleBackToDashboard} className="btn-secondary">
            ← Back to Dashboard
          </button>
          <button onClick={handleLogout} className="btn-logout">
            Logout
          </button>
        </div>
      </div>

      <div className="migration-content">
        <div className="info-section">
          <h2>ℹ️ About This Tool</h2>
          <p>
            This utility generates and migrates mock data to Firebase for testing and development purposes.
          </p>
          <p><strong>What will be created:</strong></p>
          <ul>
            <li>5 Individual Events (Solo Music, Story Writing, etc.)</li>
            <li>2 Group Events (Group Song, Bible Quiz)</li>
            <li>4 Sections with churches and leadership</li>
            <li>60-80 Participants with chest numbers</li>
            <li>8 Group Teams (2 per section)</li>
            <li>180-240 Score entries from 3 judges</li>
            <li>3 Judge accounts</li>
            <li>Points configuration</li>
          </ul>
        </div>

        <div className="action-section">
          <h2>🚀 Migration Actions</h2>
          
          <div className="action-buttons">
            <button
              onClick={handleMigrate}
              disabled={loading}
              className="btn-primary btn-large"
            >
              {loading ? '⏳ Migrating...' : '📤 Start Migration'}
            </button>

            <button
              onClick={handleVerify}
              disabled={loading}
              className="btn-secondary btn-large"
            >
              {loading ? '⏳ Verifying...' : '🔍 Verify Data'}
            </button>
          </div>

          {migrationStatus && (
            <div className={`status-message ${migrationStatus.success ? 'success' : 'error'}`}>
              <h3>{migrationStatus.success ? '✅ Success' : '❌ Failed'}</h3>
              <p>{migrationStatus.message}</p>
            </div>
          )}

          {verificationResult && (
            <div className={`verification-result ${verificationResult.success ? 'success' : 'error'}`}>
              <h3>🔍 Verification Results</h3>
              {verificationResult.success ? (
                <div className="counts-grid">
                  <div className="count-item">
                    <span className="count-label">Events:</span>
                    <span className="count-value">{verificationResult.counts.events}</span>
                  </div>
                  <div className="count-item">
                    <span className="count-label">Participants:</span>
                    <span className="count-value">{verificationResult.counts.participants}</span>
                  </div>
                  <div className="count-item">
                    <span className="count-label">Sections:</span>
                    <span className="count-value">{verificationResult.counts.sections}</span>
                  </div>
                  <div className="count-item">
                    <span className="count-label">Judges:</span>
                    <span className="count-value">{verificationResult.counts.judges}</span>
                  </div>
                  <div className="count-item">
                    <span className="count-label">Results/Scores:</span>
                    <span className="count-value">{verificationResult.counts.results}</span>
                  </div>
                  <div className="count-item">
                    <span className="count-label">Group Teams:</span>
                    <span className="count-value">{verificationResult.counts.groupTeams}</span>
                  </div>
                </div>
              ) : (
                <p className="error-text">{verificationResult.error}</p>
              )}
            </div>
          )}
        </div>

        <div className="warning-section">
          <h3>⚠️ Important Notes</h3>
          <ul>
            <li>This will add new data to Firebase - it does NOT clear existing data first</li>
            <li>Running this multiple times will create duplicate entries</li>
            <li>To clear data, manually delete collections from Firebase Console</li>
            <li>Recommended: Use this on a fresh/empty Firebase project</li>
          </ul>
        </div>

        <div className="instructions-section">
          <h3>📋 How to Use</h3>
          <ol>
            <li>Ensure your Firebase project is properly configured</li>
            <li>Click "Start Migration" to generate and upload mock data</li>
            <li>Wait for the migration to complete (may take 1-2 minutes)</li>
            <li>Click "Verify Data" to check what was migrated</li>
            <li>Navigate to other pages to see the data in action</li>
          </ol>
        </div>
      </div>
    </div>
  );
};

export default MockDataMigrationPage;
