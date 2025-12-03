
import React from 'react';

const LoadingIndicator: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-12 space-y-4">
      <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin"></div>
      <h2 className="text-2xl font-semibold text-slate-700">Gerando seu simulado...</h2>
      <p className="text-slate-500 max-w-md">
        Aguarde um momento. A IA está preparando questões desafiadoras e únicas para você!
      </p>
    </div>
  );
};

export default LoadingIndicator;
