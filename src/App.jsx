import { useState } from 'react'
import BackgroundParticles from './components/BackgroundParticles'
import LandingPage from './components/LandingPage'
import SignupPage from './components/SignupPage'
import './App.css'

function App() {
  const [view, setView] = useState('landing') // 'landing' | 'signup'

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-start items-center overflow-x-hidden">
      {/* Shared continuous particles animation */}
      <BackgroundParticles />
      
      {/* Page Content */}
      {view === 'landing' ? (
        <LandingPage setView={setView} />
      ) : (
        <SignupPage setView={setView} />
      )}
    </div>
  )
}

export default App
