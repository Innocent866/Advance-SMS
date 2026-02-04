import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CheckCircle,
  ArrowRight,
  Monitor,
  Calendar,
  FileText,
  Users,
  CreditCard,
  Cpu,
  BarChart3,
  Shield,
  Layers,
  Lock,
  Globe,
  Award,
  BookOpen,
  PieChart,
  UserCheck
} from 'lucide-react';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const Features = () => {
    return (
        <div className="bg-white overflow-hidden">
            
            {/* 1. Hero Section */}
            <section className="relative py-20 lg:py-32 bg-gray-50 overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 filter contrast-125 brightness-100"></div>
                <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-50 rounded-bl-[100px] transform translate-x-1/3 z-0"></div>
                
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={staggerContainer}
                        >
                            <motion.span variants={fadeInUp} className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 font-bold text-sm mb-6">
                                All-In-One Solution
                            </motion.span>
                            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6 leading-tight">
                                Powerful Features Built for <span className="text-primary-600">Modern Schools</span>
                            </motion.h1>
                            <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-8 leading-relaxed">
                                From admissions to alumni, GT-SchoolHub unifies every aspect of your institution into one seamless, intelligent platform.
                            </motion.p>
                            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4">
                                <Link to="/register-school">
                                    <button className="px-8 py-4 rounded-full bg-primary-600 text-white font-bold text-lg shadow-lg hover:bg-primary-700 transition-all hover:translate-y-[-2px]">
                                        Get Started Free
                                    </button>
                                </Link>
                                <Link to="/pricing">
                                    <button className="px-8 py-4 rounded-full bg-white text-primary-900 font-bold text-lg border border-primary-200 shadow-sm hover:bg-primary-50 transition-all flex items-center justify-center gap-2">
                                        View Pricing <ArrowRight size={18} />
                                    </button>
                                </Link>
                            </motion.div>
                        </motion.div>
                        
                        <motion.div
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8 }}
                            className="relative"
                        >
                             <div className="relative rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
                                  {/* Abstract UI Representation */}
                                  <div className="bg-gray-50 border-b border-gray-100 p-4 flex items-center gap-2">
                                       <div className="flex gap-1.5">
                                            <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                            <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                       </div>
                                       <div className="h-6 w-64 bg-white rounded-md mx-auto shadow-sm"></div>
                                  </div>
                                  <div className="p-6 grid grid-cols-12 gap-4 bg-white min-h-[300px]">
                                       <div className="col-span-3 bg-gray-50 rounded-lg p-3 hidden md:block">
                                            <div className="space-y-2">
                                                 {[1, 2, 3, 4, 5].map(i => (
                                                     <div key={i} className="h-8 bg-gray-200 rounded animate-pulse opacity-50"></div>
                                                 ))}
                                            </div>
                                       </div>
                                       <div className="col-span-12 md:col-span-9 space-y-4">
                                            <div className="grid grid-cols-3 gap-4">
                                                 {[1, 2, 3].map(i => (
                                                     <div key={i} className="h-24 bg-primary-50 rounded-lg border border-primary-100 flex flex-col justify-end p-3">
                                                         <div className="w-8 h-8 bg-white rounded-full mb-2 shadow-sm"></div>
                                                         <div className="h-2 w-16 bg-primary-200 rounded"></div>
                                                     </div>
                                                 ))}
                                            </div>
                                            <div className="h-40 bg-gray-50 rounded-lg border border-gray-100 p-4">
                                                 <div className="flex items-end justify-between h-full gap-2">
                                                      {[40, 70, 50, 90, 60, 80, 50].map((h, i) => (
                                                           <div key={i} className="w-full bg-primary-500 rounded-t" style={{height: `${h}%`}}></div>
                                                      ))}
                                                 </div>
                                            </div>
                                       </div>
                                  </div>
                             </div>
                             {/* Floating Badges */}
                             <motion.div 
                                animate={{ y: [0, -10, 0] }}
                                transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                                className="absolute -bottom-6 -right-6 bg-white p-4 rounded-xl shadow-xl border border-gray-100 flex items-center gap-3"
                             >
                                 <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
                                     <CheckCircle size={20} />
                                 </div>
                                 <div className="text-sm">
                                     <div className="font-bold text-gray-900">Task Complete</div>
                                     <div className="text-gray-500">Report Generated</div>
                                 </div>
                             </motion.div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 2. Core Feature Categories (Grid) */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
                         <h2 className="text-3xl font-bold text-gray-900">Everything You Need to Succeed</h2>
                         <p className="mt-4 text-gray-600">A comprehensive suite of tools designed for excellence.</p>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
                         {[
                             { icon: BookOpen, title: "Academic Management", desc: "Manage student records, class arms, and curriculum effortlessly." },
                             { icon: UserCheck, title: "Attendance Tracking", desc: "Daily student & teacher attendance with automated summaries." },
                             { icon: FileText, title: "Learning Materials", desc: "Digital library for notes & assignments with admin approval." },
                             { icon: Users, title: "Parent Portal", desc: "Real-time access for parents to view results and pay fees." },
                             { icon: CreditCard, title: "Fees & Finance", desc: "Track payments, generate receipts, and manage payroll." },
                             { icon: Cpu, title: "AI-Powered Tools", desc: "Smart marking assistants and automated report generation." },
                             { icon: BarChart3, title: "Reports & Analytics", desc: "Data-driven insights to improve school performance." },
                             { icon: Monitor, title: "CBT & Online Exams", desc: "Conduct computer-based tests securely and efficiently." }
                         ].map((feat, i) => (
                             <motion.div
                                 key={i}
                                 initial={{ opacity: 0, y: 20 }}
                                 whileInView={{ opacity: 1, y: 0 }}
                                 viewport={{ once: true }}
                                 transition={{ delay: i * 0.1 }}
                                 className="bg-gray-50 p-6 rounded-2xl border border-gray-100 hover:bg-white hover:shadow-lg hover:border-primary-100 transition-all group"
                             >
                                 <div className="w-12 h-12 bg-white rounded-lg shadow-sm flex items-center justify-center text-primary-600 mb-4 group-hover:bg-primary-600 group-hover:text-white transition-colors">
                                     <feat.icon size={24} />
                                 </div>
                                 <h3 className="text-lg font-bold text-gray-900 mb-2">{feat.title}</h3>
                                 <p className="text-sm text-gray-600">{feat.desc}</p>
                             </motion.div>
                         ))}
                     </div>
                </div>
            </section>

            {/* 3. Feature Spotlight Sections (Alternating) */}
            <section className="py-24 bg-milk">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-32">
                     
                     {/* Spotlight 1: Smart Result Management */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                         <motion.div
                             initial={{ opacity: 0, x: -50 }}
                             whileInView={{ opacity: 1, x: 0 }}
                             viewport={{ once: true }}
                         >
                             <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600 mb-6">
                                 <PieChart size={32} />
                             </div>
                             <h2 className="text-3xl font-bold text-gray-900 mb-6">Smart Result Management</h2>
                             <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                 Say goodbye to manual compilation errors. Our system automatically computes grades, class positions, and cumulative averages instantly.
                             </p>
                             <ul className="space-y-3">
                                 {["Automated Broadsheets", "Customizable Grading Systems", "Instant Report Card Generation"].map((item, i) => (
                                     <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                         <CheckCircle size={18} className="text-green-500" /> {item}
                                     </li>
                                 ))}
                             </ul>
                         </motion.div>
                         <motion.div
                             initial={{ opacity: 0, scale: 0.95 }}
                             whileInView={{ opacity: 1, scale: 1 }}
                             viewport={{ once: true }}
                             className="bg-white p-2 rounded-3xl shadow-xl border border-gray-100"
                         >
                              <div className="bg-gray-100 rounded-2xl h-[400px] w-full flex items-center justify-center relative overflow-hidden">
                                  {/* Placeholder for Result UI */}
                                  <div className="absolute inset-x-10 top-10 bottom-0 bg-white rounded-t-xl shadow-lg border border-gray-200 p-6">
                                      <div className="flex justify-between items-center mb-6">
                                           <div className="h-4 w-32 bg-gray-200 rounded"></div>
                                           <div className="flex gap-2">
                                                <div className="h-8 w-20 bg-primary-100 rounded"></div>
                                                <div className="h-8 w-8 bg-gray-100 rounded"></div>
                                           </div>
                                      </div>
                                      <div className="space-y-4">
                                           {[1, 2, 3, 4].map(i => (
                                               <div key={i} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                    <div className="flex items-center gap-3">
                                                         <div className="w-8 h-8 rounded-full bg-gray-200"></div>
                                                         <div className="h-3 w-24 bg-gray-200 rounded"></div>
                                                    </div>
                                                    <div className="h-3 w-8 bg-green-200 rounded"></div>
                                               </div>
                                           ))}
                                      </div>
                                  </div>
                              </div>
                         </motion.div>
                     </div>

                     {/* Spotlight 2: Parent Engagement */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center lg:flex-row-reverse">
                         <motion.div 
                             className="lg:order-2"
                             initial={{ opacity: 0, x: 50 }}
                             whileInView={{ opacity: 1, x: 0 }}
                             viewport={{ once: true }}
                         >
                             <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center text-purple-600 mb-6">
                                 <Users size={32} />
                             </div>
                             <h2 className="text-3xl font-bold text-gray-900 mb-6">Seamless Parent Engagement</h2>
                             <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                 Keep parents connected and informed. From checking daily attendance to paying school fees securely online, everything is just a click away.
                             </p>
                             <ul className="space-y-3">
                                 {["Real-time Performance Updates", "Secure Online Fee Payments", "Direct Communication Channels"].map((item, i) => (
                                     <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                         <CheckCircle size={18} className="text-green-500" /> {item}
                                     </li>
                                 ))}
                             </ul>
                         </motion.div>
                         <div className="lg:order-1 relative">
                             {/* Decorative blob */}
                             <div className="absolute top-0 right-0 w-64 h-64 bg-purple-100 rounded-full blur-3xl opacity-50 -z-10"></div>
                             <motion.div
                                 initial={{ opacity: 0, scale: 0.95 }}
                                 whileInView={{ opacity: 1, scale: 1 }}
                                 viewport={{ once: true }}
                                 className="bg-white p-2 rounded-3xl shadow-xl border border-gray-100"
                             >
                                  <div className="bg-gray-100 rounded-2xl h-[400px] w-full flex items-center justify-center relative overflow-hidden">
                                       <CreditCard size={64} className="text-gray-300 mb-4" />
                                       <div className="absolute bottom-10 left-10 right-10 bg-white p-4 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                 <div className="w-10 h-10 rounded-full bg-primary-100 flex items-center justify-center text-primary-600">
                                                     <Shield size={20} />
                                                 </div>
                                                 <div>
                                                     <div className="text-xs text-gray-500">Payment Status</div>
                                                     <div className="font-bold text-green-600">Successful</div>
                                                 </div>
                                            </div>
                                            <div className="font-bold text-gray-900">₦45,000</div>
                                       </div>
                                  </div>
                             </motion.div>
                         </div>
                     </div>

                     {/* Spotlight 3: AI Tools */}
                     <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                         <motion.div
                             initial={{ opacity: 0, x: -50 }}
                             whileInView={{ opacity: 1, x: 0 }}
                             viewport={{ once: true }}
                         >
                             <div className="w-16 h-16 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6">
                                 <Cpu size={32} />
                             </div>
                             <h2 className="text-3xl font-bold text-gray-900 mb-6">AI-Powered Teaching Assistant</h2>
                             <p className="text-lg text-gray-600 leading-relaxed mb-6">
                                 Empower your teachers with cutting-edge AI. Generate lesson plans, mark theoretical questions automatically, and get personalized student insights.
                             </p>
                             <ul className="space-y-3">
                                 {["AI Exam Marking (WAEC Style)", "Lesson Note Generation", "Student Performance Prediction"].map((item, i) => (
                                     <li key={i} className="flex items-center gap-3 text-gray-700 font-medium">
                                         <CheckCircle size={18} className="text-green-500" /> {item}
                                     </li>
                                 ))}
                             </ul>
                         </motion.div>
                        <motion.div
                             initial={{ opacity: 0, scale: 0.95 }}
                             whileInView={{ opacity: 1, scale: 1 }}
                             viewport={{ once: true }}
                             className="bg-white p-2 rounded-3xl shadow-xl border border-gray-100"
                         >
                              <div className="bg-gray-900 rounded-2xl h-[400px] w-full flex flex-col relative overflow-hidden p-6">
                                   <div className="flex items-center gap-2 mb-6 border-b border-gray-800 pb-4">
                                       <div className="w-3 h-3 rounded-full bg-red-400"></div>
                                       <div className="w-3 h-3 rounded-full bg-yellow-400"></div>
                                       <div className="w-3 h-3 rounded-full bg-green-400"></div>
                                       <span className="ml-2 text-xs text-gray-500 font-mono">ai_marker.exe</span>
                                   </div>
                                   <div className="font-mono text-sm text-green-400 space-y-2">
                                       <p>&gt; Analyzing student response...</p>
                                       <p>&gt; Context: Biology, Cell Theory</p>
                                       <p>&gt; Comparing with marking scheme...</p>
                                       <p className="text-blue-400">&gt; Score Awarded: 8/10</p>
                                       <p className="text-gray-500">&gt; Feedback: Good understanding, but missed the role of mitochondria.</p>
                                   </div>
                              </div>
                         </motion.div>
                     </div>

                 </div>
            </section>

            {/* 4. Workflow Section */}
            <section className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                     <div className="text-center mb-16">
                         <h2 className="text-3xl font-bold text-gray-900">How GT-SchoolHub Works</h2>
                         <p className="mt-4 text-gray-600">Get up and running in 4 simple steps.</p>
                     </div>
                     
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                          {/* Connector Line (Desktop) */}
                          <div className="hidden md:block absolute top-12 left-[12.5%] right-[12.5%] h-0.5 bg-gray-100 -z-10"></div>
                          
                          {[
                              { title: "Register", desc: "Create your school account securely.", icon: Lock },
                              { title: "Onboard", desc: "Add staff, students, and classes.", icon: Users },
                              { title: "Manage", desc: "Track attendance, results, and fees.", icon: Layers },
                              { title: "Connect", desc: "Parents login to view progress.", icon: Globe }
                          ].map((step, i) => (
                              <motion.div
                                  key={i}
                                  initial={{ opacity: 0, y: 20 }}
                                  whileInView={{ opacity: 1, y: 0 }}
                                  viewport={{ once: true }}
                                  transition={{ delay: i * 0.2 }}
                                  className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm text-center relative"
                              >
                                  <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-6 border-4 border-white shadow-sm font-bold text-xl">
                                      {i + 1}
                                  </div>
                                  <h3 className="font-bold text-lg text-gray-900 mb-2">{step.title}</h3>
                                  <p className="text-sm text-gray-600">{step.desc}</p>
                              </motion.div>
                          ))}
                     </div>
                </div>
            </section>

            {/* 5. Comparison Preview */}
            <section className="py-24 bg-gray-900 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
                          <div>
                               <h2 className="text-3xl font-bold mb-6">Scales With Your Growth</h2>
                               <p className="text-lg text-gray-400 mb-8 leading-relaxed">
                                   Whether you are a small nursery or a large secondary school, we have a plan that fits. Start for free and upgrade as you need more power.
                               </p>
                               <ul className="space-y-4 mb-10">
                                   {[
                                       "Free Plan: Essential records & attendance",
                                       "Standard: Parent portal & online results",
                                       "Premium: AI tools & advanced analytics"
                                   ].map((item, i) => (
                                       <li key={i} className="flex items-center gap-3 text-gray-300">
                                           <CheckCircle size={20} className="text-primary-400" /> {item}
                                       </li>
                                   ))}
                               </ul>
                               <Link to="/pricing">
                                   <button className="px-8 py-3 rounded-full bg-primary-600 text-white font-bold hover:bg-primary-500 transition-all">
                                       Upgrade Your Plan
                                   </button>
                               </Link>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4">
                               <div className="bg-gray-800 p-6 rounded-2xl border border-gray-700 opacity-60 transform scale-95">
                                    <div className="text-gray-400 font-bold mb-2">Basic</div>
                                    <div className="text-2xl font-bold mb-4">Free</div>
                                    <div className="h-1 w-full bg-gray-700 rounded mb-2"></div>
                                    <div className="h-1 w-2/3 bg-gray-700 rounded"></div>
                               </div>
                               <div className="bg-gradient-to-br from-primary-900 to-primary-800 p-6 rounded-2xl border border-primary-500 shadow-xl transform scale-105 z-10 relative">
                                    <div className="absolute top-0 right-0 bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-lg">POPULAR</div>
                                    <div className="text-white font-bold mb-2">Premium</div>
                                    <div className="text-2xl font-bold mb-4">₦500<span className="text-sm font-normal opacity-70">/student</span></div>
                                    <div className="space-y-2">
                                         <div className="flex items-center gap-2 text-xs text-primary-200"><CheckCircle size={12}/> AI Marking</div>
                                         <div className="flex items-center gap-2 text-xs text-primary-200"><CheckCircle size={12}/> Finance</div>
                                         <div className="flex items-center gap-2 text-xs text-primary-200"><CheckCircle size={12}/> CBT Exams</div>
                                    </div>
                               </div>
                          </div>
                     </div>
                </div>
            </section>

            {/* 6. Trust & Security */}
            <section className="py-16 bg-white border-b border-gray-100">
                 <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                      <div className="flex flex-wrap justify-center gap-8 md:gap-16 items-center opacity-70 grayscale hover:grayscale-0 transition-all duration-500">
                           <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
                               <Shield size={24} className="text-primary-600" /> Secure Data
                           </div>
                           <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
                               <Lock size={24} className="text-primary-600" /> Encrypted Payments
                           </div>
                           <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
                               <Award size={24} className="text-primary-600" /> 99.9% Uptime
                           </div>
                           <div className="flex items-center gap-2 font-bold text-xl text-gray-800">
                               <Users size={24} className="text-primary-600" /> Verified Schools
                           </div>
                      </div>
                 </div>
            </section>

            {/* 7. Final Call-To-Action */}
            <section className="py-24 relative overflow-hidden bg-primary-600">
                 <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 filter contrast-125 brightness-100"></div>
                 <div className="absolute inset-0 bg-gradient-to-r from-primary-900 via-primary-700 to-primary-500 opacity-90"></div>
                 
                 <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
                      <motion.h2 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl md:text-5xl font-extrabold mb-8 tracking-tight"
                      >
                          Ready to Experience the Future of School Management?
                      </motion.h2>
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.1 }}
                        className="text-xl text-primary-100 mb-12 max-w-2xl mx-auto"
                      >
                          Join hundreds of forward-thinking schools transforming education with GT-SchoolHub.
                      </motion.p>
                      
                      <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: 0.2 }}
                        className="flex flex-col sm:flex-row gap-5 justify-center"
                      >
                          <Link to="/register-school">
                              <button className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-primary-900 font-bold text-lg shadow-2xl hover:bg-gray-100 transition-all hover:scale-105">
                                  Create Free Account
                              </button>
                          </Link>
                          <Link to="/contact">
                              <button className="w-full sm:w-auto px-10 py-5 rounded-full bg-transparent border-2 border-white text-white font-bold text-lg hover:bg-white/10 transition-all">
                                  Request Demo
                              </button>
                          </Link>
                      </motion.div>
                 </div>
            </section>

        </div>
    );
};

export default Features;
