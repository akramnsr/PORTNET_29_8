import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// ✅ Supprimer le double AuthProvider - il est déjà dans App.jsx
ReactDOM.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);