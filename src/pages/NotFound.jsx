import { Link } from 'react-router-dom';
import logoCCA from '../assets/logoCCA.svg';

export default function NotFound() {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-4 pt-24">
            {/* Logo y título */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 flex items-center gap-3">
                <img 
                    src={logoCCA} 
                    alt="Logo CCA" 
                    className="w-12 h-12 object-contain"
                />
                <div>
                    <h1 className="text-lg font-bold text-gray-800">
                        Círculo Cordobés de Aeromodelismo
                    </h1>
                    <p className="text-xs text-gray-500">
                        Gestión de Socios
                    </p>
                </div>
            </div>

            {/* Contenedor principal */}
            <div className="max-w-md w-full">
                <div className="bg-white rounded-xl shadow-lg p-10 text-center">
                    {/* Icono 404 */}
                    <div className="mb-6">
                        <h2 className="text-8xl font-bold mb-2" style={{color: '#03a9f4'}}>
                            404
                        </h2>
                        <div className="w-20 h-1 mx-auto rounded-full" style={{backgroundColor: '#03a9f4'}}></div>
                    </div>
                    
                    <h3 className="text-2xl font-bold text-gray-800 mb-3">
                        Página No Encontrada
                    </h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">
                        Parece que has volado fuera del curso. Esta página no existe en nuestro espacio aéreo.
                    </p>
                    
                    <Link 
                        to="/" 
                        className="inline-block w-full text-white font-medium py-2.5 px-6 rounded-lg transition-colors"
                        style={{backgroundColor: '#03a9f4'}}
                        onMouseEnter={(e) => e.target.style.backgroundColor = '#0288d1'}
                        onMouseLeave={(e) => e.target.style.backgroundColor = '#03a9f4'}
                    >
                        Volver al Inicio
                    </Link>
                </div>
            </div>
        </div>
    );
} 