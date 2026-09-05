import React, { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { router } from './routes';

const App: React.FC = () => {
  // Clear chunk reload flag once the app has successfully mounted
  useEffect(() => {
    if (typeof window !== 'undefined') {
      sessionStorage.removeItem('chunk-reload');
    }
  }, []);

  return <RouterProvider router={router} />;
};

export default App;
