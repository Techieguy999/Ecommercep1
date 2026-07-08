import React, { useEffect, useState } from 'react';
import { validateDeliveryDistance } from '../utils/distance';
import type { DistanceValidation, Coordinates } from '../types/location.types';

interface DistanceAlertProps {
  gpsCoords: Coordinates | null;
  markerCoords: Coordinates;
  className?: string;
}

/**
 * DistanceAlert — Displays warnings based on the distance between 
 * browser GPS coordinates and the selected address marker position.
 */
export const DistanceAlert: React.FC<DistanceAlertProps> = ({ gpsCoords, markerCoords, className = '' }) => {
  const [validation, setValidation] = useState<DistanceValidation | null>(null);

  useEffect(() => {
    if (!gpsCoords) {
      setValidation(null);
      return;
    }

    const result = validateDeliveryDistance(
      gpsCoords.lat,
      gpsCoords.lng,
      markerCoords.lat,
      markerCoords.lng
    );
    setValidation(result);
  }, [gpsCoords, markerCoords]);

  if (!validation) return null;

  const styles = {
    at_location: 'bg-emerald-500/10 border-emerald-500/30 text-emerald-700',
    nearby: 'bg-amber-500/10 border-amber-500/30 text-amber-700',
    away: 'bg-red-500/10 border-red-500/30 text-red-700'
  };

  const icons = {
    at_location: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    nearby: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    away: (
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
      </svg>
    )
  };

  return (
    <div className={`flex items-start gap-3 p-4 rounded-xl border transition-all duration-200 text-sm ${styles[validation.status]} ${className}`}>
      {icons[validation.status]}
      <div className="space-y-0.5">
        <p className="font-semibold">{validation.message}</p>
        <p className="text-xs opacity-70">
          Distance offset: {validation.distance.toFixed(1)} meters
        </p>
      </div>
    </div>
  );
};
