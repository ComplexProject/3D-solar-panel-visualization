type usedParametersProps = {
    title: string;
    parameter: string;
}

function usedParameters({title, parameter} : usedParametersProps) {
    return(
        <div className="w-full justify-between bg-[#F3F3F3] flex flex-col drop-shadow rounded-2xl">
            <h1 className="font-bold text-xl px-7 py-3">{title}</h1>
            <hr/>
            <h1 className="text-3xl px-7 py-3 pt-3">{parameter}</h1>
        </div>
    );
}

export default usedParameters