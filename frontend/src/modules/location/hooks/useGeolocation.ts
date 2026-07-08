import { useState, useCallback } from 'react';
import type { GPSLocation } from '../types/location.types';

export type GeolocationStatus = 'idle' | 'loading' | 'success' | 'error' | 'denied';

export function useGeolocation() {
  const [status, setStatus] = useState<GeolocationStatus>('idle');
  const [error, setError] = useState<string | null>(null);
  const [coords, setCoords] = useState<GPSLocation | null>(null);

  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setStatus('error');
      setError('Geolocation is not supported by your browser.');
      return;
    }

    setStatus('loading');
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy
        });
        setStatus('success');
      },
      (geoError) => {
        console.warn('Geolocation access failed:', geoError);
        if (geoError.code === geoError.PERMISSION_DENIED) {
          setStatus('denied');
          setError('Location permission denied. Please enter address manually.');
        } else {
          setStatus('error');
          setError(geoError.message || 'Unable to retrieve location coordinates.');
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );
  }, []);

  return {
    status,
    error,
    coords,
    requestLocation
  };
}
