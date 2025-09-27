
import React from 'react';

interface ToggleSwitchProps {
  checked: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  id: string;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ checked, onChange, id }) => {
  return (
    <label htmlFor={id} className="relative inline-block w-12 h-6 cursor-pointer">
      <input 
        type="checkbox" 
        id={id}
        className="opacity-0 w-0 h-0"
        checked={checked} 
        onChange={onChange} 
      />
      <span className={`absolute top-0 left-0 right-0 bottom-0 bg-gray-300 rounded-full transition duration-300 ${checked ? 'bg-green-500' : 'bg-gray-300'}`}></span>
      <span className={`absolute content-[''] h-5 w-5 left-0.5 bottom-0.5 bg-white rounded-full transition duration-300 ${checked ? 'transform translate-x-6' : ''}`}></span>
    </label>
  );
};

export default ToggleSwitch;
