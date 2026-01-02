import { WarningTriangleSolid, IconoirProvider } from 'iconoir-react';

function error3Dviewer() {
    return (
        <>
            <div className="m-20 absolute z-50 bg-[#FFDEDE] border border-[#FF3131] rounded-2xl p-3 w-xs pointer-events-none">
                <div className='flex items-start gap-2'>
                    <IconoirProvider
                        iconProps={{
                        color: '#f21b1b',
                        stroke: '#ffffff',
                        strokeWidth: 0.5,
                        width: '2rem',
                        height: '2rem',
                        }}
                    >
                        <WarningTriangleSolid />
                    </IconoirProvider>
                    <p className="text-xl font-semibold">Data retrieval failed</p> 
                </div>                
            </div>
        </>
    )
}

export default error3Dviewer