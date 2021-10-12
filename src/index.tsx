import React from 'react';
import ReactDOM from 'react-dom';
import { BrowserRouter } from 'react-router-dom';
import { ApiClientProvider } from './api/ApiClientProvider';
import App from './App';
import { ApiAccessTokenProvider } from './auth/ApiAccessTokenProvider';
import { ClientProvider } from './auth/ClientProvider';
import HandleCallback from './auth/HandleCallback';
import './i18n';
import './index.scss';
import reportWebVitals from './reportWebVitals';

ReactDOM.render(
  <React.StrictMode>
    <BrowserRouter>
      <HandleCallback>
        <ClientProvider>
          <ApiAccessTokenProvider>
            <ApiClientProvider>
              <App />
            </ApiClientProvider>
          </ApiAccessTokenProvider>
        </ClientProvider>
      </HandleCallback>
    </BrowserRouter>
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
