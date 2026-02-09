import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import ShortsFeed from './components/ShortsFeed';
import BottomNav from './components/BottomNav';
import ProfilePage from './pages/ProfilePage';
import { AuthProvider } from './context/AuthContext';
import { ShortsProvider } from './context/ShortsContext';
import { DiscoverProvider } from './context/DiscoverContext';
import { MessagingProvider } from './context/MessagingContext';

import SettingsPage from './pages/SettingsPage';
import DiscoverPage from './pages/DiscoverPage';
import VideoPlayerPage from './pages/VideoPlayerPage';
import UploadPage from './pages/UploadPage';
import InboxPage from './pages/InboxPage';
import ChatPage from './pages/ChatPage';

function App() {
  return (
    <AuthProvider>
      <ShortsProvider>
        <MessagingProvider>
          <DiscoverProvider>
            <Router>
              <div className="app-container">
                <div className="content-area">
                  <Routes>
                    <Route path="/" element={<ShortsFeed />} />
                    <Route path="/search" element={<DiscoverPage />} />
                    <Route path="/watch/:owner/:permlink" element={<VideoPlayerPage />} />
                    <Route path="/profile" element={<ProfilePage />} />
                    <Route path="/profile/:username" element={<ProfilePage />} />
                    <Route path="/upload" element={<UploadPage />} />
                    <Route path="/settings" element={<SettingsPage />} />
                    <Route path="/inbox" element={<InboxPage />} />
                    <Route path="/inbox/:recipient" element={<ChatPage />} />
                    <Route path="*" element={<ShortsFeed />} />
                  </Routes>
                </div>
                <BottomNav />
              </div>
            </Router>
          </DiscoverProvider>
        </MessagingProvider>
      </ShortsProvider>
    </AuthProvider>
  );
}

export default App;
