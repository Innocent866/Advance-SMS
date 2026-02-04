import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle, BarChart, Users, Shield, Calendar, BookOpen, Layers, Laptop, PenTool, Database } from 'lucide-react';

import schoolBg from '../../assets/school_bg.mp4';

const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

const Home = () => {
  return (
    <div className="overflow-hidden bg-milk">
      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Background Video */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
             <video
                autoPlay
                loop
                muted
                playsInline
                className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2 opacity-60"
             >
                <source src={schoolBg} type="video/mp4" />
             </video>
             {/* Overlay to ensure text readability - Milk tint */}
             <div className="absolute inset-0 bg-gradient-to-b from-milk/90 via-milk/80 to-milk/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
               <motion.span variants={fadeInUp} className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-8 border border-primary-100 shadow-sm">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                  </span>
                  New Era of School Management
               </motion.span>
              <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1]">
                Empower Your School with <br className="hidden md:block" />
                <span className="text-primary-600">Intelligent Digital Tools</span>
              </motion.h1>
              <motion.p variants={fadeInUp} className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed font-medium">
                Streamline operations, boost student performance, and connect your entire school community with one intuitive, secure platform.
              </motion.p>
              <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-5 justify-center items-center">
                <Link to="/register-school" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-primary-700 transition-all transform hover:-translate-y-1 border border-transparent">
                        Get Started Free
                    </button>
                </Link>
                <Link to="/contact" className="w-full sm:w-auto">
                    <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-primary-900 font-bold text-lg border border-primary-100 shadow-md hover:bg-primary-50 hover:border-primary-200 transition-all flex items-center justify-center gap-2">
                        Request a Demo <ArrowRight size={20} className="text-primary-600" />
                    </button>
                </Link>
              </motion.div>
            </motion.div>
          </div>
          
          {/* Hero Visual Mockup */}
          <motion.div 
            initial={{ opacity: 0, y: 80, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay: 0.6, duration: 1, ease: "easeOut" }}
            className="mt-20 relative group"
          >
             <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-primary-300 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
             <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary-100 bg-white">
                 {/* Abstract Dashboard UI */}
                 <div className="bg-milk aspect-[16/9] flex flex-col overflow-hidden">
                     {/* Top bar */}
                     <div className="h-14 bg-white border-b border-primary-50 flex items-center px-6 gap-4">
                         <div className="w-8 h-8 bg-primary-100 rounded-lg"></div>
                         <div className="h-4 w-32 bg-gray-100 rounded-full"></div>
                         <div className="flex-1"></div>
                         <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                         <div className="w-8 h-8 bg-gray-100 rounded-full"></div>
                     </div>
                     <div className="flex-1 flex overflow-hidden">
                         {/* Sidebar */}
                         <div className="w-64 bg-white border-r border-primary-50 p-6 hidden md:flex flex-col gap-4">
                             {[1, 2, 3, 4, 5].map(i => (
                                 <div key={i} className={`flex items-center gap-3 ${i === 1 ? 'bg-primary-50 p-2 rounded-lg' : ''}`}>
                                     <div className={`w-6 h-6 rounded-md ${i === 1 ? 'bg-primary-500' : 'bg-gray-100'}`}></div>
                                     <div className={`h-3 w-24 rounded-full ${i === 1 ? 'bg-primary-200' : 'bg-gray-100'}`}></div>
                                 </div>
                             ))}
                         </div>
                         {/* Main Content */}
                         <div className="flex-1 p-8 grid grid-cols-3 gap-6 bg-milk">
                              {/* Cards */}
                              <div className="col-span-3 lg:col-span-2 space-y-6">
                                  <div className="grid grid-cols-2 gap-6">
                                      <div className="h-32 bg-white rounded-xl shadow-sm border border-primary-50 p-4 relative overflow-hidden group/card">
                                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:scale-110 transition-transform"><BarChart size={40} className="text-primary-600" /></div>
                                          <div className="h-2 w-16 bg-primary-100 rounded mb-2"></div>
                                          <div className="h-8 w-24 bg-gray-800 rounded mb-2"></div>
                                      </div>
                                      <div className="h-32 bg-white rounded-xl shadow-sm border border-primary-50 p-4 relative overflow-hidden group/card">
                                           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:scale-110 transition-transform"><Users size={40} className="text-primary-600" /></div>
                                           <div className="h-2 w-16 bg-green-100 rounded mb-2"></div>
                                           <div className="h-8 w-24 bg-gray-800 rounded mb-2"></div>
                                      </div>
                                  </div>
                                  <div className="h-64 bg-white rounded-xl shadow-sm border border-primary-50 p-6">
                                      <div className="flex items-end gap-4 h-full pb-4">
                                          {[40, 60, 45, 75, 50, 80, 65, 90, 70].map((h, i) => (
                                              <div key={i} className="flex-1 bg-primary-50 rounded-t-lg relative group/bar">
                                                  <div style={{height: `${h}%`}} className="absolute bottom-0 w-full bg-primary-500 rounded-t-lg transition-all duration-1000 group-hover/bar:bg-primary-600"></div>
                                              </div>
                                          ))}
                                      </div>
                                  </div>
                              </div>
                              <div className="col-span-3 lg:col-span-1 space-y-6">
                                  <div className="h-full bg-white rounded-xl shadow-sm border border-primary-50 p-6 flex flex-col gap-4">
                                      <div className="h-4 w-32 bg-gray-100 rounded mb-4"></div>
                                      {[1, 2, 3, 4].map(i => (
                                          <div key={i} className="flex items-center gap-3">
                                              <div className="w-10 h-10 rounded-full bg-gray-100"></div>
                                              <div>
                                                  <div className="h-3 w-20 bg-gray-100 rounded mb-1"></div>
                                                  <div className="h-2 w-12 bg-primary-50 rounded"></div>
                                              </div>
                                          </div>
                                      ))}
                                  </div>
                              </div>
                         </div>
                     </div>
                 </div>
                 {/* Overlay Text */}
                 <div className="absolute inset-0 flex items-center justify-center bg-black/5 group-hover:bg-transparent transition-colors pointer-events-none">
                 </div>
             </div>
          </motion.div>
        </div>
      </section>

      {/* 2. Visual Storytelling Section */}
      <section className="py-24 bg-white relative overflow-hidden">
         {/* Green & Milk Background Accents */}
         <div className="absolute top-0 left-0 w-full h-full bg-primary-900/5 z-0"></div>
         <div className="absolute -top-40 -right-40 w-96 h-96 bg-primary-100 rounded-full mix-blend-multiply filter blur-3xl opacity-70"></div>
         
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                 <motion.div
                    initial="hidden"
                    whileInView="visible"
                    viewport={{ once: true }}
                    variants={fadeInUp}
                 >
                     <h2 className="text-3xl font-bold sm:text-4xl mb-6 leading-tight text-gray-900">
                         Transforming Education Through <span className="text-primary-600">Technology</span>
                     </h2>
                     <p className="text-gray-600 text-lg leading-relaxed mb-8">
                         Imagine a school where administrative tasks happen automatically, where teachers have instant access to resources, and parents are always in the loop. That's the power of digital transformation.
                     </p>
                     <ul className="space-y-4">
                         {[
                             "Real-time connected classrooms",
                             "Paperless administration",
                             "Instant parent-teacher collaboration"
                         ].map((item, i) => (
                             <li key={i} className="flex items-center gap-3 text-lg font-medium text-gray-700">
                                 <div className="w-6 h-6 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                     <CheckCircle size={14} />
                                 </div>
                                 {item}
                             </li>
                         ))}
                     </ul>
                 </motion.div>
                 <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="relative"
                 >
                     {/* Modern graphic composition */}
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-4 mt-8">
                             <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-all">
                                 <Laptop className="text-primary-600 mb-4 h-8 w-8" />
                                 <h3 className="font-bold text-lg mb-2 text-gray-900">Smart Admin</h3>
                                 <p className="text-sm text-gray-500">Automate fees, attendance & admissions.</p>
                             </div>
                             <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-all">
                                 <BookOpen className="text-primary-500 mb-4 h-8 w-8" />
                                 <h3 className="font-bold text-lg mb-2 text-gray-900">E-Learning</h3>
                                 <p className="text-sm text-gray-500">Video lessons & digital libraries.</p>
                             </div>
                         </div>
                         <div className="space-y-4">
                             <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-all">
                                 <Users className="text-primary-600 mb-4 h-8 w-8" />
                                 <h3 className="font-bold text-lg mb-2 text-gray-900">Parent Portal</h3>
                                 <p className="text-sm text-gray-500">Seamless communication & progress tracking.</p>
                             </div>
                             <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-all">
                                 <BarChart className="text-primary-500 mb-4 h-8 w-8" />
                                 <h3 className="font-bold text-lg mb-2 text-gray-900">Analytics</h3>
                                 <p className="text-sm text-gray-500">Data-driven insights for better decisions.</p>
                             </div>
                         </div>
                     </div>
                 </motion.div>
             </div>
         </div>
      </section>

      {/* 3. Who is it for? */}
      <section className="py-24 bg-milk">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center mb-16">
                  <h2 className="text-3xl font-bold text-gray-900">Built for the Entire Ecosystem</h2>
                  <p className="mt-4 text-gray-600 max-w-2xl mx-auto">
                      Every stakeholder in your institution benefits from our tailored dashboards.
                  </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                  {[
                      { role: "School Admin", icon: <Shield className="w-8 h-8"/>, color: "bg-primary-50 text-primary-600", desc: "Gain total control over operations, finance, and staff." },
                      { role: "Teachers", icon: <PenTool className="w-8 h-8"/>, color: "bg-orange-50 text-orange-600", desc: "Streamline grading, lesson planning, and attendance." },
                      { role: "Students", icon: <BookOpen className="w-8 h-8"/>, color: "bg-blue-50 text-blue-600", desc: "Access notes, track results, and learn from anywhere." },
                      { role: "Parents", icon: <Users className="w-8 h-8"/>, color: "bg-purple-50 text-purple-600", desc: "Stay informed on child progress and make easy payments." }
                  ].map((item, idx) => (
                      <motion.div 
                        key={idx}
                        className="bg-white p-8 rounded-2xl shadow-sm border border-primary-50 hover:shadow-xl hover:-translate-y-2 transition-all duration-300 group"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.1 }}
                      >
                          <div className={`w-16 h-16 rounded-2xl ${item.color} flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
                              {item.icon}
                          </div>
                          <h3 className="text-xl font-bold text-gray-900 mb-3">{item.role}</h3>
                          <p className="text-gray-600 leading-relaxed text-sm">{item.desc}</p>
                      </motion.div>
                  ))}
              </div>
          </div>
      </section>

      {/* 4. Problem + Solution */}
      <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-24 items-center">
                  {/* Problems */}
                  <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                  >
                      <h2 className="text-3xl font-bold text-gray-900 mb-8">Stop Struggling with...</h2>
                      <div className="space-y-6">
                          {[
                              { title: "Manual Record Keeping", desc: "Piles of paper files that are hard to search and easy to lose." },
                              { title: "Delayed Results", desc: "Weeks of waiting for report cards to be compiled manually." },
                              { title: "Financial Leaks", desc: "Untracked fees and difficult reconciliation processes." },
                              { title: "Communication Gaps", desc: "Parents feeling disconnected from school activities." }
                          ].map((prob, i) => (
                              <div key={i} className="flex gap-4 p-4 rounded-xl hover:bg-red-50 transition-colors border-l-4 border-red-200 bg-gray-50">
                                  <div className="flex-shrink-0 mt-1 text-red-500">
                                      <div className="w-6 h-6 border-2 border-red-500 rounded-full flex items-center justify-center font-bold text-xs">!</div>
                                  </div>
                                  <div>
                                      <h4 className="font-bold text-gray-900">{prob.title}</h4>
                                      <p className="text-sm text-gray-600">{prob.desc}</p>
                                  </div>
                              </div>
                          ))}
                      </div>
                  </motion.div>

                  {/* Solution */}
                  <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="relative"
                  >
                       <div className="absolute inset-0 bg-primary-600 rounded-3xl transform rotate-3 opacity-10"></div>
                       <div className="bg-milk border border-primary-100 rounded-3xl shadow-2xl p-8 lg:p-10 relative z-10">
                            <h2 className="text-3xl font-bold text-primary-600 mb-8">Start Enjoying...</h2>
                            <div className="space-y-6">
                                {[
                                    { title: "Centralized Management", desc: "One secure database for everything." },
                                    { title: "Automated Workflows", desc: "Results, grade promotions, and fees processed instantly." },
                                    { title: "Real-time Access", desc: "Login from anywhere, on any device." },
                                    { title: "Secure Digital Records", desc: "Never lose a file again. Backed up and encrypted." }
                                ].map((sol, i) => (
                                    <div key={i} className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0">
                                            <CheckCircle size={18} />
                                        </div>
                                        <span className="text-lg font-medium text-gray-800">{sol.title}</span>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-10 pt-8 border-t border-primary-100">
                                <Link to="/register-school">
                                    <button className="w-full py-4 rounded-xl bg-primary-800 text-white font-bold shadow-lg hover:bg-primary-900 transition-all">
                                        Get Started Today
                                    </button>
                                </Link>
                            </div>
                       </div>
                  </motion.div>
              </div>
          </div>
      </section>

      {/* 5. Key Features Grid */}
      <section className="py-24 bg-milk">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl font-bold text-gray-900">Everything You Need</h2>
                <p className="mt-4 text-gray-600">A complete suite of tools to manage every aspect of your school.</p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {[
                    { icon: <BookOpen className="w-6 h-6"/>, title: "Academic Management", desc: "Curriculum planning, subject allocation, and arm/class management." },
                    { icon: <BarChart className="w-6 h-6"/>, title: "Result Processing", desc: "Automated grading, CA computation, and broadsheet generation." },
                    { icon: <Users className="w-6 h-6"/>, title: "Parent Portal", desc: "Dedicated access for parents to check results and pay fees." },
                    { icon: <Layers className="w-6 h-6"/>, title: "Finance & Accounts", desc: "Income/Expense tracking, payroll, and automated invoicing." },
                    { icon: <Database className="w-6 h-6"/>, title: "Learning Resources", desc: "Digital library, video lessons, and AI lesson planner." },
                    { icon: <Shield className="w-6 h-6"/>, title: "Security & Roles", desc: "Granular access control ensuring data privacy." }
                ].map((feat, i) => (
                    <motion.div 
                        key={i}
                        className="bg-white p-6 rounded-xl border border-primary-50 hover:border-primary-300 hover:shadow-lg transition-all group"
                        whileHover={{ y: -5 }}
                    >
                        <div className="w-12 h-12 bg-primary-50 rounded-lg flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                            {feat.icon}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                        <p className="text-sm text-gray-600">{feat.desc}</p>
                    </motion.div>
                ))}
            </div>
            <div className="mt-12 text-center">
                <Link to="/features" className="text-primary-600 font-semibold hover:text-primary-700 inline-flex items-center gap-2">
                    View all features <ArrowRight size={16} />
                </Link>
            </div>
        </div>
      </section>

      {/* 6. Simple Flow */}
      <section className="py-24 bg-white relative">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-16">
                   <h2 className="text-3xl font-bold text-gray-900">Get Started in 3 Simple Steps</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">
                   {/* Connecting Line (Desktop) */}
                   <div className="hidden md:block absolute top-12 left-0 w-full h-0.5 bg-primary-50 z-0"></div>

                   {[
                       { step: "01", title: "Register Your School", desc: "Create your free account and set up your school profile in minutes." },
                       { step: "02", title: "Add Your Data", desc: "Upload staff, students, and classes easily using our bulk tools." },
                       { step: "03", title: "Go Digital", desc: "Start managing attendance, results, and payments immediately." }
                   ].map((item, i) => (
                       <motion.div 
                          key={i} 
                          className="relative z-10 text-center"
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.2 }}
                       >
                           <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-primary-100 flex items-center justify-center text-2xl font-bold text-primary-600 mb-6 shadow-sm">
                               {item.step}
                           </div>
                           <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                           <p className="text-gray-600">{item.desc}</p>
                       </motion.div>
                   ))}
               </div>
           </div>
      </section>

      {/* 7. Trust Signals */}
      <section className="py-16 bg-milk border-t border-primary-50">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="flex flex-col md:flex-row justify-between items-center gap-8 text-center md:text-left">
                    <div>
                        <h3 className="text-2xl font-bold text-gray-900 mb-2">Trusted & Secure</h3>
                        <p className="text-gray-600">Your data is safe with us.</p>
                    </div>
                    <div className="flex flex-wrap justify-center gap-6">
                        <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm text-sm font-medium text-gray-700 border border-primary-50">
                            <Shield className="text-green-500" size={18} /> Bank-Grade Security
                        </div>
                        <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm text-sm font-medium text-gray-700 border border-primary-50">
                            <Database className="text-blue-500" size={18} /> Daily Backups
                        </div>
                         <div className="flex items-center gap-2 px-6 py-3 bg-white rounded-full shadow-sm text-sm font-medium text-gray-700 border border-primary-50">
                            <Users className="text-purple-500" size={18} /> 24/7 Support
                        </div>
                    </div>
               </div>
           </div>
      </section>

      {/* 8. Final CTA */}
      <section className="py-24 bg-primary-900 relative overflow-hidden">
          <div className="absolute inset-0 opacity-20 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] filter contrast-125 brightness-100"></div>
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center">
              <h2 className="text-4xl font-bold text-white mb-8 tracking-tight">
                  Ready to transform your school?
              </h2>
              <p className="text-xl text-primary-100 mb-12">
                  Join hundreds of schools that have improved efficiency and student outcomes with Advance SMS.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-5">
                   <Link to="/register-school">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-primary-900 font-bold text-lg shadow-2xl hover:bg-gray-50 transition-colors"
                        >
                            Create Free School Account
                        </motion.button>
                   </Link>
                   <Link to="/contact">
                        <motion.button 
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            className="w-full sm:w-auto px-10 py-5 rounded-full bg-transparent border border-primary-400 text-white font-bold text-lg hover:bg-primary-800 transition-colors"
                        >
                            Contact Us
                        </motion.button>
                   </Link>
              </div>
          </div>
      </section>

    </div>
  );
};

export default Home;
