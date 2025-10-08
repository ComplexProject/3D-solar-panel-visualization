import { useState } from 'react';
import type { RefObject } from 'react';
import ParameterForm from './ParametersForm';
import AdvancedSettings from './AdvancedSettings';
import FormButton from './FormButton';

interface SideMenuProps {
  nodeRef: RefObject<HTMLDivElement | null>;
}

function SideMenu({nodeRef} : SideMenuProps) {
    const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);

    return (
        <div ref={nodeRef} className="flex flex-col py-6 rounded-l-3xl px-4 gap-5 lg:w-1/4 md:w-1/2 fixed drop-shadow right-0 bg-[#F8F8F8]">
            <div className='flex flex-row justify-between'>
                <h1 className="font-bold text-3xl">{showAdvancedSettings ? "Advanced settings" : "Parameters"}</h1>
                 <button className='pt-2 justify-center items-center hover:scale-105 hover:cursor-pointer'
                    onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}>
                    <svg width="30px" height="30px" strokeWidth={1.5} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000">
                        {!showAdvancedSettings ? (<> 
                            <path d="M12 15C13.6569 15 15 13.6569 15 12C15 10.3431 13.6569 9 12 9C10.3431 9 9 10.3431 9 12C9 13.6569 10.3431 15 12 15Z" stroke="#000000" strokeWidth={1.5} strokeLinecap='round' strokeLinejoin='round'></path>
                            <path d="M19.6224 10.3954L18.5247 7.7448L20 6L18 4L16.2647 5.48295L13.5578 4.36974L12.9353 2H10.981L10.3491 4.40113L7.70441 5.51596L6 4L4 6L5.45337 7.78885L4.3725 10.4463L2 11V13L4.40111 13.6555L5.51575 16.2997L4 18L6 20L7.79116 18.5403L10.397 19.6123L11 22H13L13.6045 19.6132L16.2551 18.5155C16.6969 18.8313 18 20 18 20L20 18L18.5159 16.2494L19.6139 13.598L21.9999 12.9772L22 11L19.6224 10.3954Z" stroke="#000000" strokeWidth={1.5} strokeLinecap='round' strokeLinejoin='round'></path></>)
                        :
                            <path d="M6.75827 17.2426L12.0009 12M17.2435 6.75736L12.0009 12M12.0009 12L6.75827 6.75736M12.0009 12L17.2435 17.2426" stroke="#000000" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"></path>
                        }
                    </svg>
                </button>
            </div>
            <div className="flex flex-col drop-shadow py-5 px-8 bg-white rounded-2xl">
                {showAdvancedSettings ? <AdvancedSettings /> : <ParameterForm />}
            </div>
            <div className="flex flex-row justify-center items-center gap-5 px-5">
                {showAdvancedSettings ? <FormButton buttonText='Go back' isClosingButton={true} onClick={() => setShowAdvancedSettings(false)}/> : <FormButton buttonText='Close' isClosingButton={true}/>}
                {showAdvancedSettings ? <FormButton buttonText='Save'/> : <FormButton buttonText='Calculate'/>}
            </div>
        </div>
    );
}

export default SideMenu