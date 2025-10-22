import './App.css'
import { useState, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import SideMenu from './SideMenu'
import TotalEnergy from './EnergyResultsComponents/TotalEnergy'
import UsedParameters from './EnergyResultsComponents/UsedParameters'
import OptimalSolarPlacement from './EnergyResultsComponents/OptimalSolarPlacement'
import ProducedSolarEnergy from './EnergyResultsComponents/ProducedSolarEnergy'

function App() {
  const [showSideMenu, setShowSideMenu] = useState(false)
  const nodeRef = useRef(null)
  const pullTabRef = useRef(null)

  const closeSideMenu = () => {
    setShowSideMenu(false)
  }

  return (
    <>
      <div className='h-screen w-full bg-red-50'>
        <div ref={pullTabRef} className={`absolute right-0 top-11 h-24 flex items-center px-5 bg-[#F8F8F8] rounded-l-4xl drop-shadow cursor-pointer transition-all duration-150
          ${showSideMenu ? 'lg:w-[30%] md:w-[58%] sm:w-[60%]' : 'w-[5.5rem]'}`} onClick={() => setShowSideMenu(!showSideMenu)}>
          <svg width="42px" height="42px" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M11 6L5 12L11 18" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M19 6L13 12L19 18" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
        </div>
        <div className='flex justify-end overflow-x-hidden'>

          <CSSTransition
            in={showSideMenu}
            timeout={150}
            classNames="sideMenuSlide"
            unmountOnExit
            nodeRef={nodeRef}
          >
            <SideMenu nodeRef={nodeRef} onClick={closeSideMenu} />
          </CSSTransition>
        </div>
      </div>
      <div className='px-12 py-16 flex flex-col h-full w-full gap-11 bg-[#F8F8F8]'>
        <h1 className=' font-bold text-5xl'>Results</h1>

          <div className='w-full h-full flex flex-row gap-10'>
            <div className='bg-white p-11 gap-10 drop-shadow rounded-2xl w-full flex flex-col basis-[80%]'>

              <h1 className=' text-2xl font-bold'>Optimal solar placement</h1>
              <div className='grid grid-cols-2 gap-5'>
                <OptimalSolarPlacement panelNumber={1} azimuth={5} slope={10} />
                <OptimalSolarPlacement panelNumber={2} azimuth={0} slope={50} />
                <OptimalSolarPlacement panelNumber={3} azimuth={134} slope={8} />
                <OptimalSolarPlacement panelNumber={4} azimuth={20} slope={20} />
              </div>
            </div>

            <div className='bg-white drop-shadow rounded-2xl w-full flex flex-col basis-1/3'>
              <h1 className='font-bold text-2xl p-10'>Produced solar energy</h1>

              <hr className='border-1'/>

              <div className='px-10 py-1 text-2xl'>
                <ProducedSolarEnergy panelNumber={1} producedEnergy={5}/>
                <ProducedSolarEnergy panelNumber={2} producedEnergy={1}/>
                <ProducedSolarEnergy panelNumber={3} producedEnergy={1}/>
                <ProducedSolarEnergy panelNumber={4} producedEnergy={1}/>
              </div>
            </div>

          </div>

        <div className='w-full h-full flex flex-row gap-16'>
          <TotalEnergy title='Total energy demand' results={1234} />
          <TotalEnergy title='Energy from the grid' results={1234} />
          <TotalEnergy title='PV Energy production' results={40} />
        </div>
        <div className='bg-white w-full h-full flex flex-col p-11 gap-10 drop-shadow rounded-2xl'>
          <h1 className=' text-2xl font-bold'>Used parameters</h1>
          <div className='grid grid-cols-3 gap-16'>
            <UsedParameters title='Latitude' parameter='51.498'/>
            <UsedParameters title='Longitude' parameter='3.618'/>
            <UsedParameters title='Slope increment' parameter='2° increment'/>
            <UsedParameters title='Azimuth increment' parameter='5° increment'/>
            <UsedParameters title='PV max power' parameter='10 kWp'/>
            <UsedParameters title='PV longevity' parameter='15 years'/>
          </div>
        </div>
      </div>
    </>
  )
}

export default App
