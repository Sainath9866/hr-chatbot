export interface FAQCategory {
  id: string
  name: string
  icon: string
  questions: string[]
}

export const faqCategories: FAQCategory[] = [
  {
    id: 'salary',
    name: 'Salary & Payroll',
    icon: '💰',
    questions: [
      'What is the salary day?',
      'When is the salary processed?',
      'Do we get salary during probation?',
      'How can I get my payslip?',
      'Who should I contact for salary issues?',
      'How do I request a salary certificate?',
    ],
  },
  {
    id: 'leaves',
    name: 'Leaves & Time Off',
    icon: '🌴',
    questions: [
      'What is the leave limit per year?',
      'How many sick leaves can I take?',
      'Can I encash unused leaves?',
      'How to apply for leave?',
      'What is the policy for maternity leave?',
      'What is the policy for paternity leave?',
    ],
  },
  {
    id: 'working-hours',
    name: 'Working Hours',
    icon: '⏰',
    questions: [
      'What are office working hours?',
      'Do we have work from home option?',
      'What is the policy for late coming?',
      'What is the lunch break duration?',
      'Is biometric attendance mandatory?',
      'Can employees work on weekends?',
    ],
  },
  {
    id: 'appraisal',
    name: 'Appraisal & Promotion',
    icon: '📈',
    questions: [
      'When is the annual appraisal cycle?',
      'How are promotions decided?',
      'When are performance bonuses paid?',
    ],
  },
  {
    id: 'benefits',
    name: 'Benefits & Insurance',
    icon: '🎁',
    questions: [
      'What benefits does the company provide?',
      'How to claim health insurance?',
      'Is there a transportation facility?',
      'Are there team outings or events?',
    ],
  },
  {
    id: 'policies',
    name: 'Company Policies',
    icon: '📋',
    questions: [
      'What is the company dress code?',
      'What is the dress code on Fridays?',
      'What is the company\'s overtime policy?',
      'How many national holidays do we get?',
      'What is the probation period?',
      'What is the notice period?',
    ],
  },
  {
    id: 'hr-portal',
    name: 'HR Portal & Support',
    icon: '⚙️',
    questions: [
      'How to reset my HR portal password?',
      'How can I update my personal details?',
      'What should I do if I lose my ID card?',
      'Who should I contact for IT issues?',
    ],
  },
  {
    id: 'career',
    name: 'Career & Exit',
    icon: '🚀',
    questions: [
      'Can interns get full-time offers?',
      'Can I transfer to another branch?',
      'How can I get my experience letter?',
      'How long does full and final settlement take?',
      'What is the retirement age?',
    ],
  },
]

