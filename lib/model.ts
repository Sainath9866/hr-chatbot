import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

const HR_KEYWORDS = [
  'salary', 'leave', 'holiday', 'holidays', 'probation', 'notice period',
  'working hours', 'work from home', 'office hours', 'attendance', 'payslip',
  'payroll', 'dress code', 'appraisal', 'promotion', 'benefits', 'overtime',
  'HR portal', 'password', 'personal details', 'maternity', 'paternity',
  'ID card', 'lunch break', 'transportation', 'weekend', 'bonus', 'bonuses',
  'team outing', 'intern', 'interns', 'biometric', 'health insurance',
  'retirement', 'certificate', 'transfer', 'branch', 'experience letter',
  'settlement', 'IT', 'support', 'sick leave', 'sick leaves', 'encash',
  'wfh', 'remote work', 'WFH'
]

// Load HR FAQ data
let hrFaqData: Array<{ question: string; answer: string }> = [];

try {
  const csvPath = path.join(process.cwd(), 'hr_faq.csv');
  const csvContent = fs.readFileSync(csvPath, 'utf-8');
  const lines = csvContent.split('\n').slice(1); // Skip header
  
  hrFaqData = lines
    .filter(line => line.trim())
    .map(line => {
      const match = line.match(/^"([^"]+)","([^"]+)"$/);
      if (match) {
        return { question: match[1], answer: match[2] };
      }
      return null;
    })
    .filter(item => item !== null) as Array<{ question: string; answer: string }>;
} catch (error) {
  console.error('Error loading HR FAQ:', error);
}

export function isHRRelated(question: string): boolean {
  const lowerQuestion = question.toLowerCase()
  
  // Check if any HR keyword is present
  return HR_KEYWORDS.some(keyword => lowerQuestion.includes(keyword))
}

export async function getAnswer(question: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create context from HR FAQ
    const context = hrFaqData
      .map(qa => `Q: ${qa.question}\nA: ${qa.answer}`)
      .join('\n\n');

    const prompt = `You are an HR assistant. Use the following HR FAQ database to answer the user's question.
    
${context}

User Question: ${question}

Instructions:
1. Answer based ONLY on the HR FAQ database provided above
2. If the answer is in the database, provide it directly
3. If not in the database, say "I don't have information about this. Please contact the HR department for assistance."
4. Keep your answer concise and professional

Answer:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const answer = response.text();

    return answer;
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return 'Sorry, there was an error processing your question. Please try again later.'
  }
}
