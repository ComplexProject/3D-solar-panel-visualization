import { WarningTriangleSolid, IconoirProvider } from 'iconoir-react';

function loadingMessageModelViewer() {
    return (
        <>
            <div className="m-20 absolute z-50 bg-[#FFDEDE] border border-[#FF3131] rounded-2xl p-3 w-xs">
                <div className='flex gap-2'>
                    <IconoirProvider
                    iconProps={{
                    color: '#f21b1b',
                    stroke: '#ffffff',
                    strokeWidth: 0,
                    width: '4em',
                    height: '3em',
                    }}
                    >
                    <WarningTriangleSolid />
                    </IconoirProvider>
                    <p className="text-xl font-semibold">Currently, there are no solar panels in the 3D viewer</p> 
                </div>                
            </div>
        </>
    )
}

export default loadingMessageModelViewer