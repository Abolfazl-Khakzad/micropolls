import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'   // ← this is the key line
import './i18n'
import { Toaster } from "react-hot-toast";
<Toaster position="top-center" />

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
