import StyledDropzone from './DropZone'

function ParameterForm() {
    return(
        <form className='flex flex-col gap-4 w-full h-full'>
        <div>
            <label htmlFor="city" >City</label><br />
            <input className=' px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px]' type="text" id="city"></input><br />
        </div>
        <div>
            <label htmlFor="power" >Maximum PV power (KWP)</label><br />
            <input className=' px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px]' type="text" id="power"></input><br />
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