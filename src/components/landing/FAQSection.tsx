import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
export function FAQSection() {
  const faqs = [
  {
    question: 'Is InDesk HIPAA compliant?',
    answer:
    'Absolutely. InDesk is fully HIPAA compliant with end-to-end encryption, BAA agreements, and regular security audits. Your patient data is protected with the same standards used by major healthcare institutions.'
  },
  {
    question: 'Can I migrate from my current system?',
    answer:
    'Yes! We offer free data migration from all major practice management platforms including WriteUpp, SimplePractice, and TherapyNotes. Our team handles the entire process.'
  },
  {
    question: 'How does the AI assessment feature work?',
    answer:
    'Our AI analyzes validated assessment responses to generate progress summaries and treatment insights. It is designed to augment your clinical judgment, never replace it. All AI features are optional and fully configurable.'
  },
  {
    question: 'Is there a contract or commitment?',
    answer:
    'No contracts, ever. All plans are month-to-month and you can cancel anytime. We also offer annual billing with a 20% discount.'
  },
  // {
  //   question: 'Do you offer training for my team?',
  //   answer:
  //   'Every plan includes free onboarding support. Practice and Enterprise plans include dedicated training sessions and ongoing support from our clinical success team.'
  // },
  {
    question: 'Can patients book their own appointments?',
    answer:
    'Yes! InDesk includes a beautiful patient-facing booking portal that you can customize with your branding. Patients can book, reschedule, and manage their appointments independently.'
  }];

  return (
    <section id="faq" className="py-24 bg-warm-white">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-serif text-charcoal">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) =>
          <AccordionItem
            key={index}
            question={faq.question}
            answer={faq.answer} />

          )}
        </div>
      </div>
    </section>);

}
function AccordionItem({
  question,
  answer



}: {question: string;answer: string;}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <div className="border-b border-warm-gray/10 last:border-0">
      <button
        className="w-full py-6 flex justify-between items-center text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}>

        <span className="text-lg font-medium text-charcoal group-hover:text-terracotta transition-colors">
          {question}
        </span>
        <ChevronDown
          className={`text-terracotta transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
          size={20} />

      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-96 opacity-100 pb-6' : 'max-h-0 opacity-0'}`}>

        <p className="text-warm-gray leading-relaxed">{answer}</p>
      </div>
    </div>);

}