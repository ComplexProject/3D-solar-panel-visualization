const API_URL = "http://localhost:8501";

export const testApiGateway = async () => {
  try {
    const response = await fetch(`${API_URL}`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching data:", error);
    return null;
  }
};
