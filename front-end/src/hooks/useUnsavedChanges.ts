export const useUnsavedChanges = () => {
  const checkUnsavedChanges = () => {
    try {
      const form = document.getElementById('advanced-settings-form') as HTMLFormElement;
      if (!form) return false;

      const lat = (form.elements.namedItem('latitude') as HTMLInputElement)?.value;
      const lon = (form.elements.namedItem('longitude') as HTMLInputElement)?.value;
      const year = (form.elements.namedItem('year') as HTMLInputElement)?.value;
      
      const savedLat = localStorage.getItem("latitude") ? JSON.parse(localStorage.getItem("latitude")!).toString() : '0';
      const savedLon = localStorage.getItem("longitude") ? JSON.parse(localStorage.getItem("longitude")!).toString() : '0';
      const savedYear = localStorage.getItem("year") ? JSON.parse(localStorage.getItem("year")!).toString() : '2023';
      
      return lat !== savedLat || lon !== savedLon || year !== savedYear;
    } catch(e) {
      console.error(e);
      return false
    }
  };

  return {checkUnsavedChanges};
};