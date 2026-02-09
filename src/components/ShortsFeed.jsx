import React, { useState, useEffect, useRef } from 'react';
import { useShorts } from '../hooks/useShorts';
import ShortItem from './ShortItem';

const ShortsFeed = () => {
    const { shorts, loading, hasMore, loadMore, activeIndex, setActiveIndex } = useShorts();
    // const [activeIndex, setActiveIndex] = useState(0); // Moved to Context
    const [muted, setMuted] = useState(true);
    const feedRef = useRef(null);

    // Initial scroll restoration
    useEffect(() => {
        if (feedRef.current && activeIndex > 0 && shorts.length > 0) {
            // Find the element with the corresponding data-index
            const activeElement = feedRef.current.querySelector(`[data-index="${activeIndex}"]`);
            if (activeElement) {
                activeElement.scrollIntoView({ block: 'start' });
            }
        }
    }, [shorts.length]); // Only try to scroll when shorts are loaded (or re-mounted)
    // Note: If shorts are already in context, they will be here on mount.

    // Intersection Observer to track which video is active (fully in view)
    useEffect(() => {
        const options = {
            root: feedRef.current,
            rootMargin: '0px',
            threshold: 0.6, // 60% of the video must be visible to be "active"
        };

        const handleIntersect = (entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    const index = Number(entry.target.dataset.index);
                    setActiveIndex(index);
                }
            });
        };

        const observer = new IntersectionObserver(handleIntersect, options);

        // We need to observe the children of the feed.
        // However, children are dynamic.
        // A simpler way with React is to attach a ref to each child or querySelector
        // But since ShortItem is a component, we can pass a ref or wrap it.
        // Let's use a slightly different approach:
        // We can query selector all .short-item inside useEffect whenever shorts changes.

        // Actually, attaching observer to elements:
        const elements = document.querySelectorAll('.short-item-wrapper');
        elements.forEach(el => observer.observe(el));

        return () => {
            observer.disconnect();
        };
    }, [shorts]); // Re-run when shorts list changes

    // Infinite scroll trigger
    const handleScroll = (e) => {
        const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
        if (scrollHeight - scrollTop <= clientHeight * 2) { // Load more when 2 screens away from bottom
            if (!loading && hasMore) {
                loadMore();
            }
        }
    };

    const toggleMute = () => {
        setMuted(prev => !prev);
    };

    return (
        <div className="shorts-feed" ref={feedRef} onScroll={handleScroll}>
            {shorts.map((short, index) => (
                <div
                    key={`${short.owner}-${short.permlink}-${index}`}
                    className="short-item-wrapper"
                    data-index={index}
                    style={{ height: '100%', width: '100%', scrollSnapAlign: 'start' }}
                >
                    <ShortItem
                        short={short}
                        isActive={index === activeIndex}
                        shouldLoad={index === activeIndex || index === activeIndex + 1 || index === activeIndex + 2}
                        muted={muted}
                        onToggleMute={toggleMute}
                    />
                </div>
            ))}
            {loading && <div className="loading-container">Loading more...</div>}
            {!hasMore && shorts.length > 0 && (
                <div className="loading-container" style={{ padding: '40px 20px' }}>
                    <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🎬</div>
                    <div>You're all caught up!</div>
                </div>
            )}
        </div>
    );
};

export default ShortsFeed;
