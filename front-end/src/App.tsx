import './App.css'
import { useState, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import SideMenu from './SideMenu'
import TotalEnergy from './EnergyResultsComponents/TotalEnergy'
import UsedParameters from './EnergyResultsComponents/UsedParameters'
import ApiTesting from './ApiTesting'


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
            <div 
          ref={pullTabRef} 
          className={`absolute right-0 top-1/4 h-24 flex items-center px-5 bg-[#F8F8F8] rounded-l-4xl drop-shadow cursor-pointer transition-all duration-150
            ${showSideMenu ? 'lg:w-[30%] md:w-[58%] sm:w-[60%]' : 'w-[5.5rem]'}`} 
          onClick={() => setShowSideMenu(!showSideMenu)}
        >
          <svg width="42px" height="42px" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000">
            <path d="M11 6L5 12L11 18" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M19 6L13 12L19 18" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
        </div>
        <div className='absolute right-0 top-1/6 lg:w-1/4 md:w-1/2 sm:w-1/2 overflow-x-hidden py-1 pl-1'>
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
        <div className='w-full h-full flex flex-row gap-16'>
          <div className='bg-white p-11 gap-10 drop-shadow rounded-2xl w-full flex flex-col'>
            <h1 className=' text-2xl font-bold'>Optimal solar placement</h1>
            <div className='grid grid-cols-2 gap-5'>
              <div>HI</div>
              <div>HI</div>
              <div>HI</div>
              <div>HI</div>
            </div>
          </div>
          <div className='bg-white gap-10 p-11 drop-shadow rounded-2xl w-full flex flex-col'>
            <h1 className='font-bold text-2xl'>Produced solar energy</h1>
            <div className='flex flex-col gap-5'>
              <div>HI</div>
              <div>HI</div>
              <div>HI</div>
              <div>HI</div>
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
      <ApiTesting/>
    </>

  )
}

export default App
