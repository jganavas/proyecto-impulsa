import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import api from '../axios'; 

interface ServicioFormData {
  nombre: string;
  tipo: string;
  precio_mensual: string | number;
  activa: boolean;
}

const EditarServicio = () => {

    const { id } = useParams();//cojo el id de la url 
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

    //Plantilla
    const [formData, setFormData] = useState<ServicioFormData>({
        nombre: '',
        tipo: '',
        precio_mensual: '',
        activa: false,
    });

    useEffect(() => {
        const cargarServicio = async () => {
            try {//Llamo a Symfony pidiendo el id del servicio
                const res = await api.get(`/servicios/${id}`);
                setFormData({
                    nombre: res.data.nombre || '',
                    tipo: res.data.tipo || '',
                    precio_mensual: res.data.precio_mensual ?? '',
                    activa: res.data.activa ?? false,
                });
            } catch (err) {
                setError('No se ha podido cargar la información del servicio.');
            } finally {
                setLoading(false);
            }
        };
        cargarServicio();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;//Saco la info del input que el user ha tocado
        
        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;//en checked se guarda el valor booleano en vez del value del input que seria un string
            setFormData(prev => ({ ...prev, [name]: checked }));
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    //Actualizacion registro servicio con su id 
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        const dataToSend = {
            ...formData,
            precio_mensual: formData.precio_mensual === '' ? 0 : parseFloat(formData.precio_mensual as string)
        };

        try {
            await api.put(`/servicios/${id}`, dataToSend);//actualizo registro
            navigate('/servicios'); // Redirigimos al listado después de guardar
        } catch (err) {
            setError('Error al actualizar el servicio. Revisa los datos enviados.');
        } finally {
            setSaving(false);
        }
    };

    //Borrar servicio
    const handleDelete = async () => {
        //mensaje seguridad
        if (!window.confirm('¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.')) {
            return;
        }

        setDeleting(true);
        try {
            await api.delete(`/servicios/${id}`);//busco el servicio por la id y si existe, se borra
            navigate('/servicios');
        } catch (err) {
            setError('No se ha podido eliminar el servicio. Comprueba que no tiene contratos asociados.');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 animate-pulse">Cargando datos del servicio...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <Link to="/servicios" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-6 transition-colors">
                    ← Volver a la lista
                </Link>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Editar Servicio</h1>
                    <p className="text-gray-500 mb-8">Modifica los campos necesarios para actualizar el servicio {formData.nombre}.</p>

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
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Servicio</label>
                            <input 
                                type="text" name="tipo" required
                                value={formData.tipo} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Precio Mensual (€)</label>
                            <input 
                                type="number" step="0.01" name="precio_mensual" required
                                value={formData.precio_mensual} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            />
                        </div>

                        <div className="md:col-span-2 flex items-center gap-3 mt-2">
                            <input 
                                type="checkbox" id="activa" name="activa"
                                checked={formData.activa} onChange={handleChange}
                                className="w-5 h-5 text-blue-600 bg-gray-50 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <label htmlFor="activa" className="text-sm font-semibold text-gray-700">
                                Servicio Activo (Se mostrará como disponible)
                            </label>
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:bg-gray-400"
                            >
                                {saving ? 'Guardando cambios...' : 'Actualizar Servicio'}
                            </button>
                            <button 
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full mt-5 py-4 bg-red-500 text-white hover:bg-red-600 font-bold rounded-xl transition-all hover:-translate-y-1 disabled:opacity-50"
                            >
                                {deleting ? 'Eliminando...' : 'Eliminar Servicio'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditarServicio;
