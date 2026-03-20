import { useEffect, useState } from 'react';
import api from '../axios'; 
import { Link } from 'react-router-dom';

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

interface Servicio {
  id: number;
  nombre: string;
  tipo: string;
  precio_mensual: number;
}

const Clientes = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [selectedCliente, setSelectedCliente] = useState<number | null>(null);
  const [selectedServicio, setSelectedServicio] = useState<number | null>(null);
  const [modalError, setModalError] = useState('');
  const [modalSuccess, setModalSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchDatos = async () => {
      try {
        const [clientesRes, serviciosRes] = await Promise.all([
          api.get('/clientes'),
          api.get('/servicios')
        ]);
        setClientes(clientesRes.data);
        setServicios(serviciosRes.data);
      } catch (err: any) {
        setError('No se han podido cargar los datos. ¿Ha caducado tu sesión?');
      } finally {
        setLoading(false);
      }
    };

    fetchDatos();
  }, []);

  const abrirModal = () => {
    setShowModal(true);
    setSelectedCliente(null);//Si hubiera un cliente seleccionado lo quita
    setSelectedServicio(null);//Si hubiera un servicio seleccionado lo quita
    setModalError('');
    setModalSuccess('');
  };

  const crearContrato = async () => {
    //Mensaje por si falta algo por seleccionar
    if (!selectedCliente || !selectedServicio) {
      setModalError('Debes seleccionar un cliente y un servicio.');
      return;
    }

    setSubmitting(true);
    setModalError('');
    setModalSuccess('');

    try {
      //Envio de los datos al backend
      const response = await api.post('/contratos', {
        cliente_id: selectedCliente,
        servicio_id: selectedServicio,
        estado: 'Activo'
      });

      setModalSuccess('Contrato creado exitosamente.');
      
      //Creo el objeto del contrato nuevo 
      const newContratoData = {
        id: response.data.id,
        nombreServicio: response.data.servicio?.nombre || servicios.find(s => s.id === selectedServicio)?.nombre || '',
        precio: response.data.servicio?.precio_mensual || servicios.find(s => s.id === selectedServicio)?.precio_mensual || 0
      };

      setClientes(clientes.map(c => {
        if (c.id === selectedCliente) {
          return { ...c, contratos: [...(c.contratos || []), newContratoData] };
        }
        return c;
      }));

      //Cierre de modal
      setTimeout(() => setShowModal(false), 2000);
      
    } catch (err: any) {
      setModalError(err.response?.data?.message || 'Error al intentar crear el contrato.');
    } finally {
      setSubmitting(false);
    }
  };

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
                  <tr key={cliente.id} className="hover:bg-gray-50 transition-colors align-top">
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
                      <div className="flex flex-col gap-3">
                        {cliente.contratos && cliente.contratos.length > 0 ? (
                          cliente.contratos.map((contrato) => (
                            <div key={contrato.id} className="flex items-center justify-between border border-blue-100 bg-blue-50/50 p-2 rounded-lg">
                                <span 
                                  className="text-sm font-medium text-blue-800"
                                >
                                  {contrato.nombreServicio}
                                </span>
                                <Link 
                                    to={`/editar-contrato/${contrato.id}`}
                                    className="text-xs font-medium bg-white text-gray-600 hover:text-blue-600 hover:border-blue-300 border border-gray-200 px-2.5 py-1 rounded transition-colors"
                                >
                                    Editar contrato
                                </Link>
                            </div>
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
        {/* boton para el modal */}
        <div className="mt-6 flex justify-end">
          <button 
            onClick={abrirModal}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all flex items-center gap-2"
          >
            <span className="text-xl">+</span> Añadir servicio a cliente
          </button>
        </div>
      </div>

      {/* Modal para añadir contrato */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-500 bg-opacity-75 backdrop-blur-sm transition-all">
          <div className="bg-white rounded-xl shadow-2xl p-8 max-w-lg w-full max-h-[90vh] overflow-y-auto transform transition-all">
            <h2 className="text-2xl font-bold text-gray-800 mb-6">Añadir servicio a cliente</h2>
            
            {modalError && (
              <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm border-l-4 border-red-500">
                {modalError}
              </div>
            )}
            
            {modalSuccess && (
              <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md text-sm border-l-4 border-green-500">
                {modalSuccess}
              </div>
            )}

            {!modalSuccess && (
              <>
                <div className="mb-6">
                  <h3 className="text-lg font-medium text-gray-700 mb-3">¿A qué cliente quieres adjudicarle un servicio?</h3>
                  <div className="space-y-2 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                    {clientes.map(cliente => {
                      return (
                        <label 
                          key={cliente.id} 
                          className="flex items-center p-2 rounded-md hover:bg-blue-50 cursor-pointer"
                        >
                          <input 
                            type="radio" 
                            name="cliente_radio" 
                            className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                            checked={selectedCliente === cliente.id}
                            onChange={() => setSelectedCliente(cliente.id)}
                          />
                          <span className="text-gray-800 font-medium">
                            {cliente.nombre_completo} <span className="text-xs font-normal">({cliente.dni_cif})</span>
                          </span>
                        </label>
                      );
                    })}
                    {clientes.length === 0 && <p className="text-sm text-gray-500 italic">No hay clientes disponibles.</p>}
                  </div>
                </div>

                {selectedCliente && (
                  <div className="mb-6 animate-fade-in-down">
                    <h3 className="text-lg font-medium text-gray-700 mb-3">¿Qué servicio le adjudicamos?</h3>
                    <div className="space-y-2 border border-gray-200 rounded-lg p-3 max-h-48 overflow-y-auto bg-gray-50">
                      {servicios.map(servicio => (
                        <label key={servicio.id} className="flex items-center p-2 rounded-md hover:bg-blue-50 cursor-pointer">
                          <input 
                            type="radio" 
                            name="servicio_radio" 
                            className="mr-3 w-4 h-4 text-blue-600 focus:ring-blue-500"
                            checked={selectedServicio === servicio.id}
                            onChange={() => setSelectedServicio(servicio.id)}
                          />
                          <span className="text-gray-800 font-medium">
                            {servicio.nombre} <span className="text-xs text-gray-500">({servicio.tipo}) - {servicio.precio_mensual}€</span>
                          </span>
                        </label>
                      ))}
                      {servicios.length === 0 && <p className="text-sm text-gray-500 italic">No tienes servicios creados.</p>}
                    </div>
                  </div>
                )}

                <div className="flex justify-end gap-3 mt-8 pt-4 border-t border-gray-100">
                  <button 
                    onClick={() => setShowModal(false)}
                    className="px-4 py-2 text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg font-medium transition-colors"
                    disabled={submitting}
                  >
                    Cancelar
                  </button>
                  <button 
                    onClick={crearContrato}
                    disabled={submitting || !selectedCliente || !selectedServicio}
                    className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {submitting ? 'Creando...' : 'Crear contrato'}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Clientes;
