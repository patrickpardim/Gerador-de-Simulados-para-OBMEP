
import React, { useState, useCallback } from 'react';
import { Level, Simulado } from './types';
import { generateSimulado as generateSimuladoService } from './services/geminiService';
import ControlPanel from './components/ControlPanel';
import LoadingIndicator from './components/LoadingIndicator';
import SimuladoView from './components/SimuladoView';
import { MathIcon } from './components/icons';

const App: React.FC = () => {
  const [level, setLevel] = useState<Level>(Level.Nivel1);
  const [numQuestions, setNumQuestions] = useState<number>(20);
  const [simulado, setSimulado] = useState<Simulado | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerateSimulado = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    setSimulado(null);
    try {
      const generatedSimulado = await generateSimuladoService(level, numQuestions);
      setSimulado(generatedSimulado);
    } catch (err) {
      console.error(err);
      setError('Falha ao gerar o simulado. A API pode estar indisponível. Por favor, tente novamente mais tarde.');
    } finally {
      setIsLoading(false);
    }
  }, [level, numQuestions]);

  const handleReset = () => {
    setSimulado(null);
    setError(null);
  };

  const renderContent = () => {
    if (isLoading) {
      return <LoadingIndicator />;
    }
    if (error) {
      return (
        <div className="text-center p-8 bg-red-100 border border-red-400 text-red-700 rounded-lg shadow-md">
          <p className="font-semibold text-lg mb-4">Ocorreu um Erro</p>
          <p>{error}</p>
          <button
            onClick={handleReset}
            className="mt-6 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition duration-300"
          >
            Tentar Novamente
          </button>
        </div>
      );
    }
    if (simulado) {
      return <SimuladoView simulado={simulado} onReset={handleReset} />;
    }
    return (
      <ControlPanel
        level={level}
        setLevel={setLevel}
        numQuestions={numQuestions}
        setNumQuestions={setNumQuestions}
        onGenerate={handleGenerateSimulado}
      />
    );
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 selection:bg-blue-200 print:bg-white print:block print:p-0" style={{
      backgroundImage: `
        radial-gradient(circle at 1px 1px, #d1d5db 1px, transparent 0)
      `,
      backgroundSize: '20px 20px'
    }}>
      <div className="w-full max-w-5xl mx-auto print:max-w-none print:w-full">
        <header className="text-center mb-8 print:hidden">
          <div className="flex items-center justify-center gap-4">
            <MathIcon className="h-12 w-12 text-blue-600" />
            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight">
              Gerador de Simulados OBMEP
            </h1>
          </div>
          <p className="mt-4 text-lg text-slate-600">
            Crie provas personalizadas com questões geradas por IA para a Olimpíada de Matemática.
          </p>
        </header>
        <main className="bg-white rounded-2xl shadow-2xl shadow-slate-300/40 p-6 md:p-10 ring-1 ring-slate-200 print:shadow-none print:ring-0 print:p-0 print:rounded-none">
          {renderContent()}
        </main>
        <footer className="text-center mt-8 text-sm text-slate-500 print:hidden">
          <p>&copy; 2025 Gerador de Simulados OBMEP. Potencializado por IA. Desenvolvido por Patrick Pardim.</p>
        </footer>
      </div>
    </div>
  );
};

export default App;