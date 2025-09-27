
import React, { useState } from 'react';
import type { AppConfig } from '../types';
import ToggleSwitch from './common/ToggleSwitch';

interface ConfigSectionProps {
    config: AppConfig;
    onConfigChange: (newConfig: AppConfig) => void;
    onTestSound: () => void;
}

const ConfigRow: React.FC<{ label: string, children: React.ReactNode }> = ({ label, children }) => (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <span className="font-bold text-gray-700 flex-1">{label}</span>
        <div className="flex-shrink-0">{children}</div>
    </div>
);

const ConfigSection: React.FC<ConfigSectionProps> = ({ config, onConfigChange, onTestSound }) => {
    const [isCollapsed, setIsCollapsed] = useState(true);

    const handleChange = (key: keyof AppConfig, value: any) => {
        onConfigChange({ ...config, [key]: value });
    };

    return (
        <section className="bg-white rounded-2xl p-5 mt-8 shadow-lg">
            <h2 className="text-lg font-bold text-gray-800 mb-2 flex items-center justify-between">
                <span>⚙️ Configuración de Alarmas</span>
                 <button
                    className="bg-gray-100 border border-gray-300 rounded-md py-1 px-2.5 text-sm cursor-pointer transition hover:bg-gray-200 min-h-[32px]"
                    onClick={() => setIsCollapsed(!isCollapsed)}
                >
                    {isCollapsed ? '➕ Mostrar' : '➖ Ocultar'}
                </button>
            </h2>
            <div className={`transition-all duration-300 ease-in-out overflow-hidden ${isCollapsed ? 'max-h-0' : 'pt-0' } pt-4`}>
                <ConfigRow label="🔊 Sonido activo">
                    <ToggleSwitch id="soundEnabled" checked={config.soundEnabled} onChange={(e) => handleChange('soundEnabled', e.target.checked)} />
                </ConfigRow>
                <ConfigRow label="📳 Vibración activa">
                    <ToggleSwitch id="vibrationEnabled" checked={config.vibrationEnabled} onChange={(e) => handleChange('vibrationEnabled', e.target.checked)} />
                </ConfigRow>
                <ConfigRow label="🔊 Volumen">
                    <div className="flex items-center gap-2">
                        <input type="range" className="w-24 accent-blue-500" min="0" max="1" step="0.1" value={config.volume} onChange={(e) => handleChange('volume', parseFloat(e.target.value))} />
                        <button className="bg-blue-500 text-white rounded-md py-1 px-2.5 hover:bg-blue-600" onClick={onTestSound}>🔊</button>
                    </div>
                </ConfigRow>
                <ConfigRow label="⏰ Minutos antes (mediodía)">
                    <div className="flex items-center">
                        <input type="number" className="w-16 p-1 border border-gray-300 rounded-md text-center" min="1" max="60" value={config.middayMinutes} onChange={(e) => handleChange('middayMinutes', parseInt(e.target.value))} />
                        <span className="ml-2">min</span>
                    </div>
                </ConfigRow>
                <ConfigRow label="⚠️ Minutos antes (cierre final)">
                    <div className="flex items-center">
                        <input type="number" className="w-16 p-1 border border-gray-300 rounded-md text-center" min="1" max="60" value={config.finalMinutes} onChange={(e) => handleChange('finalMinutes', parseInt(e.target.value))} />
                        <span className="ml-2">min</span>
                    </div>
                </ConfigRow>
                <ConfigRow label="🟡 Alarma para mediodía">
                    <ToggleSwitch id="middayAlarmEnabled" checked={config.middayAlarmEnabled} onChange={(e) => handleChange('middayAlarmEnabled', e.target.checked)} />
                </ConfigRow>
                <ConfigRow label="🔴 Alarma para cierre final">
                    <ToggleSwitch id="finalAlarmEnabled" checked={config.finalAlarmEnabled} onChange={(e) => handleChange('finalAlarmEnabled', e.target.checked)} />
                </ConfigRow>
            </div>
        </section>
    );
};

export default ConfigSection;
