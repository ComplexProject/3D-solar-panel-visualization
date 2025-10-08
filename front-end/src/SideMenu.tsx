import PropTypes from 'prop-types';
import StyledDropzone from './DropZone'

function SideMenu({ title = "Parameters", leftButton = "Close", rightButton = "Calculate"}) {
    return(
        <div className="flex flex-col py-6 rounded-l-3xl px-4 gap-5 lg:w-1/4 md:w-1/2 absolute drop-shadow right-0 bg-[#F8F8F8]">
            <h1 className="font-bold text-4xl">{title}</h1>
            <div className="flex flex-col drop-shadow py-6 px-8 bg-white rounded-2xl">
                <form className='flex flex-col gap-4 w-full h-full'>
                    <div>
                        <label htmlFor="city" >City</label><br/>
                        <input className='border-1 shadow-md border-[#808080] w-full rounded-[7px]' type="int" id="city"></input><br/>
                    </div>
                    <div>
                        <label htmlFor="power" >Maximum PV power (KWP)</label><br/>
                        <input className='border-1 shadow-md border-[#808080] w-full rounded-[7px]' type="int" id="power"></input><br/>
                    </div>
                <div>
                    <label htmlFor="file" >Upload demand profile</label><br/>
                    <p className=' text-[12px] text-[#717171]'>Allowed files: CSV, JSON</p>
                    <StyledDropzone/>
                </div>
                </form>
            </div>
            <div className="flex flex-row justify-center items-center gap-5 px-5">
                <button className='hover:scale-105 drop-shadow-sm cursor-pointer rounded-xl py-0.5 w-full border-2 border-[#006FAA] bg-white text-[#006FAA]'>
                    {leftButton}
                </button>
                <button className='hover:scale-105 drop-shadow-sm cursor-pointer w-full py-0.5 rounded-xl border-2 border-[#006FAA] bg-[#006FAA] text-white'>
                    {rightButton}
                </button>
            </div>
        </div>
    );
}

SideMenu.propTypes = {
    title: PropTypes.string,
    leftButton: PropTypes.string,
    rightButton: PropTypes.string,
}

export default SideMenu