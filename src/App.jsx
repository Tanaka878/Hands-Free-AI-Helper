import { useState } from 'react'

import './App.css';
import './index.css';
import Navbar from "./Components/Navbar"
import Hero from "./Components/Hero"
import Highlights from "./Components/Highlights"


function App() {
  const [count, setCount] = useState(0)

  return (
    <main>
   
  <Navbar/>
  <Hero/>
  <Highlights/>
  </main>
  )
}

export default App
