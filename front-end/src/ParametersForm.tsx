import StyledDropzone from './DropZone'
import { useForm } from 'react-hook-form'

const inputClass = 'px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px]'

function ParameterForm() {
    const {register, handleSubmit} = useForm();

    const onSubmit = (data: any) => {
        console.log(data)
    }

    return(
        <form id='parameter-form' onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-4 w-full h-full'>
        <div>
            <label htmlFor="city" >City</label><br />
            <input className={inputClass} type="text" {...register("city")} id="city"/><br />
        </div>
        <div>
            <label htmlFor="power" >Maximum PV power (KWP)</label><br />
            <input className={inputClass} type="text" {...register("power")} id="power"/><br />
        </div>
        <div>
            <label htmlFor="file" >Upload demand profile</label><br />
            <p className=' text-[12px] text-[#717171]'>Allowed files: CSV, JSON</p>
            <StyledDropzone />
        </div>
    </form>
    );
}

export default ParameterForm