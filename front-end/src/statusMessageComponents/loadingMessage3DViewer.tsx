import Warning from '../assets/warning.png';

function loadingMessageModelViewer() {
    return (
        <>
            <div className="m-20 absolute z-50 bg-[#FDFFDA] border border-[#FFE3AE] rounded-2xl p-3 w-xs">
                <div className='flex items-start gap-2'>
                    <img src={Warning} className='mt-1 h-[2em] w-[2.5em]'></img>
                    <p className="text-xl font-semibold">Currently, there are no solar panels in the 3D viewer</p> 
                </div>                
            </div>
        </>
    )
}

export default loadingMessageModelViewer