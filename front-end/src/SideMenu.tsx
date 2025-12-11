import { useContext, useState } from 'react';
import type { RefObject } from 'react';
import ParameterForm from './formComponents/ParametersForm';
import AdvancedSettings from './formComponents/AdvancedSettings';
import FormButton from './formComponents/FormButton';
import { Settings, Xmark, IconoirProvider } from 'iconoir-react';
import { sendFormData } from './utils/sendFormData';
import { CalculationContext, ResultContext } from './App';

type SideMenuProps = {
    nodeRef: RefObject<HTMLDivElement | null>;
    onClick?: () => void;
}

function SideMenu({ nodeRef, onClick }: SideMenuProps) {
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const { isCalculationRunning, setIsCalculationRunning } = useContext(CalculationContext);
    const { setIsResultAvailable, setResultData } = useContext(ResultContext);

    const maxHeight = !showAdvancedSettings ? '22.968rem' : '14.394rem';

    const calculate = async () => {
        try {
            setIsCalculationRunning(true)
            setResultData(null)
            setIsResultAvailable(1)
            const res = await sendFormData();
            setResultData(res);
            localStorage.setItem('resultData', JSON.stringify(res));
            setIsCalculationRunning(false);
            setIsResultAvailable(2);
        } catch (err) {
            console.error("error", err);
            setIsCalculationRunning(false)
            setIsResultAvailable(3);
        }
    } 
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
                    {!isCalculationRunning ? 
                    <> {showAdvancedSettings ? <AdvancedSettings /> : <ParameterForm />} </>
                    :
                    <div className='flex flex-col gap-10 p-5 justify-center items-center'>
                        <div className="relative w-12 h-12">
                            <div className="absolute inset-0 border-4 border-gray-200 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-[#006FAA] rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <p>Calculations are running...</p>
                    </div>
                    }
                </div>
                <div className="flex flex-row justify-center items-center gap-5 px-5">
                    {showAdvancedSettings ? <FormButton buttonText='Go back' isClosingButton={true} onClick={() => setShowAdvancedSettings(false)} /> : <FormButton buttonText='Close' isClosingButton={true} onClick={onClick} />}
                    {showAdvancedSettings ? <FormButton buttonText='Save' type='submit' form='advanced-settings-form' /> : <FormButton buttonText='Calculate' form="parameter-form" onClick={calculate} />}
                </div>
            </div>
        </>
    );
}

export default SideMenu