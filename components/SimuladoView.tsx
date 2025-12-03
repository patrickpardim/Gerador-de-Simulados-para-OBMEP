import React, { useState } from 'react';
import { Simulado } from '../types';
import { AnswerKeyIcon, DownloadIcon, ResetIcon } from './icons';

// Declara a biblioteca jsPDF carregada via CDN para o TypeScript
declare const jspdf: any;

// Fix: Define the missing SimuladoViewProps interface.
interface SimuladoViewProps {
  simulado: Simulado;
  onReset: () => void;
}

const SimuladoView: React.FC<SimuladoViewProps> = ({ simulado, onReset }) => {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPdf = async (withAnswers: boolean) => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      const { jsPDF } = jspdf;
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4',
      });

      // Configurações inspiradas na ABNT
      const margins = { top: 25, left: 25, right: 25, bottom: 25 };
      const pageWidth = pdf.internal.pageSize.getWidth();
      const usableWidth = pageWidth - margins.left - margins.right;
      const fontSize = 12;
      const lineHeightMultiplier = 1.5;
      const lineHeight = (fontSize * 0.352778) * lineHeightMultiplier; // Converte ponto para mm e aplica multiplicador

      pdf.setFont('Helvetica', 'normal');
      pdf.setFontSize(fontSize);

      let y = margins.top;

      // Função auxiliar para adicionar texto com quebra de página inteligente
      const addText = (text: string, x: number, align: 'left' | 'center' | 'justify', isBold = false, isTitle = false) => {
        if (isBold || isTitle) pdf.setFont('Helvetica', 'bold');
        if (isTitle) pdf.setFontSize(14);

        const lines = pdf.splitTextToSize(text, usableWidth);
        const textHeight = lines.length * lineHeight;

        if (y + textHeight > pdf.internal.pageSize.getHeight() - margins.bottom) {
          pdf.addPage();
          y = margins.top;
        }
        
        // CORREÇÃO: O alinhamento estava fixo, o que causava o problema de
        // espaçamento. Agora, a função usa o parâmetro 'align' que é passado.
        pdf.text(lines, x, y, { align: align });
        y += textHeight;

        // Resetar para o padrão
        if (isBold || isTitle) pdf.setFont('Helvetica', 'normal');
        if (isTitle) pdf.setFontSize(fontSize);
      };
      
      const addCenteredText = (text: string, isTitle = false) => {
        if (isTitle) {
          pdf.setFontSize(16); // Destaque para o título
          pdf.setFont('Helvetica', 'bold');
        }

        const lines = pdf.splitTextToSize(text, usableWidth);
        const textHeight = lines.length * lineHeight;

        if (y + textHeight > pdf.internal.pageSize.getHeight() - margins.bottom) {
          pdf.addPage();
          y = margins.top;
        }

        pdf.text(lines, pageWidth / 2, y, { align: 'center' });
        y += textHeight;

        if(isTitle) {
          pdf.setFontSize(fontSize); // Reset
          pdf.setFont('Helvetica', 'normal');
        }
      }


      // --- Início da Geração do Conteúdo ---

      // Título do Simulado
      addCenteredText(`Simulado OBMEP - ${simulado.level}`, true);
      y += lineHeight * 2;

      // Renderiza as Questões e Gabarito (se solicitado)
      for (const q of simulado.questions) {
        y += lineHeight; // Espaço antes de cada questão

        // Estimativa de altura para evitar quebras de página ruins
        let questionBlockHeight = (q.text.length / 50 + q.options.length * 2) * lineHeight;
        if (withAnswers) {
          questionBlockHeight += (q.explanation.length / 50 + 4) * lineHeight;
        }
        
        if (y + questionBlockHeight > pdf.internal.pageSize.getHeight() - margins.bottom) {
          pdf.addPage();
          y = margins.top;
        }

        const combinedQuestionText = `Questão ${String(q.number).padStart(2, '0')}: ${q.text}`;
        addText(combinedQuestionText, margins.left, 'left');
        y += lineHeight * 0.5;

        // Renderiza as Opções
        for (let i = 0; i < q.options.length; i++) {
          const optionText = `${String.fromCharCode(65 + i)}) ${q.options[i]}`;
          addText(optionText, margins.left + 5, 'left');
        }
        
        // Se withAnswers for true, adiciona o gabarito logo abaixo da questão
        if (withAnswers) {
          y += lineHeight * 1.5; // Espaçamento maior para o gabarito

          addText(`Resposta Correta: ${q.answer}`, margins.left, 'left', true);

          addText('Explicação:', margins.left, 'left', true);
          addText(q.explanation, margins.left, 'left');
        }
      }

      // --- Fim da Geração ---

      const fileName = `Simulado OBMEP - ${simulado.level.split('(')[0].trim()}${withAnswers ? ' com Gabarito' : ''}.pdf`;
      pdf.save(fileName);

    } catch (error) {
      console.error("Erro ao gerar o PDF:", error);
      alert("Ocorreu um erro ao gerar o PDF. Por favor, tente novamente.");
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div id="simulado-content">
      <div className="mb-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-slate-800">{simulado.level}</h2>
          <p className="text-slate-500">{simulado.questions.length} questões</p>
        </div>
        <div id="simulado-action-buttons" className="mt-6 flex flex-wrap items-center justify-center gap-3">
          <button
            onClick={() => handleDownloadPdf(false)}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-blue-700 transition disabled:bg-blue-400 disabled:cursor-wait"
            title="Baixar PDF sem gabarito"
          >
            <DownloadIcon className="h-5 w-5" />
            {isDownloading ? 'Gerando...' : 'PDF sem Gabarito'}
          </button>
          <button
            onClick={() => handleDownloadPdf(true)}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-green-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-green-700 transition disabled:bg-green-400 disabled:cursor-wait"
            title="Baixar PDF com gabarito"
          >
            <DownloadIcon className="h-5 w-5" />
            {isDownloading ? 'Gerando...' : 'PDF com Gabarito'}
          </button>

          <button
            onClick={onReset}
            disabled={isDownloading}
            className="flex items-center gap-2 bg-slate-600 text-white font-bold py-2 px-4 rounded-lg hover:bg-slate-700 transition disabled:bg-slate-400 disabled:cursor-wait"
            title="Gerar Novo Simulado"
          >
            <ResetIcon className="h-5 w-5" />
            Gerar Novo Simulado
          </button>
        </div>
      </div>

      <div className="prose prose-slate max-w-none space-y-8 print:prose-sm">
        {simulado.questions.map((q) => (
          <div key={q.number} className="p-6 rounded-xl border border-slate-200 bg-white question-block">
            <p className="text-slate-700 !mt-0">
              <strong className="font-bold text-slate-800">
                Questão {String(q.number).padStart(2, '0')}&nbsp;
              </strong>
              {q.text}
            </p>
            <ol className="list-none p-0 mt-4 space-y-2">
              {q.options.map((option, index) => (
                <li key={index}>
                  {`${String.fromCharCode(65 + index)}) ${option}`}
                </li>
              ))}
            </ol>

            <details className="mt-6 rounded-lg bg-slate-50 group print:hidden">
              <summary className="p-3 font-semibold text-slate-700 cursor-pointer list-none flex items-center justify-between transition-colors hover:bg-slate-100 rounded-lg">
                <span className="flex items-center gap-2">
                  <AnswerKeyIcon className="h-5 w-5" />
                  Ver Resposta e Explicação
                </span>
                <svg className="h-5 w-5 transition-transform duration-300 ease-in-out group-open:rotate-180" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <div className="p-4 border-t border-slate-200">
                <p className="font-semibold">Resposta Correta: <span className="font-bold text-green-600">{q.answer}</span></p>
                <div className="mt-3 pt-3 border-t border-slate-200 prose-sm max-w-none">
                  <h5 className="font-semibold text-slate-700 mb-1">Explicação:</h5>
                  <p className="text-slate-600 leading-relaxed !mt-1">{q.explanation}</p>
                </div>
              </div>
            </details>

          </div>
        ))}
      </div>
    </div>
  );
};

export default SimuladoView;