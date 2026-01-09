import { useContext, useState, useRef } from 'react';
import type { RefObject } from 'react';
import ParameterForm from './formComponents/ParametersForm';
import AdvancedSettings from './formComponents/AdvancedSettings';
import FormButton from './formComponents/FormButton';
import { Settings, Xmark, IconoirProvider } from 'iconoir-react';
import { sendFormData } from './utils/sendFormData';
import { CalculationContext, ResultContext } from './App';
import { useUnsavedChanges } from './hooks/useUnsavedChanges';

type SideMenuProps = {
    nodeRef: RefObject<HTMLDivElement | null>;
    onClick?: () => void;
    onShowUnsavedChanges?: (callback: () => void) => void;
}

/**
 * React component that holds the styling and the functionality of the Side menu
 * @param nodeRef - place of the SideMenu and its included components on the screen
 * @returns Side menu component
 */
function SideMenu({ nodeRef, onClick, onShowUnsavedChanges }: SideMenuProps) {
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
    const { isCalculationRunning, setIsCalculationRunning } = useContext(CalculationContext);
    const { setIsResultAvailable, setResultData } = useContext(ResultContext);
    const { checkUnsavedChanges } = useUnsavedChanges();
    const parameterFormRef = useRef<{ validateBeforeCalculate: () => boolean }>(null);

    const [formRefresh, setFormRefresh] = useState(0);
    const maxHeight = isCalculationRunning ? '12.394rem' : (!showAdvancedSettings ? '22.968rem' : '14.394rem');

    /**
     * When user goes to and from the advanced settings it refreshed the forms 
     * so that they are constantly updated witht the new data
     */
    const refreshForms = () => {
        setFormRefresh(prev => prev + 1);
    };

    /**
     * 1. When a user presses the calculate button it sets the state to isCalcualtionrunning which triggers
     * appropriate loading bar to be displayed
     * 2. After that the old result is deleted form localstorage and it sets isResultAvailabe to 1
     * which also triggers approapriate loading 
     * 3. result is waiting for the backend API to finish and is then saved to local storage
     * 4. calcualtion is running is set to false to hide the loading bar
     * 5. sets the isResultAvailable to 2 to show the results on screen
     * If there is an error loading bar is hidden and the isResultAvailable is to 3 to trigger approprate message
     */
    const calculate = async () => {
        try {
            if (!parameterFormRef.current?.validateBeforeCalculate()) {
                return;
            }

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

    /**
     * Function that shows / hides the advanced settings
     */
    const handleToggleSettings = () => {
        if (showAdvancedSettings && checkUnsavedChanges()) {
            onShowUnsavedChanges?.(() => setShowAdvancedSettings(false));
            refreshForms();
        } else {
            setShowAdvancedSettings(!showAdvancedSettings);
            refreshForms();
        }
    };

    /**
     * When user leaves the advanced settings a check is made to see if they have unsaved changes
     * If they do a pop up will appear
     * If they do not the form is replaced with parameter form
     */
    const handleGoBack = () => {
        if (checkUnsavedChanges()) {
            onShowUnsavedChanges?.(() => setShowAdvancedSettings(false));
            refreshForms();
        } else {
            setShowAdvancedSettings(false);
            refreshForms();
        }
    };
    
    return (
        <div ref={nodeRef} className="flex flex-col py-6 rounded-l-3xl px-4 gap-5 w-full relative drop-shadow bg-[#F8F8F8]">
            <div className='flex flex-row justify-between'>
                <h1 className="font-bold text-3xl">{showAdvancedSettings ? "Advanced settings" : "Parameters"}</h1>
                <button className='pt-2 justify-center items-center hover:scale-105 hover:cursor-pointer'
                    onClick={handleToggleSettings}>
                    <IconoirProvider iconProps={{ color: '#000000', strokeWidth: 1.5, width: '1.8rem', height: '1.8rem' }}>
                        {!showAdvancedSettings ? <Settings /> : <Xmark />}
                    </IconoirProvider>
                </button>
            </div>
            <div className="flex flex-col drop-shadow transition-all duration-[230ms] ease-in-out py-5 px-8 bg-white rounded-2xl overflow-hidden" style={{ height: maxHeight}}>
                {!isCalculationRunning ? 
                <> {showAdvancedSettings ? <AdvancedSettings key={`advanced-${formRefresh}`} /> : <ParameterForm ref={parameterFormRef} key={`advanced-${formRefresh}`}/>} </>
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
                {showAdvancedSettings ? 
                    <FormButton buttonText='Go back' isClosingButton={true} onClick={handleGoBack} /> : 
                    <FormButton buttonText='Close' isClosingButton={true} onClick={onClick} />
                }
                {showAdvancedSettings ? 
                    <FormButton buttonText='Save' type='submit' form='advanced-settings-form' /> : 
                    <FormButton buttonText='Calculate' form="parameter-form" onClick={calculate} />
                }
            </div>
        </div>
    );
}

export default SideMenu;