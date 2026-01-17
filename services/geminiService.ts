
import { GoogleGenAI, Type } from "@google/genai";
import { QuestionType, Question } from "../types";

export const generateQuizQuestions = async (
  content: string,
  questionCount: number,
  types: QuestionType[]
): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const typeDescriptions = types.map(t => {
    if (t === QuestionType.TRUE_FALSE) return "Σωστό/Λάθος (ΥΠΟΧΡΕΩΤΙΚΑ η απάντηση πρέπει να είναι 'Σωστό' ή 'Λάθος')";
    if (t === QuestionType.MULTIPLE_CHOICE) return "Πολλαπλής Επιλογής (πολλές σωστές)";
    if (t === QuestionType.SINGLE_CHOICE) return "Μοναδικής Επιλογής (μία σωστή)";
    if (t === QuestionType.FILL_BLANKS) return "Συμπλήρωση Κενών (ο χρήστης επιλέγει τη σωστή λέξη)";
    return t;
  }).join(", ");

  const prompt = `
    Βασισμένο στο παρακάτω εκπαιδευτικό περιεχόμενο, δημιούργησε ένα κουίζ με ${questionCount} ερωτήσεις.
    Οι τύποι των ερωτήσεων πρέπει να είναι: ${typeDescriptions}.
    
    Εκπαιδευτικό Περιεχόμενο:
    "${content}"
    
    Σημαντικοί Κανόνες:
    1. Για τον τύπο TRUE_FALSE, το πεδίο correctAnswer ΠΡΕΠΕΙ να είναι είτε "Σωστό" είτε "Λάθος" (στα ελληνικά). Μην χρησιμοποιήσεις "True", "False" ή "Yes", "No".
    2. Επίστρεψε τις ερωτήσεις σε μορφή JSON. 
    3. Για τον τύπο FILL_BLANKS, χρησιμοποίησε το σύμβολο [____] στο κείμενο της ερώτησης εκεί που πρέπει να γίνει η συμπλήρωση.
    4. Η απάντηση για το FILL_BLANKS πρέπει να είναι μία από τις επιλογές (options).
  `;

  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: prompt,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            id: { type: Type.STRING },
            type: { 
              type: Type.STRING, 
              enum: Object.values(QuestionType) 
            },
            text: { type: Type.STRING },
            options: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING } 
            },
            correctAnswer: { 
              type: Type.STRING,
              description: "Η σωστή απάντηση. Για TRUE_FALSE πρέπει να είναι 'Σωστό' ή 'Λάθος'."
            },
            explanation: { type: Type.STRING }
          },
          required: ["id", "type", "text", "correctAnswer"]
        }
      }
    }
  });

  try {
    const text = response.text;
    return JSON.parse(text);
  } catch (error) {
    console.error("Failed to parse Gemini response:", error);
    throw new Error("Σφάλμα κατά τη δημιουργία των ερωτήσεων.");
  }
};
