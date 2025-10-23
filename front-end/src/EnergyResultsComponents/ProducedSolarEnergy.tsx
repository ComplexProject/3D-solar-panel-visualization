type Props= {
    panelNumber: number
    producedEnergy: number
}

function producedSolarEnergy({panelNumber, producedEnergy}: Props) {
    return (
        <>
            <div className='flex justify-between py-5'>
                <div>PV {panelNumber}</div>
                <div>{producedEnergy} kWp</div>
            </div>
        </>
    )
}

export default producedSolarEnergy