import StyledDropzone from './DropZone'
import { useForm } from 'react-hook-form'
import { useState, useEffect, forwardRef, useImperativeHandle } from 'react';
import { IconoirProvider, InfoCircle } from 'iconoir-react';
import { GetCoordinates } from '../utils/GeocodingAPI';
import ToolTip from './ToolTip';

const inputClass = 'px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px]'

interface FormData {
    city?: string;
    power?: number;
    cityFetchFailed?: boolean;
    cityRequired?: boolean;
    powerRequired?: boolean;
    demandProfileRequired?: boolean;
}

/**
 * React component that has the styling and the logic of the Parameter form
 * @returns Parameter form component
 */
function ParameterForm({}, ref: React.Ref<{ validateBeforeCalculate: () => boolean }>) {
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

    useEffect(() => {
    function handler(e: Event) {
        const ev = e as CustomEvent;
        const city = ev?.detail?.city;
        if (typeof city === 'string') {
          setFormData(prev => ({...prev, city}));
          setValue("city", city);
        }
      }

      window.addEventListener('coordinatesUpdated', handler as EventListener);
      return () => window.removeEventListener('coordinatesUpdated', handler as EventListener);
    }, [setValue]);

    /**
     * When a user exits the City input field API is called to get the lat and lon of the City
     * @param e input field of the City
     */
    const handleCityBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
        const cityValue = e.target.value;        
        
        if (cityValue === "") {
            localStorage.removeItem("city");
            setFormData(prev => ({ ...prev, city: undefined }));
            return;
        } 
        
        const savedCity = localStorage.getItem("city");
        const parsedSavedCity = savedCity ? JSON.parse(savedCity) : null;
        if (cityValue === parsedSavedCity) {
            return;
        }
        
        localStorage.setItem("city", JSON.stringify(cityValue));
        setFormData(prev => ({ ...prev, city: cityValue }));
        const savedYear = localStorage.getItem("year");
        const yearNumber = savedYear ? parseInt(savedYear) : 2019;
        
        try {
            const locationData = await GetCoordinates(cityValue, yearNumber);
            if (locationData) {
                if (errors.cityFetchFailed) {
                    clearErrors('cityFetchFailed')
                }
                localStorage.setItem("latitude", JSON.stringify(locationData.latitude));
                localStorage.setItem("longitude", JSON.stringify(locationData.longitude));
            }
        } catch (error) {
            setError("cityFetchFailed", {
                message: 'City not found',
            })
            localStorage.removeItem("latitude");
            localStorage.removeItem("longitude");
            localStorage.removeItem("city");
        }
    }

    /**
     * After user changes the power it is automatically saved in local storage
     * @param e power input field
     */
    const handlePowerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        const powerNumber = value === "" ? 0 : parseFloat(value);
        localStorage.setItem("power", JSON.stringify(powerNumber));
        setFormData(prev => ({ ...prev, power: powerNumber }));
    }

    /**
     * Validates the form before calculation
     * Checks if city exists and is not empty, if power is provided, and if demand profile exists
     * @returns true if validation passes, false otherwise
     */
    const validateBeforeCalculate = (): boolean => {
        let isValid = true;
        const savedCity = localStorage.getItem("city");
        const savedPower = localStorage.getItem("power");
        const demandProfile = localStorage.getItem("demandProfile");

        if (!savedCity || JSON.parse(savedCity) === "") {
            setError("cityRequired", {
                message: 'City is required'
            });
            isValid = false;
        } else {
            clearErrors('cityRequired');
        }

        if (!savedPower || JSON.parse(savedPower) === 0 || JSON.parse(savedPower) === "") {
            setError("powerRequired", {
                message: 'Maximum PV power is required'
            });
            isValid = false;
        } else {
            clearErrors('powerRequired');
        }

        if (!demandProfile) {
            setError("demandProfileRequired", {
                message: 'Demand profile is required'
            });
            isValid = false;
        } else {
            clearErrors('demandProfileRequired');
        }

        return isValid;
    };

    useImperativeHandle(ref, () => ({
        validateBeforeCalculate
    }), []);

    return (
        <form id='parameter-form' className='flex flex-col gap-4 w-full h-full'>
            <div>
                <div className='flex flex-row gap-1'>
                    <label htmlFor="city">City</label>
                    <p className='text-red-500'>*</p>
                </div>
                <input className={`${errors.cityFetchFailed || errors.cityRequired ? 'bg-[#FFDEDE]' : null} ${inputClass}`} type="text" placeholder='Middelburg' {...register("city", { onBlur: handleCityBlur, onChange: () => {clearErrors('cityFetchFailed'); clearErrors('cityRequired')} })} id="city" />
                {errors.cityFetchFailed ? <p className='text-[#FF0000] text-sm absolute z-50'>{errors.cityFetchFailed?.message}</p> : null}
                {errors.cityRequired ? <p className='text-[#FF0000] text-sm absolute z-50'>{errors.cityRequired?.message}</p> : null}
            </div>
            <div>
                <div className='flex flex-row gap-1'>
                    <label htmlFor="power">Maximum PV power (kWp)</label><br />
                    <p className='text-red-500'>*</p>
                </div>
                <input className={`${errors.powerRequired ? 'bg-[#FFDEDE]' : null} ${inputClass}`} type="number" step={0.1} placeholder='15' {...register("power", { onChange: (e) => {clearErrors('powerRequired'); handlePowerChange(e)} })} id="power" /><br />
                {errors.powerRequired ? <p className='text-[#FF0000] text-sm'>{errors.powerRequired?.message}</p> : null}
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
                {errors.demandProfileRequired ? <p className='text-[#FF0000] text-sm'>{errors.demandProfileRequired?.message}</p> : null}
            </div>
        </form>
    );
}

export default forwardRef(ParameterForm)