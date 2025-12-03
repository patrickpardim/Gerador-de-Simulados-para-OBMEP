import { GoogleGenAI, Type } from "@google/genai";
import { Level, Simulado, Question } from '../types';

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const getLevelDescription = (level: Level): string => {
  switch (level) {
    case Level.Nivel1:
      return "para alunos do 6º e 7º ano do Ensino Fundamental.";
    case Level.Nivel2:
      return "para alunos do 8º e 9º ano do Ensino Fundamental.";
    case Level.Nivel3:
      return "para alunos do Ensino Médio.";
    default:
      return "";
  }
};

export const generateSimulado = async (level: Level, numQuestions: number): Promise<Simulado> => {
  const levelDescription = getLevelDescription(level);

  const prompt = `Você é um especialista em criar problemas de matemática para a Olimpíada Brasileira de Matemática das Escolas Públicas (OBMEP).
Sua tarefa é gerar um simulado completo com base nas seguintes especificações:
Nível: ${level} (${levelDescription})
Número de Questões: ${numQuestions}

Por favor, gere exatamente ${numQuestions} questões de múltipla escolha. É fundamental que todas as questões sejam únicas e distintas entre si, sem repetir problemas ou conceitos de forma idêntical. Cada questão deve ter 5 opções. As questões devem abordar uma variedade de tópicos apropriados para o nível especificado, incluindo aritmética, álgebra, geometria e raciocínio lógico, no estilo da OBMEP.

Para cada questão, forneça também uma "explanation" detalhada. A explicação deve descrever passo a passo como chegar à resposta correta, utilizando equações matemáticas (quando aplicável) e texto claro e didático.

O resultado deve ser um objeto JSON válido. Não inclua nenhum texto, explicação ou formatação de markdown antes ou depois do JSON.`;

  const responseSchema = {
    type: Type.OBJECT,
    properties: {
      questions: {
        type: Type.ARRAY,
        description: `Uma lista de ${numQuestions} questões.`,
        items: {
          type: Type.OBJECT,
          properties: {
            number: {
              type: Type.INTEGER,
              description: 'O número sequencial da questão.',
            },
            text: {
              type: Type.STRING,
              description: 'O enunciado completo da questão.',
            },
            options: {
              type: Type.ARRAY,
              description: 'Uma lista de 5 strings, contendo apenas o texto de cada opção, sem o rótulo da letra (por exemplo, "25" em vez de "A) 25").',
              items: { type: Type.STRING },
            },
            answer: {
              type: Type.STRING,
              description: 'A letra da alternativa correta (e.g., "A", "B", "C", "D", ou "E").',
            },
            explanation: {
              type: Type.STRING,
              description: 'Explicação detalhada da resposta correta, incluindo o raciocínio e as equações matemáticas.'
            },
          },
          required: ['number', 'text', 'options', 'answer', 'explanation'],
        },
      },
    },
    required: ['questions'],
  };

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        temperature: 0.9,
      },
    });

    const jsonText = response.text.trim();
    const parsedJson = JSON.parse(jsonText);

    // Validate structure
    if (!parsedJson.questions || !Array.isArray(parsedJson.questions)) {
      throw new Error("Formato da resposta da IA inválido: a propriedade 'questions' está ausente ou não é um array.");
    }
    
    // CORREÇÃO: Garante que o número de questões seja exatamente o solicitado,
    // truncando o array caso a IA retorne mais questões que o pedido.
    const questionsFromApi = parsedJson.questions.slice(0, numQuestions);

    const typedQuestions: Question[] = questionsFromApi.map((q: any, index: number) => {
        if (!q.text || !q.options || !q.answer || !q.explanation) {
            throw new Error(`Questão ${index + 1} incompleta recebida da IA.`);
        }
        return {
            number: index + 1, // Renumera as questões para garantir a sequência correta.
            text: q.text,
            options: q.options,
            answer: q.answer,
            explanation: q.explanation
        };
    });


    return {
      level,
      questions: typedQuestions,
    };
  } catch (error) {
    console.error("Erro ao chamar a API Gemini ou ao processar a resposta:", error);
    throw new Error("Não foi possível gerar o simulado. Por favor, tente novamente.");
  }
};