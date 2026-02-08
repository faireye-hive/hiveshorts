import React, { createContext, useState, useContext, useEffect } from 'react';
import { fetchShorts } from '../services/api';

export const ShortsContext = createContext(null);

export const ShortsProvider = ({ children }) => {
    const [shorts, setShorts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    const loadMore = async () => {
        if (loading || !hasMore) return;
        setLoading(true);
        try {
            const data = await fetchShorts(page);
            if (data && data.shorts && data.shorts.length > 0) {
                // Filter out duplicates if any
                setShorts(prev => {
                    const newShorts = data.shorts.filter(
                        newShort => !prev.some(
                            existing => existing.owner === newShort.owner && existing.permlink === newShort.permlink
                        )
                    );
                    return [...prev, ...newShorts];
                });
                setPage(prev => prev + 1);
                if (page >= data.totalPages) setHasMore(false);
            } else {
                setHasMore(false);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Initial load only if empty
    useEffect(() => {
        if (shorts.length === 0) {
            loadMore();
        }
    }, []);

    const value = {
        shorts,
        loading,
        hasMore,
        loadMore,
        activeIndex,
        setActiveIndex
    };

    return (
        <ShortsContext.Provider value={value}>
            {children}
        </ShortsContext.Provider>
    );
};

export const useShortsContext = () => useContext(ShortsContext);
