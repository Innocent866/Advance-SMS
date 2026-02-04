import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, Calendar, Globe, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const Community = () => {
  return (
    <div className="bg-white min-h-screen">
      
      {/* Hero */}
      <div className="bg-white pt-24 pb-16 px-6 text-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 text-blue-700 font-bold text-sm mb-8"
          >
              <Globe size={16} /> 10,000+ Educators & Admins
          </motion.div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 tracking-tight">
              Join the <span className="text-primary-600">Conversation</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-10">
              Connect with other school administrators, share best practices, and help shape the future of education in Nigeria.
          </p>
          <div className="flex justify-center gap-4">
               <button className="px-8 py-3 bg-primary-600 text-white font-bold rounded-full hover:bg-primary-700 transition-colors shadow-lg">
                   Join Community
               </button>
               <button className="px-8 py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-full hover:bg-gray-50 transition-colors">
                   Browse Topics
               </button>
          </div>
      </div>

      {/* Forum Categories */}
      <div className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Popular Discussions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                  { title: "School Administration", desc: "Tips for running day-to-day operations efficiently.", active: 120 },
                  { title: "Curriculum Implementation", desc: "Discussing the new national curriculum standards.", active: 85 },
                  { title: "EdTech Support", desc: "Getting the most out of GT-SchoolHub features.", active: 240 },
                  { title: "Teacher Welfare", desc: "Strategies for staff retention and motivation.", active: 56 }
              ].map((topic, i) => (
                  <div key={i} className="p-6 rounded-2xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-lg transition-all cursor-pointer group">
                      <div className="flex justify-between items-start mb-4">
                          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center text-gray-600 shadow-sm">
                              <MessageSquare size={20} />
                          </div>
                          <div className="flex items-center gap-1.5 text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full">
                              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> {topic.active} Online
                          </div>
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-primary-600 transition-colors">{topic.title}</h3>
                      <p className="text-gray-500 text-sm">{topic.desc}</p>
                  </div>
              ))}
          </div>
      </div>

      {/* Events Section */}
      <div className="bg-primary-900 text-white py-24">
           <div className="max-w-7xl mx-auto px-6">
               <div className="flex flex-col md:flex-row justify-between items-end mb-12">
                   <div>
                       <h2 className="text-3xl font-bold mb-4">Upcoming Events</h2>
                       <p className="text-primary-200">Webinars, workshops, and meetups for educators.</p>
                   </div>
                   <button className="hidden md:flex items-center gap-2 text-primary-200 hover:text-white transition-colors font-bold">
                       View All Events <ArrowUpRight size={18} />
                   </button>
               </div>

               <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                   {[1, 2, 3].map((i) => (
                       <div key={i} className="bg-primary-800 rounded-2xl p-6 border border-primary-700 hover:border-primary-500 transition-colors">
                           <div className="text-sm font-bold text-primary-300 mb-4 flex items-center gap-2">
                               <Calendar size={16} /> Nov {10 + i}, 2025 • 2:00 PM
                           </div>
                           <h3 className="text-xl font-bold mb-4">Digital Transformation in Schools: A Practical Guide</h3>
                           <p className="text-primary-200 text-sm mb-6">Learn how to effectively transition your school records to a digital system without disrupting operations.</p>
                           <button className="w-full py-3 bg-primary-600 rounded-xl font-bold hover:bg-primary-500 transition-colors">
                               Register Free
                           </button>
                       </div>
                   ))}
               </div>
           </div>
      </div>

    </div>
  );
};

export default Community;
