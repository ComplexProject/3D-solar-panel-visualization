export async function sendFormData() {
    const savedPower = JSON.parse(localStorage.getItem("power") || "0");
    const savedLatitude = JSON.parse(localStorage.getItem("latitude") || "0");
    const savedLongitude = JSON.parse(localStorage.getItem("longitude") || "0");
    const savedYear = JSON.parse(localStorage.getItem("year") || "2024");

    const storedFileData = localStorage.getItem("demandProfile");
    if (!storedFileData) {
        throw new Error("Demand profile file is required");
    }

    const fileData = JSON.parse(storedFileData);
    const response = await fetch(fileData.data);
    const blob = await response.blob();
    const file = new File([blob], fileData.name, { type: fileData.type });

    const formData = new FormData();
    formData.append('latitude', savedLatitude.toString());
    formData.append('longitude', savedLongitude.toString());
    formData.append('year', savedYear.toString());
    formData.append('maxPower', savedPower.toString());
    formData.append('demandProfile', file);

    const url = `http://localhost:8515/sendForm`;
    
    const resp = await fetch(url, {
        method: "POST",
        body: formData,
    });
    
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    return resp.json();
}