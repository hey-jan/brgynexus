import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center flex-1 w-full text-center px-4">
      <h1 className="text-5xl font-extrabold text-blue-600 tracking-tight sm:text-6xl mb-6">
        BrgyNexus
      </h1>
      <p className="mt-4 text-xl text-slate-600 max-w-2xl mx-auto dark:text-slate-400">
        The modern, automated barangay document request and verification system.
      </p>
      
      <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
        <a
          href="/login"
          className="rounded-md bg-blue-600 px-6 py-3 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
        >
          Login
        </a>
        <a
          href="/register"
          className="rounded-md bg-white px-6 py-3 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 dark:bg-slate-800 dark:text-white dark:ring-slate-700 dark:hover:bg-slate-700"
        >
          Register
        </a>
      </div>
    </main>
  );
}
