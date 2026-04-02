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
        week: week ? week.toString() : "1",
        date: new Date().toLocaleDateString(),
        class: "Mock Class",
        topic: topic,
        subTopic: "Introduction",
        duration: "40 Minutes",
        teachersName: "Mock Teacher",
        subject: subject,
        period: "1st Period",
        behaviouralObjectives: ["Understand the concept", "Apply the concept"],
        instructionalMaterials: ["Textbook", "Board"],
        previousKnowledge: "Basic understanding",
        entryBehaviour: "Students are ready to learn",
        recommendedText: ["Core Textbook"],
        referenceText: ["Reference Material"],
        content: "Detailed mock content for " + topic,
        presentation: ["The Teacher introduces the topic", "The Teacher explains key concepts"],
        studentActivity: ["Listen and take notes", "Ask questions"],
        summaryConclusion: "Summary of the topic.",
        evaluation: ["What is the definition?", "Give one example"],
        assignment: "Read the next chapter.",
        remark: "Good active participation.",
        lessonNotes: `# Introduction to ${topic}\n\nThis is a highly detailed mock note. It breaks down the concept into multiple fundamental pillars.\n\n## 1. Core Definition\n${topic} is a critical subject in our curriculum...\n\n## 2. Real World Application\nFor example, in Lagos markets, this concept can be seen when...\n\n## 3. Step by Step Analysis\n- First point\n- Second point\n\n## Summary\nOverall, the students must understand the underlying principles...`
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
Your task is to generate a detailed Lesson Plan and Lesson Notes for a specific subject and class.
STRICTLY FOLLOW the Nigerian Educational Research and Development Council (NERDC) curriculum standards for WAEC/NECO/BECE.
Use local Nigerian examples (e.g., Lagos, Abuja, Naira, local markets, local culture) where relevant.

Crucially:
1. For "lessonNotes", provide a highly detailed, extensive textbook-style breakdown. The 'lessonNotes' must be very long, comprehensive, and broken down with headers, bullet points, and real-world examples. It should serve as a complete study material for the teacher to deliver effectively.
2. "behaviouralObjectives", "presentation", and "studentActivity" MUST be arrays of strings (lists).
3. Each item in the "presentation" list MUST start with the phrase "The Teacher ".

Output must be valid JSON in the following structure:
{
  "week": "string",
  "date": "string",
  "class": "string",
  "topic": "string",
  "subTopic": "string",
  "duration": "string",
  "teachersName": "string",
  "subject": "string",
  "period": "string",
  "behaviouralObjectives": ["string"],
  "instructionalMaterials": ["string"],
  "previousKnowledge": "string",
  "entryBehaviour": "string",
  "recommendedText": ["string"],
  "referenceText": ["string"],
  "content": "string",
  "presentation": ["string"],
  "studentActivity": ["string"],
  "summaryConclusion": "string",
  "evaluation": ["string"],
  "assignment": "string",
  "remark": "string",
  "lessonNotes": "markdown string"
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
You are an expert, strict, and anonymous WAEC/NECO Chief Examiner. 
Your task is to mark a student's handwritten answer based STRICTLY on the provided Marking Scheme.
You must be completely objective and detached. Do NOT under any circumstances provide personal remarks (e.g., "See me", "Poor", "Good try"). Only provide objective academic feedback based on the rubric.

CRITICAL VISUAL MARKING RULES (For the "coord" data):
1. You must provide exact X and Y coordinates (normalized 0 to 100 percentage from the top-left) indicating exactly where on the image your red ink should land.
2. DO NOT cluster coordinates at X:0 or X:10. The coordinates MUST point accurately to the end of the specific handwritten sentence, calculation, or formula you are grading.
3. For Correct Steps: Award a positive mark (marksAwarded > 0). The system will draw a red tick (✓) at your provided coordinate.
4. For Incorrect Steps or Wrong Formulas: Award zero marks (marksAwarded: 0). The system will draw a red zero (0) or cross (✕) at your provided coordinate.
5. If an entire section is irrelevant or completely failed, provide a coordinate targeting the center of that wrong paragraph so the system can strike it out.

Output must be valid JSON in the following exact structure:
{
  "scoreBreakdown": [
    { 
      "point": "string (The specific step or fact being evaluated)", 
      "marksAwarded": number (0 for wrong/failed step, >0 for correct step), 
      "maxMarks": number (Total possible for this step), 
      "reason": "string (Strict, objective justification from the marking scheme)",
      "coord": { 
          "x": number (e.g., 75 - meaning 75% across the page, right after the student's word), 
          "y": number (e.g., 40 - meaning 40% down the page directly on their handwritten line) 
      }
    }
  ],
  "totalSuggestedScore": number,
  "maxPossibleScore": number,
  "feedback": "string (Objective summary of academic performance, e.g., 'Candidate demonstrated knowledge of the formula but failed in final arithmetic substitution.')"
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
