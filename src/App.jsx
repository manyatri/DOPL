import { useState } from 'react'
import BackgroundParticles from './components/BackgroundParticles'
import LandingPage from './components/LandingPage'
import SignupPage from './components/SignupPage'
import PlatformIntegrationPage from './components/PlatformIntegrationPage'
import TelegramMonitoringPage from './components/TelegramMonitoringPage'
import SuccessPage from './components/SuccessPage'
import SigninPage from './components/SigninPage'
import CommandCenter from './components/CommandCenter'
import './App.css'

function App() {
  const [view, setView] = useState('landing') // 'landing' | 'signup' | 'signin' | 'step2' | 'step3' | 'success' | 'dashboard'
  const [formData, setFormData] = useState({
    fullName: '',
    workEmail: '',
    password: 'doplcreator',
    hostType: 'custom-lms',
    endpointUrl: 'https://academy.yourdomain.com/api/v1',
    seedSources: 'https://t.me/joinchat/pirated_course_group_alpha\nhttps://t.me/free_educational_materials_hub\nexample_competitor_forum_url.com/leaks',
    keywords: 'Advanced Python, Rohan Sharma, Architecture Boot Camp',
    scanPublicTelegram: true,
    scanPrivateLink: true,
    scanCloudStorage: false
  })

  const handleStep1Continue = (step1Data) => {
    setFormData((prev) => ({ ...prev, ...step1Data }))
    setView('step2')
  }

  const handleStep2Continue = (step2Data) => {
    setFormData((prev) => ({ ...prev, ...step2Data }))
    setView('step3')
  }

  const handleStep3Finish = (step3Data) => {
    const finalData = { ...formData, ...step3Data }
    setFormData(finalData)
    setView('success')
  }

  const handleLoginSuccess = (loginData) => {
    setFormData((prev) => ({ ...prev, ...loginData }))
    setView('dashboard')
  }

  const handleRestart = () => {
    setFormData({
      fullName: '',
      workEmail: '',
      password: 'doplcreator',
      hostType: 'custom-lms',
      endpointUrl: 'https://academy.yourdomain.com/api/v1',
      seedSources: 'https://t.me/joinchat/pirated_course_group_alpha\nhttps://t.me/free_educational_materials_hub\nexample_competitor_forum_url.com/leaks',
      keywords: 'Advanced Python, Rohan Sharma, Architecture Boot Camp',
      scanPublicTelegram: true,
      scanPrivateLink: true,
      scanCloudStorage: false
    })
    setView('landing')
  }

  return (
    <div className="relative min-h-screen w-full flex flex-col justify-start items-center overflow-x-hidden">
      {/* Shared continuous particles animation */}
      <BackgroundParticles />
      
      {/* Page Content */}
      {view === 'landing' && (
        <LandingPage setView={setView} />
      )}
      
      {view === 'signup' && (
        <SignupPage 
          setView={setView} 
          onContinue={handleStep1Continue} 
          initialData={formData} 
        />
      )}

      {view === 'signin' && (
        <SigninPage 
          setView={setView} 
          onLoginSuccess={handleLoginSuccess} 
        />
      )}

      {view === 'step2' && (
        <PlatformIntegrationPage 
          onBack={() => setView('signup')} 
          onContinue={handleStep2Continue} 
          initialData={formData} 
        />
      )}

      {view === 'step3' && (
        <TelegramMonitoringPage 
          onBack={() => setView('step2')} 
          onFinish={handleStep3Finish} 
          initialData={formData} 
        />
      )}

      {view === 'success' && (
        <SuccessPage 
          data={formData} 
          onGoToSetup={() => setView('dashboard')}
        />
      )}

      {view === 'dashboard' && (
        <CommandCenter 
          formData={formData} 
          onLogOut={handleRestart} 
        />
      )}
    </div>
  )
}

export default App


