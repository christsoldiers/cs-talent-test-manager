import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DataMigration from '../../services/DataMigration';
import './MigrationUtility.css';

const MigrationUtility = () => {
  const [migrationStatus, setMigrationStatus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [migrationResult, setMigrationResult] = useState(null);
  const navigate = useNavigate();

  const handleMigrate = async () => {
    if (!window.confirm('This will migrate all data from localStorage to Firebase. Continue?')) {
      return;
    }

    setIsLoading(true);
    setMigrationStatus('Starting migration...');

    try {
      const result = await DataMigration.migrateAll();
      setMigrationResult(result);
      
      if (result.success) {
        setMigrationStatus('✅ Migration completed successfully!');
        
        // Verify migration
        setMigrationStatus('Verifying migration...');
        const verification = await DataMigration.verifyMigration();
        
        if (verification.success) {
          setMigrationStatus('✅ Migration verified successfully!');
          setMigrationResult({
            ...result,
            verification
          });
        }
      } else {
        setMigrationStatus('❌ Migration failed: ' + result.message);
      }
    } catch (error) {
      setMigrationStatus('❌ Error: ' + error.message);
      setMigrationResult({ success: false, error: error.message });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    setMigrationStatus('Verifying data in Firebase...');

    try {
      const result = await DataMigration.verifyMigration();
      setMigrationResult(result);
      
      if (result.success) {
        setMigrationStatus('✅ Verification completed!');
      } else {
        setMigrationStatus('❌ Verification failed');
      }
    } catch (error) {
      setMigrationStatus('❌ Error: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="migration-container">
      <div className="migration-header">
        <h1>Data Migration Utility</h1>
        <button onClick={() => navigate('/admin/dashboard')} className="btn-back">
          Back to Dashboard
        </button>
      </div>

      <div className="migration-info">
        <h2>⚠️ Important Information</h2>
        <ul>
          <li>This utility migrates all data from localStorage to Firebase Firestore</li>
          <li>Includes: Events, Participants, Sections, Judges, Results, and Configuration</li>
          <li>This is a one-time operation - data will be copied, not moved</li>
          <li>Make sure you have configured Firebase in <code>src/config/firebase.js</code></li>
          <li>Your localStorage data will remain intact</li>
        </ul>
      </div>

      <div className="migration-actions">
        <button 
          onClick={handleMigrate} 
          disabled={isLoading}
          className="btn-migrate"
        >
          {isLoading ? 'Migrating...' : 'Start Migration'}
        </button>
        
        <button 
          onClick={handleVerify} 
          disabled={isLoading}
          className="btn-verify"
        >
          Verify Firebase Data
        </button>
      </div>

      {migrationStatus && (
        <div className={`migration-status ${migrationResult?.success === false ? 'error' : 'success'}`}>
          <h3>Status</h3>
          <p>{migrationStatus}</p>
        </div>
      )}

      {migrationResult && migrationResult.verification && (
        <div className="migration-results">
          <h3>Migration Summary</h3>
          <table>
            <thead>
              <tr>
                <th>Collection</th>
                <th>Count</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Events</td>
                <td>{migrationResult.verification.counts.events}</td>
              </tr>
              <tr>
                <td>Participants</td>
                <td>{migrationResult.verification.counts.participants}</td>
              </tr>
              <tr>
                <td>Sections</td>
                <td>{migrationResult.verification.counts.sections}</td>
              </tr>
              <tr>
                <td>Judges</td>
                <td>{migrationResult.verification.counts.judges}</td>
              </tr>
              <tr>
                <td>Group Teams</td>
                <td>{migrationResult.verification.counts.groupTeams}</td>
              </tr>
              <tr>
                <td>Results</td>
                <td>{migrationResult.verification.counts.results}</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      <div className="migration-instructions">
        <h3>Next Steps After Migration</h3>
        <ol>
          <li>Verify all data has been migrated correctly using the "Verify" button</li>
          <li>Update all components to use FirebaseService instead of StorageService</li>
          <li>Test all CRUD operations to ensure they work with Firebase</li>
          <li>Once confirmed, you can remove the old localStorage code</li>
        </ol>
      </div>
    </div>
  );
};

export default MigrationUtility;
