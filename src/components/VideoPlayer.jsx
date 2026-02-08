import React, { useEffect, useRef, useState } from 'react';
import Hls from 'hls.js';
import { Play, Pause, Volume2, VolumeX } from 'lucide-react';

const VideoPlayer = ({ src, poster, isActive, muted, onToggleMute }) => {
    const videoRef = useRef(null);
    const hlsRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        // Check if HLS is supported by browser or valid Hls.js usage
        if (Hls.isSupported()) {
            if (hlsRef.current) hlsRef.current.destroy();

            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
            });

            hls.loadSource(src);
            hls.attachMedia(video);
            hlsRef.current = hls;

            hls.on(Hls.Events.MANIFEST_PARSED, () => {
                if (isActive) video.play().catch(() => { });
            });
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            video.src = src;
            if (isActive) video.play().catch(() => { });
        }

        return () => {
            if (hlsRef.current) hlsRef.current.destroy();
        };
    }, [src]);

    useEffect(() => {
        const video = videoRef.current;
        if (!video) return;

        if (isActive) {
            const playPromise = video.play();
            if (playPromise !== undefined) {
                playPromise.catch(error => {
                    console.log("Auto-play was prevented", error);
                });
            }
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    }, [isActive]);

    const togglePlay = () => {
        const video = videoRef.current;
        if (video.paused) {
            video.play();
            setIsPlaying(true);
        } else {
            video.pause();
            setIsPlaying(false);
        }
    };

    return (
        <div className="video-container" onClick={togglePlay}>
            <video
                ref={videoRef}
                poster={poster}
                className="video-player"
                loop
                playsInline
                muted={muted}
            />

            {/* Play/Pause Overlay Animation (Optional) */}
            {!isPlaying && (
                <div className="play-overlay">
                    <Play size={64} fill="white" stroke="none" />
                </div>
            )}

            {/* Mute Toggle */}
            <button
                className="mute-btn"
                onClick={(e) => { e.stopPropagation(); onToggleMute(); }}
            >
                {muted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
        </div>
    );
};

export default VideoPlayer;
