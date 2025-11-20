function Header() {
    return (
        <div className="w-full absolute p-2 select-none items-center top-0 z-[100] flex flex-row gap-3">
            <a href="https://hz.nl/onderzoek/kenniscentra-lectoraten/delta-power" target="_blank"><img className="h-10" src="images/HZLogo.png" alt="HZ Logo"/></a>
            <h1 className="hz text-2xl text-[#005481]">Lectorate Delta Power</h1>
        </div>
    );
}

export default Header