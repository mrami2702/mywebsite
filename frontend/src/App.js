import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Toaster } from 'react-hot-toast';

// Components
import Navigation from './components/Navigation';

import AboutPage from './pages/AboutPage';
import ArticlesPage from './pages/ArticlesPage';
import RacesPage from './pages/RacesPage';
import FitnessPage from './pages/FitnessPage';
import MusicPage from './pages/MusicPage';
import ProfessionalPage from './pages/ProfessionalPage';
import AdminPage from './pages/AdminPage';
import RacesAdminPage from './pages/RacesAdminPage';
import SpotifyCallback from './pages/SpotifyCallback';

// Global Styles
const AppContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #F8F6FF 0%, #F0EDF5 100%);
  font-family: 'Lato', sans-serif;
`;

const MainContent = styled(motion.main)`
  padding-top: 80px; // Account for fixed navigation
`;

function App() {
  return (
    <Router>
      <AppContainer>
        <Navigation />
        <MainContent
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Routes>
            <Route path="/" element={<AboutPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/articles" element={<ArticlesPage />} />
            <Route path="/races" element={<RacesPage />} />
            <Route path="/fitness" element={<FitnessPage />} />
            <Route path="/music" element={<MusicPage />} />
            <Route path="/professional" element={<ProfessionalPage />} />
            <Route path="/auth/spotify/callback" element={<SpotifyCallback />} />
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/races" element={<RacesAdminPage />} />
          </Routes>
        </MainContent>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#4A4238',
              color: '#FFF8DC',
            },
          }}
        />
      </AppContainer>
    </Router>
  );
}

export default App;

