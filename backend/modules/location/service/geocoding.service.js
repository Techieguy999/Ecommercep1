
const USER_AGENT = 'DevTech-Fashion-Ecom-Address-System';

/**
 * Forward Geocoding using Nominatim
 */
export async function forwardGeocode(addressData) {
  const { houseNumber, building, street, area, city, state, pincode, country = 'India' } = addressData;

  // Build search query: prioritize specific details first
  const queryParts = [
    houseNumber,
    building,
    street,
    area,
    city,
    state,
    pincode,
    country
  ].filter(Boolean);

  const query = queryParts.join(', ');
  const url = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(query)}&format=json&addressdetails=1&limit=5&countrycodes=in`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim request failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || data.length === 0) {
      // Fallback: search with a broader query (street, area, city, pincode)
      const fallbackParts = [street, area, city, pincode, country].filter(Boolean);
      const fallbackQuery = fallbackParts.join(', ');
      const fallbackUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(fallbackQuery)}&format=json&addressdetails=1&limit=5&countrycodes=in`;

      const fallbackResponse = await fetch(fallbackUrl, {
        headers: {
          'User-Agent': USER_AGENT
        }
      });
      if (fallbackResponse.ok) {
        const fallbackData = await fallbackResponse.json();
        if (fallbackData && fallbackData.length > 0) {
          return mapNominatimToGeocodeResult(fallbackData[0]);
        }
      }
      return null;
    }

    return mapNominatimToGeocodeResult(data[0]);
  } catch (error) {
    console.error('Geocoding service error:', error);
    throw error;
  }
}

/**
 * Reverse Geocoding using Nominatim
 */
export async function reverseGeocode(lat, lon) {
  const url = `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`;

  try {
    const response = await fetch(url, {
      headers: {
        'User-Agent': USER_AGENT
      }
    });

    if (!response.ok) {
      throw new Error(`Nominatim reverse geocode failed with status: ${response.status}`);
    }

    const data = await response.json();
    if (!data || !data.address) {
      return null;
    }

    return mapNominatimToAddressComponents(data);
  } catch (error) {
    console.error('Reverse geocoding service error:', error);
    throw error;
  }
}

function mapNominatimToGeocodeResult(item) {
  return {
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    formattedAddress: item.display_name,
    accuracy: item.importance > 0.6 ? 'ROOFTOP' : 'APPROXIMATE',
    address: {
      houseNumber: item.address.house_number || '',
      building: item.address.building || item.address.apartment || '',
      street: item.address.road || '',
      area: item.address.suburb || item.address.neighbourhood || item.address.village || '',
      city: item.address.city || item.address.town || item.address.municipality || '',
      state: item.address.state || '',
      country: item.address.country || 'India',
      pincode: item.address.postcode || ''
    }
  };
}

function mapNominatimToAddressComponents(item) {
  const addr = item.address;
  return {
    latitude: parseFloat(item.lat),
    longitude: parseFloat(item.lon),
    formattedAddress: item.display_name,
    accuracy: 'ROOFTOP', // Default to rooftop for exact pin drops
    address: {
      houseNumber: addr.house_number || '',
      building: addr.building || addr.apartment || addr.hotel || '',
      street: addr.road || '',
      area: addr.suburb || addr.neighbourhood || addr.village || addr.subdivision || '',
      city: addr.city || addr.town || addr.municipality || '',
      state: addr.state || '',
      country: addr.country || 'India',
      pincode: addr.postcode || ''
    }
  };
}
