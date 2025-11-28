import { useState } from 'react'
import './App.css'

import Globe3D from './components/Globe'
import Menu from './components/Menu'

function App() {

  return (
    <>
      <Globe3D data="" />
      {/* get values from menu states and pass it into globe3d?? is that possible? or what if i make the menu here and pass it in */}
      <Menu />
    </>
  )
}

export default App
