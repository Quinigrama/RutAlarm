
import React, { useState, useEffect } from 'react';
import type { Alarm } from '../types';

interface AlarmCardProps {
    alarm: Alarm;
    onToggle: (id: string) => void;
    onDelete: (id: string) => void;
}

const getTimeUntil = (alarmTime: Date) => {
    const diff = alarmTime.getTime() - new Date().getTime();
    if (diff <= 0) return "¡AHORA!";
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
};

const getAlarmClasses = (alarmTime: Date, type: 'midday' | 'final') => {
    const diff = alarmTime.getTime() - new Date().getTime();
    if (diff <= 0) return "bg-red-800 border-red-900 text-white animate-pulse";
    if (diff < 10 * 60 * 1000) return "bg-red-600 border-red-700 text-white animate-pulse";
    if (type === "final") return "bg-red-100 border-red-500 text-red-900";
    return "bg-yellow-100 border-yellow-500 text-yellow-900";
};

const AlarmCard: React.FC<AlarmCardProps> = ({ alarm, onToggle, onDelete }) => {
    const [timeUntil, setTimeUntil] = useState(getTimeUntil(alarm.alarmTime));

    useEffect(() => {
        const interval = setInterval(() => {
            setTimeUntil(getTimeUntil(alarm.alarmTime));
        }, 1000 * 30); // update every 30 seconds
        return () => clearInterval(interval);
    }, [alarm.alarmTime]);

    const cardClasses = getAlarmClasses(alarm.alarmTime, alarm.type);
    const inactiveClass = !alarm.active ? 'opacity-50' : '';
    const icon = alarm.type === "final" ? "⚠️" : "⏰";

    return (
        <div className={`border-2 rounded-xl p-4 mb-2.5 transition-all duration-300 ${cardClasses} ${inactiveClass}`}>
            <h4 className="font-bold mb-1">{icon} {alarm.businessName}</h4>
            <div className="text-sm">
                <p>⏰ Alarma: {alarm.alarmTime.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</p>
                <p>🚪 Cierre: {alarm.closingTime}</p>
                <p className="font-bold text-lg my-1">⏳ {timeUntil}</p>
                {alarm.type === 'midday' && <p className="text-xs mt-1">💛 Reabre por la tarde</p>}
                {alarm.type === 'final' && <p className="text-xs mt-1">🔴 Última oportunidad</p>}
            </div>
            <div className="flex gap-2.5 mt-2.5 flex-wrap">
                <button 
                    className="flex-1 text-sm font-bold py-2 px-3 rounded-md bg-yellow-400 text-yellow-900 hover:bg-yellow-500 transition"
                    onClick={() => onToggle(alarm.id)}
                >
                    {alarm.active ? '⏸️ Pausar' : '▶️ Activar'}
                </button>
                <button 
                    className="flex-1 text-sm font-bold py-2 px-3 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
                    onClick={() => onDelete(alarm.id)}
                >
                    🗑️ Eliminar
                </button>
            </div>
        </div>
    );
};

export default AlarmCard;
