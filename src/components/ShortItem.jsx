import React, { useEffect, useState, useRef } from 'react';
import { useInView } from 'react-intersection-observer';
import VideoPlayer from './VideoPlayer';
import ShortOverlay from './ShortOverlay';
import CommentsDrawer from './CommentsDrawer';
import { fetchVideoDetails, fetchHivePost } from '../services/api';
import { useAuth } from '../context/AuthContext';

const ShortItem = ({ short, isActive, shouldLoad, onToggleMute, muted }) => {
    const { user } = useAuth();
    const [videoUrl, setVideoUrl] = useState(null);
    const [stats, setStats] = useState({ likes: 0, comments: 0, payout: "0.00" });
    const [isDrawerOpen, setIsDrawerOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [hasVoted, setHasVoted] = useState(false);

    // Intersection observer to know when this item is in view
    const { ref, inView } = useInView({
        threshold: 0.1,
        triggerOnce: true
    });

    const shouldFetch = inView || shouldLoad;

    // Extract Hive permlink from embed_url which is in format "@username/permlink"
    // Example: "@novef85/20260206t080229834z"
    const getHivePermlink = () => {
        if (!short.embed_url) return short.permlink; // Fallback
        const parts = short.embed_url.split('/');
        return parts.length > 1 ? parts[1] : short.permlink;
    };

    const hivePermlink = getHivePermlink();

    useEffect(() => {
        let mounted = true;

        const loadStream = async () => {
            if (!short.owner || !short.permlink) return;

            try {
                // Fetch video details (stream URL) using 3Speak permlink
                const detailsPromise = fetchVideoDetails(short.owner, short.permlink);

                // Fetch Hive stats (likes, comments) using Hive permlink
                const hivePromise = fetchHivePost(short.owner, hivePermlink);

                const [details, hiveData] = await Promise.all([detailsPromise, hivePromise]);

                if (mounted) {
                    if (details && details.videoUrl) {
                        setVideoUrl(details.videoUrl);
                    }
                    if (hiveData) {
                        const payout = hiveData.total_payout_value !== "0.000 HBD" ? hiveData.total_payout_value : hiveData.pending_payout_value;
                        setStats({
                            likes: hiveData.active_votes ? hiveData.active_votes.length : 0,
                            comments: hiveData.children || 0,
                            payout: payout
                        });

                        // Check if user has voted
                        if (user && hiveData.active_votes) {
                            const voted = hiveData.active_votes.some(v => v.voter === user.username);
                            setHasVoted(voted);
                        }
                    }
                }
            } catch (err) {
                console.error("Failed to load video stream and stats", err);
            } finally {
                if (mounted) setLoading(false);
            }
        };

        if (shouldFetch && !videoUrl && loading) {
            loadStream();
        }

        return () => {
            mounted = false;
        };
    }, [shouldFetch, short.owner, short.permlink, hivePermlink, videoUrl, loading, user]);

    const handleVote = () => {
        if (!user) {
            alert("Please login to vote!");
            return;
        }
        if (hasVoted) return; // Already voted

        if (window.hive_keychain) {
            window.hive_keychain.requestVote(
                user.username,
                hivePermlink,
                short.owner,
                10000, // 100% weight
                (response) => {
                    if (response.success) {
                        setHasVoted(true);
                        setStats(prev => ({ ...prev, likes: prev.likes + 1 }));
                    } else {
                        // Suppress "user canceled" error
                        if (response.message &&
                            (response.message.toLowerCase().includes("user canceled") ||
                                response.message.toLowerCase().includes("request was canceled"))) {
                            console.log("Vote canceled by user");
                            return;
                        }
                        alert("Vote failed: " + response.message);
                    }
                }
            );
        } else {
            alert("Hive Keychain not installed!");
        }
    };

    // Construct thumbnail URL if available
    const poster = short.thumbnail_url || ""; // Use empty string if null

    return (
        <div className="short-item" ref={ref}>
            {loading && !videoUrl ? (
                <div className="loading-container">Loading...</div>
            ) : videoUrl ? (
                <VideoPlayer
                    src={videoUrl}
                    poster={poster}
                    isActive={isActive}
                    muted={muted}
                    onToggleMute={onToggleMute}
                />
            ) : (
                <div className="error-container">Video unavailable</div>
            )}

            <ShortOverlay
                title={short.title || "Untitled"}
                author={short.owner}
                authorAvatar={`https://images.hive.blog/u/${short.owner}/avatar`} // Hive avatar convention
                views={short.views}
                likes={stats.likes}
                comments={stats.comments}
                payout={stats.payout}
                onOpenComments={() => setIsDrawerOpen(true)}
                onVote={handleVote}
                hasVoted={hasVoted}
            />

            <CommentsDrawer
                isOpen={isDrawerOpen}
                onClose={() => setIsDrawerOpen(false)}
                author={short.owner}
                permlink={hivePermlink}
            />
        </div>
    );
};

export default ShortItem;
