import { useState } from "react";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";

const faqs = [
  {
    question: "How secure is RemoteConnect?",
    answer: "RemoteConnect uses AES-256 encryption for all data transmission and follows industry best practices for security. We implement multi-factor authentication, session timeouts, and detailed audit logs to ensure your remote connections remain secure. All sessions are end-to-end encrypted and we maintain SOC 2 compliance."
  },
  {
    question: "What operating systems are supported?",
    answer: "RemoteConnect supports Windows (7, 8, 10, 11), macOS (10.13 and later), and major Linux distributions (Ubuntu, Debian, CentOS, Fedora). Our mobile apps are available for iOS and Android, allowing you to connect and provide support from anywhere."
  },
  {
    question: "How does white labeling work?",
    answer: "White labeling allows you to customize the RemoteConnect interface with your company's branding. In the Professional and Enterprise plans, you can upload your logo, set custom colors, and add your company name. When your clients use RemoteConnect, they'll see your branding instead of ours, creating a seamless experience."
  },
  {
    question: "Is there a limit to the number of devices I can connect to?",
    answer: "No, there is no limit to the number of devices you can connect to with RemoteConnect. Our pricing is based on the number of technicians (users who initiate connections), not on the number of devices they connect to. This means you can provide support to unlimited clients with a single technician license."
  },
  {
    question: "Do you offer a free trial?",
    answer: "Yes, we offer a 14-day free trial of our Professional plan with no credit card required. This gives you full access to all features so you can evaluate RemoteConnect thoroughly before making a purchase decision. If you need more time for testing, our sales team can arrange an extended trial period."
  }
];

const FAQSection = () => {
  return (
    <section id="faq" className="py-16 md:py-24 bg-neutral-50">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-neutral-800 mb-4 text-center">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-neutral-500 mb-12 max-w-3xl mx-auto text-center">
          Find answers to common questions about RemoteConnect.
        </p>
        
        <div className="max-w-3xl mx-auto mt-8">
          <Accordion type="single" collapsible className="w-full space-y-4">
            {faqs.map((faq, index) => (
              <AccordionItem 
                key={index} 
                value={`item-${index}`}
                className="bg-white rounded-lg shadow-sm border border-neutral-100 overflow-hidden"
              >
                <AccordionTrigger className="px-4 py-4 hover:no-underline">
                  <h3 className="text-lg font-medium text-neutral-800 text-left">{faq.question}</h3>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4 text-neutral-600">
                  {faq.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </div>
    </section>
  );
};

export default FAQSection;
