import React from 'react';
import { useRoutes } from 'react-router-dom';
import routes from './routes';

function App(): React.ReactElement {
  const routing = useRoutes(routes);
  return <>{routing}</>;
}

export default App;
