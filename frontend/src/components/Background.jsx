import React from 'react';

const Background = () => {
  return (
    <div 
      style={{ 
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        zIndex: -1,
        overflow: 'hidden',
        margin: 0,
        padding: 0,
        backgroundColor: '#0F172A', // Add background color as fallback
      }}
    >
      <svg 
        xmlns="http://www.w3.org/2000/svg" 
        viewBox="0 0 1200 800" 
        style={{ 
          width: '100%', 
          height: '100%',
          display: 'block',
          position: 'absolute',
          top: 0,
          left: 0,
        }}
        preserveAspectRatio="xMidYMid slice" // This ensures the SVG covers the entire area
      >
        {/* Base background */}
        <rect width="100%" height="100%" fill="#0F172A" />
        
        <defs>
          {/* Base gradient with code pattern colors */}
          <linearGradient id="baseGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#0F172A" />
            <stop offset="100%" stopColor="#0D1B2A" />
          </linearGradient>
          
          {/* Pattern definition from geometric background */}
          <pattern id="hexPattern" width="60" height="60" patternUnits="userSpaceOnUse" patternTransform="rotate(10)">
            <path d="M30 0 L60 17.32 L60 51.96 L30 69.28 L0 51.96 L0 17.32 Z" fill="none" stroke="rgba(14, 165, 233, 0.15)" strokeWidth="1" />
          </pattern>
        </defs>
        
        {/* Background with gradient */}
        <rect width="100%" height="100%" fill="url(#baseGradient)" />
        
        {/* Overlay geometric pattern */}
        <rect width="100%" height="100%" fill="url(#hexPattern)" />
        
        {/* Abstract shapes with code pattern colors */}
        <circle cx="150" cy="100" r="120" fill="rgba(14, 165, 233, 0.05)" />
        <circle cx="1050" cy="700" r="180" fill="rgba(14, 165, 233, 0.03)" />
        <path d="M900,200 L1100,300 L1000,500 Z" fill="rgba(14, 165, 233, 0.04)" />
        <path d="M200,500 L350,650 L100,700 Z" fill="rgba(14, 165, 233, 0.04)" />
        
        {/* Code pattern elements */}
        <g opacity="0.15" fill="#64FFDA">
          {/* Code symbols scattered across the background */}
          <text x="100" y="100" fontFamily="monospace" fontSize="12">&lt;/&gt;</text>
          <text x="300" y="150" fontFamily="monospace" fontSize="12">function()</text>
          <text x="500" y="80" fontFamily="monospace" fontSize="12">{'{}'}</text>
          <text x="700" y="120" fontFamily="monospace" fontSize="12">import</text>
          <text x="900" y="90" fontFamily="monospace" fontSize="12">const</text>
          <text x="1100" y="130" fontFamily="monospace" fontSize="12">=&gt;</text>
          
          <text x="150" y="200" fontFamily="monospace" fontSize="12">class</text>
          <text x="350" y="230" fontFamily="monospace" fontSize="12">return</text>
          <text x="550" y="190" fontFamily="monospace" fontSize="12">&&</text>
          <text x="750" y="220" fontFamily="monospace" fontSize="12">||</text>
          <text x="950" y="250" fontFamily="monospace" fontSize="12">export</text>
          <text x="1150" y="210" fontFamily="monospace" fontSize="12">while</text>
          
          <text x="200" y="320" fontFamily="monospace" fontSize="12">async</text>
          <text x="400" y="350" fontFamily="monospace" fontSize="12">await</text>
          <text x="600" y="300" fontFamily="monospace" fontSize="12">[...]</text>
          <text x="800" y="380" fontFamily="monospace" fontSize="12">render()</text>
          <text x="1000" y="330" fontFamily="monospace" fontSize="12">git</text>
          
          <text x="100" y="450" fontFamily="monospace" fontSize="12">npm</text>
          <text x="300" y="480" fontFamily="monospace" fontSize="12">react</text>
          <text x="500" y="430" fontFamily="monospace" fontSize="12">def</text>
          <text x="700" y="460" fontFamily="monospace" fontSize="12">if()</text>
          <text x="900" y="440" fontFamily="monospace" fontSize="12">else</text>
          <text x="1100" y="470" fontFamily="monospace" fontSize="12">try</text>
          
          <text x="150" y="550" fontFamily="monospace" fontSize="12">catch</text>
          <text x="350" y="580" fontFamily="monospace" fontSize="12">finally</text>
          <text x="550" y="530" fontFamily="monospace" fontSize="12">var</text>
          <text x="750" y="560" fontFamily="monospace" fontSize="12">let</text>
          <text x="950" y="590" fontFamily="monospace" fontSize="12">for</text>
          <text x="1150" y="540" fontFamily="monospace" fontSize="12">map()</text>
          
          <text x="200" y="650" fontFamily="monospace" fontSize="12">filter()</text>
          <text x="400" y="680" fontFamily="monospace" fontSize="12">reduce()</text>
          <text x="600" y="630" fontFamily="monospace" fontSize="12">state</text>
          <text x="800" y="660" fontFamily="monospace" fontSize="12">props</text>
          <text x="1000" y="640" fontFamily="monospace" fontSize="12">commit</text>
        </g>
        
        {/* Subtle blue glow effects */}
        <circle cx="300" cy="200" r="150" fill="#0EA5E9" opacity="0.05" />
        <circle cx="900" cy="600" r="200" fill="#0EA5E9" opacity="0.05" />
      </svg>
    </div>
  );
};

export default Background;