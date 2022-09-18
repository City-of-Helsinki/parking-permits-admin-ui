import React from 'react';
import { Helmet } from 'react-helmet';
import { useRoutes } from 'react-router-dom';
import routes from './routes';

function App(): React.ReactElement {
  const routing = useRoutes(routes);

  return (
    <>
      <Helmet>
        <script type="text/javascript">
          {`
            var cpm = {
              enabled: ${process.env.REACT_APP_COOKIEHUB_ENABLED}
            };
            (function(h,u,b){
            var d=h.getElementsByTagName("script")[0],e=h.createElement("script");
            e.async=true;e.src='${process.env.REACT_APP_COOKIEHUB_URL}';
            e.onload=function(){u.cookiehub.load(b);}
            d.parentNode.insertBefore(e,d);
            })(document,window,cpm);
        `}
        </script>
      </Helmet>
      {routing}
    </>
  );
}

export default App;
