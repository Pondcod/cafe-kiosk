import { useEffect, useState } from 'react'
import './App.css'
import axios from "axios"
import WelcomeScreen from './component/WelcomeScreen'
import ConnectionTest from './component/ConnectionTest'
import SupabaseConnectionTest from './component/SupabaseConnectionTest'


function App() {
  const [count, setCount] = useState(0)

  const fetchAPI = async () =>{
    const respone = await axios.get("http://localhost:8080/api")
    console.log(respone.data.fruits)
  }
  useEffect(() =>{
    fetchAPI();
  }, [])
  return (
<div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Connection Test</h1>
      
      <ConnectionTest />
      <SupabaseConnectionTest />
      <WelcomeScreen/>
      
      {/* Rest of your app */}
    </div>
  )
}

export default App
