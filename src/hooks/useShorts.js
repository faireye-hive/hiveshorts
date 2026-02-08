import { useContext } from 'react';
import { ShortsContext } from '../context/ShortsContext';

export const useShorts = () => {
    const context = useContext(ShortsContext);
    if (!context) {
        throw new Error('useShorts must be used within a ShortsProvider');
    }
    return context;
};
