
import React, { useState, useEffect } from 'react';

const Header: React.FC = () => {
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timerId = setInterval(() => {
            setCurrentTime(new Date());
        }, 1000 * 60); // Update every minute
        return () => clearInterval(timerId);
    }, []);

    return (
        <header className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
            <h1 className="text-xl sm:text-2xl font-bold text-gray-800 mb-2">
                📱 Gestor de Rutas con Alarmas
            </h1>
            <div className="bg-blue-50 p-2.5 rounded-lg font-bold text-blue-600">
                🕐 {currentTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
            </div>
        </header>
    );
};

export default Header;
