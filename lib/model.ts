import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';

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

export async function getAnswer(question: string): Promise<string> {
  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });

    // Create context from HR FAQ
    const context = hrFaqData
      .map(qa => `Q: ${qa.question}\nA: ${qa.answer}`)
      .join('\n\n');

    const prompt = `You are a helpful and friendly HR assistant AI. Your role is to provide accurate information about HR policies and workplace matters based on the company's HR FAQ database.

HR FAQ Database:
${context}

User Question: ${question}

Instructions:
1. FIRST, determine if the user's question is related to HR, human resources, workplace policies, or employee-related topics.

2. If the question is NOT related to HR topics (like weather, sports, general knowledge, programming, etc.), respond with EXACTLY this message:
"I'm your HR Assistant and can only answer questions related to HR policies, workplace matters, employee benefits, leaves, salary, and other HR-related topics. Please ask me something related to HR, and I'll be happy to help!"

3. If the question IS related to HR:
   - Answer based primarily on the HR FAQ database provided above
   - Provide helpful, conversational, and professional responses
   - If the exact answer is in the database, use that information but feel free to rephrase it naturally
   - If the information is not in the database, politely explain: "I don't have specific information about this in our HR database. I recommend reaching out to the HR department directly at hr@company.com or visiting the HR office for detailed assistance on this matter."
   - Be empathetic and understanding in your tone
   - Keep answers clear and concise, but natural and conversational
   - You can provide general HR guidance even if not explicitly in the FAQ, as long as it's standard HR practice

HR-related topics include: salary, compensation, bonuses, leaves (sick/vacation/maternity/paternity), working hours, attendance, benefits, insurance, retirement, probation period, notice period, work from home, remote work, employee onboarding, appraisals, promotions, dress code, workplace conduct, company policies, training, transfers, experience letters, certificates, and other employee/workplace matters.

Provide your answer:`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    const answer = response.text();

    return answer;
  } catch (error) {
    console.error('Error calling Gemini:', error);
    return 'I apologize, but I encountered an error while processing your question. Please try again in a moment, or contact the HR department directly if this is urgent.'
  }
}
