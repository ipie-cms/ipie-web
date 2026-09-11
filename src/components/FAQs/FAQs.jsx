import React, { useState } from 'react';
import Container from '../Container/Container';


const FAQItem = ({ question, answer, isOpen, onClick }) => (
  <Container>
  <div className="bg-blue-50 rounded-lg border border-blue-200 overflow-hidden transition-all duration-300">
    <button
      onClick={onClick}
      className="w-full px-8 py-3 flex justify-between items-center text-left hover:bg-blue-100 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-300"
      aria-expanded={isOpen}
    >
      <span className="text-lg font-semibold text-gray-900">{question}</span>
      <span className="text-3xl text-gray-600 ml-4 flex-shrink-0 font-light">
        {isOpen ? '−' : '+'}
      </span>
    </button>
    
    <div 
      className={`overflow-hidden transition-all duration-300 ease-in-out ${
        isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
      }`}
    >
      <div className="px-8 pb-6 text-gray-600 leading-relaxed text-base">
        {answer}
      </div>
    </div>
  </div>
  </Container>
);

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(0);

  const faqData = [
    {
      question: 'What is iPIE?',
      answer: 'IPIE is a unified digital platform that brings together all IBC ecosystem stakeholders, enabling secure case management, seamless collaboration, transparent workflows, and efficient resolution processes through a single integrated interface.'
    },
    {
      question: 'How It Works?',
      answer: 'The platform provides a centralized dashboard where stakeholders can access case information, submit documents, track progress, and communicate securely. Users can log in with their credentials to access role-specific features and tools.'
    },
    {
      question: 'Does iPIE charge any fees for its services?',
      answer: 'The platform operates on a subscription-based model with different tiers based on user roles and requirements. Basic access is provided for essential functions, while premium features are available for advanced users.'
    },
    {
      question: 'Is iPIE secure?',
      answer: 'Yes, iPIE employs industry-standard security measures including end-to-end encryption, secure authentication, role-based access control, and regular security audits to protect all data and transactions.'
    }
  ];

  const handleToggle = (index) => {
    setOpenIndex(openIndex === index ? -1 : index);
  };

  return (
    <Container>
    <div className=" bg-white flex flex-col">

      {/* FAQ Section */}
      <div className="flex-grow py-[50px] px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <h2 className="text-4xl font-bold text-center text-gray-900 mb-12">
            Frequently Asked Questions (FAQ's)
          </h2>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqData.map((faq, index) => (
              <FAQItem
                key={index}
                question={faq.question}
                answer={faq.answer}
                isOpen={openIndex === index}
                onClick={() => handleToggle(index)}
              />
            ))}
          </div>
        </div>
      </div>


    
    </div>
    </Container>
  );
};

export default FAQ;