import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider } from './context/ThemeContext'
import { LangProvider } from './context/LangContext'
import { AuthProvider } from './context/AuthContext'
import { PreviewProvider } from './context/PreviewContext'
import './index.css'
import App from './App'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <PreviewProvider>
        <ThemeProvider>
          <LangProvider>
            <AuthProvider>
              <App />
            </AuthProvider>
          </LangProvider>
        </ThemeProvider>
      </PreviewProvider>
    </BrowserRouter>
  </StrictMode>
)
