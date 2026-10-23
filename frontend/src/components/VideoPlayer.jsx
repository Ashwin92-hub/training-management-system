import React from 'react';

const VideoPlayer = ({ videoUrl, title }) => {
  if (!videoUrl) return null;

  // Convert standard YouTube watch URLs to embed format if needed
  let embedUrl = videoUrl;
  if (videoUrl.includes('youtube.com/watch?v=')) {
    const videoId = videoUrl.split('v=')[1]?.split('&')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  } else if (videoUrl.includes('youtu.be/')) {
    const videoId = videoUrl.split('youtu.be/')[1]?.split('?')[0];
    embedUrl = `https://www.youtube.com/embed/${videoId}`;
  }

  return (
    <div style={{
      width: '100%',
      borderRadius: 'var(--radius-md)',
      overflow: 'hidden',
      boxShadow: '0 8px 30px rgba(0,0,0,0.5)',
      background: '#000',
      marginBottom: '20px',
      aspectRatio: '16/9'
    }}>
      <iframe
        src={embedUrl}
        title={title || "Video Training Module"}
        style={{ width: '100%', height: '100%', border: 'none' }}
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      />
    </div>
  );
};

export default VideoPlayer;
