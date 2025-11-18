function errorMessage() {
    return (
        <>
            <div className="bg-[#FFDEDE] border-1 border-[#FF3131] rounded-2xl p-6">
                <h1 className="text-4xl font-semibold mb-2">Error</h1>
                <p className="text-lg">Data retrieval has failed</p>
            </div>
        </>
    )
}

export default errorMessage