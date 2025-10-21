import { useState } from "react";

interface Coordinate {
  latitude: number;
  longitude: number;
}

interface GeocodingResult {
  latitude: number;
  longitude: number;
  name: string;
  country: string;
}

function ApiTesting() {
  const [result, setResult] = useState<GeocodingResult[] | null>(null);
  const [message, setMessage] = useState<string>("");

  const apiKey = import.meta.env.VITE_API_KEY;
  const city = 'Middelburg';

  // Reference coordinates (you can set these to your current location)
  const referenceCoords: Coordinate = {
    latitude: 51.4988,  // Example: Rotterdam coordinates
    longitude: 4.2917
  };

  // Haversine formula to calculate distance between two coordinates
  function calculateDistance(coord1: Coordinate, coord2: Coordinate): number {
    const R = 6371; // Earth's radius in kilometers
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

  async function getGeocodingData() {
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
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: GeocodingResult[] = await response.json();
      console.log(data);
      setResult(data);

      // Check distance for each result
      if (data && data.length > 0) {
        const newCoords: Coordinate = {
          latitude: data[0].latitude,
          longitude: data[0].longitude
        };

        const distance = calculateDistance(referenceCoords, newCoords);
        
        if (distance <= 25) {
          setMessage(`📍 Distance: ${distance.toFixed(2)} km - Use the same weather`);
        } else {
          setMessage(`📍 Distance: ${distance.toFixed(2)} km - Use new weather`);
        }
      }

      return data;
    } catch (error) {
      console.error('Error:', error instanceof Error ? error.message : 'Unknown error');
      setMessage('Error fetching data');
    }
  }

  return (
    <div>
      <h1>Geocoding Data</h1>
      <button onClick={getGeocodingData}>Get Data</button>
      
      {message && (
        <div style={{ 
          margin: '10px 0', 
          padding: '10px', 
          backgroundColor: message.includes('same weather') ? '#d4edda' : '#f8d7da',
          border: `1px solid ${message.includes('same weather') ? '#c3e6cb' : '#f5c6cb'}`,
          borderRadius: '4px'
        }}>
          <strong>{message}</strong>
        </div>
      )}
      
      {result && <pre>{JSON.stringify(result, null, 2)}</pre>}
    </div>
  );
}

export default ApiTesting;