
import React from 'react';
import type { Business } from '../types';

interface BusinessCardProps {
    business: Business;
}

const statusMap = {
    final: { text: '🔴 Cierre final', className: 'bg-red-100 text-red-800' },
    midday: { text: '🟡 Cierre con reapertura', className: 'bg-yellow-100 text-yellow-800' },
    continuous: { text: '🔵 Horario continuo', className: 'bg-sky-100 text-sky-800' },
};

const BusinessCard: React.FC<BusinessCardProps> = ({ business }) => {
    const status = statusMap[business.closingType] || statusMap.final;
    
    return (
        <div className="border-2 border-gray-200 rounded-xl p-4 mb-2.5">
            <h4 className="font-bold text-gray-800 mb-2">{business.name}</h4>
            <p className="text-gray-600 text-sm mb-2">{business.address}</p>
            <p className="text-blue-600 font-bold mb-2">📅 {business.schedule}</p>
            <span className={`inline-block px-2 py-1 rounded-full text-xs font-bold ${status.className}`}>
                {status.text}
            </span>
        </div>
    );
};

export default BusinessCard;
