import { useForm } from 'react-hook-form'

type FormData = {
  latitude?: number;
  longitude?: number;
  year?: number;
  azimuthIncrement?: number;
  slopeIncrement?: number;
}

function AdvancedSettings({latitude = 0, longitude = 0, year = 2024, azimuthIncrement = 5, slopeIncrement = 2} : FormData) {
    const inputClass = 'px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px]'

       const {register, handleSubmit} = useForm<FormData>({
        defaultValues: {
            latitude,
            longitude,
            year,
            azimuthIncrement,
            slopeIncrement,
        }
       });
   
       const onSubmit = (data: FormData) => {
           console.log(data)
       }

    return (
        <form id='advanced-settings-form' onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-[0.965rem] w-full h-full">
            <div>
                <label htmlFor="latitude" >Latitude</label><br />
                <input className={inputClass} type="number" id="latitude" {...register("latitude", { valueAsNumber: true })} /><br/>
            </div>
            <div>
                <label htmlFor="longitude" >Longitude</label><br />
                <input className={inputClass} type="number" id="longitude" {...register("longitude", { valueAsNumber: true })} /><br/>
            </div>
            <div>
                <label htmlFor="year" >Year</label><br />
                <input className={inputClass} type="year" id="year" {...register("year", { valueAsNumber: true })} /><br/>
            </div>
            <div>
                <label htmlFor="azimuthIncrement">Azimuth increment</label><br />
                <input className={inputClass} type="number" id="azimuthIncrement" {...register("azimuthIncrement", { valueAsNumber: true })} /><br/>
            </div>
            <div>
                <label htmlFor="slopeIncrement">Slope increment</label><br />
                <input className={inputClass} type="number" id="slopeIncrement" {...register("slopeIncrement", { valueAsNumber: true })} /><br/>
            </div>
        </form>
    );
}

export default AdvancedSettings