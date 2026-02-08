import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Home, Search, PlusSquare, MessageSquare, User, Settings as SettingsIcon } from 'lucide-react';
import { useDiscoverContext } from '../context/DiscoverContext';

const BottomNav = () => {
    const location = useLocation();
    const { refresh } = useDiscoverContext();

    const handleDiscoverClick = (e) => {
        if (location.pathname === '/search') {
            e.preventDefault();
            refresh();
            // Optional: scroll to top if not handled by refresh (refresh resets list, so it usually jumps to top)
        }
    };

    return (
        <div className="bottom-nav">
            <NavLink to="/" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <Home size={24} />
                <span>Home</span>
            </NavLink>

            <NavLink
                to="/search"
                className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}
                onClick={handleDiscoverClick}
            >
                <Search size={24} />
                <span>Discover</span>
            </NavLink>

            <div className="nav-item upload-btn">
                <PlusSquare size={32} />
            </div>

            <NavLink to="/inbox" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <MessageSquare size={24} />
                <span>Inbox</span>
            </NavLink>

            <NavLink to="/profile" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <User size={24} />
                <span>Profile</span>
            </NavLink>

            <NavLink to="/settings" className={({ isActive }) => isActive ? "nav-item active" : "nav-item"}>
                <SettingsIcon size={24} />
                <span>Settings</span>
            </NavLink>
        </div>
    );
};

export default BottomNav;
