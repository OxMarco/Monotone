import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { Providers } from './Providers.tsx';
import ErrorPage from './pages/ErrorPage.tsx';
import SwapPage from './pages/SwapPage.tsx';

const router = createBrowserRouter([
  {
    path: '/',
    element: <SwapPage />,
    errorElement: <ErrorPage />,
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <>
    <Providers>
      <RouterProvider router={router} />
    </Providers>
  </>,
);
