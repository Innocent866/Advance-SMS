import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  CheckCircle,
  Users,
  Shield,
  Lightbulb,
  TrendingUp,
  Heart,
  Server,
  BookOpen,
  UserCheck,
  CreditCard,
  Activity,
  FileText,
  Cpu,
  BarChart3,
  Quote
} from 'lucide-react';

import schoolBg from '../../assets/school_bg.mp4';
import founderImg from '../../assets/founder.jpeg';

// Animation variants
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

const About = () => {
  return (
    <div className="bg-milk overflow-hidden">
      
      {/* 1. Hero Intro */}
      <section className="relative py-20 lg:py-32 bg-white overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 filter contrast-125 brightness-100"></div>
         <div className="absolute top-0 right-0 w-1/2 h-full bg-primary-50/50 rounded-l-full blur-3xl transform translate-x-1/3 z-0"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
             <motion.div
                initial="hidden"
                animate="visible"
                variants={staggerContainer}
                className="max-w-4xl mx-auto"
             >
                <motion.h1 variants={fadeInUp} className="text-5xl md:text-7xl font-extrabold text-gray-900 mb-6 tracking-tight">
                    About <span className="text-primary-600">GT-SchoolHub</span>
                </motion.h1>
                <motion.p variants={fadeInUp} className="text-xl text-gray-600 mb-10 leading-relaxed max-w-2xl mx-auto">
                    Building the future of education through smart technology. We empower schools to transcend traditional boundaries and create connected, digital-first learning environments.
                </motion.p>
                <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link to="/register-school">
                        <button className="px-8 py-4 rounded-full bg-primary-600 text-white font-bold text-lg shadow-lg hover:bg-primary-700 transition-all hover:-translate-y-1">
                            Get Started
                        </button>
                    </Link>
                    <Link to="/contact">
                         <button className="px-8 py-4 rounded-full bg-white text-primary-900 font-bold text-lg border border-primary-100 shadow-sm hover:bg-primary-50 transition-all flex items-center gap-2 justify-center">
                            Request Demo <ArrowRight size={20} />
                        </button>
                    </Link>
                </motion.div>
             </motion.div>
             
             {/* Abstract Dashboard/Tech Visual */}
             <motion.div 
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 1 }}
                className="mt-16 relative mx-auto max-w-5xl"
             >
                  <div className="absolute inset-0 bg-primary-600 blur-[100px] opacity-10 rounded-full"></div>
                  <div className="relative rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white aspect-[16/9] md:aspect-[21/9] flex items-center justify-center">
                       {/* Placeholder for "Modern school technology or dashboard preview" */}
                        <div className="text-center p-8">
                            <Cpu size={64} className="text-primary-200 mx-auto mb-4" />
                            <p className="text-gray-400 font-medium">GT-SchoolHub Dashboard Logic</p>
                        </div>
                         {/* Decorative UI elements overlay */}
                         <div className="absolute top-10 left-10 p-4 bg-white/80 backdrop-blur rounded-xl shadow-lg border border-white">
                             <div className="flex items-center gap-3">
                                 <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                 <span className="text-sm font-bold text-gray-700">System Online</span>
                             </div>
                         </div>
                         <div className="absolute bottom-10 right-10 p-4 bg-primary-600 text-white rounded-xl shadow-lg">
                             <div className="flex items-center gap-3">
                                 <Users size={18} />
                                 <span className="text-sm font-bold">50k+ Active Students</span>
                             </div>
                         </div>
                  </div>
             </motion.div>
        </div>
      </section>

      {/* 2. Mission + Vision */}
      <section className="py-24 bg-milk">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-20">
                  <motion.div 
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white p-10 rounded-3xl shadow-sm border border-primary-50 hover:shadow-md transition-all group"
                  >
                      <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600 mb-6 group-hover:scale-110 transition-transform">
                          <Lightbulb size={32} />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Mission</h2>
                      <p className="text-lg text-gray-600 leading-relaxed">
                          Empower schools with innovative digital solutions that simplify education management. We strive to remove administrative burdens, allowing educators to focus purely on student growth.
                      </p>
                  </motion.div>

                   <motion.div 
                    initial={{ opacity: 0, x: 30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white p-10 rounded-3xl shadow-sm border border-primary-50 hover:shadow-md transition-all group"
                  >
                       <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center text-orange-600 mb-6 group-hover:scale-110 transition-transform">
                          <TrendingUp size={32} />
                      </div>
                      <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Vision</h2>
                      <p className="text-lg text-gray-600 leading-relaxed">
                          Become one of Africa’s leading education technology brands transforming schools into connected learning environments. We envision a future where every school is a smart school.
                      </p>
                  </motion.div>
              </div>
          </div>
      </section>

      {/* 3. Story Section */}
      <section className="py-24 bg-white relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-full bg-primary-900/5"></div>
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
               <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                   <motion.div
                       initial={{ opacity: 0 }}
                       whileInView={{ opacity: 1 }}
                       viewport={{ once: true }}
                   >
                        <span className="text-primary-600 font-bold uppercase tracking-wider text-sm mb-2 block">Who We Are</span>
                        <h2 className="text-4xl font-extrabold text-gray-900 mb-8">Our Story</h2>
                        <div className="prose prose-lg text-gray-600">
                            <p className="mb-6">
                                Goldima Tech started from a simple yet powerful passion: to leverage technology for community growth. We observed that many schools were struggling with outdated manual records, delayed result processing, and communication gaps that hindered student potential.
                            </p>
                            <p>
                                We decided to build a solution. Not just software, but a comprehensive platform designed to solve these real-world challenges. GT-SchoolHub was born from a commitment to progress—bringing digital transformation to the corridors of education where it matters most.
                            </p>
                        </div>
                   </motion.div>
                   <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                   >
                        <div className="absolute -inset-4 bg-gradient-to-tr from-primary-600 to-primary-300 rounded-[2rem] opacity-20 blur-lg"></div>
                        <div className="relative h-[500px] w-full bg-gray-900 rounded-[2rem] overflow-hidden shadow-2xl flex items-center justify-center">
                             {/* Inspiring Background Image Placeholder */}
                             <div className="absolute inset-0 bg-primary-900 opacity-60 z-10"></div>
                             <img 
                                src="https://images.pexels.com/photos/5212345/pexels-photo-5212345.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1"
                                alt="Students learning" // Generic inspiring image
                                className="absolute inset-0 w-full h-full object-cover"
                             />
                             <div className="relative z-20 text-center p-8 max-w-sm">
                                  <Quote size={48} className="text-white/80 mx-auto mb-6" />
                                  <p className="text-white text-xl font-light italic">"Technology is not just a tool. It empowers people to do what they do best, better."</p>
                             </div>
                        </div>
                   </motion.div>
               </div>
           </div>
      </section>

      {/* 4. Who We Serve */}
      <section className="py-24 bg-milk">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-16">
                   <h2 className="text-3xl font-bold text-gray-900">Who We Serve</h2>
                   <p className="mt-4 text-gray-600 max-w-2xl mx-auto">GT-SchoolHub is designed to meet the diverse needs of the entire educational ecosystem.</p>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                   {[
                       { icon: Shield, title: "Administrators", desc: "For easy management of staff, finances, and operations." },
                       { icon: BookOpen, title: "Teachers", desc: "Tools to plan lessons, grade results, and track attendance." },
                       { icon: Users, title: "Students", desc: "Access to learning materials, results, and progress tracking." },
                       { icon: Heart, title: "Parents", desc: "Real-time updates on their child's performance and fees." }
                   ].map((item, idx) => (
                       <motion.div
                          key={idx}
                          initial={{ opacity: 0, y: 20 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          viewport={{ once: true }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-white p-8 rounded-2xl shadow-sm border border-primary-50 text-center hover:translate-y-[-5px] transition-all duration-300"
                       >
                           <div className="w-16 h-16 mx-auto bg-primary-50 rounded-full flex items-center justify-center text-primary-600 mb-6">
                               <item.icon size={28} />
                           </div>
                           <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                           <p className="text-gray-600 text-sm">{item.desc}</p>
                       </motion.div>
                   ))}
               </div>
          </div>
      </section>

      {/* 5. What We Offer */}
      <section className="py-24 bg-white">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-16">
                   <h2 className="text-3xl font-bold text-gray-900">An All-In-One Solution</h2>
                   <p className="mt-4 text-gray-600">Everything you need to run a modern school.</p>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                   {[
                       { icon: Users, title: "Student & Staff Management" },
                       { icon: UserCheck, title: "Attendance Tracking" },
                       { icon: BarChart3, title: "Results & Assessment" },
                       { icon: CreditCard, title: "Fee Payments & Portal" },
                       { icon: Activity, title: "Health & Medical Records" },
                       { icon: FileText, title: "Learning Materials" },
                       { icon: Cpu, title: "AI-Assisted Marking" },
                       { icon: Server, title: "Reports & Analytics" }
                   ].map((feat, i) => (
                       <motion.div
                           key={i}
                           initial={{ opacity: 0, scale: 0.9 }}
                           whileInView={{ opacity: 1, scale: 1 }}
                           viewport={{ once: true }}
                           className="flex items-center gap-4 p-4 rounded-xl border border-gray-100 bg-gray-50 hover:bg-white hover:shadow-md transition-all"
                       >
                           <div className="flex-shrink-0 w-10 h-10 rounded-lg bg-primary-600 text-white flex items-center justify-center">
                               <feat.icon size={20} />
                           </div>
                           <span className="font-semibold text-gray-800 text-sm">{feat.title}</span>
                       </motion.div>
                   ))}
               </div>
           </div>
      </section>

      {/* 6. Values Section */}
      <section className="py-24 bg-primary-900 text-white relative overflow-hidden">
           <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="text-center mb-16">
                     <h2 className="text-3xl font-bold">Our Core Values</h2>
                     <p className="mt-4 text-primary-200">The pillars that define our brand and promise.</p>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-8">
                    {[
                        { title: "Innovation", icon: Lightbulb },
                        { title: "Simplicity", icon: CheckCircle },
                        { title: "Growth", icon: TrendingUp },
                        { title: "Trust", icon: Shield },
                        { title: "Impact", icon: Heart }
                    ].map((val, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur border border-white/10 hover:bg-white/20 transition-colors"
                        >
                            <val.icon size={32} className="mx-auto mb-4 text-primary-300" />
                            <h3 className="font-bold text-lg">{val.title}</h3>
                        </motion.div>
                    ))}
                </div>
           </div>
      </section>

      {/* 7. Founder Spotlight */}
      <section className="py-24 bg-milk">
           <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
               <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-[2.5rem] p-8 md:p-12 shadow-xl border border-primary-50 relative overflow-hidden"
               >
                   <div className="absolute top-0 right-0 w-64 h-64 bg-primary-50 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3"></div>
                   
                   <div className="flex flex-col md:flex-row gap-10 items-center relative z-10">
                        <div className="w-48 h-48 md:w-64 md:h-64 flex-shrink-0 bg-gray-200 rounded-full overflow-hidden border-4 border-primary-100 shadow-lg">
                            <img src={founderImg} alt="Goldima Innocent" className="w-full h-full object-cover" />
                        </div>
                        <div className="text-center md:text-left">
                             <div className="inline-block px-4 py-1.5 rounded-full bg-primary-100 text-primary-700 text-sm font-bold mb-4">Founder Spotlight</div>
                             <h2 className="text-3xl font-bold text-gray-900 mb-2">Goldima Innocent</h2>
                             <p className="text-primary-600 font-medium mb-6">Founder, Goldima Tech</p>
                             <p className="text-gray-600 leading-relaxed mb-6 italic">
                                 "I built GT-SchoolHub because I believe every child deserves an education powered by the best tools available. As a web developer and educator, my goal is to bridge the digital divide and help our schools grow."
                             </p>
                             <div className="flex gap-4 justify-center md:justify-start">
                                  {/* Social placeholders could go here */}
                             </div>
                        </div>
                   </div>
               </motion.div>
           </div>
      </section>

      {/* 8. Testimonials (Placeholder) */}
      <section className="py-24 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <h2 className="text-3xl font-bold text-center text-gray-900 mb-16">Trusted by the Community</h2>
               <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { quote: "Finally, a system that actually simplifies our work instead of complicating it.", role: "School Administrator" },
                        { quote: "I love being able to check my child's results and pay fees from my phone.", role: "Parent" },
                        { quote: "Uploading lesson notes and tracking attendance has never been this easy.", role: "Teacher" }
                    ].map((t, i) => (
                        <motion.div
                           key={i}
                           initial={{ opacity: 0 }}
                           whileInView={{ opacity: 1 }}
                           viewport={{ once: true }}
                           className="bg-milk p-8 rounded-2xl border border-primary-50 relative"
                        >
                            <Quote size={40} className="text-primary-200 absolute top-6 right-6" />
                            <p className="text-gray-700 italic mb-6 relative z-10">"{t.quote}"</p>
                            <div className="font-bold text-primary-700">- {t.role}</div>
                        </motion.div>
                    ))}
               </div>
          </div>
      </section>

      {/* 9. CTA + Contact */}
      <section className="py-24 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-primary-800 to-primary-600"></div>
          <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 filter contrast-125 brightness-100"></div>
          
          <div className="max-w-4xl mx-auto px-4 relative z-10 text-center text-white">
               <h2 className="text-4xl font-bold mb-6">Ready to Transform Your School?</h2>
               <p className="text-xl text-primary-100 mb-10">Join the Goldima Tech family and experience the future of school management today.</p>
               
               <div className="flex flex-col sm:flex-row gap-5 justify-center mb-12">
                   <Link to="/register-school">
                       <button className="w-full sm:w-auto px-10 py-4 rounded-full bg-white text-primary-900 font-bold text-lg shadow-xl hover:bg-gray-100 transition-all">
                           Create Free School Account
                       </button>
                   </Link>
                   <Link to="/contact">
                       <button className="w-full sm:w-auto px-10 py-4 rounded-full bg-transparent border-2 border-primary-200 text-white font-bold text-lg hover:bg-primary-700 transition-all">
                           Contact Us
                       </button>
                   </Link>
               </div>
               
               <div className="pt-10 border-t border-primary-500/30">
                    <p className="text-primary-200 font-medium">Get in touch directly:</p>
                    <a href="mailto:goldima@gt-schoolhub.com.ng" className="text-2xl font-bold text-white hover:text-primary-200 transition-colors mt-2 inline-block">
                        goldima@gt-schoolhub.com.ng
                    </a>
               </div>
          </div>
      </section>

    </div>
  );
};

export default About;
