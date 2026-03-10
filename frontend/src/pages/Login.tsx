import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../axios';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    //Hook de React Router
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); 
    setError(''); 

    try {
        const response = await api.post('/login', { 
            username: email, 
            password: password 
        });

        const token = response.data.token;

        if (token) {

            localStorage.setItem('token', token);

            navigate('/clientes', { replace: true });
        } else {
            setError('Error de protocolo: El servidor no ha enviado la clave de acceso.');
        }

        } catch (err: any) {
            
            if (err.response) {
                // El servidor respondió con un código de error (4xx, 5xx)
                if (err.response.status === 401) {
                    setError('Email o contraseña incorrectos. Inténtalo de nuevo.');
                } else {
                    setError(`Error del servidor: ${err.response.status}`);
                }
            } else if (err.request) {
                // La petición se hizo pero no hubo respuesta (servidor caído)
                setError('No se ha podido conectar con el servidor. Verifica que Symfony esté arrancado.');
            } else {
                // Error al configurar la petición
                setError('Ocurrió un error inesperado al intentar iniciar sesión.');
            }
        }
    };

    return (
    // Envolvemos todo en un contenedor que ocupa toda la pantalla para centrar la tarjeta
    <div className="min-h-screen flex items-center justify-center p-4 font-sans">
      
      <div className="max-w-md w-full p-8 bg-white rounded-2xl shadow-xl border border-gray-100">
        
        {/* NUEVO: Título de bienvenida */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-extrabold text-blue-600 mb-2 tracking-tight">
            Impulsa
          </h1>
          <h2 className="text-gray-500 text-lg">
            ¡Bienvenido de nuevo!
          </h2>
        </div>
        
        {/* Mensaje de error */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          <div>
            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-1">
              Email
            </label>
            <input 
              type="email" 
              id="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required 
              placeholder="pepe@email.com"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-1">
              Contraseña
            </label>
            <input 
              type="password" 
              id="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required 
              placeholder="••••••••"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
            />
          </div>

          <button 
            type="submit" 
            className="w-full mt-2 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg shadow-md transition-all duration-200 ease-in-out transform hover:-translate-y-1 hover:shadow-lg"
          >
            Iniciar Sesión
          </button>
        </form>
      </div>
    </div>
  );

};

export default Login;