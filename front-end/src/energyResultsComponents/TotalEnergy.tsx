type energyProps = {
    title: string;
    results: number;
}

function totalEnergy({title, results} : energyProps) {
    return(
        <div className="bg-white w-full flex flex-col drop-shadow rounded-2xl justify-between px-7 py-3 gap-5">
            <h1 className="font-bold text-xl">{title}</h1>
            <h1 className="text-3xl">{results} kWp</h1>
        </div>
    );
}

export default totalEnergy