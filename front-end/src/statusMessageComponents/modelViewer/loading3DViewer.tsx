
function loadingMessage3DViewer() {
    return (
        <>
            <div className="m-20 absolute z-50 bg-[#FDFFDA] border border-[#FFE3AE] rounded-2xl p-3 w-xs pointer-events-none">
                <div className='flex items-center gap-2'>
                    <div className="relative">
                        <div className="absolute w-6 h-6 border-2 border-gray-100 rounded-full"></div>
                        <div className="w-6 h-6 border-2 border-[#000000] rounded-full border-t-transparent animate-spin"></div>
                    </div>
                    <p className="text-xl font-semibold">Please wait until the calculation has finished</p> 
                </div>                
            </div>
        </>
    )
}

export default loadingMessage3DViewer