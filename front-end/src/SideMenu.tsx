import { useState } from 'react';
import type { RefObject } from 'react';
import ParameterForm from './ParametersForm';
import AdvancedSettings from './AdvancedSettings';
import FormButton from './FormButton';
import { Settings, Xmark, IconoirProvider } from 'iconoir-react';

type SideMenuProps = {
    nodeRef: RefObject<HTMLDivElement | null>;
    onClick?: () => void;
}

function SideMenu({ nodeRef, onClick }: SideMenuProps) {
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

    return (
        <>
            <div ref={nodeRef} className="flex flex-col py-6 rounded-l-3xl px-4 gap-5 w-full relative drop-shadow bg-[#F8F8F8]">
                <div className='flex flex-row justify-between'>
                    <h1 className="font-bold text-3xl">{showAdvancedSettings ? "Advanced settings" : "Parameters"}</h1>
                    <button className='pt-2 justify-center items-center hover:scale-105 hover:cursor-pointer'
                        onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}>
                        <IconoirProvider
                            iconProps={{
                                color: '#000000',
                                strokeWidth: 1.5,
                                width: '1.8rem',
                                height: '1.8rem',
                            }}
                        >
                            {!showAdvancedSettings ? <Settings /> : <Xmark />}
                        </IconoirProvider>
                    </button>
                </div>
                <div className="flex flex-col drop-shadow py-5 px-8 bg-white rounded-2xl">
                    {showAdvancedSettings ? <AdvancedSettings /> : <ParameterForm />}
                </div>
                <div className="flex flex-row justify-center items-center gap-5 px-5">
                    {showAdvancedSettings ? <FormButton buttonText='Go back' isClosingButton={true} onClick={() => setShowAdvancedSettings(false)} /> : <FormButton buttonText='Close' isClosingButton={true} onClick={onClick} />}
                    {showAdvancedSettings ? <FormButton buttonText='Save' type='submit' form='advanced-settings-form' /> : <FormButton buttonText='Calculate' type="submit" form="parameter-form" />}
                </div>
            </div>
        </>
    );
}

export default SideMenu