
import React from 'react';

const legendItems = [
    { color: 'bg-yellow-400', text: 'Cierre mediodía (reabre)' },
    { color: 'bg-red-500', text: 'Cierre final del día' },
    { color: 'bg-sky-500', text: 'Horario continuo' },
    { color: 'bg-red-600', text: '¡Menos de 10 min!' },
    { color: 'bg-red-800', text: '¡AHORA MISMO!' },
];

const LegendItem: React.FC<{ color: string, text: string }> = ({ color, text }) => (
    <div className="flex items-center gap-2 text-sm">
        <div className={`w-4 h-4 rounded ${color}`}></div>
        <span>{text}</span>
    </div>
);

const Legend: React.FC = () => {
    return (
        <section className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
            <h3 className="font-bold text-gray-800 mb-2">🏷️ Leyenda de Alarmas:</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mt-2.5">
                {legendItems.map(item => <LegendItem key={item.text} {...item} />)}
            </div>
        </section>
    );
};

export default Legend;
