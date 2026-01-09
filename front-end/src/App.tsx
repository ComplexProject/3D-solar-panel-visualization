import './App.css'
import { useState, useRef, useEffect } from 'react'
import { CSSTransition } from 'react-transition-group'
import SideMenu from './SideMenu'
import TotalEnergy from './energyResultsComponents/TotalEnergy'
import UsedParameters from './energyResultsComponents/UsedParameters'
import SolarPlacementCard from './energyResultsComponents/SolarPlacementCard'
import ProducedSolarEnergy from './energyResultsComponents/ProducedSolarEnergy'
import { FastArrowLeft, IconoirProvider } from 'iconoir-react';
import { ArrowLeft } from 'iconoir-react';
import { ArrowRight } from 'iconoir-react';
import ModelViewer from './ModelImportComponent/ModelViewer'
import BuildingWithSolarPanels from './ModelImportComponent/BuildingWithSolarPanels'
import LoadingMessage from './statusMessageComponents/results/loadingMessage'
import ErrorMessage from './statusMessageComponents/results/errorMessage'
import Header from './Header'
import React from 'react'
import RunCalculation from './statusMessageComponents/results/runCalculation'
import UnsavedChanges from './formComponents/UnsavedChanges'
import ClosestCityFound from './formComponents/ClosestCityFound'
import { exportToPDF, prepareExportData } from './utils/exportResult'
import { GetCityName } from './utils/GeocodingAPI'

export const CalculationContext = React.createContext<{isCalculationRunning: boolean; setIsCalculationRunning: (value: boolean) => void}>({isCalculationRunning: false, setIsCalculationRunning: () => {}});
export const ResultContext = React.createContext<{isResultAvailabe: number; setIsResultAvailable: (value: number) => void; resultData: any | null; setResultData: (value: any) => void;}>({ isResultAvailabe: 0, setIsResultAvailable: () => {}, resultData: null, setResultData: () => {}});

function App() {
  const [showSideMenu, setShowSideMenu] = useState(false)
  const [isCalculationRunning, setIsCalculationRunning] = useState(false)
  const [isResultAvailabe, setIsResultAvailable] = useState(0)
  const [resultData, setResultData] = useState<any | null>(null)
  const [showUnsavedPopup, setShowUnsavedPopup] = useState(false);
  const [unsavedCallback, setUnsavedCallback] = useState<(() => void) | null>(null);
  const [showClosestPopup, setShowClosestPopup] = useState(false);
  const [closestDistance, setClosestDistance] = useState<number | null>(null);
  const [closestCoords, setClosestCoords] = useState<{lat: number, lon: number} | null>(null);

  const nodeRef = useRef(null)
  const pullTabRef = useRef(null)
  const navRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const savedResult = localStorage.getItem('resultData');
    if (savedResult) {
      setResultData(JSON.parse(savedResult));
      setIsResultAvailable(2);
    }
  }, [])

  useEffect(() => {
    function handler(e: Event) {
      const ev = e as CustomEvent;
      const distance = ev?.detail?.distance;
      const lat = ev?.detail?.lat;
      const lon = ev?.detail?.lon;
      if (typeof distance === 'number' && typeof lat === 'number' && typeof lon === 'number') {
        setClosestDistance(Math.round(distance));
        setClosestCoords({lat, lon});
        setShowClosestPopup(true);
      }
    }

    window.addEventListener('closestCityFound', handler as EventListener);
    return () => window.removeEventListener('closestCityFound', handler as EventListener);
  }, []);
  
  const getSolarPanelResult = () => {
    if (!resultData?.output?.panels) return [];
    return Object.values(resultData.output.panels).map((panel: any) => ({
      azimuth: panel.azimuth,
      slope: panel.slope,
      kwp: panel.kwp
    }));
  };

  const handleNav = (direction: string) => {
    if (direction == "left") {
      navRef.current?.scrollBy({ left: -200, behavior: "smooth" })
    }
    if (direction == "right") {
      navRef.current?.scrollBy({ left: 200, behavior: "smooth" })
    }
  }

  const closeSideMenu = () => setShowSideMenu(false);
  const showNavArrows = () => getSolarPanelResult().length > 4;

  const showUnsavedChangesPopup = (callback: () => void) => {
    setUnsavedCallback(() => callback);
    setShowUnsavedPopup(true);
  };

  const handleUnsavedConfirm = () => {
    setShowUnsavedPopup(false);
    unsavedCallback?.();
    setUnsavedCallback(null);
  };

  const handleUnsavedCancel = () => {
    setShowUnsavedPopup(false);
    setUnsavedCallback(null);
  };

  const handleExport = () => {
  if (!resultData) {
    alert('No calculation results available to export');
    return;
  }
  
  try {
    const exportData = prepareExportData(getSolarPanelResult, resultData);
    exportToPDF(exportData);
  } catch (error) {
      console.error('Error exporting PDF:', error);
      alert('Error generating report. Please try again.');
  }
  };

  return (
    <>
      <div className='h-screen w-full bg-white flex justify-center items-center'>
        <Header/>        
        {showUnsavedPopup && (
          <UnsavedChanges 
            onConfirm={handleUnsavedConfirm}
            onCancel={handleUnsavedCancel}
          />
        )}
        {showClosestPopup && (
          <ClosestCityFound
            onConfirm={async () => {
              if (closestCoords) {
                localStorage.setItem('latitude', JSON.stringify(closestCoords.lat));
                localStorage.setItem('longitude', JSON.stringify(closestCoords.lon));
                
                const cityData = await GetCityName(closestCoords.lat, closestCoords.lon);
                if (cityData) {
                  localStorage.setItem('city', JSON.stringify(cityData.name));
                  window.dispatchEvent(new CustomEvent('coordinatesUpdated', {
                    detail: {lat: closestCoords.lat, lon: closestCoords.lon, city: cityData.name}
                  }));
                } else {
                  window.dispatchEvent(new CustomEvent('coordinatesUpdated', {
                    detail: {lat: closestCoords.lat, lon: closestCoords.lon}
                  }));
                }
              }
              setShowClosestPopup(false);
            }}
            onCancel={() => setShowClosestPopup(false)}
            distance={closestDistance ?? 0}
          />
        )}
              
        <div className="relative h-full w-full">
          <ModelViewer
          props={{
            isResultAvailabe: isResultAvailabe,
          }}
          >
            <BuildingWithSolarPanels />
          </ModelViewer>
        </div>
        <div
          ref={pullTabRef}
          className={`absolute right-0 top-1/4 h-24 flex items-center px-5 bg-[#F8F8F8] z-20 rounded-l-4xl drop-shadow cursor-pointer transition-all duration-150
          ${showSideMenu ? 'lg:w-[30%] md:w-[58%] sm:w-[60%]' : 'w-[5.5rem]'}`}
          onClick={() => setShowSideMenu(!showSideMenu)}
        >
          <IconoirProvider iconProps={{ color: '#000000', strokeWidth: 1.5, width: '2.6rem', height: '2.6rem' }}>
            <FastArrowLeft />
          </IconoirProvider>
        </div>
        <div className='absolute right-0 top-1/6 lg:w-1/4 md:w-1/2 sm:w-1/2 z-30 overflow-x-hidden py-1 pl-1'>
          <CSSTransition in={showSideMenu} timeout={150} classNames="sideMenuSlide" unmountOnExit nodeRef={nodeRef}>
            <ResultContext.Provider value={{ isResultAvailabe, setIsResultAvailable, resultData, setResultData }}>
              <CalculationContext.Provider value={{ isCalculationRunning: isCalculationRunning, setIsCalculationRunning: setIsCalculationRunning}}>
                <SideMenu nodeRef={nodeRef} onClick={closeSideMenu} onShowUnsavedChanges={showUnsavedChangesPopup}/>
              </CalculationContext.Provider>
            </ResultContext.Provider>
          </CSSTransition>
        </div>
      </div>
      <div className='px-12 py-16 flex flex-col h-full w-full gap-11 bg-[#F8F8F8]'>
        <div className='flex justify-between items-center'>
          <h1 className='font-bold text-5xl'>Results</h1>
          {resultData  && !isCalculationRunning ?
          <div className='flex flex-row gap-5 justify-center items-center'>
            <div className='flex'>
              <h2 className='text-2xl pr-2'>City:</h2>
              <h2 className='text-2xl font-bold'>{`${JSON.parse(localStorage.getItem("city")!)}`}</h2>
            </div>
            <div className='flex'>
              <h2 className='text-2xl pr-2'>Year:</h2>
              <h2 className='text-2xl font-bold'>{`${JSON.parse(localStorage.getItem("year")!)}`}</h2>
            </div>
            <button className='drop-shadow-sm cursor-pointer rounded-xl p-2 bg-[#006FAA] text-white hover:scale-105' onClick={handleExport}>Export results</button>
          </div>
            :
          <></>
          }
        </div>
        { resultData  && !isCalculationRunning ?
        <>
          <div className='w-full h-full flex flex-row gap-10'>
            <div className='relative bg-white p-10 gap-0 drop-shadow rounded-2xl w-2/3 flex flex-col min-w-0'>
              <h1 className=' text-2xl font-bold mb-5'>Optimal solar placement</h1>              
              <div ref={navRef} className='grid grid-rows-2 grid-flow-col gap-10 w-full overflow-x-auto'>
                {getSolarPanelResult().map((panel, index) => (
                  <SolarPlacementCard key={index} panelNumber={index + 1} azimuth={panel.azimuth} slope={panel.slope} />
                ))
                }
              </div>
              {showNavArrows() ? 
              <div className='absolute top-[53%] w-full px-10 left-0 right-0 flex flex-row justify-between m-0 p-0'>
                <button onClick={() => handleNav('left')}>
                  <IconoirProvider
                  iconProps={{
                  color: '#000000',
                  strokeWidth: 1.5,
                  width: '1.5rem',
                  height: '1.5rem',
                  }}
                  >
                  <ArrowLeft />
                  </IconoirProvider>
                </button>
                <button onClick={() => handleNav('right')}>
                  <IconoirProvider
                    iconProps={{
                    color: '#000000',
                    strokeWidth: 1.5,
                    width: '1.5rem',
                    height: '1.5rem',
                  }}
                  >
                    <ArrowRight />
                  </IconoirProvider>
                </button>
              </div>
              : 
              null
              }
            </div>
            <div className='bg-white drop-shadow rounded-2xl flex flex-col w-1/3'>
              <h1 className='font-bold text-2xl p-10'>Produced solar energy</h1>
              <hr className='border-1'/>
              <div className='px-10 py-1 text-2xl divide-y divide-black max-h-[300px] overflow-auto'>
                {getSolarPanelResult().map((panel, index) => (
                  <ProducedSolarEnergy key={index} panelNumber={index + 1} producedEnergy={panel.kwp} />
                ))}
              </div>
            </div>
          </div>
          <div className='w-full h-full flex flex-row gap-10'>
          {resultData  && !isCalculationRunning ? (
            <>
              <div className='flex w-2/3 gap-10'>
                <TotalEnergy title='Total energy demand' results={(resultData.output?.ppv_usable || 0) + (resultData.output?.energy_from_grid || 0)}  />
                <TotalEnergy title='Energy from the grid' results={resultData.output?.energy_from_grid || 0} />
              </div>
              <div className='w-1/3'>
                <TotalEnergy title='PV Energy production' results={resultData.output?.ppv_usable || 0} />
              </div>
            </>
            ) : (
            <></>
          )}
          </div>
          <div className='bg-white w-full h-full flex flex-col p-11 gap-10 drop-shadow rounded-2xl'>
            <h1 className=' text-2xl font-bold'>Used parameters</h1>
            <div className='grid grid-cols-3 gap-10'>
              <UsedParameters title='Latitude' parameter={localStorage.getItem("latitude") ? `${JSON.parse(localStorage.getItem("latitude")!)}°` : "N/A"}/>
              <UsedParameters title='Latitude' parameter={localStorage.getItem("longitude") ? `${JSON.parse(localStorage.getItem("longitude")!)}°` : "N/A"}/>
              <UsedParameters title='Slope increment' parameter='1° increment'/>
              <UsedParameters title='Azimuth increment' parameter='1° increment'/>
              <UsedParameters title='PV max power' parameter={localStorage.getItem("power") ? `${localStorage.getItem("power")} kWp`: "N/A"}/>
              <UsedParameters title='PV longevity' parameter='15 years'/>
            </div>
          </div>
        </>
        :
        <>
          {isResultAvailabe == 0 ? <RunCalculation/> : isResultAvailabe == 1 ? <LoadingMessage /> : isResultAvailabe == 3 ? <ErrorMessage /> : null}
        </>
        } 
      </div>
    </> 
  )
}

export default App
