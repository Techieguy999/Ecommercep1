import type { DistanceValidation } from '../types/location.types';

/**
 * Calculates the Haversine distance between two points in meters
 */
export function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371e3; // Earth's radius in meters
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaPhi = ((lat2 - lat1) * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(deltaPhi / 2) * Math.sin(deltaPhi / 2) +
    Math.cos(phi1) * Math.cos(phi2) * Math.sin(deltaLambda / 2) * Math.sin(deltaLambda / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // in meters
}

/**
 * Validates distance between GPS position and address target location (Phase 8 boundaries)
 */
export function validateDeliveryDistance(
  gpsLat: number,
  gpsLon: number,
  addressLat: number,
  addressLon: number
): DistanceValidation {
  const distance = calculateDistance(gpsLat, gpsLon, addressLat, addressLon);

  if (distance < 20) {
    return {
      status: 'at_location',
      message: 'You are at the delivery location.',
      distance
    };
  } else if (distance >= 20 && distance <= 100) {
    return {
      status: 'nearby',
      message: 'You appear to be nearby. Please verify your location.',
      distance
    };
  } else {
    return {
      status: 'away',
      message: 'You are away from the delivery location. Please move the marker or update the address.',
      distance
    };
  }
}
