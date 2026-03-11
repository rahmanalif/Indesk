import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
export function FAQSection() {
  const faqs = [
  {
    question: 'Is InDesk GDPR compliant?',
    answer:
    'Yes. InDesk is built with GDPR requirements in mind, with secure handling of data, clear access controls, and privacy-conscious workflows for modern practices.'
  },
  {
    question: 'How does Sigmund help with assessments?',
    answer:
    'Sigmund can help generate assessments and support storing them within your workflow, while remaining separate from your clinical information. It cannot access, read, or retrieve patient records, clinical notes, or other clinical data stored in InDesk.'
  },
  {
    question: 'Is there a contract or commitment?',
    answer:
    'No long-term contract is required. Plans are designed to stay flexible, so you are not locked into a lengthy commitment.'
  },
  {
    question: 'What support and resources are available?',
    answer:
    'InDesk includes onboarding guidance, practical resources, and ongoing product updates so your team can get up to speed quickly and keep track of what is available now and what is coming next.'
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
