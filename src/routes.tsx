import React from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import AuthError from './pages/AuthError';
import Login from './pages/Login';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import PermitDetail from './pages/PermitDetail';
import Permits from './pages/Permits';
import Reports from './pages/Reports';
import Returns from './pages/Returns';

const routes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'permits', element: <Permits /> },
      { path: 'permits/:id', element: <PermitDetail /> },
      { path: 'returns', element: <Returns /> },
      { path: 'messages', element: <Messages /> },
      { path: 'reports', element: <Reports /> },
      { path: 'authError', element: <AuthError /> },
      { path: '404', element: <NotFound /> },
      { path: '/', element: <Navigate to="/permits" /> },
      { path: '*', element: <Navigate to="/404" /> },
    ],
  },
];

export default routes;
