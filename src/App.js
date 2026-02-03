import React, { useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { LoadingProvider, useLoading } from './context/LoadingContext';
import { setLoadingCallbacks } from './services/LoadingInterceptor';
import Navbar from './components/Navbar';
import LoadingSpinner from './components/LoadingSpinner';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AdminLogin from './pages/Admin/AdminLogin';
import JudgeLogin from './pages/Admin/JudgeLogin';
import SectionLogin from './pages/Admin/SectionLogin';
import EventDashboard from './pages/Admin/EventDashboard';
import EventDetailView from './pages/Admin/EventDetailView';
import SectionEventDashboard from './pages/Admin/SectionEventDashboard';
import SectionEventDetailView from './pages/Admin/SectionEventDetailView';
import AdminDashboard from './pages/Admin/AdminDashboard';
import JudgeDashboard from './pages/Admin/JudgeDashboard';
import SectionDashboard from './pages/Admin/SectionDashboard';
import ResultsView from './pages/Admin/ResultsView';
import Leaderboard from './pages/Admin/Leaderboard';
import MasterData from './pages/Admin/MasterData';
import GroupTeams from './pages/Admin/GroupTeams';
import GroupResults from './pages/Admin/GroupResults';
import PrintableResults from './pages/Admin/PrintableResults';
import Participants from './pages/Admin/Participants';
import IndividualResults from './pages/Admin/IndividualResults';
import MigrationUtility from './pages/Admin/MigrationUtility';
import Presentation from './pages/Presentation';
import MockDataMigrationPage from './pages/Admin/MockDataMigrationPage';
import TalentTestEvents from './pages/Admin/TalentTestEvents';
import NewsEventsManager from './pages/Admin/NewsEventsManager';
import './App.css';

function AppContent() {
  const { loading, showLoading, hideLoading } = useLoading();

  // Initialize loading callbacks for Firebase service
  useEffect(() => {
    setLoadingCallbacks(showLoading, hideLoading);
  }, [showLoading, hideLoading]);

  return (
    <>
      {loading && <LoadingSpinner />}
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/presentation" element={<Presentation />} />
              {/* Login Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/judge/login" element={<JudgeLogin />} />
              <Route path="/section/login" element={<SectionLogin />} />
              
              {/* Redirect old route to new admin login */}
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              
              {/* Admin Routes - Event-based navigation */}
              <Route path="/admin/dashboard" element={<EventDashboard />} />
              <Route path="/admin/events" element={<EventDashboard />} />
              <Route path="/admin/event/:eventId" element={<EventDetailView />} />
              <Route path="/admin/talent-test-events" element={<TalentTestEvents />} />
              <Route path="/admin/master-data" element={<MasterData />} />
              <Route path="/admin/news-events" element={<NewsEventsManager />} />
              
              {/* Admin - Event-specific pages */}
              <Route path="/admin/participants" element={<Participants />} />
              <Route path="/admin/group-teams" element={<GroupTeams />} />
              <Route path="/admin/results" element={<ResultsView />} />
              <Route path="/admin/group-results" element={<GroupResults />} />
              <Route path="/admin/leaderboard" element={<Leaderboard />} />
              <Route path="/admin/individual-results" element={<IndividualResults />} />
              <Route path="/admin/printable-results" element={<PrintableResults />} />
              
              {/* Legacy/Utility Routes */}
              <Route path="/admin/old-dashboard" element={<AdminDashboard />} />
              <Route path="/admin/migration" element={<MigrationUtility />} />
              <Route path="/admin/mock-migration" element={<MockDataMigrationPage />} />
              <Route path="/admin/talent-test-events" element={<TalentTestEvents />} />
              {/* Judge Routes */}
              <Route path="/judge/dashboard" element={<JudgeDashboard />} />
              
              {/* Section Routes - Event-based navigation */}
              <Route path="/section/dashboard" element={<SectionEventDashboard />} />
              <Route path="/section/event/:eventId" element={<SectionEventDetailView />} />
              <Route path="/section/participants" element={<Participants />} />
              
              {/* Legacy Section Route */}
              <Route path="/section/old-dashboard" element={<SectionDashboard />} />
              {/* Section Routes */}
              <Route path="/section/dashboard" element={<SectionDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </>
  );
}

function App() {
  return (
    <LoadingProvider>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </LoadingProvider>
  );
}

export default App;
