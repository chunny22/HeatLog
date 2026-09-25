import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider } from './auth/AuthContext'
import './index.css'
import App from './App.tsx'
import { ExerciseProvider } from './exercises/ExerciseContext'
import { ProfileProvider } from './profile/ProfileContext'
import { ThemeProvider } from './theme/ThemeContext'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider>
      <BrowserRouter>
        <AuthProvider>
          <ProfileProvider>
            <ExerciseProvider>
              <App />
            </ExerciseProvider>
          </ProfileProvider>
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  </StrictMode>,
)
