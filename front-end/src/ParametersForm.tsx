import StyledDropzone from './DropZone'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react';
import { GetGeocodingData } from './ApiTesting';

const inputClass = 'px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px]'

interface FormData {
  city: string;
  power: string;
}

function ParameterForm() {
    const { register, handleSubmit, setValue } = useForm<FormData>();
    
    const [formData, setFormData] = useState<FormData>(() => {
        const savedCity = localStorage.getItem("city");
        const savedPower = localStorage.getItem("power");
        
        return {
            city: savedCity ? JSON.parse(savedCity) : "",
            power: savedPower ? JSON.parse(savedPower) : "",
        };
    });

    useEffect(() => {
        setValue("city", formData.city);
        setValue("power", formData.power);
    }, [setValue, formData]);

    const onSubmit = (data: FormData) => {
        console.log(data);
    }

    const handleCityBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cityValue = e.target.value;
        localStorage.setItem("city", JSON.stringify(cityValue));
        setFormData(prev => ({ ...prev, city: cityValue }));
        const locationData = await GetGeocodingData(cityValue);
        if (locationData) {
            localStorage.setItem("latitude", JSON.stringify(locationData.latitude));
            localStorage.setItem("longitude", JSON.stringify(locationData.longitude));
        } else {
            localStorage.removeItem("latitude");
            localStorage.removeItem("longitude");
        }
    }

    const handlePowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const powerValue = e.target.value;
        localStorage.setItem("power", JSON.stringify(powerValue));
        setFormData(prev => ({ ...prev, power: powerValue }));
    }

    return(
        <form id='parameter-form' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4 w-full h-full'>
            <div>
                <label htmlFor="city">City</label><br />
                <input className={inputClass} type="text" {...register("city", { onBlur: handleCityBlur })} id="city"/><br />
            </div>
            <div>
                <label htmlFor="power">Maximum PV power (kWp)</label><br />
                <input className={inputClass} type="text" {...register("power", { onChange: handlePowerChange })} id="power"/><br />
            </div>
            <div>
                <label htmlFor="file">Upload demand profile</label><br />
                <p className='text-[12px] text-[#717171]'>Allowed files: CSV, JSON</p>
                <StyledDropzone />
            </div>
        </form>
    );
}

export default ParameterForm