import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useDiscoverContext } from '../context/DiscoverContext';
import ShortItem from '../components/ShortItem';
import { fetchVideoDetails } from '../services/api';

const VideoPlayerPage = () => {
    const { owner, permlink } = useParams();
    const navigate = useNavigate();
    const { videos, loadMore, hasMore, loading: contextLoading } = useDiscoverContext();

    // Local state for standalone mode (if accessing directly via URL not from discover)
    const [standaloneVideo, setStandaloneVideo] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Feed state
    const [activeIndex, setActiveIndex] = useState(0);
    const feedRef = useRef(null);
    const [isDiscoverFeed, setIsDiscoverFeed] = useState(false);

    useEffect(() => {
        // Check if the current video exists in the DiscoverContext
        const foundIndex = videos.findIndex(v => v.owner === owner && v.permlink === permlink);

        if (foundIndex !== -1) {
            setIsDiscoverFeed(true);
            setActiveIndex(foundIndex);
            setLoading(false);
            // Scroll to the specific video on mount
            // We need to wait for render
        } else {
            // Not in context, load standalone
            setIsDiscoverFeed(false);
            const loadVideo = async () => {
                setLoading(true);
                try {
                    const data = await fetchVideoDetails(owner, permlink);
                    if (data) {
                        setStandaloneVideo(data);
                    } else {
                        setError("Video not found");
                    }
                } catch (err) {
                    console.error(err);
                    setError("Failed to load video");
                } finally {
                    setLoading(false);
                }
            };
            loadVideo();
        }
    }, [owner, permlink, videos.length]); // Dependency on videos.length to re-evaluate if context updates? 
    // Actually if we navigate from Discover to here, videos should be populated.

    // Scroll handling for Feed Mode
    useEffect(() => {
        if (isDiscoverFeed && feedRef.current) {
            const activeElement = feedRef.current.querySelector(`[data-index="${activeIndex}"]`);
            if (activeElement) {
                // Only scroll on initial mount or when params change, but we want to avoid 
                // scrolling if the user is already scrolling. 
                // Ideally we just want to start at the right place.
                activeElement.scrollIntoView({ block: 'start' });
            }
        }
    }, [isDiscoverFeed]); // Run once when mode triggers

    // Intersection Observer for Feed Mode
    useEffect(() => {
        if (!isDiscoverFeed || !feedRef.current) return;

        const options = {
            root: feedRef.current,
            rootMargin: '0px',
            threshold: 0.6,
        };

        const handleIntersect = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = Number(entry.target.dataset.index);
                    setActiveIndex(index);
                    // Update URL silently? Maybe not, complicates history. 
                    // Keeping URL same as entry point is safer for now, OR using replaceState.
                    // Let's keep simple: Feed of discover videos.
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, options);
        const elements = feedRef.current.querySelectorAll('.short-item-wrapper');
        elements.forEach(el => observer.observe(el));

        return () => observer.disconnect();
    }, [isDiscoverFeed, videos.length]);

    // Render Standalone
    if (!isDiscoverFeed) {
        if (loading) return <div className="loading-container">Loading Video...</div>;
        if (error) return <div className="loading-container">{error}</div>;
        if (!standaloneVideo) return null;

        return (
            <div className="shorts-feed" style={{ position: 'relative' }}>
                <BackButton navigate={navigate} />
                <div className="short-item-wrapper" style={{ height: '100%', width: '100%' }}>
                    <ShortItem
                        short={standaloneVideo}
                        isActive={true}
                        shouldLoad={true}
                        muted={false}
                        onToggleMute={() => { }}
                    />
                </div>
            </div>
        );
    }

    // Render Feed
    return (
        <div style={{ position: 'relative', height: '100%', width: '100%' }}>
            <BackButton navigate={navigate} />
            <div className="shorts-feed" ref={feedRef} style={{ position: 'relative' }}>
                {videos.map((video, index) => (
                    <div
                        key={`${video.owner}-${video.permlink}-${index}`}
                        className="short-item-wrapper"
                        data-index={index}
                        style={{ height: '100%', width: '100%', scrollSnapAlign: 'start' }}
                    >
                        <ShortItem
                            short={video}
                            isActive={index === activeIndex}
                            shouldLoad={index === activeIndex || index === activeIndex + 1 || index === activeIndex - 1} // simplified load logic
                            muted={false}
                            onToggleMute={() => { }}
                        />
                    </div>
                ))}
                {contextLoading && <div className="loading-container">Loading more...</div>}
            </div>
        </div>
    );
};

const BackButton = ({ navigate }) => (
    <button
        onClick={() => navigate(-1)}
        style={{
            position: 'absolute',
            top: '20px',
            left: '20px',
            zIndex: 50,
            background: 'rgba(0,0,0,0.5)',
            border: 'none',
            borderRadius: '50%',
            padding: '8px',
            color: 'white',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
        }}
    >
        <ArrowLeft size={24} />
    </button>
);

export default VideoPlayerPage;
