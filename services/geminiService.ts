
import { GoogleGenAI, Type } from "@google/genai";
import { QuestionType, Question } from "../types";

export const generateQuizQuestions = async (
  content: string,
  questionCount: number,
  types: QuestionType[]
): Promise<Question[]> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });
  
  const typeDescriptions = types.map(t => {
    if (t === QuestionType.TRUE_FALSE) return "Σωστό/Λάθος (Η απάντηση ΠΡΕΠΕΙ να είναι ['Σωστό'] ή ['Λάθος'])";
    if (t === QuestionType.MULTIPLE_CHOICE) return "Πολλαπλής Επιλογής (Μπορεί να έχει μία ή περισσότερες σωστές απαντήσεις)";
    if (t === QuestionType.SINGLE_CHOICE) return "Μοναδικής Επιλογής (Ακριβώς μία σωστή απάντηση)";
    if (t === QuestionType.FILL_BLANKS) return "Συμπλήρωση Κενών (Ο χρήστης επιλέγει τη σωστή λέξη για το κενό [____])";
    return t;
  }).join(", ");

  const prompt = `
    Βασισμένο στο παρακάτω εκπαιδευτικό περιεχόμενο, δημιούργησε ένα κουίζ με ${questionCount} ερωτήσεις.
    Οι τύποι των ερωτήσεων πρέπει να είναι: ${typeDescriptions}.
    
    Εκπαιδευτικό Περιεχόμενο:
    "${content}"
    
    Σημαντικοί Κανόνες:
    1. Το πεδίο correctAnswer ΠΡΕΠΕΙ να είναι ΠΙΝΑΚΑΣ (ARRAY) από strings, ακόμη και αν υπάρχει μόνο μία σωστή απάντηση.
    2. Για τον τύπο TRUE_FALSE, το correctAnswer πρέπει να είναι ["Σωστό"] ή ["Λάθος"].
    3. Για τον τύπο MULTIPLE_CHOICE, συμπεριέλαβε στον πίνακα όλες τις ορθές επιλογές.
    4. Επίστρεψε τις ερωτήσεις αυστηρά σε μορφή JSON. 
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
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Λίστα με τις σωστές απαντήσεις. Πάντα πίνακας."
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
    throw new Error("Σφάλμα κατά τη δημιουργία των ερωτήσεων. Δοκιμάστε ξανά.");
  }
};
