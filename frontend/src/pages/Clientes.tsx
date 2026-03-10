import { useEffect, useState } from 'react';
import api from '../axios'; 
import { Link } from 'react-router-dom';

// Definimos la estructura de los datos para TypeScript
interface Contrato {
  id: number;
  nombreServicio: string;
  precio: number;
}

interface Cliente {
  id: number;
  dni_cif: string;
  nombre_completo: string;
  email_contacto: string;
  telefono_contacto: string;
  contratos: Contrato[];
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchClientes = async () => {
      try {

        const response = await api.get('/clientes');

        setClientes(response.data);

      } catch (err: any) {
        setError('No se han podido cargar los clientes. ¿Ha caducado tu sesión?');
      } finally {
        setLoading(false);
      }
    };

    fetchClientes();
  }, []);

  if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 animate-pulse">Cargando clientes...</p>
            </div>
        );
    }

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera de la página */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mis Clientes</h1>
            <p className="text-gray-500">Gestiona tu cartera de clientes y sus servicios</p>
          </div>
            <Link 
                to="/nuevo-cliente" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all flex items-center gap-2"
                >
                <span className="text-xl">+</span> Nuevo Cliente
            </Link>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm">
            {error}
          </div>
        )}

        {/* Tabla de Clientes */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Cliente</th>
                <th className="px-6 py-4 font-semibold">Contacto</th>
                <th className="px-6 py-4 font-semibold">Servicios Contratados</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {clientes.length > 0 ? (
                clientes.map((cliente) => (
                  <tr key={cliente.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-900">{cliente.nombre_completo}</div>
                      <div className="text-xs text-gray-400 font-mono mt-0.5">{cliente.dni_cif}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-gray-600 flex items-center gap-1">
                        <span className="opacity-60 text-xs">📧</span> {cliente.email_contacto}
                      </div>
                      <div className="text-sm text-gray-600 flex items-center gap-1 mt-1">
                        <span className="opacity-60 text-xs">📞</span> {cliente.telefono_contacto}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex flex-wrap gap-2">
                        {cliente.contratos && cliente.contratos.length > 0 ? (
                          cliente.contratos.map((contrato) => (
                            <span 
                              key={contrato.id} 
                              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                            >
                              {contrato.nombreServicio}
                            </span>
                          ))
                        ) : (
                          <span className="text-xs text-gray-400 italic">Sin servicios</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                          to={`/editar-cliente/${cliente.id}`}
                          className="text-gray-400 hover:text-blue-600 font-medium text-sm transition-colors"
                          >
                           Editar 
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 italic">
                    No tienes clientes registrados todavía.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Clientes;