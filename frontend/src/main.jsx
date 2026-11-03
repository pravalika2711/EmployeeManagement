// main.jsx - React application entry point

import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Import CSS stylesheets
import './styles/global.css';
import './styles/layout.css';
import './styles/auth.css';
import './styles/dashboard.css';
import './styles/employees.css';
import './styles/modal.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

