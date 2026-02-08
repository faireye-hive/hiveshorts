import React, { useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscoverContext } from '../context/DiscoverContext';

const DiscoverPage = () => {
    const { videos, loading, hasMore, loadMore, scrollPosition, setScrollPosition } = useDiscoverContext();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const scrollRef = useRef(scrollPosition); // Track locally to avoid context updates on every scroll
    const observer = useRef();

    // Restore scroll position on mount
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = scrollPosition;
        }
    }, [scrollPosition]); // videos dependency might be needed if restoration happens before render?
    // Actually, if videos are already in context, they render immediately. 
    // We might need to wait for render.

    // Save scroll position on unmount
    useEffect(() => {
        return () => {
            setScrollPosition(scrollRef.current);
        };
    }, [setScrollPosition]);

    const handleScroll = (e) => {
        scrollRef.current = e.target.scrollTop;
    };

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

    return (
        <div className="discover-container" ref={containerRef} onScroll={handleScroll}>
            <h2 className="page-header">Discover</h2>
            <div className="video-grid">
                {videos.map((video, index) => {
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
                })}
            </div>
            {loading && <div className="loading-more">Loading more...</div>}
        </div>
    );
};

export default DiscoverPage;
