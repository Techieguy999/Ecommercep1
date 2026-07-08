import React from 'react';

interface AccuracyBadgeProps {
  accuracy?: string;
  className?: string;
}

/**
 * AccuracyBadge — Displays geocode accuracy badge (Rooftop vs Approximate)
 */
export const AccuracyBadge: React.FC<AccuracyBadgeProps> = ({ accuracy = 'APPROXIMATE', className = '' }) => {
  const isHigh = accuracy === 'ROOFTOP';

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${className}
      ${isHigh 
        ? 'bg-emerald-500/10 text-emerald-700 border border-emerald-500/30' 
        : 'bg-amber-500/10 text-amber-700 border border-amber-500/30'
      }`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${isHigh ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
      <span>{isHigh ? 'Precise Address Found (Rooftop)' : 'Approximate Location (Pin Dropped)'}</span>
    </div>
  );
};
