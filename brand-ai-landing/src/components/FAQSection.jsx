import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Minus, Plus } from 'lucide-react';

const faqs = [
  {
    question: "What is the Gaod Early Access Program?",
    answer: "The Gaod Early Access Program allows a select group of users to experience our domain-specific AI tools before the public launch. Participants get exclusive access to new features and direct channels to provide feedback."
  },
  {
    question: "How can I join the Early Access Program?",
    answer: "You can request access by clicking the 'Request early access' button in the navigation bar. We review applications on a rolling basis and prioritize teams and agencies with immediate use cases."
  },
  {
    question: "How do I get in touch?",
    answer: "For support inquiries, please email support@gaod.ai. For enterprise sales or partnership opportunities, contact sales@gaod.ai."
  }
];

const FAQSection = () => {
  const [activeIndex, setActiveIndex] = useState(null);

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="w-full max-w-6xl mx-auto px-4 py-24 border-t border-gray-200">
      <div className="flex flex-col md:flex-row gap-16">
        {/* Left Column: Header (Optional, keeping it simple as per reference) */}
        <div className="w-full md:w-1/3">
             {/* Can add title here if needed, but reference shows clean layout */}
        </div>

        {/* Right Column: Accordion */}
        <div className="w-full md:w-2/3">
            {faqs.map((faq, index) => (
                <div key={index} className="border-b border-gray-200 last:border-0">
                    <button 
                        onClick={() => toggleFAQ(index)}
                        className="w-full py-8 flex justify-between items-center text-left hover:text-gray-600 transition-colors group"
                    >
                        <span className="text-xl md:text-2xl font-serif text-[#1A1A1A] group-hover:text-gray-600 transition-colors">
                            {faq.question}
                        </span>
                        <span className="ml-4 flex-shrink-0 text-gray-400 font-light text-2xl">
                            {activeIndex === index ? <Minus className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
                        </span>
                    </button>
                    <AnimatePresence>
                        {activeIndex === index && (
                            <motion.div
                                initial={{ height: 0, opacity: 0 }}
                                animate={{ height: "auto", opacity: 1 }}
                                exit={{ height: 0, opacity: 0 }}
                                transition={{ duration: 0.3, ease: "easeInOut" }}
                                className="overflow-hidden"
                            >
                                <p className="pb-8 text-gray-500 leading-relaxed max-w-2xl">
                                    {faq.answer}
                                </p>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            ))}
        </div>
      </div>
    </section>
  );
};

export default FAQSection;