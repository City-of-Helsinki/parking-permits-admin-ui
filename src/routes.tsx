import React from 'react';
import { Navigate } from 'react-router-dom';
import MainLayout from './components/MainLayout';
import SuperAdminLayout from './components/SuperAdminLayout';
import AuthError from './pages/AuthError';
import CreateCompanyPermit from './pages/CreateCompanyPermit';
import CreatePermit from './pages/CreatePermit';
import CreateResidentPermit from './pages/CreateResidentPermit';
import EditResidentPermit from './pages/EditResidentPermit';
import EndPermit from './pages/EndPermit';
import Login from './pages/Login';
import Messages from './pages/Messages';
import NotFound from './pages/NotFound';
import Orders from './pages/Orders';
import PermitDetail from './pages/PermitDetail';
import Permits from './pages/Permits';
import RefundDetail from './pages/RefundDetail';
import Refunds from './pages/Refunds';
import Reports from './pages/Reports';
import Addresses from './pages/superAdmin/addresses/Addresses';
import CreateAddress from './pages/superAdmin/addresses/CreateAddress';
import EditAddress from './pages/superAdmin/addresses/EditAddress';
import CreateLowEmissionCriterion from './pages/superAdmin/lowEmissionCriteria/CreateLowEmissionCriterion';
import EditLowEmissionCriterion from './pages/superAdmin/lowEmissionCriteria/EditLowEmissionCriterion';
import LowEmissionCriteria from './pages/superAdmin/lowEmissionCriteria/LowEmissionCriteria';
import CreateProduct from './pages/superAdmin/products/CreateProduct';
import EditProduct from './pages/superAdmin/products/EditProduct';
import Products from './pages/superAdmin/products/Products';

const routes = [
  {
    path: 'admin',
    element: <SuperAdminLayout />,
    children: [
      { path: 'products', element: <Products /> },
      { path: 'products/create', element: <CreateProduct /> },
      { path: 'products/:id', element: <EditProduct /> },
      { path: 'addresses', element: <Addresses /> },
      { path: 'addresses/create', element: <CreateAddress /> },
      { path: 'addresses/:id', element: <EditAddress /> },
      { path: 'lowEmissionCriteria', element: <LowEmissionCriteria /> },
      {
        path: 'lowEmissionCriteria/create',
        element: <CreateLowEmissionCriterion />,
      },
      {
        path: 'lowEmissionCriteria/:id',
        element: <EditLowEmissionCriterion />,
      },
      { path: '', element: <Navigate to="products" /> },
    ],
  },
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'permits', element: <Permits /> },
      { path: 'permits/:id', element: <PermitDetail /> },
      { path: 'permits/:id/end/:endType', element: <EndPermit /> },
      { path: 'permits/:id/edit/', element: <EditResidentPermit /> },
      { path: 'permits/create', element: <CreatePermit /> },
      { path: 'permits/create/resident', element: <CreateResidentPermit /> },
      { path: 'permits/create/company', element: <CreateCompanyPermit /> },
      { path: 'orders', element: <Orders /> },
      { path: 'refunds', element: <Refunds /> },
      { path: 'refunds/:id', element: <RefundDetail /> },
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
