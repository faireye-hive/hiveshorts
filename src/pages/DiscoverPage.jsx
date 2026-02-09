import React, { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDiscoverContext } from '../context/DiscoverContext';
import { Search, X } from 'lucide-react';

const CATEGORIES = [
    { id: 'all', label: 'All' },
    { id: 'gaming', label: '🎮 Gaming' },
    { id: 'music', label: '🎵 Music' },
    { id: 'vlogs', label: '📹 Vlogs' },
    { id: 'education', label: '📚 Education' },
    { id: 'sports', label: '⚽ Sports' },
    { id: 'comedy', label: '😂 Comedy' },
];

const DiscoverPage = () => {
    const { videos, loading, hasMore, loadMore, scrollPosition, setScrollPosition } = useDiscoverContext();
    const navigate = useNavigate();
    const containerRef = useRef(null);
    const scrollRef = useRef(scrollPosition);
    const observer = useRef();

    const [searchQuery, setSearchQuery] = useState('');
    const [activeCategory, setActiveCategory] = useState('all');

    // Filtered videos based on search and category
    const filteredVideos = useMemo(() => {
        let filtered = videos;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter(video =>
                video.title?.toLowerCase().includes(query) ||
                video.owner?.toLowerCase().includes(query)
            );
        }

        // Could add category filtering if tags are available in API
        // For now, category filter is visual only

        return filtered;
    }, [videos, searchQuery]);

    // Restore scroll position on mount
    useEffect(() => {
        if (containerRef.current) {
            containerRef.current.scrollTop = scrollPosition;
        }
    }, [scrollPosition]);

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

    const clearSearch = () => {
        setSearchQuery('');
    };

    return (
        <div className="discover-container" ref={containerRef} onScroll={handleScroll}>
            {/* Modern Header */}
            <div className="discover-header">
                <h2 className="discover-title">Discover</h2>
                <p className="discover-subtitle">{videos.length} shorts available</p>
            </div>

            {/* Search Bar */}
            <div className="discover-search-wrapper">
                <div className="discover-search">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="Search shorts, creators..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search-input"
                    />
                    {searchQuery && (
                        <button onClick={clearSearch} className="search-clear">
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Category Filters */}
            <div className="filter-chips-wrapper">
                <div className="filter-chips">
                    {CATEGORIES.map(category => (
                        <button
                            key={category.id}
                            className={`filter-chip ${activeCategory === category.id ? 'active' : ''}`}
                            onClick={() => setActiveCategory(category.id)}
                        >
                            {category.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Video Grid */}
            <div className="video-grid">
                {filteredVideos.map((video, index) => {
                    const isLastVideo = filteredVideos.length === index + 1;
                    return (
                        <div
                            key={`${video.permlink}-${index}`}
                            className="discover-card"
                            ref={isLastVideo ? lastVideoElementRef : null}
                            onClick={() => navigate(`/watch/${video.owner}/${video.permlink}`)}
                        >
                            {/* Thumbnail */}
                            {(video.thumbnail_url || video.thumbnail) ? (
                                <img
                                    src={video.thumbnail_url || video.thumbnail}
                                    alt={video.title}
                                    loading="lazy"
                                    className="card-thumbnail"
                                    onError={(e) => {
                                        e.target.onerror = null;
                                        e.target.src = 'https://via.placeholder.com/150x266?text=No+Preview';
                                    }}
                                />
                            ) : (
                                <div className="no-thumbnail">
                                    <span>Preview</span>
                                </div>
                            )}

                            {/* Author Avatar Badge */}
                            <div className="card-author-badge">
                                <img
                                    src={`https://images.hive.blog/u/${video.owner}/avatar`}
                                    alt={video.owner}
                                    className="author-avatar-small"
                                />
                            </div>

                            {/* Hover Overlay */}
                            <div className="card-hover-overlay">
                                <div className="card-info">
                                    <p className="card-author">@{video.owner}</p>
                                    <p className="card-title">{video.title || 'Untitled'}</p>
                                </div>
                            </div>

                            {/* Stats Badge */}
                            <div className="grid-stats">
                                <span>👁 {video.views}</span>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* No Results */}
            {filteredVideos.length === 0 && !loading && (
                <div className="no-results">
                    <div className="no-results-icon">🔍</div>
                    <p className="no-results-text">No shorts found</p>
                    <p className="no-results-subtext">Try adjusting your search</p>
                </div>
            )}

            {/* Loading More */}
            {loading && <div className="loading-more">Loading more...</div>}
        </div>
    );
};

export default DiscoverPage;
