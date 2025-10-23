import './App.css'
import { useState, useRef, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import SideMenu from './SideMenu'
import TotalEnergy from './EnergyResultsComponents/TotalEnergy'
import UsedParameters from './EnergyResultsComponents/UsedParameters'
import {getDummyData} from './api'

function App() {
  const [showSideMenu, setShowSideMenu] = useState(false)
  type Panel = { azimuth: number; slope: number };
  type DummyData = {
    totalEnergy: number;
    energyFromGrid: number;
    pvProduction: number;
    solarPanels: Panel[];
  };
  const [dummyData, setDummyData] = useState<DummyData | null>(null)
  const nodeRef = useRef(null)
  const pullTabRef = useRef(null)

  const closeSideMenu = () => {
    setShowSideMenu(false)
  }

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDummyData()
      setDummyData(data)
    }
    fetchData()
  }, [])

  return (
    <>
      <div className='h-screen w-full bg-red-50'>
        <div
          ref={pullTabRef}
          className={`absolute right-0 top-11 h-24 flex items-center px-5 bg-[#F8F8F8] rounded-l-4xl drop-shadow cursor-pointer transition-all duration-150
            ${showSideMenu ? 'lg:w-[30%] md:w-[58%] sm:w-[60%]' : 'w-[5.5rem]'}`}
          onClick={() => setShowSideMenu(!showSideMenu)}
        >
          <svg width="42px" height="42px" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000">
            <path d="M11 6L5 12L11 18" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
            <path d="M19 6L13 12L19 18" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path>
          </svg>
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
        <h1 className='font-bold text-5xl'>Results</h1>

        <div className='w-full h-full flex flex-row gap-16'>
          <div className='bg-white p-11 gap-10 drop-shadow rounded-2xl w-full flex flex-col'>
            <h1 className='text-2xl font-bold'>Optimal solar placement</h1>
            <div className='grid grid-cols-2 gap-5'>
              {dummyData ? (
                dummyData.solarPanels.map((panel, index) => (
                  <div key={index} className='p-4 bg-gray-50 rounded-lg border border-gray-200'>
                    <p><strong>Azimuth:</strong> {panel.azimuth}°</p>
                    <p><strong>Slope:</strong> {panel.slope}°</p>
                  </div>
                ))
              ) : (
                <p>Loading panels...</p>
              )}
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
          {dummyData ? (
            <>
              <TotalEnergy title='Total energy demand' results={dummyData.totalEnergy} />
              <TotalEnergy title='Energy from the grid' results={dummyData.energyFromGrid} />
              <TotalEnergy title='PV Energy production' results={dummyData.pvProduction} />
            </>
          ) : (
            <p>Loading data...</p>
          )}
        </div>

        <div className='bg-white w-full h-full flex flex-col p-11 gap-10 drop-shadow rounded-2xl'>
          <h1 className='text-2xl font-bold'>Used parameters</h1>
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
