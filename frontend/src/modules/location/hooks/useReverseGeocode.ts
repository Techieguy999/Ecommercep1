import { useState, useCallback } from 'react';
import { LocationService } from '../services/locationService';
import type { ReverseGeocodeResult } from '../types/location.types';

export function useReverseGeocode() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const performReverseGeocode = useCallback(async (lat: number, lng: number): Promise<ReverseGeocodeResult | null> => {
    setLoading(true);
    setError(null);
    try {
      const result = await LocationService.reverseGeocode(lat, lng);
      if (!result) {
        setError('No address matches these coordinates.');
        return null;
      }
      return result;
    } catch (err) {
      console.error('Reverse geocode hook error:', err);
      setError('Failed to resolve coordinates. Check your connection.');
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    performReverseGeocode
  };
}
