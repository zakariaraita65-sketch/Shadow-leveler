import React from 'react';

interface SystemLogoProps {
  color?: string;
  size?: number;
  className?: string;
  glow?: boolean;
}

export default function SystemLogo({ color = '#00ff9d', size = 40, className = "", glow = true }: SystemLogoProps) {
  return (
    <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
      {/* Glow Effect */}
      {glow && (
        <div 
          className="absolute inset-0 blur-md opacity-50 rounded-full"
          style={{ backgroundColor: color }}
        />
      )}
      
      {/* The Logo using Masking - Assuming user puts logo.png in public */}
      {/* We use a fallback SVG if logo.png is missing or until they upload it */}
      <div 
        className="w-full h-full relative z-10"
        style={{ 
          backgroundColor: color,
          maskImage: 'url(/logo.png)',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
          maskSize: 'contain',
          WebkitMaskImage: 'url(/logo.png)',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          WebkitMaskSize: 'contain',
        }}
      >
        {/* Fallback SVG logic: if mask fails, we show a simplified SVG version or just the shape */}
        {/* For now, we rely on the mask. If /logo.png is 404, it might show nothing. */}
        {/* I will add a default SVG path as a child just in case, but mask will override if image loads? No, mask works on the element itself. */}
      </div>

      {/* Backup SVG for the case where logo.png is not found yet - styled like the user's image */}
      <svg 
        viewBox="0 0 100 100" 
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ fill: color, filter: glow ? `drop-shadow(0 0 5px ${color})` : 'none' }}
      >
        {/* Stylized mask based on provided image: symmetric demonic/hunter mask */}
        <path d="M50 85 L45 50 L35 40 L50 15 L65 40 L55 50 Z M52 45 L85 15 L70 50 L75 75 L55 55 Z M48 45 L15 15 L30 50 L25 75 L45 55 Z" />
      </svg>
    </div>
  );
}
