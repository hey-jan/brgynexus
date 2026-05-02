"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { MapPin, Phone, Mail } from "lucide-react";
import { toast } from "sonner";

export function ContactSection() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const data = Object.fromEntries(formData.entries());
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to send message");

      toast.success("Message sent successfully! We will get back to you soon.");
      (e.target as HTMLFormElement).reset();
    } catch (error) {
      toast.error("An error occurred while sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="contact" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white">Contact Us</h2>
          <p className="mt-4 text-lg text-slate-600 dark:text-slate-400">We're here to help.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Map and Info */}
          <div>
            <div className="aspect-video bg-slate-200 dark:bg-slate-800 rounded-2xl overflow-hidden relative mb-8">
              {/* Google Maps Placeholder */}
              <div className="absolute inset-0 flex items-center justify-center flex-col text-slate-500 bg-slate-100 dark:bg-slate-800">
                <MapPin className="h-10 w-10 mb-2 opacity-50" />
                <span className="font-medium">Google Maps Embed Placeholder</span>
                <span className="text-sm opacity-70">Requires API Key</span>
              </div>
            </div>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <MapPin className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Address</h4>
                  <p className="text-slate-600 dark:text-slate-400">123 Barangay Hall St., City, Province, Philippines</p>
                </div>
              </div>
              <div className="flex items-start">
                <Phone className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Phone</h4>
                  <p className="text-slate-600 dark:text-slate-400">(02) 1234-5678</p>
                </div>
              </div>
              <div className="flex items-start">
                <Mail className="h-6 w-6 text-blue-600 mt-1 mr-4" />
                <div>
                  <h4 className="font-semibold text-slate-900 dark:text-white">Email</h4>
                  <p className="text-slate-600 dark:text-slate-400">contact@brgynexus.com</p>
                </div>
              </div>
            </div>
          </div>

          {/* Contact Form */}
          <div className="bg-white dark:bg-slate-950 p-8 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-800">
            <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6">Send us a message</h3>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="firstName" className="text-sm font-medium text-slate-700 dark:text-slate-300">First Name</label>
                  <Input id="firstName" name="firstName" required placeholder="Juan" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="lastName" className="text-sm font-medium text-slate-700 dark:text-slate-300">Last Name</label>
                  <Input id="lastName" name="lastName" required placeholder="Dela Cruz" />
                </div>
              </div>
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium text-slate-700 dark:text-slate-300">Email Address</label>
                <Input id="email" name="email" type="email" required placeholder="juan@example.com" />
              </div>
              <div className="space-y-2">
                <label htmlFor="message" className="text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
                <Textarea id="message" name="message" required placeholder="How can we help you?" rows={5} />
              </div>
              <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
