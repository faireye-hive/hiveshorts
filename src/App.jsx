import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ShortsFeed from './components/ShortsFeed';
import BottomNav from './components/BottomNav';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';
import { ShortsProvider } from './context/ShortsContext';
import { DiscoverProvider } from './context/DiscoverContext';

import SettingsPage from './pages/SettingsPage';
import DiscoverPage from './pages/DiscoverPage';
import VideoPlayerPage from './pages/VideoPlayerPage';

function App() {
  return (
    <AuthProvider>
      <ShortsProvider>
        <DiscoverProvider>
          <Router>
            <div className="app-container">
              <div className="content-area" style={{ height: 'calc(100% - 60px)', position: 'relative' }}>
                <Routes>
                  <Route path="/" element={<ShortsFeed />} />
                  <Route path="/search" element={<DiscoverPage />} />
                  <Route path="/watch/:owner/:permlink" element={<VideoPlayerPage />} />
                  <Route path="/profile" element={<ProfilePage />} />
                  <Route path="/profile/:username" element={<ProfilePage />} />
                  <Route path="/settings" element={<SettingsPage />} />
                  <Route path="*" element={<ShortsFeed />} />
                </Routes>
              </div>
              <BottomNav />
            </div>
          </Router>
        </DiscoverProvider>
      </ShortsProvider>
    </AuthProvider>
  );
}

export default App;
