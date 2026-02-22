import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle, BarChart, Users, Shield, BookOpen, Laptop, Database } from 'lucide-react';
import schoolBg from '../../assets/school_bg.mp4';
import SEO from '../../components/SEO';

const FeaturesSection = React.lazy(() => import('../../components/sections/FeaturesSection'));
const ProblemSolution = React.lazy(() => import('../../components/sections/ProblemSolution'));
const KeyFeaturesGrid = React.lazy(() => import('../../components/sections/KeyFeaturesGrid'));

const Home = () => {
  return (
    <div className="overflow-hidden bg-milk">
      <SEO 
        title="Intelligent School Management System"
        description="Empower your school with GT-SchoolHub's intelligent digital tools. Streamline operations, boost performance, and connect your community with our secure school management platform."
        keywords="school management software, educational management, student portal, result processing system, e-learning platform Nigeria"
      />
      {/* 1. Hero Section */}
      <section className="relative pt-20 pb-32 lg:pt-32 lg:pb-40 overflow-hidden">
        {/* Background Video with Performance Focus */}
        <div className="absolute inset-0 w-full h-full overflow-hidden z-0 bg-milk">
             <video
                key={schoolBg}
                autoPlay
                loop
                muted
                playsInline
                preload="metadata"
                className="absolute top-1/2 left-1/2 min-w-full min-h-full object-cover transform -translate-x-1/2 -translate-y-1/2 opacity-60 transition-opacity duration-1000"
             >
                <source src={schoolBg} type="video/mp4" />
             </video>
             {/* Overlay to ensure text readability - Milk tint */}
             <div className="absolute inset-0 bg-gradient-to-b from-milk/95 via-milk/80 to-milk/95"></div>
        </div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-5xl mx-auto">
            <div className="animate-fadeInUp">
               <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary-50 text-primary-700 text-sm font-semibold mb-8 border border-primary-100 shadow-sm transition-all hover:bg-primary-100">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-primary-500"></span>
                  </span>
                  New Era of School Management
               </span>
              <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight text-gray-900 mb-8 leading-[1.1] animate-fadeInUp animation-delay-200">
                Empower Your School with <br className="hidden md:block" />
                <span className="text-primary-600">Intelligent Digital Tools</span>
              </h1>
              <p className="text-xl text-gray-700 mb-12 max-w-3xl mx-auto leading-relaxed font-medium animate-fadeInUp animation-delay-400">
                Streamline operations, boost student performance, and connect your entire school community with one intuitive, secure platform.
              </p>
              <div className="flex flex-col sm:flex-row gap-5 justify-center items-center animate-fadeInUp animation-delay-400">
                <Link to="/register-school" className="w-full sm:w-auto" aria-label="Register your school for free">
                    <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-primary-600 text-white font-bold text-lg shadow-xl hover:shadow-2xl hover:bg-primary-700 transition-all transform hover:-translate-y-1 border border-transparent">
                        Get Started Free
                    </button>
                </Link>
                <Link to="/contact" className="w-full sm:w-auto" aria-label="Request a demonstration of the platform">
                    <button className="w-full sm:w-auto px-8 py-4 rounded-full bg-white text-primary-900 font-bold text-lg border border-primary-100 shadow-md hover:bg-primary-50 hover:border-primary-200 transition-all flex items-center justify-center gap-2">
                        Request a Demo <ArrowRight size={20} className="text-primary-600" aria-hidden="true" />
                    </button>
                </Link>
              </div>
            </div>
          </div>
          
          {/* Hero Visual Mockup */}
          <div className="mt-20 relative group animate-fadeInUp animation-delay-400">
             <div className="absolute -inset-1 bg-gradient-to-r from-primary-500 to-primary-300 rounded-3xl blur opacity-25 group-hover:opacity-50 transition duration-1000"></div>
             <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-primary-100 bg-white transform hover:scale-[1.01] transition-transform duration-700">
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
                                      <div className="h-32 bg-white rounded-xl shadow-sm border border-primary-50 p-4 relative overflow-hidden group/card" role="img" aria-label="Analytics visualization">
                                          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:scale-110 transition-transform"><BarChart size={40} className="text-primary-600" aria-hidden="true" /></div>
                                          <div className="h-2 w-16 bg-primary-100 rounded mb-2"></div>
                                          <div className="h-8 w-24 bg-gray-800 rounded mb-2"></div>
                                      </div>
                                      <div className="h-32 bg-white rounded-xl shadow-sm border border-primary-50 p-4 relative overflow-hidden group/card" role="img" aria-label="User management visualization">
                                           <div className="absolute top-0 right-0 p-4 opacity-10 group-hover/card:scale-110 transition-transform"><Users size={40} className="text-primary-600" aria-hidden="true" /></div>
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
             </div>
          </div>
        </div>
      </section>

      {/* 2. Visual Storytelling Section */}
      <section className="py-24 bg-white relative overflow-hidden border-t border-primary-50">
         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
             <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                 <div className="animate-fadeInUp">
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
                 </div>
                 <div className="relative animate-fadeInUp animation-delay-200">
                     <div className="grid grid-cols-2 gap-4">
                         <div className="space-y-4 mt-8">
                             <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-all hover:scale-105">
                                 <Laptop className="text-primary-600 mb-4 h-8 w-8" />
                                 <h3 className="font-bold text-lg mb-2 text-gray-900">Smart Admin</h3>
                                 <p className="text-sm text-gray-500">Automate fees, attendance & admissions.</p>
                             </div>
                             <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-all hover:scale-105">
                                 <BookOpen className="text-primary-500 mb-4 h-8 w-8" />
                                 <h3 className="font-bold text-lg mb-2 text-gray-900">E-Learning</h3>
                                 <p className="text-sm text-gray-500">Video lessons & digital libraries.</p>
                             </div>
                         </div>
                         <div className="space-y-4">
                             <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-all hover:scale-105">
                                 <Users className="text-primary-600 mb-4 h-8 w-8" />
                                 <h3 className="font-bold text-lg mb-2 text-gray-900">Parent Portal</h3>
                                 <p className="text-sm text-gray-500">Seamless communication & tracking.</p>
                             </div>
                             <div className="bg-white p-6 rounded-2xl border border-primary-100 shadow-sm hover:shadow-md transition-all hover:scale-105">
                                 <BarChart className="text-primary-500 mb-4 h-8 w-8" />
                                 <h3 className="font-bold text-lg mb-2 text-gray-900">Analytics</h3>
                                 <p className="text-sm text-gray-500">Data-driven insights for decisions.</p>
                             </div>
                         </div>
                     </div>
                 </div>
             </div>
         </div>
      </section>

      {/* 3. Who is it for? */}
      <React.Suspense fallback={<div className="h-96 bg-milk animate-pulse" />}>
          <FeaturesSection />
      </React.Suspense>

      {/* 4. Problem + Solution */}
      <React.Suspense fallback={<div className="h-96 bg-white animate-pulse" />}>
          <ProblemSolution />
      </React.Suspense>

      <React.Suspense fallback={<div className="h-96 bg-milk animate-pulse" />}>
          <KeyFeaturesGrid />
      </React.Suspense>

      {/* 6. Simple Flow */}
      <section className="py-24 bg-white relative">
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
               <div className="text-center mb-16">
                   <h2 className="text-3xl font-bold text-gray-900">Get Started in 3 Simple Steps</h2>
               </div>
               
               <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative text-center">
                   {[
                       { step: "01", title: "Register Your School", desc: "Create your free account and set up your school profile in minutes." },
                       { step: "02", title: "Add Your Data", desc: "Upload staff, students, and classes easily using our bulk tools." },
                       { step: "03", title: "Go Digital", desc: "Start managing attendance, results, and payments immediately." }
                   ].map((item, i) => (
                       <div key={i} className="relative z-10 transition-transform hover:scale-105 duration-300">
                           <div className="w-24 h-24 mx-auto bg-white rounded-full border-4 border-primary-100 flex items-center justify-center text-2xl font-bold text-primary-600 mb-6 shadow-sm">
                               {item.step}
                           </div>
                           <h3 className="text-xl font-bold text-gray-900 mb-3">{item.title}</h3>
                           <p className="text-gray-600">{item.desc}</p>
                       </div>
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
              <h2 className="text-4xl font-bold text-white mb-8 tracking-tight animate-fadeInUp">
                  Ready to transform your school?
              </h2>
              <p className="text-xl text-primary-100 mb-12 animate-fadeInUp animation-delay-200">
                  Join hundreds of schools that have improved efficiency and student outcomes with Advance SMS.
              </p>
              <div className="flex flex-col sm:flex-row justify-center gap-5 animate-fadeInUp animation-delay-400">
                   <Link to="/register-school">
                        <button className="w-full sm:w-auto px-10 py-5 rounded-full bg-white text-primary-900 font-bold text-lg shadow-2xl hover:bg-gray-50 transition-all transform hover:scale-105 active:scale-95">
                            Create Free School Account
                        </button>
                   </Link>
                   <Link to="/contact">
                        <button className="w-full sm:w-auto px-10 py-5 rounded-full bg-transparent border border-primary-400 text-white font-bold text-lg hover:bg-primary-800 transition-all transform hover:scale-105 active:scale-95">
                            Contact Us
                        </button>
                   </Link>
              </div>
          </div>
      </section>

    </div>
  );
};

export default Home;
