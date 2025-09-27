
import React, { useState, useEffect, useRef, useCallback } from 'react';
import type { Business, Alarm, AppConfig } from './types';
import { parseAddressesWithSchedules, generateAlarms } from './services/alarmLogic';
import Header from './components/Header';
import UploadSection from './components/UploadSection';
import ResultsSection from './components/ResultsSection';
import ConfigSection from './components/ConfigSection';
import Legend from './components/Legend';

const DEFAULT_CONFIG: AppConfig = {
    soundEnabled: true,
    vibrationEnabled: true,
    volume: 0.5,
    middayMinutes: 20,
    finalMinutes: 20,
    middayAlarmEnabled: true,
    finalAlarmEnabled: true
};

const App: React.FC = () => {
    const [businesses, setBusinesses] = useState<Business[]>([]);
    const [alarms, setAlarms] = useState<Alarm[]>([]);
    const [config, setConfig] = useState<AppConfig>(DEFAULT_CONFIG);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [loadingMessage, setLoadingMessage] = useState('');
    const [extractedText, setExtractedText] = useState('');
    
    const alarmAudioRef = useRef<HTMLAudioElement | null>(null);
    const lastTriggeredAlarms = useRef(new Set<string>());

    useEffect(() => {
        alarmAudioRef.current = document.getElementById('alarmSound') as HTMLAudioElement;
        
        try {
            const savedConfig = localStorage.getItem('alarmConfig');
            if (savedConfig) {
                setConfig(prevConfig => ({ ...prevConfig, ...JSON.parse(savedConfig) }));
            }
        } catch (error) {
            console.error("Failed to parse config from localStorage", error);
        }
        
        requestNotificationPermission();
    }, []);
    
    const handleConfigChange = useCallback((newConfig: AppConfig) => {
        const previousVibration = config.vibrationEnabled;
        setConfig(newConfig);
        localStorage.setItem('alarmConfig', JSON.stringify(newConfig));
        
        if (!previousVibration && newConfig.vibrationEnabled) {
            triggerVibration();
        }
        
        // Regenerate alarms with new settings if businesses are already loaded
        if (businesses.length > 0) {
            const newAlarms = generateAlarms(businesses, newConfig, new Date());
            setAlarms(newAlarms);
        }
    }, [config, businesses]);
    
    const playAlarmSound = useCallback(() => {
        if (config.soundEnabled && alarmAudioRef.current) {
            alarmAudioRef.current.volume = config.volume;
            alarmAudioRef.current.play().catch(e => console.error('Error playing sound:', e));
        }
    }, [config.soundEnabled, config.volume]);

    const triggerVibration = useCallback(() => {
        if (config.vibrationEnabled && 'vibrate' in navigator) {
            navigator.vibrate([200, 100, 200]);
        }
    }, [config.vibrationEnabled]);

    const requestNotificationPermission = () => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    };
    
    const showNotification = (alarm: Alarm) => {
        if ('Notification' in window && Notification.permission === 'granted') {
            const notif = new Notification('🚚 Alarma de Entrega', {
                body: `${alarm.businessName} cierra pronto!`,
                icon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y=".9em" font-size="90">🚚</text></svg>',
                tag: `delivery-alarm-${alarm.id}`
            });
            setTimeout(() => notif.close(), 10000);
        }
    };

    const checkAlarms = useCallback(() => {
        const now = new Date();
        alarms.forEach(alarm => {
            if (!alarm.active) return;
            const timeDiff = alarm.alarmTime.getTime() - now.getTime();
            const alarmKey = `${alarm.id}-${alarm.closingTime}`;

            if (timeDiff <= 60000 && timeDiff > -60000) { // Trigger within a 2-minute window
                if (!lastTriggeredAlarms.current.has(alarmKey)) {
                    const shouldTrigger = (alarm.type === 'midday' && config.middayAlarmEnabled) ||
                                          (alarm.type === 'final' && config.finalAlarmEnabled);
                    if (shouldTrigger) {
                        playAlarmSound();
                        triggerVibration();
                        showNotification(alarm);
                        lastTriggeredAlarms.current.add(alarmKey);
                    }
                }
            }
        });
    }, [alarms, config.middayAlarmEnabled, config.finalAlarmEnabled, playAlarmSound, triggerVibration]);

    useEffect(() => {
        const alarmInterval = setInterval(checkAlarms, 30000);
        return () => clearInterval(alarmInterval);
    }, [checkAlarms]);

    const handleAnalyze = async () => {
        if (!imageFile) return;

        setIsLoading(true);
        setLoadingMessage('Extrayendo texto...');
        setBusinesses([]);
        setAlarms([]);
        setExtractedText('');
        lastTriggeredAlarms.current.clear();

        const { Tesseract } = window as any;
        if (!Tesseract) {
            alert('Tesseract.js no está cargado. Por favor, revisa tu conexión a internet.');
            setIsLoading(false);
            return;
        }

        try {
            const result = await Tesseract.recognize(
                imageFile,
                'spa',
                {
                    logger: (m: { status: string, progress: number }) => {
                        if (m.status === 'recognizing text') {
                            const progress = Math.round(m.progress * 100);
                            setLoadingMessage(`Analizando... ${progress}%`);
                        }
                    }
                }
            );

            setLoadingMessage('Procesando direcciones...');
            const text = result.data.text;
            setExtractedText(text);

            setTimeout(() => { // Simulate processing time for better UX
                const detectedBusinesses = parseAddressesWithSchedules(text);
                setBusinesses(detectedBusinesses);
                
                const generatedAlarms = generateAlarms(detectedBusinesses, config, new Date());
                setAlarms(generatedAlarms);

                setIsLoading(false);
            }, 500);

        } catch (error) {
            console.error('Error en OCR:', error);
            setLoadingMessage('❌ Error en análisis');
            setTimeout(() => setIsLoading(false), 3000);
        }
    };
    
    const handleToggleAlarm = (alarmId: string) => {
        setAlarms(prevAlarms =>
            prevAlarms.map(alarm =>
                alarm.id === alarmId ? { ...alarm, active: !alarm.active } : alarm
            )
        );
    };

    const handleDeleteAlarm = (alarmId: string) => {
        setAlarms(prevAlarms => prevAlarms.filter(alarm => alarm.id !== alarmId));
    };

    const handleTestSound = () => {
        playAlarmSound();
        triggerVibration();
    };

    return (
        <div className="container mx-auto max-w-lg p-2 sm:p-4 font-sans text-gray-800">
            <Header />
            <main>
                <UploadSection 
                    onFileSelect={setImageFile}
                    onAnalyze={handleAnalyze}
                    isLoading={isLoading}
                    loadingMessage={loadingMessage}
                    extractedText={extractedText}
                />
                
                {(businesses.length > 0 || alarms.length > 0) && !isLoading && (
                    <ResultsSection 
                        businesses={businesses}
                        alarms={alarms}
                        onToggleAlarm={handleToggleAlarm}
                        onDeleteAlarm={handleDeleteAlarm}
                    />
                )}

                <Legend />

                <ConfigSection 
                    config={config}
                    onConfigChange={handleConfigChange}
                    onTestSound={handleTestSound}
                />
            </main>
        </div>
    );
};

export default App;
