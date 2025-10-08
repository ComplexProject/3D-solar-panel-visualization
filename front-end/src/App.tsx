import { useState, useRef } from 'react'
import { CSSTransition } from 'react-transition-group'
import SideMenu from './SideMenu'
import './App.css'

function App() {
  const [showSideMenu, setShowSideMenu] = useState(false)
  const nodeRef = useRef<HTMLDivElement>(null)

  return (
    <>
      <div onClick={() => setShowSideMenu(!showSideMenu)}>
        CLICK ME!
      </div>

      <CSSTransition
        in={showSideMenu}
        timeout={150}
        classNames="slide-fade"
        unmountOnExit
        nodeRef={nodeRef}
      >
        <SideMenu nodeRef={nodeRef} />
      </CSSTransition>
    </>
  )
}

export default App
