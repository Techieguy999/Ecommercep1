import type { GeocodeResult, ReverseGeocodeResult, AddressFormData } from '../types/location.types';

const API_BASE_URL = 'http://localhost:5000/location';

export interface Geocoder {
  geocode(address: Partial<AddressFormData>): Promise<GeocodeResult | null>;
}

export interface ReverseGeocoder {
  reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null>;
}

/**
 * OpenStreetMap Nominatim Geocoder Adapter (calling our backend secure proxy)
 */
class NominatimGeocoder implements Geocoder {
  async geocode(address: Partial<AddressFormData>): Promise<GeocodeResult | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/geocode`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(address),
      });

      if (!response.ok) return null;
      const json = await response.json();
      return json.success ? json.data : null;
    } catch (error) {
      console.error('NominatimGeocoder error:', error);
      return null;
    }
  }
}

/**
 * OpenStreetMap Nominatim Reverse Geocoder Adapter
 */
class NominatimReverseGeocoder implements ReverseGeocoder {
  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    try {
      const response = await fetch(`${API_BASE_URL}/reverse`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ latitude: lat, longitude: lng }),
      });

      if (!response.ok) return null;
      const json = await response.json();
      return json.success ? json.data : null;
    } catch (error) {
      console.error('NominatimReverseGeocoder error:', error);
      return null;
    }
  }
}

// Current provider configuration (Nominatim)
const currentGeocoder = new NominatimGeocoder();
const currentReverseGeocoder = new NominatimReverseGeocoder();

/**
 * Unified Location Service - components invoke this rather than APIs directly.
 */
export const LocationService = {
  async geocode(address: Partial<AddressFormData>): Promise<GeocodeResult | null> {
    return currentGeocoder.geocode(address);
  },

  async reverseGeocode(lat: number, lng: number): Promise<ReverseGeocodeResult | null> {
    return currentReverseGeocoder.reverseGeocode(lat, lng);
  }
};
