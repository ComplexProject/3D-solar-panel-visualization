import StyledDropzone from './DropZone'
import { useForm } from 'react-hook-form'
import { useState, useEffect } from 'react';
import { GetGeocodingData } from '../utils/apiTesting';
import { IconoirProvider, InfoCircle } from 'iconoir-react';
import ToolTip from './ToolTip';

const inputClass = 'px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px]'

interface FormData {
    city: string;
    power: number;
    cityFetchFailed?: boolean;
}

function ParameterForm() {
    const { register, setValue, setError, formState: {errors}, clearErrors } = useForm<FormData>();

    const [formData, setFormData] = useState<FormData>(() => {
        const savedCity = localStorage.getItem("city");
        const savedPower = localStorage.getItem("power");

        return {
            city: savedCity ? JSON.parse(savedCity) : undefined,
            power: savedPower ? JSON.parse(savedPower) : undefined,
        };
    });

    useEffect(() => {
        setValue("city", formData.city);
        setValue("power", formData.power);
    }, [setValue, formData]);

    const handleCityBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cityValue = e.target.value;
        localStorage.setItem("city", JSON.stringify(cityValue));
        setFormData(prev => ({ ...prev, city: cityValue }));
        const locationData = await GetGeocodingData(cityValue);
        if (locationData) {
            if (errors.cityFetchFailed) {
                clearErrors('cityFetchFailed')
            }
            localStorage.setItem("latitude", JSON.stringify(locationData.latitude));
            localStorage.setItem("longitude", JSON.stringify(locationData.longitude));
        } else {
            setError("cityFetchFailed", {
                message: 'City not found',
            })
            localStorage.removeItem("latitude");
            localStorage.removeItem("longitude");
        }
    }

    const handlePowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const powerNumber = value === "" ? 0 : parseFloat(value);
        localStorage.setItem("power", JSON.stringify(powerNumber));
        setFormData(prev => ({ ...prev, power: powerNumber }));
    }

    return (
        <form id='parameter-form' className='flex flex-col gap-4 w-full h-full'>
            <div>
                <div className='flex flex-row gap-1'>
                    <label htmlFor="city">City</label>
                    <p className='text-red-500'>*</p>
                </div>
                <input className={`${errors.cityFetchFailed ? 'bg-[#FFDEDE]' : null} ${inputClass}`} type="text" placeholder='Middelburg' {...register("city", { onBlur: handleCityBlur })} id="city" />
                {errors.cityFetchFailed ? <p className='text-[#FF0000] text-sm'>{errors.cityFetchFailed?.message}</p> : null}
            </div>
            <div>
                <div className='flex flex-row gap-1'>
                    <label htmlFor="power">Maximum PV power (kWp)</label><br />
                    <p className='text-red-500'>*</p>
                </div>
                <input className={inputClass} type="number" step={0.1} placeholder='15' {...register("power", { onChange: handlePowerChange })} id="power" /><br />
            </div>
            <div>
                <div className='flex flex-row justify-between'>
                    <div className='flex flex-row gap-1'>
                        <label htmlFor="file">Upload demand profile</label>
                        <p className='text-red-500'>*</p>
                    </div>
                    <div className='cursor-pointer flex items-center group '>
                        <ToolTip toolTipText='The file must include only one column'/>
                        <IconoirProvider
                            iconProps={{
                                className: 'hover:scale-110',
                                color: 'black',
                                strokeWidth: 1.5,
                                width: '1.1rem',
                                height: '1.1rem',
                            }}>
                            <InfoCircle />
                        </IconoirProvider>
                    </div>
                </div>
                <p className='text-[12px] text-[#717171]'>Allowed files: CSV, JSON</p>
                <StyledDropzone />
            </div>
        </form>
    );
}

export default ParameterForm