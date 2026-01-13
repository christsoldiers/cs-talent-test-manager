import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import About from './pages/About';
import Events from './pages/Events';
import Gallery from './pages/Gallery';
import Contact from './pages/Contact';
import AdminLogin from './pages/Admin/AdminLogin';
import JudgeLogin from './pages/Admin/JudgeLogin';
import SectionLogin from './pages/Admin/SectionLogin';
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
import MigrationUtility from './pages/Admin/MigrationUtility';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Navbar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/about" element={<About />} />
              <Route path="/events" element={<Events />} />
              <Route path="/gallery" element={<Gallery />} />
              <Route path="/contact" element={<Contact />} />
              
              {/* Login Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/judge/login" element={<JudgeLogin />} />
              <Route path="/section/login" element={<SectionLogin />} />
              
              {/* Redirect old route to new admin login */}
              <Route path="/admin" element={<Navigate to="/admin/login" replace />} />
              
              {/* Admin Routes */}
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin/participants" element={<Participants />} />
              <Route path="/admin/migration" element={<MigrationUtility />} />
              <Route path="/admin/results" element={<ResultsView />} />
              <Route path="/admin/leaderboard" element={<Leaderboard />} />
              <Route path="/admin/master-data" element={<MasterData />} />
              <Route path="/admin/group-teams" element={<GroupTeams />} />
              <Route path="/admin/group-results" element={<GroupResults />} />
              <Route path="/admin/printable-results" element={<PrintableResults />} />
              
              {/* Judge Routes */}
              <Route path="/judge/dashboard" element={<JudgeDashboard />} />
              
              {/* Section Routes */}
              <Route path="/section/dashboard" element={<SectionDashboard />} />
            </Routes>
          </main>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
