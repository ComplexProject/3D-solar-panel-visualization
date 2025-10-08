function AdvancedSettings() {
    return (
        <form className="flex flex-col gap-4 w-full h-full">
            <div>
                <label htmlFor="latitude" >Latitude</label><br />
                <input className=' px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px]' type="int" id="latitude"></input><br />
            </div>
            <div>
                <label htmlFor="longitude" >Longitude</label><br />
                <input className=' px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px]' type="int" id="longitude"></input><br />
            </div>
            <div>
                <label htmlFor="year" >Year</label><br />
                <input className=' px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px]' type="year" id="year"></input><br />
            </div>
            <div>
                <label htmlFor="azimuthIncrement">Azimuth increment</label><br />
                <input className=' px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px]' type="int" id="azimuthIncrement"></input><br />
            </div>
            <div>
                <label htmlFor="slopeIncrement">Slope increment</label><br />
                <input className=' px-2 py-0.5 hover:border-[#006FAA] focus:ring-1 focus:outline-none focus:ring-[#006FAA] border shadow-md border-[#808080] w-full rounded-[7px]' type="int" id="slopeIncrement"></input><br />
            </div>
        </form>
    );
}

export default AdvancedSettings