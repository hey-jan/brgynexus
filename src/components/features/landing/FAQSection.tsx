import { Accordion } from "@/components/ui/Accordion";

export function FAQSection() {
  const faqs = [
    { title: "How long does it take to process a document?", content: "Most documents are processed within 1-2 working days. You will receive an email and an in-app notification once your document is ready for pickup or download." },
    { title: "Do I need to pay for the documents online?", content: "Currently, payments are made upon claiming the document at the Barangay Hall. We will be adding online payment options soon." },
    { title: "How do I know if my request is approved?", content: "You can track the status of your request on your Resident Dashboard. We will also send you an email update." },
    { title: "Can I request documents for someone else?", content: "No, for security and privacy reasons, residents can only request documents for themselves." },
  ];

  return (
    <section id="faq" className="py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Everything you need to know about the system.</p>
        </div>
        <Accordion items={faqs} />
      </div>
    </section>
  );
}
