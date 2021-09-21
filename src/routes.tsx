import React from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import Permits from './pages/Permits';
import Reports from './pages/Reports';
import Returns from './pages/Returns';

const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'permits', element: <Permits /> },
      { path: 'returns', element: <Returns /> },
      { path: 'messages', element: <Messages /> },
      { path: 'reports', element: <Reports /> },
      { path: '404', element: <NotFound /> },
      { path: '/', element: <Navigate to="/permits" /> },
      { path: '*', element: <Navigate to="/404" /> },
    ],
  },
];

export default routes;
