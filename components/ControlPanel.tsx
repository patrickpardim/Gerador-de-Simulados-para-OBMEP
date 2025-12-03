
import React from 'react';
import { Level } from '../types';
import { GenerateIcon } from './icons';

interface ControlPanelProps {
  level: Level;
  setLevel: (level: Level) => void;
  numQuestions: number;
  setNumQuestions: (num: number) => void;
  onGenerate: () => void;
}

const ControlPanel: React.FC<ControlPanelProps> = ({
  level,
  setLevel,
  numQuestions,
  setNumQuestions,
  onGenerate,
}) => {
  return (
    <div className="space-y-8">
      <div>
        <label className="block text-lg font-semibold text-slate-700 mb-3">
          1. Selecione o Nível
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {(Object.values(Level) as Level[]).map((lvl) => (
            <button
              key={lvl}
              onClick={() => setLevel(lvl)}
              className={`p-4 rounded-lg text-left transition-all duration-200 border-2 ${
                level === lvl
                  ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                  : 'bg-slate-50 hover:bg-slate-100 hover:border-slate-300 border-slate-200'
              }`}
            >
              <span className="font-bold block text-base">
                {lvl.split('(')[0].trim()}
              </span>
              <span className={`text-sm ${level === lvl ? 'text-blue-200' : 'text-slate-500'}`}>
                ({lvl.split('(')[1]}
              </span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <label
          htmlFor="numQuestions"
          className="block text-lg font-semibold text-slate-700 mb-3"
        >
          2. Escolha o Número de Questões
        </label>
        <div className="flex items-center gap-4">
          <input
            type="range"
            id="numQuestions"
            min="20"
            max="30"
            value={numQuestions}
            onChange={(e) => setNumQuestions(Number(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
          />
          <span className="font-mono text-xl font-semibold text-blue-600 bg-blue-100 rounded-md px-3 py-1">
            {numQuestions}
          </span>
        </div>
      </div>

      <div className="border-t border-slate-200 pt-8">
        <button
          onClick={onGenerate}
          className="w-full flex items-center justify-center gap-3 bg-blue-600 text-white font-bold text-lg py-4 px-6 rounded-lg hover:bg-blue-700 active:bg-blue-800 transition-transform duration-150 transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-blue-300 shadow-lg"
        >
          <GenerateIcon className="h-6 w-6" />
          Gerar Simulado
        </button>
      </div>
    </div>
  );
};

export default ControlPanel;
