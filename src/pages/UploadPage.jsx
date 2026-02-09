import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Upload, X, Film, CheckCircle, AlertCircle, ArrowLeft, Plus } from 'lucide-react';

const UploadPage = () => {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [videoFile, setVideoFile] = useState(null);
    const [videoPreview, setVideoPreview] = useState(null);
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [tags, setTags] = useState('');
    const [isUploading, setIsUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStatus, setUploadStatus] = useState('idle'); // idle, uploading, success, error

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
            setUploadStatus('idle');
        } else {
            alert('Please select a valid video file.');
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
        e.stopPropagation();
    };

    const handleDrop = (e) => {
        e.preventDefault();
        e.stopPropagation();
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('video/')) {
            setVideoFile(file);
            const url = URL.createObjectURL(file);
            setVideoPreview(url);
            setUploadStatus('idle');
        }
    };

    const clearSelection = () => {
        setVideoFile(null);
        setVideoPreview(null);
        setUploadStatus('idle');
        setUploadProgress(0);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handlePublish = () => {
        if (!videoFile || !title) {
            alert('Please select a video and provide a title.');
            return;
        }

        setIsUploading(true);
        setUploadStatus('uploading');

        // Mock upload progress
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            setUploadProgress(progress);
            if (progress >= 100) {
                clearInterval(interval);
                setUploadStatus('success');
                setIsUploading(false);
                setTimeout(() => {
                    navigate('/');
                }, 2000);
            }
        }, 300);
    };

    return (
        <div className="upload-container">
            <div className="upload-header">
                <button className="back-btn" onClick={() => navigate(-1)}>
                    <ArrowLeft size={24} />
                </button>
                <h2>Create Short</h2>
                <div style={{ width: 24 }}></div> {/* Spacer */}
            </div>

            <div className="upload-content">
                {!videoPreview ? (
                    <div
                        className="drop-zone"
                        onDragOver={handleDragOver}
                        onDrop={handleDrop}
                        onClick={() => fileInputRef.current?.click()}
                    >
                        <div className="drop-zone-icon">
                            <Upload size={48} />
                        </div>
                        <h3>Select video to upload</h3>
                        <p>Or drag and drop a file</p>
                        <ul className="upload-requirements">
                            <li>MP4 or WebM</li>
                            <li>Resolution 720x1280 or higher</li>
                            <li>Up to 60 seconds</li>
                            <li>Less than 50MB</li>
                        </ul>
                        <button className="select-file-btn">Select File</button>
                        <input
                            type="file"
                            ref={fileInputRef}
                            onChange={handleFileSelect}
                            accept="video/*"
                            style={{ display: 'none' }}
                        />
                    </div>
                ) : (
                    <div className="upload-workspace">
                        <div className="video-preview-container">
                            <video
                                src={videoPreview}
                                className="video-preview-element"
                                controls
                            />
                            {uploadStatus !== 'uploading' && (
                                <button className="clear-selection-btn" onClick={clearSelection}>
                                    <X size={20} />
                                </button>
                            )}

                            {uploadStatus === 'uploading' && (
                                <div className="upload-overlay">
                                    <div className="upload-progress-circle">
                                        <svg viewBox="0 0 36 36" className="circular-chart">
                                            <path className="circle-bg"
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                            <path className="circle"
                                                strokeDasharray={`${uploadProgress}, 100`}
                                                d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                                            />
                                        </svg>
                                        <span className="progress-text">{uploadProgress}%</span>
                                    </div>
                                    <p>Uploading to 3Speak...</p>
                                </div>
                            )}

                            {uploadStatus === 'success' && (
                                <div className="upload-overlay success">
                                    <CheckCircle size={64} color="#4ade80" />
                                    <h3>Published Successfully!</h3>
                                    <p>Redirecting to feed...</p>
                                </div>
                            )}
                        </div>

                        <div className="upload-form">
                            <div className="form-group">
                                <label>Title</label>
                                <input
                                    type="text"
                                    placeholder="Add a catchy title..."
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    maxLength={100}
                                    disabled={uploadStatus === 'uploading'}
                                />
                                <span className="char-count">{title.length}/100</span>
                            </div>

                            <div className="form-group">
                                <label>Description</label>
                                <textarea
                                    placeholder="Tell viewers about your video..."
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={4}
                                    disabled={uploadStatus === 'uploading'}
                                />
                            </div>

                            <div className="form-group">
                                <label>Tags (comma separated)</label>
                                <div className="tags-input-container">
                                    <Plus size={18} className="tag-icon" />
                                    <input
                                        type="text"
                                        placeholder="gaming, music, vlogs..."
                                        value={tags}
                                        onChange={(e) => setTags(e.target.value)}
                                        disabled={uploadStatus === 'uploading'}
                                    />
                                </div>
                            </div>

                            <div className="upload-actions">
                                <button
                                    className="publish-btn"
                                    onClick={handlePublish}
                                    disabled={uploadStatus === 'uploading' || !title || !videoFile}
                                >
                                    {uploadStatus === 'uploading' ? 'Publishing...' : 'Publish to 3Speak'}
                                </button>
                                <p className="disclaimer">
                                    By publishing, you agree to our Terms of Service and Privacy Policy.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default UploadPage;
