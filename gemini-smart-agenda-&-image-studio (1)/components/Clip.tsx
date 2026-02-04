
import React, { useState, useRef, useEffect } from 'react';
import { ClipData } from '../types';

interface ClipProps {
  data: ClipData;
}

const formatNumber = (num: number) => {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num;
};

const Clip: React.FC<ClipProps> = ({ data }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const options = {
      root: document.querySelector('.snap-y'),
      rootMargin: '0px',
      threshold: 0.6
    };

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        if (data.type === 'video') videoRef.current?.play();
        setIsPlaying(true);
      } else {
        if (data.type === 'video') {
          videoRef.current?.pause();
          if(videoRef.current) videoRef.current.currentTime = 0;
        }
        setIsPlaying(false);
      }
    }, options);

    const currentContainer = containerRef.current;
    if (currentContainer) {
      observer.observe(currentContainer);
    }

    return () => {
      if (currentContainer) {
        observer.unobserve(currentContainer);
      }
    };
  }, [data.type]);

  const handleVideoClick = () => {
    if (data.type === 'youtube') return; // Iframe handles its own clicks
    if (isPlaying) {
      videoRef.current?.pause();
    } else {
      videoRef.current?.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <div ref={containerRef} className="h-full w-full snap-start relative flex items-center justify-center bg-zinc-900">
      {data.type === 'video' ? (
        <video
          ref={videoRef}
          loop
          muted
          playsInline
          className="w-full h-full object-cover"
          onClick={handleVideoClick}
        >
          <source src={data.src} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      ) : (
        <iframe
          className="w-full h-full pointer-events-auto"
          src={`https://www.youtube.com/embed/${data.src}?autoplay=0&controls=0&loop=1&playlist=${data.src}&modestbranding=1&rel=0`}
          title="YouTube Shorts"
          frameBorder="0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        ></iframe>
      )}
      
      {data.type === 'video' && !isPlaying && (
        <div className="absolute text-white text-6xl opacity-70 pointer-events-none">
          <i className="fas fa-play"></i>
        </div>
      )}

      {/* UI Overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 text-white bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none">
        <div className="flex justify-between items-end">
          {/* Left side: user info & description */}
          <div className="flex-1 min-w-0 pr-12 pb-2">
            <div className="flex items-center space-x-2 mb-3 pointer-events-auto">
              <img src={data.avatar} alt={data.user} className="w-10 h-10 rounded-full border-2 border-white shadow-md" />
              <span className="font-bold text-shadow">{data.user}</span>
              <button className="bg-white text-black px-3 py-1 rounded-full text-xs font-bold hover:bg-red-600 hover:text-white transition ml-2">Subscribe</button>
            </div>
            <p className="text-sm text-shadow line-clamp-2">{data.description}</p>
          </div>

          {/* Right side: action buttons */}
          <div className="flex flex-col items-center space-y-5 pointer-events-auto mb-4">
            <button onClick={handleLike} className="group">
              <div className={`w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800/60 backdrop-blur-md transition-all group-hover:scale-110 ${isLiked ? 'text-red-600' : 'text-white'}`}>
                <i className="fas fa-thumbs-up text-xl"></i>
              </div>
              <span className="text-[10px] font-bold mt-1 text-white text-shadow uppercase">{formatNumber(data.likes + (isLiked ? 1 : 0))}</span>
            </button>
            <button className="group">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800/60 backdrop-blur-md transition-all group-hover:scale-110 text-white">
                <i className="fas fa-comment-dots text-xl"></i>
              </div>
              <span className="text-[10px] font-bold mt-1 text-white text-shadow uppercase">1.2K</span>
            </button>
            <button className="group">
              <div className="w-12 h-12 flex items-center justify-center rounded-full bg-zinc-800/60 backdrop-blur-md transition-all group-hover:scale-110 text-white">
                <i className="fas fa-share text-xl"></i>
              </div>
              <span className="text-[10px] font-bold mt-1 text-white text-shadow uppercase">Share</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Clip;
