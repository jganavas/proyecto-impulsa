import { useState, type FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../axios'; 

interface ServicioForm {
  nombre: string;
  tipo: string;
  precio_mensual: number | '';
  activa: boolean;
}

const NuevoServicio = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  //Plantilla del formulario vacia
  const [formData, setFormData] = useState<ServicioForm>({
    nombre: '',
    tipo: '',
    precio_mensual: '',
    activa: true,
  });

  //relleno la plantilla con los datos del usuario
  //la funcion React.ChangeEvent se dispara solo cuando nota cambios en los input o select
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    
    if (name === 'activa') {//select
      const boolValue = value === 'true';
      setFormData(prev => ({ ...prev, [name]: boolValue }));
    } else if (name === 'precio_mensual') {
      setFormData(prev => ({ ...prev, [name]: value === '' ? '' : parseFloat(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  //funcion asincrona que envia los datos de los input y select al servidor de symfony para que los guarde en la BD
  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    //asegurarse de que el precio si se manda en blanco se envíe como 0
    const dataToSend = {
        ...formData,
        precio_mensual: typeof formData.precio_mensual === 'number' ? formData.precio_mensual : 0
    };

    try {
      await api.post('/servicios', dataToSend);//envia los datos a la ruta servicios
      navigate('/servicios');//si todo ok nos movemos a la vista servicios
    } catch (err: any) {
      let msg = 'Error al crear el servicio. Revisa los datos o tu conexión.';
      if (err.response && err.response.data && err.response.data.message) {
        msg = err.response.data.message;
      }
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        
        {/* Botón Volver */}
        <Link to="/servicios" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-6 transition-colors">
          ← Volver a la lista
        </Link>

        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Nuevo Servicio</h1>
          <p className="text-gray-500 mb-8">Introduce los datos para registrar un nuevo servicio en tu catálogo.</p>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre del Servicio</label>
              <input 
                type="text" name="nombre" required
                value={formData.nombre} onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="Ej: Mantenimiento Informático Básico"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo</label>
              <input 
                type="text" name="tipo" required
                value={formData.tipo} onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="Ej: Soporte, Cloud, Telefonía"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Mensual (€)</label>
              <input 
                type="number" step="0.01" min="0" name="precio_mensual" required
                value={formData.precio_mensual} onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all"
                placeholder="0.00"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Estado del servicio</label>
              <select 
                name="activa" 
                value={formData.activa ? 'true' : 'false'} 
                onChange={handleChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all cursor-pointer"
              >
                <option value="true">Activo (Disponible para contratar)</option>
                <option value="false">Inactivo (Oculto / En pausa)</option>
              </select>
            </div>

            <div className="md:col-span-2 mt-4">
              <button 
                type="submit" 
                disabled={loading} //evitamos que el usuario haga click 50 vecs y asi no duplica el servicio
                className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:bg-gray-400"
              >
                {loading ? 'Guardando...' : 'Crear Servicio'}
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default NuevoServicio;