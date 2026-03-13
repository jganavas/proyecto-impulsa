import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate, useParams, Link } from "react-router-dom";
import api from '../axios';

interface Servicio {
    id: number;
    nombre: string;
    precio_mensual: number;
}

interface ContratoFormData {
    servicio_id: string | number;
    estado: string;
}

const EditarContrato = () => {
    const { id } = useParams();//cojo le id de la URL
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');
    const [servicios, setServicios] = useState<Servicio[]>([]);
    
    const [clienteNombre, setClienteNombre] = useState('');
    const [fechaAlta, setFechaAlta] = useState('');

    const [formData, setFormData] = useState<ContratoFormData>({
        servicio_id: '',
        estado: 'Activo',
    });

    useEffect(() => {
        const cargarDatos = async () => {
            try {
                //hago las dos peticiones a la vez 
                const [contratoRes, serviciosRes] = await Promise.all([
                    api.get(`/contratos/${id}`),
                    api.get('/servicios')
                ]);

                setServicios(serviciosRes.data);
                
                const data = contratoRes.data;
                setClienteNombre(data.nombreCliente || 'Cliente Desconocido');
                
                if (data.fecha_alta) {
                    const dateObj = new Date(data.fecha_alta);
                    setFechaAlta(dateObj.toLocaleDateString());
                }
                //relleno el formulario con los datos actuales del contrato
                setFormData({
                    servicio_id: data.servicioId || data.servicio?.id || '',
                    estado: data.estado || 'Activo',
                });
                
            } catch (err) {
                setError('No se ha podido cargar la información del contrato.');
            } finally {
                setLoading(false);
            }
        };

        cargarDatos();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    //Envio los cambios al servidor
    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        if (!formData.servicio_id) {
            setError('Debes seleccionar un servicio.');
            setSaving(false);
            return;
        }

        try {
            await api.put(`/contratos/${id}`, {
                servicio_id: parseInt(formData.servicio_id as string),
                estado: formData.estado
            });
            navigate('/clientes');
        } catch (err) {
            setError('Error al actualizar el contrato. Revisa los datos enviados.');
        } finally {
            setSaving(false);
        }
    };

    //Borrar contrato
    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este contrato? Esta acción no se puede deshacer y el cliente dejará de tener este servicio.')) {
            return;
        }

        setDeleting(true);
        try {
            await api.delete(`/contratos/${id}`);
            navigate('/clientes');
        } catch (err) {
            setError('No se ha podido eliminar el contrato.');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 animate-pulse">Cargando datos del contrato...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                <Link to="/clientes" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-6 transition-colors">
                    ← Volver a clientes
                </Link>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Editar Contrato</h1>
                    <p className="text-gray-500 mb-8">
                        Modifica los detalles del contrato para el cliente <span className="font-semibold">{clienteNombre}</span>.
                    </p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
                        
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Servicio Asociado</label>
                            <select 
                                name="servicio_id" required
                                value={formData.servicio_id} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="" disabled>Selecciona un servicio...</option>
                                {servicios.map((srv) => (
                                    <option key={srv.id} value={srv.id}>
                                        {srv.nombre} ({srv.precio_mensual}€)
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Estado del Contrato</label>
                            <select 
                                name="estado" required
                                value={formData.estado} onChange={handleChange}
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                            >
                                <option value="Activo">Activo</option>
                                <option value="Pausado">Pausado</option>
                                <option value="Cancelado">Cancelado</option>
                            </select>
                        </div>
                        
                        {fechaAlta && (
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Fecha de Alta</label>
                                <input 
                                    type="text" 
                                    value={fechaAlta}
                                    disabled
                                    className="w-full px-4 py-3 bg-gray-100 text-gray-500 border border-gray-200 rounded-xl outline-none cursor-not-allowed"
                                />
                                <p className="text-xs text-gray-400 mt-1">La fecha de alta no se puede modificar.</p>
                            </div>
                        )}

                        <div className="mt-4">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:bg-gray-400"
                            >
                                {saving ? 'Guardando cambios...' : 'Actualizar Contrato'}
                            </button>
                            <button 
                                type="button"
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full mt-5 py-4 bg-red-500 text-white hover:bg-red-600 font-bold rounded-xl transition-all hover:-translate-y-1 disabled:opacity-50"
                            >
                                {deleting ? 'Eliminando...' : 'Eliminar Contrato'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditarContrato;
