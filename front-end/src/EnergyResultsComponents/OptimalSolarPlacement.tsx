type Props = {
    panelNumber: number
    azimuth: number
    slope: number
}

function optimalSolarPlacement({panelNumber, azimuth, slope} : Props) {
    return (
        <div className='bg-[#F3F3F3] rounded-2xl drop-shadow text-xl'>
            <div className="m-4 font-bold">PV {panelNumber}</div>
            <hr />
            <div className="mx-4 my-2">
                <div className="flex justify-between">
                    <div className="">Azimuth</div>
                    <div>{azimuth}°</div>
                </div>
                <div className="flex justify-between mb-4">
                    <div className="">Slope</div>
                    <div>{slope}°</div>
                </div>
            </div>
        </div>
    )
}

export default optimalSolarPlacement