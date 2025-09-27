
import React, { useState } from 'react';
import type { Business, Alarm } from '../types';
import BusinessCard from './BusinessCard';
import AlarmCard from './AlarmCard';

interface ResultsSectionProps {
    businesses: Business[];
    alarms: Alarm[];
    onToggleAlarm: (id: string) => void;
    onDeleteAlarm: (id: string) => void;
}

const CollapsibleSection: React.FC<{ title: string; count: number; children: React.ReactNode }> = ({ title, count, children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    return (
        <div className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center justify-between">
                <span>{title} ({count})</span>
                <button
                    className="bg-gray-100 border border-gray-300 rounded-md py-1 px-2.5 text-sm cursor-pointer transition hover:bg-gray-200 min-h-[32px]"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? '➕ Mostrar' : '➖ Ocultar'}
                </button>
            </h2>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0' : 'max-h-[400px]'}`}>
                <div className="max-h-[350px] overflow-y-auto border border-gray-200 rounded-xl p-2.5">
                    {children}
                </div>
            </div>
        </div>
    );
};


const ResultsSection: React.FC<ResultsSectionProps> = ({ businesses, alarms, onToggleAlarm, onDeleteAlarm }) => {
    return (
        <div id="resultsContainer">
            <CollapsibleSection title="📍 Direcciones Detectadas" count={businesses.length}>
                {businesses.length > 0 ? (
                    businesses.map(business => <BusinessCard key={business.id} business={business} />)
                ) : (
                    <div className="text-center text-gray-500 p-5">No hay direcciones detectadas</div>
                )}
            </CollapsibleSection>

             <div className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
                <h2 className="text-lg font-bold text-gray-800 mb-4">⏰ Alarmas Programadas ({alarms.length})</h2>
                <div className="max-h-[400px] overflow-y-auto border border-gray-200 rounded-xl p-2.5">
                    {alarms.length > 0 ? (
                        alarms.map(alarm => (
                            <AlarmCard
                                key={alarm.id}
                                alarm={alarm}
                                onToggle={onToggleAlarm}
                                onDelete={onDeleteAlarm}
                            />
                        ))
                    ) : (
                        <div className="text-center text-gray-500 p-5">No hay alarmas programadas</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ResultsSection;
