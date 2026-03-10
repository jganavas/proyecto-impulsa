import { useEffect, useState, type FormEvent } from 'react';
import { useNavigate } from "react-router";
import { useParams } from 'react-router-dom';
import api from '../axios'; 
import { Link } from 'react-router-dom';

interface ClienteFormData {
  dni_cif: string;
  nombre_completo: string;
  email_contacto: string;
  telefono_contacto: string;
}

const EditarCliente = () => {

    const { id } = useParams(); //Capturo ID de la URL
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState('');

        const [formData, setFormData] = useState<ClienteFormData>({
        dni_cif: '',
        nombre_completo: '',
        email_contacto: '',
        telefono_contacto: '',
    });

    useEffect(() => {
    const cargarCliente = async () => {
      try {
        const res = await api.get(`/clientes/${id}`);
        setFormData({
          dni_cif: res.data.dni_cif,
          nombre_completo: res.data.nombre_completo,
          email_contacto: res.data.email_contacto || '',
          telefono_contacto: res.data.telefono_contacto || '',
        });
        } catch (err) {
            setError('No se ha podido cargar la información del cliente.');
        } finally {
            setLoading(false);
        }
        };
        cargarCliente();
    }, [id]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setSaving(true);
        setError('');

        // Limpiamos el teléfono de espacios antes de enviar
        const dataToSend = {
            ...formData,
            telefono_contacto: formData.telefono_contacto.replace(/\s/g, '')
        };

        try {
            await api.put(`/clientes/${id}`, dataToSend);
            navigate('/clientes'); // Volvemos a la lista tras guardar
            } catch (err) {
            setError('Error al actualizar el cliente. Revisa los datos.');
            } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de que deseas eliminar este cliente? Esta acción no se puede deshacer.')) {
            return;
        }

        setDeleting(true);
        try {
            await api.delete(`/clientes/${id}`);
            navigate('/clientes');
        } catch (err) {
            setError('No se ha podido eliminar el cliente.');
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center min-h-screen bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600 mb-4"></div>
                <p className="text-gray-500 animate-pulse">Cargando ficha del cliente...</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8 font-sans">
            <div className="max-w-2xl mx-auto">
                
                <Link to="/clientes" className="text-blue-600 hover:text-blue-800 flex items-center gap-2 mb-6 transition-colors">
                ← Volver a la lista
                </Link>

                <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Editar Cliente</h1>
                    <p className="text-gray-500 mb-8">Modifica los campos necesarios para actualizar la ficha de {formData.nombre_completo}.</p>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
                        {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        
                        <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Nombre Completo / Razón Social</label>
                        <input 
                            type="text" name="nombre_completo" required
                            value={formData.nombre_completo} onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">DNI / CIF</label>
                        <input 
                            type="text" name="dni_cif" required
                            value={formData.dni_cif} onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        </div>

                        <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Teléfono</label>
                        <input 
                            type="tel" name="telefono_contacto"
                            value={formData.telefono_contacto} onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        </div>

                        <div className="md:col-span-2">
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Email de contacto</label>
                        <input 
                            type="email" name="email_contacto"
                            value={formData.email_contacto} onChange={handleChange}
                            className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                        />
                        </div>

                        <div className="md:col-span-2 mt-4">
                            <button 
                                type="submit" 
                                disabled={saving}
                                className="w-full py-4 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg transition-all transform hover:-translate-y-1 disabled:bg-gray-400"
                            >
                                {saving ? 'Guardando cambios...' : 'Actualizar Cliente'}
                            </button>
                            <button 
                                onClick={handleDelete}
                                disabled={deleting}
                                className="w-full mt-5 py-4 bg-red-500 text-white hover:bg-red-600 font-bold rounded-xl transition-all hover:-translate-y-1 disabled:opacity-50"
                            >
                                {deleting ? 'Eliminando...' : 'Eliminar Cliente'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </div>
    );
};

export default EditarCliente;