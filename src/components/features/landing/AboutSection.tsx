export function AboutSection() {
  return (
    <section id="about" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col lg:flex-row items-center gap-12">
          <div className="w-full lg:w-1/2">
            <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden relative">
              {/* Placeholder for an image */}
              <div className="absolute inset-0 flex items-center justify-center text-slate-500 font-medium">
                [Barangay Hall Image Placeholder]
              </div>
            </div>
          </div>
          <div className="w-full lg:w-1/2">
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-6">About Barangay X</h2>
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 leading-relaxed">
              Welcome to the official online portal of Barangay X. Our mission is to provide efficient, transparent, and accessible services to all our residents.
            </p>
            <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed">
              Through BrgyNexus, we are bringing our services directly to your fingertips. No more long lines, no more wasted time. Request what you need, when you need it, and track its progress in real-time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
