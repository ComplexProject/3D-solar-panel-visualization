import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react';

const inputClass = 'px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px]'

interface FormData {
  latitude: number;
  longitude: number;
  year: number;
  azimuthIncrement: number;
  slopeIncrement: number;
}

function AdvancedSettings() {
  const { register, handleSubmit, setValue } = useForm<FormData>();
  
  const [formData, setFormData] = useState<FormData>(() => {
    const savedLatitude = localStorage.getItem("latitude");
    const savedLongitude = localStorage.getItem("longitude");
    const savedYear = localStorage.getItem("year");
    const savedAzimuthIncrement = localStorage.getItem("azimuthIncrement");
    const savedSlopeIncrement = localStorage.getItem("slopeIncrement");

    return {
        latitude: savedLatitude ? JSON.parse(savedLatitude) : 0,
        longitude: savedLongitude ? JSON.parse(savedLongitude) : 0,
        year: savedYear ? JSON.parse(savedYear) : 2024,
        azimuthIncrement: savedAzimuthIncrement ? JSON.parse(savedAzimuthIncrement) : 5,
        slopeIncrement: savedSlopeIncrement ? JSON.parse(savedSlopeIncrement) : 2,
    };
  });

  useEffect(() => {
      setValue("latitude", formData.latitude);
      setValue("longitude", formData.longitude);
      setValue("year", formData.year);
      setValue("azimuthIncrement", formData.azimuthIncrement);
      setValue("slopeIncrement", formData.slopeIncrement);
  }, [setValue, formData]);

  const onSubmit = (data: FormData) => {    
    localStorage.setItem("latitude", JSON.stringify(data.latitude));
    localStorage.setItem("longitude", JSON.stringify(data.longitude));
    localStorage.setItem("year", JSON.stringify(data.year));
    localStorage.setItem("azimuthIncrement", JSON.stringify(data.azimuthIncrement));
    localStorage.setItem("slopeIncrement", JSON.stringify(data.slopeIncrement));
    
    setFormData(data);
  }

  return (
    <form id='advanced-settings-form' onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[0.965rem] w-full h-full">
      <div>
        <label htmlFor="latitude">Latitude</label><br />
        <input className={inputClass} type="float" id="latitude" {...register("latitude")} /><br/>
      </div>
      <div>
        <label htmlFor="longitude">Longitude</label><br />
        <input className={inputClass} type="float" id="longitude" {...register("longitude")} /><br/>
      </div>
      <div>
        <label htmlFor="year">Year</label><br />
        <input className={inputClass} type="number" id="year" {...register("year")} /><br/>
      </div>
      <div>
        <label htmlFor="azimuthIncrement">Azimuth increment</label><br />
        <input className={inputClass} type="number" id="azimuthIncrement" {...register("azimuthIncrement")} /><br/>
      </div>
      <div>
        <label htmlFor="slopeIncrement">Slope increment</label><br />
        <input className={inputClass} type="number" id="slopeIncrement" {...register("slopeIncrement")} /><br/>
      </div>
    </form>
  );
}

export default AdvancedSettings