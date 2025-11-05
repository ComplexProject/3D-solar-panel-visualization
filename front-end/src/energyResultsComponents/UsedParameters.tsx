type usedParametersProps = {
    title: string;
    parameter: string;
}

function usedParameters({title, parameter} : usedParametersProps) {
    return(
        <div className="w-full justify-between px-7 py-3 bg-[#F3F3F3] flex flex-col drop-shadow rounded-2xl">
            <h1 className="font-bold text-xl">{title}</h1>
            <hr/>
            <h1 className="text-3xl pt-3">{parameter}</h1>
        </div>
    );
}

export default usedParameters