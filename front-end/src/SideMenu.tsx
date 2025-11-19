import { useState } from 'react';
import type { RefObject } from 'react';
import ParameterForm from './formComponents/ParametersForm';
import AdvancedSettings from './formComponents/AdvancedSettings';
import FormButton from './formComponents/FormButton';
import { Settings, Xmark, IconoirProvider } from 'iconoir-react';
import { sendFormData } from './utils/sendFormData';

type SideMenuProps = {
    nodeRef: RefObject<HTMLDivElement | null>;
    onClick?: () => void;
}

const calculate = async () => {
    try {
        const res = await sendFormData();
        console.log("send", res);
    } catch (err) {
        console.error("error", err)
    }
}

function SideMenu({ nodeRef, onClick }: SideMenuProps) {
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const maxHeight = !showAdvancedSettings ? '22.968rem' : '14.394rem';
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
                <div className="flex flex-col drop-shadow transition-all duration-[230ms] ease-in-out py-5 px-8 bg-white rounded-2xl overflow-hidden" style={{ height: maxHeight}}>
                    {showAdvancedSettings ? <AdvancedSettings /> : <ParameterForm />}
                </div>
                <div className="flex flex-row justify-center items-center gap-5 px-5">
                    {showAdvancedSettings ? <FormButton buttonText='Go back' isClosingButton={true} onClick={() => setShowAdvancedSettings(false)} /> : <FormButton buttonText='Close' isClosingButton={true} onClick={onClick} />}
                    {showAdvancedSettings ? <FormButton buttonText='Save' type='submit' form='advanced-settings-form' /> : <FormButton buttonText='Calculate'  form="parameter-form" onClick={calculate} />}
                </div>
            </div>
        </>
    );
}

export default SideMenu