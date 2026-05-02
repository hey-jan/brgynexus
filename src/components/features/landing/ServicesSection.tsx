import { FileText, FileBadge, FileHeart, ShieldCheck } from "lucide-react";

export function ServicesSection() {
  const services = [
    { title: "Barangay Clearance", description: "Request a clearance for employment, business, or other legal purposes.", icon: <ShieldCheck className="h-6 w-6 text-blue-600" /> },
    { title: "Certificate of Indigency", description: "Secure a certificate for financial, medical, or educational assistance.", icon: <FileHeart className="h-6 w-6 text-blue-600" /> },
    { title: "Business Permit", description: "Apply or renew your barangay business permit fast and easily.", icon: <FileBadge className="h-6 w-6 text-blue-600" /> },
    { title: "Other Documents", description: "Request residency certificates, good moral certificates, and more.", icon: <FileText className="h-6 w-6 text-blue-600" /> },
  ];

  return (
    <section id="services" className="py-20 bg-slate-50 dark:bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Our Services</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">Request documents entirely online.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {services.map((service, index) => (
            <div key={index} className="bg-white dark:bg-slate-950 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-shadow">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-xl flex items-center justify-center mb-6">
                {service.icon}
              </div>
              <h3 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">{service.title}</h3>
              <p className="text-slate-600 dark:text-slate-400">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
