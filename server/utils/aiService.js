const OpenAI = require('openai');
const AIUsageLog = require('../models/AIUsageLog');

// Initialize OpenAI
// In production, ensure OPENAI_API_KEY is in .env
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'mock-key', 
    dangerouslyAllowBrowser: false
});

// Mock Fallback for Development without Key
const generateMock = async ({ subject, topic, week }) => {
    await new Promise(resolve => setTimeout(resolve, 1500));
    return {
        objectives: ["Understand the concept", "Apply the concept"],
        teachingMaterial: "Textbook, Board",
        teacherActivities: ["Explain definitions", "Show examples"],
        studentActivities: ["Take notes", "Ask questions"],
        evaluation: ["What is the definition?", "Give one example"],
        assignment: "Read Chapter 5",
        conclusion: "Summary of the topic.",
        lessonNotes: `# ${topic}\n\nNotes content here...`,
        slideOutline: ["Slide 1: Intro", "Slide 2: Main Point"]
    };
};

const generateLessonPlanAI = async ({ subject, classLevel, topic, term, week, schoolId, teacherId, generateNotes, generateSlides }) => {
    
    // 1. Check if Key Exists (or use mock)
    if (!process.env.OPENAI_API_KEY) {
        console.log('No OpenAI Key found, using Mock.');
        return await generateMock({ subject, topic, week });
    }

    // 2. Construct Prompt (Strict Nigerian Curriculum Enforcement)
    const systemPrompt = `
You are an expert Nigerian secondary school teacher and curriculum planner. 
Your task is to generate a detailed Lesson Plan, Lesson Notes, and Slide Outline for a specific subject and class.
STRICTLY FOLLOW the Nigerian Educational Research and Development Council (NERDC) curriculum standards for WAEC/NECO/BECE.
Use local Nigerian examples (e.g., Lagos, Abuja, Naira, local markets, local culture) where relevant.

Output must be valid JSON in the following structure:
{
  "objectives": ["string"],
  "teachingMaterial": "string",
  "teacherActivities": ["string"],
  "studentActivities": ["string"],
  "evaluation": ["string"],
  "assignment": "string",
  "conclusion": "string",
  "lessonNotes": "markdown string",
  "slideOutline": ["string"]
}
`;

    const userPrompt = `
Generate content for:
Subject: ${subject}
Class: ${classLevel} (Nigerian Secondary School System)
Term: ${term}
Week: ${week}
Topic: ${topic}
Additional Requirements:
- ${generateNotes ? 'Include detailed Lesson Notes (Markdown).' : 'Lesson Notes not required.'}
- ${generateSlides ? 'Include a Slide Outline (Text only).' : 'Slides not required.'}
- Ensure tone is educational and appropriate for the age group.
`;

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo-1106", // Cost efficient json mode model
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt }
            ],
            response_format: { type: "json_object" },
            max_tokens: 2500, // Limit cost
            temperature: 0.7,
        });

        const output = JSON.parse(completion.choices[0].message.content);
        const tokensUsed = completion.usage.total_tokens;

        // 3. Log Usage (Fire and forget, or await if critical)
        if (schoolId && teacherId) {
            await AIUsageLog.create({
                schoolId,
                teacherId,
                action: 'generate_lesson',
                promptType: `Plan + ${generateNotes?'Notes':''} + ${generateSlides?'Slides':''}`,
                tokensUsed,
                modelUsed: completion.model
            });
        }

        return {
            subject,
            classLevel,
            topic,
            term,
            week,
            ...output
        };

    } catch (error) {
        console.error('OpenAI Error:', error);
        
        // Fallback to Mock if Quota Exceeded in Development
        if (error.code === 'insufficient_quota' && process.env.NODE_ENV === 'development') {
            console.warn('OpenAI Quota Exceeded. Falling back to Mock data (Admin-only safety).');
            return await generateMock({ subject, topic, week });
        }

        throw new Error(error.message || 'Failed to generate lesson content.');
    }
};

module.exports = { generateLessonPlanAI };
