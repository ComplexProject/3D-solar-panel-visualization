export interface DummyData {
  totalEnergy: number;
  energyFromGrid: number;
  pvProduction: number;
  solarPanels: {
    azimuth: number;
    slope: number;
  }[];
}

const API_URL = "http://localhost:8510";

export const getDummyData = async (): Promise<DummyData | null> => {
  try {
    const response = await fetch(`${API_URL}/getDummy`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data: DummyData = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching dummy data:", error);
    return null;
  }
};
