interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

/**
 * Haversine formula to calculate distance between two points
 * And calculate the distance between 2 coordinates to see how apart they are
 * https://www.movable-type.co.uk/scripts/latlong.html
 * 
 * R - the earth radius in kilometers
 * a - square half of the length between coordinates
 * c - angular distance in radians
 * 
 * @param coord1 reference coordinates
 * @param coord2 new coordinates
 * @returns distance between the coordinates
 */
function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
  const R = 6371;
  const dLat = toRadians(coord2.latitude - coord1.latitude);
  const dLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(coord1.latitude)) * Math.cos(toRadians(coord2.latitude)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;

  return distance;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

export async function GetGeocodingData(city:string) {
  const apiKey = import.meta.env.VITE_API_KEY;
  try {
    const response = await fetch(
      `https://api.api-ninjas.com/v1/geocoding?city=${city}&country=NL`,
      {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
      
if (!response.ok) {
      let message = `Request failed with status ${response.status}`;

      switch (response.status) {
        case 400:
          message = "Bad request (400). Check your parameters.";
          break;
        case 404:
          message = "Not found (404). City not found.";
          break;
        case 500:
          message = "Server error (500). Try again later.";
          break;
      }

      throw new Error(message);
    }

    const data: GeocodingResult[] = await response.json();
    try {
    } catch{
      throw new Error("Failed to parse JSON response.");
    }

    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error("No results for this city.");
    }

    return data[0];

    // if (data && data.length > 0) {
    //   const newCoords: Coordinate = {
    //     latitude: data[0].latitude,
    //     longitude: data[0].longitude
    //   };

    //   const distance = calculateDistance(referenceCoords, newCoords);

  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
  }
}
