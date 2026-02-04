const Quiz = require('../models/Quiz');
const Submission = require('../models/Submission');
const VideoLesson = require('../models/VideoLesson');

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Teacher)
const createQuiz = async (req, res) => {
    const { videoId, title, description, questions, duration, isPublished } = req.body;

    if (!videoId || !title || !questions || questions.length === 0) {
        return res.status(400).json({ message: 'Please provide videoId, title and at least one question' });
    }

    try {
        const quiz = await Quiz.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            teacherId: req.user._id,
            videoId,
            title,
            description,
            questions,
            duration,
            isPublished: isPublished || false
        });

        res.status(201).json(quiz);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get quizzes for a video
// @route   GET /api/quizzes?videoId=...
// @access  Private
const getQuizzes = async (req, res) => {
    const { videoId } = req.query;

    if (!videoId) return res.status(400).json({ message: 'Video ID required' });

    try {
        let query = { videoId, schoolId: req.user.schoolId._id || req.user.schoolId };
        
        // Students only see published
        if (req.user.role === 'student') {
            query.isPublished = true;
        }

        const quizzes = await Quiz.find(query);
        res.json(quizzes);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Delete quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Teacher)
const deleteQuiz = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        if (quiz.teacherId.toString() !== req.user.id && req.user.role !== 'school_admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        await quiz.deleteOne();
        res.json({ message: 'Quiz removed' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Submit quiz
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student)
const submitQuiz = async (req, res) => {
    const { answers } = req.body; // [{ questionIndex: 0, answer: 'A' }]
    
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        // Auto Grade
        let score = 0;
        let totalQuestions = quiz.questions.length;

        answers.forEach(sub => {
            const question = quiz.questions[sub.questionIndex];
            if (question && question.correctAnswer && question.correctAnswer === sub.answer) {
                score++;
            }
        });

        // Calculate percentage or raw score? Let's do raw for now, or percentage.
        // Let's store raw score
        
        const submission = await Submission.create({
            schoolId: req.user.schoolId._id || req.user.schoolId,
            studentId: req.user._id,
            quizId: quiz._id,
            answers,
            score,
            passed: true // Placeholder since this route is mainly unused
        });

        res.status(201).json(submission);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

// @desc    Get submissions for a quiz
// @route   GET /api/quizzes/:id/submissions
// @access  Private (Teacher)
const getSubmissions = async (req, res) => {
    try {
        const quiz = await Quiz.findById(req.params.id);
        if (!quiz) return res.status(404).json({ message: 'Quiz not found' });

        if (quiz.teacherId.toString() !== req.user.id && req.user.role !== 'school_admin') {
            return res.status(401).json({ message: 'Not authorized' });
        }

        const submissions = await Submission.find({ quizId: quiz._id })
            .populate('studentId', 'name email');
            
        res.json(submissions);
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server error' });
    }
};

module.exports = {
    createQuiz,
    getQuizzes,
    deleteQuiz,
    submitQuiz,
    getSubmissions
};
