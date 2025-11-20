import { WarningTriangleSolid, IconoirProvider } from 'iconoir-react';


function errorMessage() {
    return (
        <>
            <div className="bg-[#FFDEDE] border border-[#FF3131] rounded-2xl p-6">
                <h1 className="text-4xl font-semibold mb-2 flex">
                        <IconoirProvider
                        iconProps={{
                        color: '#f21b1b',
                        stroke: '#ffffff',
                        strokeWidth: 0.5,
                        width: '2.6rem',
                        height: '2.6rem',
                        }}
                    >
                        <WarningTriangleSolid />
                    </IconoirProvider>
                    <p className='ml-2'>Error</p>
                </h1>
                <p className="text-lg">Data retrieval has failed</p>
            </div>
        </>
    )
}

export default errorMessage