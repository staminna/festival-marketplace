import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import registerServiceWorker from './serviceWorker';
import App from './App';
import { MetaMaskProvider } from "metamask-react";

<React.StrictMode>
    <MetaMaskProvider>
        <App />
    </MetaMaskProvider>
</React.StrictMode>

ReactDOM.render(<App />, document.getElementById('root'));
registerServiceWorker();
