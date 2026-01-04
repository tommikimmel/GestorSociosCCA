import { Link } from 'react-router-dom';
import logoCCA from '../assets/logoCCA.svg';

export default function NotFound() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
            <div className="max-w-md w-full text-center">
                <div className="mb-8">
                    <img 
                        src={logoCCA} 
                        alt="Club de Aeromodelismo" 
                        className="w-32 h-32 mx-auto drop-shadow-lg"
                    />
                </div>
                
                <div className="bg-white rounded-2xl shadow-2xl p-8 mb-6">
                    <h1 className="text-6xl font-bold text-indigo-600 mb-4">404</h1>
                    <h2 className="text-2xl font-semibold text-gray-800 mb-3">
                        ¡Página No Encontrada!
                    </h2>
                    <p className="text-gray-600 mb-6">
                        Parece que has volado fuera del curso. Esta página no existe en nuestro espacio aéreo.
                    </p>
                    
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Link 
                            to="/" 
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                        >
                            Volver al Inicio
                        </Link>
                        </div>
                </div>
                
                <p className="text-sm text-gray-500">
                    Club de Aeromodelismo - Sistema de Gestión de Socios
                </p>
            </div>
        </div>
    );
} 