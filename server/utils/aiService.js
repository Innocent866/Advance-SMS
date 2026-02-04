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
Your task is to generate a detailed Lesson Plan, Lesson Notes, and Slide Content for a specific subject and class.
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
  "slideContent": ["string"]
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

const generateExamGradingAI = async ({ subject, examType, question, markingScheme, studentAnswer, scriptFile, scriptFileType, schoolId, teacherId }) => {
    
    // 1. Check if Key Exists (or use mock)
    if (!process.env.OPENAI_API_KEY) {
        console.log('No OpenAI Key found, detailed mock required.');
        // Simple mock for now
        return {
             scoreBreakdown: [
                 { point: "Key Concept (Mock)", marksAwarded: 2, maxMarks: 5, reason: "Mock grading: Key concept identified but weak explanation." }
             ],
             totalSuggestedScore: 2,
             maxPossibleScore: 5,
             feedback: "This is a mock response because no API key is set. (File uploaded: " + (scriptFile ? 'Yes' : 'No') + ")"
        };
    }

    // 2. Construct Prompt (WAEC/NECO Style)
    const systemPrompt = `
You are an expert WAEC/NECO Chief Examiner. 
Your task is to mark a student's answer based STRICTLY on the provided Marking Scheme.
You must be objective, fair, and follow the standard marking guide.

Output must be valid JSON in the following structure:
{
  "scoreBreakdown": [
    { "point": "string (what was looked for)", "marksAwarded": number, "maxMarks": number, "reason": "string (justification)" }
  ],
  "totalSuggestedScore": number,
  "maxPossibleScore": number,
  "feedback": "string (overall comment)"
}
`;

    let userContent = [
        { type: "text", text: `Subject: ${subject}\nExam Type: ${examType}\n\nQuestion:\n${question}\n\nMarking Scheme:\n${markingScheme}\n\n` }
    ];

    if (studentAnswer) {
        userContent.push({ type: "text", text: `Student Answer (Text):\n${studentAnswer}\n\nGrade this answer strictly.` });
    }

    if (scriptFile) {
         // Assuming scriptFile is a Cloudinary URL or accessible URL
         // Note: OpenAI Vision supports JPEG, PNG, WEBP, GIF (non-animated).
         // If PDF, this implementation assumes it's converted or rejected at upload, 
         // OR we just try to pass it (which will fail for pure PDF).
         // Better to rely on 'studentAnswer' text for PDFs in this MVP unless we add PDF parsing.
         
         userContent.push({ type: "text", text: `Student Answer (Image/File): See attached image.` });
         userContent.push({
             type: "image_url",
             image_url: {
                 "url": scriptFile
             }
         });
    }

    try {
        const model = scriptFile ? "gpt-4o" : "gpt-3.5-turbo-1106"; // Use 4o for vision
        
        const completion = await openai.chat.completions.create({
            model: model,
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userContent }
            ],
            response_format: { type: "json_object" },
            max_tokens: 1500,
            temperature: 0.3, 
        });

        const output = JSON.parse(completion.choices[0].message.content);
        const tokensUsed = completion.usage.total_tokens;

        // 3. Log Usage
        if (schoolId && teacherId) {
            await AIUsageLog.create({
                schoolId,
                teacherId,
                action: 'grade_exam',
                promptType: `Subject: ${subject} ${scriptFile ? '(File)' : ''}`,
                tokensUsed,
                modelUsed: completion.model
            });
        }

        return output;

    } catch (error) {
        console.error('OpenAI Error (Grading):', error);
        throw new Error(error.message || 'Failed to grade exam.');
    }
};

module.exports = { generateLessonPlanAI, generateExamGradingAI };
