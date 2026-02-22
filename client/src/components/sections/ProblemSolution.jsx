import React from 'react';
import { motion } from 'framer-motion';
import { CheckCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

const ProblemSolution = () => {
    return (
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
    );
};

export default ProblemSolution;
