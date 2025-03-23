import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const isDevelopment = process.env.NODE_ENV === 'development';

createRoot(document.getElementById('root')).render(
  isDevelopment ? <App /> : <StrictMode><App /></StrictMode>
)