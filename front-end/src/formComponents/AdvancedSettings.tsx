import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react';
import { GetCityName } from '../utils/GeocodingAPI';
import ToolTip from './ToolTip';

const inputClass = 'px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px] disabled:bg-gray-200 disabled:text-gray-700 disabled:cursor-not-allowed'

interface FormData {
  latitude: number;
  longitude: number;
  year: number;
  coordinateFecthFailed?: boolean;
}

function predefinedCity() {
  const savedCity = localStorage.getItem("city");
  return savedCity && savedCity !== "" ? JSON.parse(savedCity) : false;
}

function AdvancedSettings() {
  const { register, handleSubmit, setValue, setError, formState: {errors}, clearErrors } = useForm<FormData>();
  
  const [formData, setFormData] = useState<FormData>(() => {
    const savedLatitude = localStorage.getItem("latitude");
    const savedLongitude = localStorage.getItem("longitude");
    const savedYear = localStorage.getItem("year");

    return {
        latitude: savedLatitude ? Number(JSON.parse(savedLatitude)) || 0 : 0,
        longitude: savedLongitude ? Number(JSON.parse(savedLongitude)) || 0 : 0,
        year: savedYear ? Number(JSON.parse(savedYear)) || 2023 : 2023,
    };
  });

  useEffect(() => {
      setValue("latitude", formData.latitude);
      setValue("longitude", formData.longitude);
      setValue("year", formData.year);
  }, [setValue, formData]);

  const onSubmit = async (data: FormData) => { 
    console.log("pressed")   
    const lat = Number(data.latitude) || 0;
    const lon = Number(data.longitude) || 0;
    const year = Number(data.year) || 2023;

    clearErrors('coordinateFecthFailed');

    localStorage.setItem("latitude", JSON.stringify(lat));
    localStorage.setItem("longitude", JSON.stringify(lon));
    localStorage.setItem("year", JSON.stringify(year));    
    setFormData({ latitude: lat, longitude: lon, year });

    if (!predefinedCity() && lat !== 0 && lon !== 0) {
      console.log("im here")
        const cityData = await GetCityName(lat, lon);
        if (cityData) {
          if (errors.coordinateFecthFailed) {
            clearErrors('coordinateFecthFailed');
          }
          localStorage.setItem("city", JSON.stringify(cityData.name));
        } else {
          setError('coordinateFecthFailed', {
            message: 'No city exists for these coordinates',
          });
          localStorage.removeItem("latitude");
          localStorage.removeItem("longitude");
          localStorage.removeItem("city");
        }
    }
  }

  return (
    <form id='advanced-settings-form' data-testid="advanced-settings-form" onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[0.965rem] w-full h-full">
      <div className='group'>
        <label htmlFor="latitude">{predefinedCity() ? `Latitude for ${predefinedCity()}` : 'Latitude'}</label><br />
        <input className={`${errors.coordinateFecthFailed ? 'bg-[#FFDEDE]' : null} ${inputClass}`} type="number" step="any" id="latitude" disabled={predefinedCity()} {...register("latitude", { onChange: () => { clearErrors('coordinateFecthFailed');}})}  /><br/>
        {predefinedCity() ? <ToolTip toolTipText='City is already predefined' toolTipPosition='bottom'/> : ''}
        {errors.coordinateFecthFailed ? <p className='text-[#FF0000] text-sm absolute z-50'>{errors.coordinateFecthFailed?.message}</p> : null}
      </div>
      <div className='group'>
        <label htmlFor="longitude">{predefinedCity() ? `Longitude for ${predefinedCity()}` : 'Longitude'}</label><br />
        <input className={`${errors.coordinateFecthFailed ? 'bg-[#FFDEDE]' : null} ${inputClass}`} type="number" step="any" id="longitude" disabled={predefinedCity()} {...register("longitude", { onChange: () => { clearErrors('coordinateFecthFailed');}})}  /><br/>
        {predefinedCity() ? <ToolTip toolTipText='City is already predefined' toolTipPosition='bottom'/> : ''}
      {errors.coordinateFecthFailed ? <p className='text-[#FF0000] text-sm absolute z-50'>{errors.coordinateFecthFailed?.message}</p> : null}
      </div>
      <div>
        <label htmlFor="year">Year</label><br />
        <input className={inputClass} type="number" id="year" {...register("year")} /><br/>
      </div>
    </form>
  );
}

export default AdvancedSettings