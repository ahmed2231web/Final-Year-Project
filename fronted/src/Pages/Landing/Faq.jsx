import React, { useState } from "react";
import Hero from '../../Components/Common/Hero';
import Section from "../../Components/FAQ/Section";

// FAQ Data (unchanged)
const faq = [
  { question: "What is AgroConnect?", answer: "AgroConnect is a platform that bridges the gap between farmers, customers, and medicine dealers to provide seamless agricultural solutions." },
  { question: "How can I purchase products on AgroConnect?", answer: "You can purchase products either online with a 10% upfront payment or visit the farmer and pay in person." },
  { question: "How does the AI-powered support work?", answer: "Our AI system provides intelligent solutions for crop-related issues. If further assistance is needed, farmers can connect with medicine dealers for expert advice." },
];

const otherQuestions = [
  { question: "Is AgroConnect available in my area?", answer: "AgroConnect is expanding rapidly and is available in most regions. Check our website for availability in your area." },
  { question: "Are all farmers verified on AgroConnect?", answer: "Yes, every farmer on AgroConnect undergoes a thorough verification process to ensure quality and trust." },
  { question: "Can I cancel my order after placing it?", answer: "Yes, you can cancel your order before it is dispatched. Please contact support for assistance." },
];

const contactQuestions = [
  { question: "How can I contact customer support?", answer: "You can reach out to our customer support via email at support@agroconnect.com or call us at +123 456 789." },
  { question: "What payment methods are supported?", answer: "We support multiple payment methods, including credit cards, debit cards, and online banking." },
  { question: "Is my data safe with AgroConnect?", answer: "Absolutely. We prioritize data security and comply with the latest security standards." },
  { question: "Can I track my order?", answer: "Yes, you can track your order through your AgroConnect account." },
  { question: "How can I give feedback or suggestions?", answer: "We value your feedback! You can submit your suggestions via our feedback form on the website." },
];

function Faq() {
  const [activeIndex, setActiveIndex] = useState({
    general: null,
    other: null,
    contact: null,
  });

  const toggleAnswer = (section, index) => {
    setActiveIndex((prevState) => ({
      ...prevState,
      [section]: prevState[section] === index ? null : index,
    }));
  };

  return (
    <div>
      <Hero>FAQs</Hero>
      {/* Responsive Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-1">
        {/* General Questions Section */}
        <Section title="General Questions" subtitle="Most Asked">
          {faq.map((section, index) => (
            <div key={index} className="mb-4">
              <div
                className={`flex justify-between items-center cursor-pointer p-3 rounded-2xl h-16 ${activeIndex.general === index ? "bg-[#0A690E] text-white border border-[#0A690E]" : "bg-white text-gray-800 border border-gray-300"}`}
                onClick={() => toggleAnswer("general", index)}
              >
                <h3 className="text-lg font-semibold truncate">{section.question}</h3>
                <span className={`${activeIndex.general === index && "text-white"}`}>
                  {activeIndex.general === index ? "▲" : "▼"}
                </span>
              </div>
              {activeIndex.general === index && (
                <div className="mt-2 p-3 bg-gray-100 rounded-md">
                  <p className="text-gray-600">{section.answer}</p>
                </div>
              )}
            </div>
          ))}
        </Section>

        {/* Other Questions Section */}
        <Section title="Other Questions" subtitle="People Know">
          {otherQuestions.map((section, index) => (
            <div key={index} className="mb-4">
              <div
                className={`flex justify-between items-center cursor-pointer p-3 rounded-2xl h-16 ${activeIndex.other === index ? "bg-[#0A690E] text-white border border-[#0A690E]" : "bg-white text-gray-800 border border-gray-300"}`}
                onClick={() => toggleAnswer("other", index)}
              >
                <h3 className="text-lg font-semibold truncate">{section.question}</h3>
                <span className={`${activeIndex.other === index && "text-white"}`}>
                  {activeIndex.other === index ? "▲" : "▼"}
                </span>
              </div>
              {activeIndex.other === index && (
                <div className="mt-2 p-3 bg-gray-100 rounded-md">
                  <p className="text-gray-600">{section.answer}</p>
                </div>
              )}
            </div>
          ))}
        </Section>
      </div>

      {/* Contact Questions Section */}
      <Section title="Happy to Answer All Your Questions" subtitle="Contact Us Now" className="mt-8">
        {contactQuestions.map((section, index) => (
          <div key={index} className="mb-4">
            <div
              className={`flex justify-between items-center cursor-pointer p-3 rounded-2xl h-16 ${activeIndex.contact === index ? "bg-[#0A690E] text-white border border-[#0A690E]" : "bg-white text-gray-800 border border-gray-300"}`}
              onClick={() => toggleAnswer("contact", index)}
            >
              <h3 className="text-lg font-semibold truncate">{section.question}</h3>
              <span className={`${activeIndex.contact === index && "text-white"}`}>
                {activeIndex.contact === index ? "▲" : "▼"}
              </span>
            </div>
            {activeIndex.contact === index && (
              <div className="mt-2 p-3 bg-gray-100 rounded-md">
                <p className="text-gray-600">{section.answer}</p>
              </div>
            )}
          </div>
        ))}
      </Section>
    </div>
  );
}

export default Faq;
