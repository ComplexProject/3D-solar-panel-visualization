import './App.css'
import { useState, useRef, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import SideMenu from './SideMenu'
import TotalEnergy from './energyResultsComponents/TotalEnergy'
import UsedParameters from './energyResultsComponents/UsedParameters'
import SolarPlacementCard from './energyResultsComponents/SolarPlacementCard'
import ProducedSolarEnergy from './energyResultsComponents/ProducedSolarEnergy'
import { FastArrowLeft, IconoirProvider } from 'iconoir-react';
import ModelViewer from './ModelImportComponent/ModelViewer'
import BuildingWithSolarPanels from './ModelImportComponent/BuildingWithSolarPanels'
import { getDummyData } from './api'

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
        <div className="relative h-full w-full">
          <ModelViewer>
            <BuildingWithSolarPanels />
          </ModelViewer>
        </div>
        <div
          ref={pullTabRef}
          className={`absolute right-0 top-1/4 h-24 flex items-center px-5 bg-[#F8F8F8] z-20 rounded-l-4xl drop-shadow cursor-pointer transition-all duration-150
            ${showSideMenu ? 'lg:w-[30%] md:w-[58%] sm:w-[60%]' : 'w-[5.5rem]'}`}
          onClick={() => setShowSideMenu(!showSideMenu)}
        >
          <IconoirProvider
            iconProps={{
              color: '#000000',
              strokeWidth: 1.5,
              width: '2.6rem',
              height: '2.6rem',
            }}
          >
            <FastArrowLeft />
          </IconoirProvider>
          </div>
          <div className={`absolute right-0 top-1/6 transition-all duration-150 z-30 ${showSideMenu ? 'lg:w-1/4 md:w-1/2 sm:w-1/2' : 'w-0'} overflow-x-hidden py-1 pl-1`}>
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
        <div className='flex justify-between items-center'>
          <h1 className='font-bold text-5xl'>Results</h1>
          <div className='flex'>
            <h2 className='text-3xl pr-2'>Year:</h2>
            <h2 className='text-3xl font-bold'>2024</h2>
          </div>
        </div>
          <div className='w-full h-full flex flex-row gap-10'>
            <div className='bg-white p-10 gap-10 drop-shadow rounded-2xl w-2/3 h-fit flex flex-col min-w-0'>
              <h1 className=' text-2xl font-bold'>Optimal solar placement</h1>
              <div className='grid grid-rows-2 grid-flow-col gap-10 w-full overflow-x-auto overflow-y-visible'>
                {dummyData ? (
                  dummyData.solarPanels.map((panel, index) => (
                    <SolarPlacementCard key={index} panelNumber={index + 1} azimuth={panel.azimuth} slope={panel.slope} />
                  ))
                  ) : (
                    <p>Loading panels...</p>
                  )}
              </div>
            </div>
            <div className='bg-white drop-shadow rounded-2xl flex flex-col w-1/3 min-w-0 '>
              <h1 className='font-bold text-2xl p-10'>Produced solar energy</h1>
              <hr className='border-1'/>
              <div className='px-10 py-1 text-2xl divide-y divide-black max-h-[300px] overflow-auto'>
                <ProducedSolarEnergy panelNumber={1} producedEnergy={5} />
                <ProducedSolarEnergy panelNumber={2} producedEnergy={30} />
                <ProducedSolarEnergy panelNumber={3} producedEnergy={60} />
                <ProducedSolarEnergy panelNumber={4} producedEnergy={15} />
                <ProducedSolarEnergy panelNumber={5} producedEnergy={37} />
                <ProducedSolarEnergy panelNumber={6} producedEnergy={23} />
              </div>
            </div>
          </div>
        <div className='w-full h-full flex flex-row gap-10'>
          {dummyData ? (
            <>
              <div className='flex w-2/3 gap-10'>
                <TotalEnergy title='Total energy demand' results={dummyData.totalEnergy} />
                <TotalEnergy title='Energy from the grid' results={dummyData.energyFromGrid} />
              </div>
              <div className='w-1/3'>
                <TotalEnergy title='PV Energy production' results={dummyData.pvProduction} />
              </div>
            </>
            ) : (
            <p>Loading data...</p>
          )}
        </div>
        <div className='bg-white w-full h-full flex flex-col p-11 gap-10 drop-shadow rounded-2xl'>
          <h1 className=' text-2xl font-bold'>Used parameters</h1>
          <div className='grid grid-cols-3 gap-10'>
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
