const API_URL = "http://localhost:8510";

export const getDummyData = async () => {
  try {
    const response = await fetch(`${API_URL}/getDummy`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching dummy data:", error);
    return null;
  }
};

// export const getResult = async () => {
//   try {
//     const response = await fetch ()
//   }
// }