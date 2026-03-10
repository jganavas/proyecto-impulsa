import { StrictMode } from 'react';
import { createBrowserRouter, RouterProvider} from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import Clientes from './pages/Clientes.tsx';
import Login from './pages/Login.tsx';
import NuevoCliente from './pages/NuevoCliente.tsx';
import EditarCliente from './pages/EditarCliente.tsx';
import ProtectedRoute from './components/ProtectedRoute';
import Servicios from './pages/Servicios.tsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />, 
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/clientes",
    element: <Clientes />,
  },
  { path: "/nuevo-cliente",
    element: <ProtectedRoute><NuevoCliente /></ProtectedRoute> 
  },
  { path: "/editar-cliente/:id",
    element: <ProtectedRoute><EditarCliente /></ProtectedRoute> 
  },
  { path:"/servicios",
    element: <ProtectedRoute><Servicios /></ProtectedRoute>,
  }
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
