import Warning from '../../assets/warning.png';

function runCalculation3DViewer() {
    return (
        <>
            <div className="m-20 absolute z-50 bg-[#FDFFDA] border border-[#FFE3AE] rounded-2xl p-3 w-xs pointer-events-none">
                <div className='flex items-start gap-2'>
                    <img src={Warning} className='mt-1 h-[2em] w-[2em]'></img>
                    <p className="text-xl font-semibold">Please run the calculations first</p> 
                </div>                
            </div>
        </>
    )
}

export default runCalculation3DViewer