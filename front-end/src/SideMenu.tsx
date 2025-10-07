import PropTypes from 'prop-types';

function SideMenu({ title = "Parameters", leftButton = "Close", rightButton = "Calculate"}) {
    return(
        <div className="flex flex-col py-12 px-4 gap-3.5 w-1/4 absolute right-0 bg-[#EBEBEB]">
            <h1 className="font-bold text-4xl">{title}</h1>
            <div className="flex flex-col drop-shadow py-6 px-8 bg-white rounded-2xl">
                <form className='flex flex-col gap-4 w-full h-full'>
                    <div>
                        <label htmlFor="latitude" >Latitude</label><br/>
                        <input className='border-1 border-[#808080] w-full rounded-[7px]' type="int" id="latitude"></input><br/>
                    </div>
                    <div>
                        <label htmlFor="latitude" >Latitude</label><br/>
                        <input className='border-1 border-[#808080] w-full rounded-[7px]' type="int" id="latitude"></input><br/>
                    </div>
                    <div>
                        <label htmlFor="latitude" >Latitude</label><br/>
                        <input className='border-1 border-[#808080] w-full rounded-[7px]' type="int" id="latitude"></input><br/>
                    </div>
                     <div>
                        <label htmlFor="latitude" >Latitude</label><br/>
                        <input className='border-1 border-[#808080] w-full rounded-[7px]' type="int" id="latitude"></input><br/>
                    </div>
                     <div>
                        <label htmlFor="latitude" >Latitude</label><br/>
                        <input className='border-1 border-[#808080] w-full rounded-[7px]' type="int" id="latitude"></input><br/>
                    </div>
                     <div>
                        <label htmlFor="latitude" >Latitude</label><br/>
                        <input className='border-1 border-[#808080] w-full rounded-[7px]' type="int" id="latitude"></input><br/>
                    </div>
                </form>
            </div>
            <div className="flex flex-row justify-center items-center gap-5">
                <button>
                    {leftButton}
                </button>
                <button>
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