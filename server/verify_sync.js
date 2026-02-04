const mongoose = require('mongoose');
const Student = require('./models/Student');
const VideoLesson = require('./models/VideoLesson');
const User = require('./models/User');

// Connect to DB (update URI as needed, usually in .env but hardcoding for test script on local dev is faster if known, checking .env first is better)
require('dotenv').config();

const verifySync = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to DB');

        // 1. Create a dummy Student and Video
        const mockStudentId = new mongoose.Types.ObjectId();
        const mockVideoId = new mongoose.Types.ObjectId();
        
        // Use raw operations to simulate the state
        const student = await Student.create({
            _id: mockStudentId,
            firstName: 'Test',
            lastName: 'Sync',
            studentId: 'SYNC_TEST_001',
            schoolId: new mongoose.Types.ObjectId(), // Fake school
            userId: new mongoose.Types.ObjectId(),
            classId: new mongoose.Types.ObjectId(),
            level: 'SSS',
            videosWatched: []
        });

        console.log('Created Student:', student._id);

        // 2. Simulate markVideoComplete logic (from learning.controller.js)
        const videoIdString = mockVideoId.toString(); // As it comes from req.params

        // The Update Logic I wrote:
        const updateResult = await Student.updateOne(
            { _id: mockStudentId, 'videosWatched.videoId': { $ne: videoIdString } },
            { 
                $push: { 
                    videosWatched: { 
                        videoId: videoIdString, 
                        watchedAt: Date.now() 
                    } 
                } 
            }
        );

        console.log('Update Result:', updateResult);

        // 3. Verify Student State
        const updatedStudent = await Student.findById(mockStudentId);
        console.log('Videos Watched Count:', updatedStudent.videosWatched.length);
        console.log('Watched Video ID:', updatedStudent.videosWatched[0]?.videoId);
        console.log('Type of Video ID:', typeof updatedStudent.videosWatched[0]?.videoId); // Should be object (ObjectId)

        if (updatedStudent.videosWatched.length === 1 && updatedStudent.videosWatched[0].videoId.toString() === videoIdString) {
            console.log('SUCCESS: Student profile updated correctly.');
        } else {
            console.log('FAILURE: Student profile NOT updated.');
        }

        // Cleanup
        await Student.deleteOne({ _id: mockStudentId });
        await mongoose.disconnect();

    } catch (error) {
        console.error('Error:', error);
        await mongoose.disconnect();
    }
};

verifySync();
