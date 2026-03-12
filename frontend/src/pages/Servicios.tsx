import { useEffect, useState } from 'react';
import api from '../axios'; 
import { Link } from 'react-router-dom';

//Interfaz para que react sepa la estructura del objeto 
interface Servicio {
  id: number;
  nombre: string;
  tipo: string;
  precio_mensual: number;
  activa: boolean;
}

const Servicios = () => {
  //solo se guarda un array de objetos que cumplan con la interfaz, por defecto es array vacio
  const [servicios, setServicios] = useState<Servicio[]>([]);
  const [loading, setLoading] = useState(true);//estado de carga
  const [error, setError] = useState('');//estado errores

  useEffect(() => {//conforme la pag aparezca en pantalla, busca los datos en el servidor
    const fetchServicios = async () => {
      try {
        const response = await api.get('/servicios');//Se piden al backend los datos
        setServicios(response.data);//Si todo ok se guarda en la variable de antes
      } catch (err: any) {
        setError('No se han podido cargar los servicios. ¿Ha caducado tu sesión?');
      } finally {
        setLoading(false);
      }
    };

    fetchServicios();//llamo la funcion para que se ejecute
  }, []);//-->[] array de dependencias, si esta vacio, se ejecuta una vez al abrir la pag

  //Estilo loading
  if (loading) return (
    <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 animate-pulse">Cargando servicios...</p>
            </div>
  );
 
 // console.log("Primer servicio recibido:", servicios[0]);
  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Cabecera de la página */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Mis Servicios</h1>
            <p className="text-gray-500">Gestiona el catálogo de servicios que ofreces</p>
          </div>
            <Link //enlace para crear un servio nuevo
                to="/nuevo-servicio" 
                className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-semibold shadow-md transition-all flex items-center gap-2"
                >
                <span className="text-xl">+</span> Nuevo Servicio
            </Link>
        </div>

        {error && (//Si hubiera errores los muestra, si no nada
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md shadow-sm">
            {error}
          </div>
        )}

        {/* Tabla de Servicios */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-gray-600 text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Servicio</th>
                <th className="px-6 py-4 font-semibold">Tipo</th>
                <th className="px-6 py-4 font-semibold">Precio / Mes</th>
                <th className="px-6 py-4 font-semibold">Estado</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {servicios.length > 0 ? (
                servicios.map((servicio) => (//Recorro array servicios e injecto datos
                  <tr key={servicio.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-5">
                      <div className="font-bold text-gray-900">{servicio.nombre}</div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm text-gray-600 capitalize">
                        {servicio.tipo}
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <div className="text-sm font-semibold text-gray-900">
                        {servicio.precio_mensual ?? 0} €
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      <span 
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          servicio.activa //Si el servicio esta activo sale de color verde y si no, rojo
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {servicio.activa ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-6 py-5 text-right">
                      <Link 
                          to={`/editar-servicio/${servicio.id}`}
                          className="text-gray-400 hover:text-blue-600 font-medium text-sm transition-colors"
                          >
                           Editar 
                      </Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500 italic">
                    No tienes servicios registrados todavía.
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

export default Servicios;