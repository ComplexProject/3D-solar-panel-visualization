interface GeocodingCoordinateResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface GeocodingCityResult {
  name: string;
  country: string;
  state: string;
}

interface ExtractedCoordinate {
  lat: number;
  lon: number;
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

function extractCoordinates(filenames: string[]): ExtractedCoordinate[] {
  return filenames
    .map(filename => {
      const match = filename.match(/_(\d+\.\d+)_(\d+\.\d+)\.mat$/);
      if (match) {
        return {
          lat: parseFloat(match[1]),
          lon: parseFloat(match[2])
        };
      }
      return null;
    })
    .filter((coord): coord is ExtractedCoordinate => coord !== null);
}

/**
 * Find the closest coordinate from a list of extracted coordinates
 */
function findClosestCoordinate(
  targetCoord: Coordinate, 
  extractedCoords: ExtractedCoordinate[], 
  maxDistance = 50
): {coord: ExtractedCoordinate | null, distance: number} {
  let closestCoord: ExtractedCoordinate | null = null;
  let minDistance = Infinity;
  
  for (const coord of extractedCoords) {
    const extractedCoord: Coordinate = {
      latitude: coord.lat,
      longitude: coord.lon
    };
    
    const distance = calculateDistance(targetCoord, extractedCoord);
    
    if (distance < minDistance) {
      minDistance = distance;
      closestCoord = coord;
    }
  }
  
  if (closestCoord && minDistance < maxDistance) {
    return { coord: closestCoord, distance: minDistance };
  }
  
  return { coord: null, distance: minDistance };
}

/**
 * Common API error handler
 */
function handleApiError(status: number): string {
  let message = `Request failed with status ${status}`;

  switch (status) {
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

  return message;
}

/**
 * Common API response handler
 */
async function handleApiResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(handleApiError(response.status));
  }

  try {
    return await response.json();
  } catch {
    throw new Error("Failed to parse JSON response.");
  }
}

/**
 * Common function to fetch saved files and extract coordinates
 */
async function fetchAndExtractCoordinates(year: number): Promise<ExtractedCoordinate[]> {
  try {
    const filesResponse = await fetch(`http://localhost:8505/listSavedFilesForFrontEnd?year=${year}`);
    const filesData = await filesResponse.json();
    return extractCoordinates(filesData.saved_files);
  } catch (err) {
    console.warn("Could not fetch file list:", err);
    return [];
  }
}

/**
 * API call that gets the latitude and longitude of a user defined city
 * @param city - user defined city
 * @param year - user defined year
 * @returns latitude and longitude
 */
export async function GetCoordinates(city: string, year: number) {
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
    
    const data: GeocodingCoordinateResult[] = await handleApiResponse(response);
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error("No results for this city.");
    }

    const cityCoords: Coordinate = {
      latitude: data[0].latitude,
      longitude: data[0].longitude
    };

    const extractedCoordinates = await fetchAndExtractCoordinates(year);
    
    if (extractedCoordinates.length > 0) {
      const { coord: closestCoord, distance } = findClosestCoordinate(cityCoords, extractedCoordinates);
      
      if (closestCoord) {
        try {
          window.dispatchEvent(new CustomEvent('closestCityFound', {
            detail: {
              lat: closestCoord.lat,
              lon: closestCoord.lon,
              distance: distance
            }
          }));
        } catch (e) {
          console.warn('Could not dispatch closestCityFound event', e);
        }
      } else {
        console.log("No coordinates found within 50 km distance.");
      }
    } else {
      console.log("No coordinates found in filenames to compare with.");
    }
    
    return data[0];
  } catch (error) {
    console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
    throw error;
  }
}

/**
 * Find the closest coordinate from saved files within 50 km distance
 * @param latitude - user latitude
 * @param longitude - user longitude
 * @param year - year to search in
 * @returns closest coordinate if found within 50 km, null otherwise
 */
export async function findClosestSavedCoordinate(latitude: number, longitude: number, year: number) {
  const userCoords: Coordinate = {
    latitude: latitude,
    longitude: longitude
  };

  const extractedCoordinates = await fetchAndExtractCoordinates(year);
  
  if (extractedCoordinates.length === 0) {
    return null;
  }
  
  const { coord: closestCoord, distance } = findClosestCoordinate(userCoords, extractedCoordinates);
  
  if (closestCoord) {
    try {
      window.dispatchEvent(new CustomEvent('closestCityFound', {
        detail: {
          lat: closestCoord.lat,
          lon: closestCoord.lon,
          distance: distance
        }
      }));
    } catch (e) {
      console.warn('Could not dispatch closestCityFound event', e);
    }
    
    return closestCoord;
  }
  
  return null;
}

/**
 * API call to get the City from user defined latitude and longitude
 * @param latitude - user defined latitude
 * @param longitude - user defined longitude
 * @returns City name
 */
export async function GetCityName(latitude: number, longitude: number) {
  const apiKey = import.meta.env.VITE_API_KEY;
  
  try {
    const response = await fetch(
      `https://api.api-ninjas.com/v1/reversegeocoding?lat=${latitude}&lon=${longitude}`,
      {
        method: 'GET',
        headers: {
          'X-Api-Key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    
    const data: GeocodingCityResult[] = await handleApiResponse(response);
    
    if (!data || (Array.isArray(data) && data.length === 0)) {
      throw new Error("No result for these coordinates");
    }

    return data[0];
  } catch (error) {
    console.error("Error:", error instanceof Error ? error.message : 'Unknown error occurred');
    throw error;
  }
}