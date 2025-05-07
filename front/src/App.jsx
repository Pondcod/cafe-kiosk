import { useEffect, useState } from 'react'
import './App.css'
import axios from "axios"
import Welcome from './pages/kiosk/welcome.jsx'
import OptionDine from './pages/kiosk/OptionDine.jsx'


function App() {
  const [count, setCount] = useState(0)

  const fetchAPI = async () =>{
    const response = await axios.get("http://localhost:8080/api")
    console.log(response.data.fruits)
  }
  useEffect(() =>{
    fetchAPI();
  }, [])
  return (
<div className="container mx-auto p-4">
      
      <Welcome />

    </div>
  )
}

export default App
