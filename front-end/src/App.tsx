import { useState, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import SideMenu from './SideMenu'
import './App.css'

function App() {
  const [showSideMenu, setShowSideMenu] = useState(false)
  const nodeRef = useRef(null)
  const pullTabRef = useRef(null)

  const closeSideMenu = () => {
    setShowSideMenu(false)
  }

  return (
    <>

      {/* <CSSTransition
        in={showSideMenu}
        timeout={100}
        classNames="pullTab"
        nodeRef={pullTabRef}
      > */}
        <div ref={pullTabRef} className={`fixed right-0 top-11 h-24 flex items-center px-5 bg-[#F8F8F8] rounded-l-4xl drop-shadow cursor-pointer transition-all duration-150
          ${ showSideMenu ? 'lg:w-[30%] md:w-[58%] sm:w-[60%]' : 'w-[5.5rem]'}`} onClick={() => setShowSideMenu(!showSideMenu)}>
          <svg width="42px" height="42px" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="#000000"><path d="M11 6L5 12L11 18" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path><path d="M19 6L13 12L19 18" stroke="#000000" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"></path></svg>
      </div>
      {/* </CSSTransition> */}

      <CSSTransition
        in={showSideMenu}
        timeout={150}
        classNames="sideMenuSlide"
        unmountOnExit
        nodeRef={nodeRef}
        >
        <SideMenu nodeRef={nodeRef} onClick={closeSideMenu}/>
      </CSSTransition>

    </>
  )
}

export default App
