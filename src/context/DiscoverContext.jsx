import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchShorts } from '../services/api';

export const DiscoverContext = createContext(null);

export const DiscoverProvider = ({ children }) => {
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [scrollPosition, setScrollPosition] = useState(0);

    const loadDiscoverVideos = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const data = await fetchShorts(page, 24);
            if (data && data.shorts && data.shorts.length > 0) {
                setVideos(prevVideos => {
                    const newVideos = data.shorts.filter(
                        newVid => !prevVideos.some(prevVid => prevVid.permlink === newVid.permlink)
                    );
                    return [...prevVideos, ...newVideos];
                });

                if (data.totalPages) {
                    setHasMore(page < data.totalPages);
                } else {
                    setHasMore(data.shorts.length === 24);
                }

                setPage(prev => prev + 1);
            } else {
                setHasMore(false);
            }
        } catch (error) {
            console.error("Failed to fetch discover videos", error);
        } finally {
            setLoading(false);
        }
    };

    // Initial load
    useEffect(() => {
        if (videos.length === 0) {
            // We need to kick off the first load. 
            // But wait, if page is 1 and videos is 0, we should load.
            // But loadDiscoverVideos uses 'page' state.
            loadDiscoverVideos();
        }
    }, []);

    const refresh = async () => {
        setVideos([]);
        setPage(1);
        setHasMore(true);
        setLoading(false); // Reset loading state
        // We need to trigger load, but loadDiscoverVideos depends on state which might not be updated yet?
        // Actually, if we clear videos, the useEffect hook will see videos.length === 0 and trigger loadDiscoverVideos.
        // BUT, useEffect only runs on mount.
        // So we should manually call loadDiscoverVideos after state reset?
        // Better: clear videos, then call loadDiscoverVideos with page 1 override?
        // Simpler: Just clear videos. The useEffect dependency array is empty, so it won't re-run.
        // So we need to explicitly call load. 
        // Let's make loadDiscoverVideos accept an optional page argument to override state?
        // Or just set state and then call a separate fetch function?
        // Let's try:
        setVideos([]);
        setPage(1);
        setHasMore(true);
        // We can't immediately call loadDiscoverVideos because 'page' state is scheduled to update.
        // We can pass page 1 to fetchShorts directly in a slightly modified load function or here.

        setLoading(true);
        try {
            const data = await fetchShorts(1, 24); // Force page 1
            if (data && data.shorts && data.shorts.length > 0) {
                setVideos(data.shorts);
                if (data.totalPages) {
                    setHasMore(1 < data.totalPages);
                } else {
                    setHasMore(data.shorts.length === 24);
                }
                setPage(2);
            } else {
                setHasMore(false);
            }
        } catch (e) {
            console.error(e);
        } finally {
            setLoading(false);
        }
    };

    const value = {
        videos,
        loading,
        hasMore,
        loadMore: loadDiscoverVideos,
        scrollPosition,
        setScrollPosition,
        refresh
    };

    return (
        <DiscoverContext.Provider value={value}>
            {children}
        </DiscoverContext.Provider>
    );
};

export const useDiscoverContext = () => {
    const context = useContext(DiscoverContext);
    if (!context) {
        throw new Error('useDiscoverContext must be used within a DiscoverProvider');
    }
    return context;
};
