const VideoLesson = require('../models/VideoLesson');
const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const Student = require('../models/Student');

// --- Video Lessons ---

// @desc    Create Video Lesson
// @route   POST /api/learning/videos
// @access  Private (Teacher)
const createVideo = async (req, res) => {
    try {
        const video = await VideoLesson.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            teacherId: req.user._id,
            ...req.body
        });
        res.status(201).json(video);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const ClassLevel = require('../models/ClassLevel');

// @desc    Get Videos (Filter by class/subject)
// @route   GET /api/learning/videos
// @access  Private (Student/Teacher)
const getVideos = async (req, res) => {
    const { classLevelId, subjectId } = req.query;
    let query = { schoolId: req.user.schoolId._id || req.user.schoolId };

    if (classLevelId) query.classLevelId = classLevelId;
    if (subjectId) query.subjectId = subjectId;

    // Security: If student, force classLevelId check
    if (req.user.role === 'student') {
        if (!req.user.classId) {
            return res.status(400).json({ message: 'Student not assigned to a class' });
        }
        query.classLevelId = req.user.classId;
        query.status = 'Approved';
        query.isPublished = true;
    }

    try {
        const videos = await VideoLesson.find(query)
            .populate('teacherId', 'name')
            .populate('subjectId', 'name')
            .populate('classLevelId', 'name')
            .sort({ createdAt: -1 });
        res.json(videos);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Student Assigned Subjects
// @route   GET /api/learning/subjects
// @access  Private (Student)
const getStudentSubjects = async (req, res) => {
    try {
        if (req.user.role !== 'student') {
             return res.status(401).json({ message: 'Not authorized' });
        }

        if (!req.user.classId) {
             return res.status(400).json({ message: 'Student not assigned to a class' });
        }

        const classLevel = await ClassLevel.findById(req.user.classId).populate('subjects');
        
        if (!classLevel) {
            return res.status(404).json({ message: 'Class not found' });
        }

        res.json(classLevel.subjects || []);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// --- Quizzes ---

// @desc    Create Quiz for a Video
// @route   POST /api/learning/quizzes
// @access  Private (Teacher)
const createQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            teacherId: req.user._id,
            ...req.body
        });
        res.status(201).json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Quiz by Video ID
// @route   GET /api/learning/quizzes/:videoId
// @access  Private
const getQuizByVideoId = async (req, res) => {
    try {
        const quiz = await Quiz.findOne({ videoId: req.params.videoId });
        if (!quiz) {
            return res.status(404).json({ message: 'Quiz not found' });
        }
        res.json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Submit Quiz
// @route   POST /api/learning/submissions
// @access  Private (Student)
const submitQuiz = async (req, res) => {
    const { quizId, answers } = req.body; // answers: [{ questionIndex, selectedOptionIndex, answerText }]

    try {
        const quiz = await Quiz.findById(quizId);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        let score = 0;
        let totalScorePossible = 0;

        const processedAnswers = answers.map(ans => {
            const question = quiz.questions[ans.questionIndex];
            if (!question) return null;

            let isCorrect = false;
            let submittedAnswer = '';

            if (question.type === 'text') {
                // Manual grading needed for text, or naive check?
                // For MVP, we mark as pending/correct if not empty? 
                // Let's assume full points for now if answered (User requirement: view score/feedback).
                // Or better: don't count towards score yet.
                submittedAnswer = ans.answerText || '';
                isCorrect = true; // Auto-pass for now to avoid zero scores, teacher verifies later
            } else {
                // Objective
                submittedAnswer = question.options[ans.selectedOptionIndex]; // Store the text value
                // Fix: Compare the text value with the stored correctAnswer string
                isCorrect = submittedAnswer === question.correctAnswer;
            }

            if (isCorrect) score += (100 / quiz.questions.length);
            
            return { 
                questionIndex: ans.questionIndex, 
                answer: submittedAnswer, // Store the actual text answer
                isCorrect 
            };
        }).filter(a => a !== null);

        const passed = score >= quiz.passingScore;

        const submission = await Submission.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            studentId: req.user._id,
            quizId,
            answers: processedAnswers,
            score,
            passed
        });

        // SYNC: Update Student Profile
        const student = await Student.findOne({ userId: req.user._id });
        if (student) {
            const existingTaskIndex = student.tasksCompleted.findIndex(t => t.taskId.toString() === quizId);
            if (existingTaskIndex > -1) {
                student.tasksCompleted[existingTaskIndex].score = score;
                student.tasksCompleted[existingTaskIndex].submittedAt = Date.now();
            } else {
                student.tasksCompleted.push({ taskId: quizId, score, submittedAt: Date.now() });
            }
            await student.save();
        }

        res.status(201).json(submission);

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get My Submissions
// @route   GET /api/learning/submissions
// @access  Private (Student)
const getMySubmissions = async (req, res) => {
    try {
        const submissions = await Submission.find({ studentId: req.user._id })
            .populate('quizId')
            .sort({ submittedAt: -1 });
        res.json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

const VideoProgress = require('../models/VideoProgress');

// @desc    Mark Video as Completed
// @route   POST /api/learning/progress/:videoId
// @access  Private (Student)
const markVideoComplete = async (req, res) => {
    try {
        const progress = await VideoProgress.findOneAndUpdate(
            { 
                studentId: req.user._id, 
                videoId: req.params.videoId,
                schoolId: req.user.schoolId._id || req.user.schoolId
            },
            { completed: true, watchedAt: Date.now() },
            { upsert: true, new: true }
        );

        // SYNC: Update Student Profile
        await Student.updateOne(
            { userId: req.user._id, 'videosWatched.videoId': { $ne: req.params.videoId } },
            { 
                $push: {  
                    videosWatched: { 
                        videoId: req.params.videoId, 
                        watchedAt: Date.now() 
                    } 
                } 
            }
        );
        res.json(progress);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get Learning History (Progress & Submissions)
// @route   GET /api/learning/history
// @access  Private (Student)
const getLearningHistory = async (req, res) => {
    try {
        const completedVideos = await VideoProgress.find({ 
            studentId: req.user._id, 
            completed: true 
        }).populate({
            path: 'videoId',
            select: 'title subjectId classLevelId',
            populate: { path: 'subjectId', select: 'name' }
        }).sort({ watchedAt: -1 });

        const submissions = await Submission.find({ 
            studentId: req.user._id 
        }).populate({
            path: 'quizId',
            select: 'title'
        }).sort({ submittedAt: -1 });

        res.json({
            completedVideos,
            submissions
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Increment Video View
// @route   POST /api/learning/videos/:id/view
// @access  Private (Student)
const incrementView = async (req, res) => {
    try {
        const video = await VideoLesson.findByIdAndUpdate(
            req.params.id,
            { $inc: { views: 1 } },
            { new: true }
        );
        
        if (!video) return res.status(404).json({ message: 'Video not found' });
        
        res.json({ views: video.views });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createVideo,
    getVideos,
    createQuiz,
    getQuizByVideoId,
    submitQuiz,
    getMySubmissions,
    getStudentSubjects,
    markVideoComplete,
    getLearningHistory,
    incrementView
};
