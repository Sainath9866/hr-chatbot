# Predefined Questions Feature Guide

## Overview
The chatbot now includes predefined question categories based on the HR FAQ database (`hr_faq.csv`). This feature helps users quickly find answers to common HR questions without typing.

## Features

### 1. **8 Question Categories**
All questions from `hr_faq.csv` have been organized into these categories:

1. **💰 Salary & Payroll** (6 questions)
   - Salary dates, payslip access, salary queries

2. **🌴 Leaves & Time Off** (6 questions)
   - Leave limits, sick leaves, maternity/paternity leave

3. **⏰ Working Hours** (6 questions)
   - Office hours, WFH policy, attendance, breaks

4. **📈 Appraisal & Promotion** (3 questions)
   - Appraisal cycle, promotions, bonuses

5. **🎁 Benefits & Insurance** (4 questions)
   - Company benefits, health insurance, transportation

6. **📋 Company Policies** (6 questions)
   - Dress code, overtime, holidays, probation, notice period

7. **⚙️ HR Portal & Support** (4 questions)
   - Portal password, profile updates, ID card, IT support

8. **🚀 Career & Exit** (5 questions)
   - Internships, transfers, experience letters, retirement

### 2. **How It Works**

#### Step 1: Category Selection
When starting a new chat, users see:
- Welcome message: "How can I help you today? 👋"
- Subtitle: "Kindly choose one of the options 👇"
- Grid of 8 category buttons with icons

#### Step 2: Question Selection
After clicking a category:
- Shows all questions in that category
- "Back to categories" button to return
- Questions displayed as clickable buttons

#### Step 3: Get Answer
When a question is clicked:
- Question is automatically submitted
- AI processes it using Gemini model
- Answer appears in chat
- Chat history is saved

### 3. **Works in Both Modes**

**Full Screen Mode:**
- Categories displayed in 4-column grid (responsive)
- Large, easy-to-click buttons
- Better visibility on desktop

**Floating Mode:**
- Categories displayed in 2-column grid
- Compact design fits in widget
- Scrollable if needed
- Same functionality as full mode

### 4. **User Flow**

```
Empty Chat State
    ↓
[8 Category Buttons]
    ↓
Click "Salary & Payroll 💰"
    ↓
[6 Salary-related Questions]
    ↓
Click "What is the salary day?"
    ↓
AI responds with answer from FAQ
    ↓
Chat continues normally
```

### 5. **Key Interactions**

- **New Chat**: Resets to category view
- **Back Button**: Returns from questions to categories
- **Direct Typing**: Users can still type questions manually
- **Category Button**: Click to see questions in that category
- **Question Button**: Click to submit and get answer

### 6. **Design Features**

**Category Buttons:**
- White background with green hover effect
- Large emoji icons that scale on hover
- Border changes from gray to green on hover
- Shadow effect for depth

**Question Buttons:**
- Green-bordered buttons
- Full question text displayed
- Hover effect with background color change
- Left-aligned text for readability

**Responsive Design:**
- Full mode: 2-4 columns (responsive)
- Floating mode: 2 columns fixed
- Adapts to screen size

### 7. **Technical Implementation**

**Data Structure:**
```typescript
// lib/faq-categories.ts
export const faqCategories: FAQCategory[] = [
  {
    id: 'salary',
    name: 'Salary & Payroll',
    icon: '💰',
    questions: ['...']
  },
  // ... more categories
]
```

**State Management:**
- `selectedCategory`: Tracks which category is active
- `null`: Shows categories
- `FAQCategory`: Shows questions for that category

**Question Submission:**
- Uses same AI validation and response system
- Automatically triggers submission when question clicked
- No need for user to press send button

## Benefits

1. **Faster Access**: Users get answers in 2 clicks (category → question)
2. **Discovery**: Users can browse available topics
3. **No Typing**: Great for mobile users
4. **Organized**: Questions grouped logically
5. **Visual**: Icons make categories easy to identify
6. **Consistent**: Same experience in both display modes

## Future Enhancements

Potential improvements:
- Add search within questions
- Track most popular categories
- Dynamic category ordering by usage
- Add more questions as needed
- Category-specific icons or images

