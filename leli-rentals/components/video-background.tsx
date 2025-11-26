"use client"

import React, { useEffect, useRef, useState } from 'react'

interface VideoBackgroundProps {
  src: string
  fallbackImage?: string
  className?: string
  children?: React.ReactNode
  overlayStyle?: string
}

export function VideoBackground({ 
  src, 
  fallbackImage = '/modern-rental-marketplace-hero-with-cars--apartmen.jpg',
  className = '',
  children,
  overlayStyle = ''
}: VideoBackgroundProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    let isSubscribed = true;

    const handleCanPlay = () => {
      if (isSubscribed) {
        setIsLoading(false);
        video.play().catch(() => {
          // Ignore autoplay errors
          setIsLoading(false);
        });
      }
    };

    const handlePlay = () => {
      if (isSubscribed) setIsPlaying(true);
    };

    const handleError = () => {
      if (isSubscribed) {
        console.error('Video error:', {
          error: video.error,
          src: video.currentSrc
        });
        setHasError(true);
        setIsLoading(false);
      }
    };

    // Configure video element
    video.muted = true;
    video.playsInline = true;
    video.autoplay = true;
    video.load();

    // Add event listeners
    video.addEventListener('canplay', handleCanPlay);
    video.addEventListener('playing', handlePlay);
    video.addEventListener('error', handleError);

    return () => {
      isSubscribed = false;
      video.removeEventListener('canplay', handleCanPlay);
      video.removeEventListener('playing', handlePlay);
      video.removeEventListener('error', handleError);
    };
  }, []);

  return (
    <div className={`relative w-full h-full overflow-hidden ${className}`}>
      {/* Fallback Image */}
      <img
        src={fallbackImage}
        alt="Background"
        className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
          isPlaying ? 'opacity-0' : 'opacity-100'
        }`}
      />

      {/* Video Layer */}
      {!hasError && (
        <video
          ref={videoRef}
          playsInline
          autoPlay
          loop
          muted
          preload="metadata"
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            isPlaying ? 'opacity-100' : 'opacity-0'
          }`}
          poster={fallbackImage}
        >
          <source src={src} type="video/mp4" />
        </video>
      )}

      {/* Loading Indicator */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/20">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-white"></div>
        </div>
      )}

      {/* Overlay */}
      <div className={`absolute inset-0 bg-linear-to-br from-black/50 via-black/30 to-black/60 dark:from-black/70 dark:via-black/50 dark:to-black/80 transition-all duration-500 ${overlayStyle}`} />

      {/* Content Layer */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
