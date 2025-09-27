
import React, { useState, useRef } from 'react';

interface UploadSectionProps {
  onFileSelect: (file: File) => void;
  onAnalyze: () => void;
  isLoading: boolean;
  loadingMessage: string;
  extractedText: string;
}

const UploadSection: React.FC<UploadSectionProps> = ({ onFileSelect, onAnalyze, isLoading, loadingMessage, extractedText }) => {
    const [imagePreview, setImagePreview] = useState<string | null>(null);
    const [isOcrVisible, setIsOcrVisible] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            onFileSelect(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setImagePreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <section className="bg-white rounded-2xl p-5 mb-4 shadow-lg">
            <label className="block font-bold mb-2.5 text-gray-700">
                📸 Sube tu imagen de ruta:
            </label>
            <input
                type="file"
                className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 p-3 border-2 border-dashed border-gray-300 rounded-xl mb-4"
                accept="image/*"
                onChange={handleFileChange}
                ref={fileInputRef}
            />
            <button
                className="w-full bg-green-500 text-white border-none p-3.5 rounded-xl text-base font-bold cursor-pointer mb-4 transition duration-300 min-h-[48px] hover:bg-green-600 disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center justify-center"
                onClick={onAnalyze}
                disabled={!imagePreview || isLoading}
            >
                {isLoading ? (
                    <>
                        <div className="inline-block w-4 h-4 border-2 border-transparent border-t-white rounded-full animate-spin mr-2"></div>
                        {loadingMessage}
                    </>
                ) : '📊 Analizar Imagen'}
            </button>

            {imagePreview && (
                <div className="mb-4 flex justify-center">
                    <img src={imagePreview} className="max-w-full max-h-52 rounded-xl border-2 border-gray-200" alt="Vista previa" />
                </div>
            )}

            {extractedText && (
                 <button
                    className="w-full text-sm bg-gray-100 border border-gray-300 rounded-lg py-2 px-3 mb-2.5 hover:bg-gray-200"
                    onClick={() => setIsOcrVisible(!isOcrVisible)}
                 >
                     {isOcrVisible ? '🙈 Ocultar texto extraído' : '👁️ Ver texto extraído'}
                 </button>
            )}
            
            {isOcrVisible && extractedText && (
                <div className="bg-gray-50 border border-gray-200 rounded-lg p-2.5 font-mono text-xs max-h-52 overflow-y-auto">
                    <pre className="whitespace-pre-wrap">{extractedText}</pre>
                </div>
            )}
        </section>
    );
};

export default UploadSection;
