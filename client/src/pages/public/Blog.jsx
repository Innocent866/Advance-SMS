import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, User, ArrowRight, Tag } from 'lucide-react';
import { Link } from 'react-router-dom';

const blogPosts = [
  {
    id: 1,
    title: "The Future of EdTech in African Schools",
    excerpt: "Exploring how digital tools are bridging the gap in educational resources and accessibility across the continent.",
    category: "EdTech",
    author: "Dr. Adebayo",
    date: "Oct 12, 2025",
    image: "https://images.unsplash.com/photo-1571260899304-425eee4c7efc?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 2,
    title: "5 Tips for Better Classroom Management",
    excerpt: "Practical strategies for teachers to maintain engagement and discipline in large classrooms without stress.",
    category: "Teaching",
    author: "Sarah Johnson",
    date: "Sep 28, 2025",
    image: "https://images.unsplash.com/photo-1544928147-79a2af1f3a94?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  },
  {
    id: 3,
    title: "Understanding the New Curriculum Standards",
    excerpt: "A breakdown of the latest government educational policies and how they affect your lesson planning.",
    category: "Policy",
    author: "Chinedu Okeke",
    date: "Sep 15, 2025",
    image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80"
  }
];

const Blog = () => {
  return (
    <div className="bg-white min-h-screen">
      
      {/* Header */}
      <div className="bg-gray-50 py-20 px-6 text-center border-b border-gray-100">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto"
          >
              <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-6">
                 Insights & Updates
              </h1>
              <p className="text-xl text-gray-600 leading-relaxed">
                  The latest news from GT-SchoolHub, plus tips and trends in the world of education technology.
              </p>
          </motion.div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-7xl mx-auto px-6 py-20">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
              {blogPosts.map((post, i) => (
                  <motion.article 
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-xl transition-shadow flex flex-col h-full"
                  >
                      <div className="h-48 overflow-hidden relative">
                          <img src={post.image} alt={post.title} className="w-full h-full object-cover transition-transform duration-500 hover:scale-105" />
                          <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-bold text-primary-700 flex items-center gap-1 shadow-sm">
                              <Tag size={12} /> {post.category}
                          </div>
                      </div>
                      <div className="p-6 flex flex-col flex-1">
                          <div className="flex items-center gap-4 text-xs text-gray-500 mb-4">
                              <div className="flex items-center gap-1"><User size={14}/> {post.author}</div>
                              <div className="flex items-center gap-1"><Calendar size={14}/> {post.date}</div>
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3 hover:text-primary-600 transition-colors cursor-pointer">
                              {post.title}
                          </h3>
                          <p className="text-gray-600 text-sm leading-relaxed mb-6 flex-1">
                              {post.excerpt}
                          </p>
                          <Link to="#" className="inline-flex items-center text-primary-600 font-bold text-sm hover:gap-2 transition-all">
                              Read Article <ArrowRight size={16} className="ml-1" />
                          </Link>
                      </div>
                  </motion.article>
              ))}
          </div>
      </div>

      {/* Newsletter */}
      <div className="bg-primary-900 py-20 px-6 border-t border-gray-100">
          <div className="max-w-4xl mx-auto bg-primary-800 rounded-3xl p-8 sm:p-12 text-center relative overflow-hidden">
               <div className="absolute top-0 right-0 w-64 h-64 bg-primary-500 rounded-full blur-3xl opacity-20 -translate-y-1/2 translate-x-1/2"></div>
               <div className="relative z-10">
                   <h2 className="text-3xl font-bold text-white mb-4">Subscribe to our newsletter</h2>
                   <p className="text-primary-200 mb-8 max-w-xl mx-auto">Get the latest educational insights and platform updates delivered directly to your inbox.</p>
                   <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                       <input 
                          type="email" 
                          placeholder="Enter your email address" 
                          className="flex-1 px-6 py-4 rounded-xl bg-primary-700/50 border border-primary-600 text-white placeholder-primary-300 focus:outline-none focus:ring-2 focus:ring-primary-400"
                       />
                       <button className="px-8 py-4 bg-white text-primary-900 font-bold rounded-xl hover:bg-gray-100 transition-colors">
                           Subscribe
                       </button>
                   </div>
               </div>
          </div>
      </div>

    </div>
  );
};

export default Blog;
