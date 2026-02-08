import React, { useEffect, useState, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { fetchHiveAccount, fetchUserVideos } from '../services/api';
import { User, LogOut } from 'lucide-react';

const ProfilePage = () => {
    const { username: paramUsername } = useParams();
    const { user, login, logout } = useAuth();
    const [profileUser, setProfileUser] = useState(null);
    const [hiveAccount, setHiveAccount] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const observer = useRef();
    const navigate = useNavigate();

    // Determine which user profile to show
    const targetUsername = paramUsername || (user ? user.username : null);

    // Initial Load & Account Data
    useEffect(() => {
        const loadProfile = async () => {
            if (!targetUsername) {
                setLoading(false);
                return;
            }

            setLoading(true);
            setVideos([]); // Reset videos on profile change
            setPage(1);
            setHasMore(true);

            try {
                // Fetch account data independently
                const accountData = await fetchHiveAccount(targetUsername);
                setHiveAccount(accountData);
                setProfileUser(targetUsername);

                // Fetch first page of videos
                await loadVideos(1, targetUsername);
            } catch (error) {
                console.error("Failed to load profile", error);
            } finally {
                setLoading(false);
            }
        };

        loadProfile();
    }, [targetUsername]);

    const loadVideos = async (pageNum, username) => {
        try {
            // Use higher limit to scan effectively
            const data = await fetchUserVideos(username, pageNum, 100);

            let foundVideos = false;
            if (data && data.shorts && data.shorts.length > 0) {
                foundVideos = true;
                setVideos(prevVideos => {
                    const newVideos = data.shorts.filter(
                        newVid => !prevVideos.some(prevVid => prevVid.permlink === newVid.permlink)
                    );
                    return [...prevVideos, ...newVideos];
                });
            }

            // Update hasMore based on API total pages
            // data.totalPages comes from the generic API response
            const apiHasMore = data.totalPages ? pageNum < data.totalPages : false;
            setHasMore(apiHasMore);

            // If we found no videos on this page but the API has more pages, 
            // we should automatically load the next page to avoid showing "No videos" prematurely.
            // This acts as a scanner.
            if (!foundVideos && apiHasMore) {
                const nextPage = pageNum + 1;
                setPage(nextPage); // Keep state in sync
                // Small delay to avoid hammering if skipping many pages (though total pages is small here)
                // await new Promise(r => setTimeout(r, 100)); 
                loadVideos(nextPage, username);
            }

        } catch (error) {
            console.error("Failed to load user videos", error);
            setHasMore(false);
        }
    };

    // Load more function for infinite scroll
    const loadMore = useCallback(() => {
        setPage(prevPage => {
            const nextPage = prevPage + 1;
            loadVideos(nextPage, targetUsername);
            return nextPage;
        });
    }, [targetUsername]);

    const lastVideoElementRef = useCallback(node => {
        if (loading) return;
        if (observer.current) observer.current.disconnect();
        observer.current = new IntersectionObserver(entries => {
            if (entries[0].isIntersecting && hasMore) {
                loadMore();
            }
        });
        if (node) observer.current.observe(node);
    }, [loading, hasMore, loadMore]);

    if (!targetUsername) {
        return (
            <div className="profile-container login-view">
                <h2>Guest</h2>
                <p>Please login in Settings to view your profile.</p>
            </div>
        );
    }

    if (loading && videos.length === 0) return <div className="loading-container">Loading Profile...</div>;

    const metadata = hiveAccount && hiveAccount.posting_json_metadata
        ? JSON.parse(hiveAccount.posting_json_metadata)
        : (hiveAccount && hiveAccount.json_metadata ? JSON.parse(hiveAccount.json_metadata) : {});

    const profileImage = metadata.profile && metadata.profile.profile_image
        ? metadata.profile.profile_image
        : `https://images.hive.blog/u/${targetUsername}/avatar`;

    const coverImage = metadata.profile && metadata.profile.cover_image
        ? metadata.profile.cover_image
        : null;

    return (
        <div className="profile-container">
            <div className="profile-header">
                {coverImage && (
                    <div className="profile-cover" style={{ backgroundImage: `url(${coverImage})` }}></div>
                )}
                <div className="profile-info">
                    <img src={profileImage} alt={targetUsername} className="profile-avatar" />
                    <div className="profile-text">
                        <h3>@{targetUsername}</h3>
                        <p>{metadata.profile?.about}</p>

                        {/* Show Logout if viewing own profile */}
                        {user && user.username === targetUsername && (
                            <button onClick={logout} className="logout-btn">
                                <LogOut size={16} /> Logout
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="add-video-section">
                {/* Placeholder for future add video button */}
            </div>

            <div className="video-grid">
                {videos.length === 0 && !loading ? (
                    <p className="no-videos">No shorts found.</p>
                ) : (
                    videos.map((video, index) => {
                        const isLastVideo = videos.length === index + 1;
                        return (
                            <div
                                key={`${video.permlink}-${index}`}
                                className="grid-item"
                                ref={isLastVideo ? lastVideoElementRef : null}
                                onClick={() => navigate(`/watch/${video.owner}/${video.permlink}`)}
                            >
                                {
                                    (video.thumbnail_url || video.thumbnail) ? (
                                        <img
                                            src={video.thumbnail_url || video.thumbnail}
                                            alt={video.title}
                                            loading="lazy"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = 'https://via.placeholder.com/150x266?text=No+Preview';
                                            }}
                                        />
                                    ) : (
                                        <div className="no-thumbnail">
                                            <span>Preview</span>
                                        </div>
                                    )
                                }
                                <div className="grid-stats">
                                    <span>{video.views} views</span>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>
            {loading && videos.length > 0 && <div className="loading-more">Loading more...</div>}
        </div>
    );
};

export default ProfilePage;
