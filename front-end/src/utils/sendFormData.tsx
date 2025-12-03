export async function sendFormData() {
    const apiPort = import.meta.env.VITE_API_PORT;
    const savedPower = JSON.parse(localStorage.getItem("power") || "0");
    const savedLatitude = JSON.parse(localStorage.getItem("latitude") || "0");
    const savedLongitude = JSON.parse(localStorage.getItem("longitude") || "0");
    const savedYear = JSON.parse(localStorage.getItem("year") || "2023");

    const storedFileData = localStorage.getItem("demandProfile");
    if (!storedFileData) {
        throw new Error("Demand profile file is required");
    }

    const fileData = JSON.parse(storedFileData);
    const response = await fetch(fileData.data);
    const blob = await response.blob();
    const file = new File([blob], fileData.name, { type: fileData.type });

    const formData = new FormData();
    formData.append('latitude', String(savedLatitude));
    formData.append('longitude', String(savedLongitude));
    formData.append('year', String(savedYear));
    formData.append('maxPower', String(savedPower));
    formData.append('profileDemand', file);

    const url = `http://localhost:${apiPort}/getData`;
    
    const resp = await fetch(url, {
        method: "POST",
        body: formData,
    });
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
}