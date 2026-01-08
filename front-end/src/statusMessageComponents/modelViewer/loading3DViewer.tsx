type Props = {
    message: string;
}

function loading3DViewer({message}: Props) {
    return (
        <>
            <div className="absolute inset-0 z-50 flex items-center justify-center pointer-events-none">
                <div className="flex flex-col items-center gap-4 bg-white bg-opacity-80 rounded-lg p-8 shadow-lg">
                    <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                    <div className="absolute inset-0 border-4 border-[#006FAA] rounded-full border-t-transparent animate-spin"></div>
                </div>
                <p className="text-gray-600 text-lg font-medium">{message}</p>
                </div>
            </div>
        </>
    )
}

export default loading3DViewer