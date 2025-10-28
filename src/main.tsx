import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import ProtectedApp from './ProtectedApp';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <ProtectedApp />
    </React.StrictMode>,
);
