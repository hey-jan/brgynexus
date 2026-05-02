"use client";

import * as React from "react";
import { cn } from "@/utils/utils";
import { ChevronDown } from "lucide-react";

interface AccordionItemProps {
  title: string;
  content: string;
}

export function Accordion({ items }: { items: AccordionItemProps[] }) {
  const [openIndex, setOpenIndex] = React.useState<number | null>(null);

  const toggle = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="w-full space-y-2">
      {items.map((item, index) => {
        const isOpen = openIndex === index;
        return (
          <div key={index} className="border border-slate-200 dark:border-slate-800 rounded-md overflow-hidden">
            <button
              onClick={() => toggle(index)}
              className="flex w-full items-center justify-between bg-white dark:bg-slate-950 px-4 py-4 text-left text-sm font-medium transition-all hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              {item.title}
              <ChevronDown
                className={cn("h-4 w-4 text-slate-500 transition-transform duration-200", {
                  "rotate-180": isOpen,
                })}
              />
            </button>
            <div
              className={cn(
                "overflow-hidden transition-all duration-200 ease-in-out bg-slate-50 dark:bg-slate-900/50",
                isOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
              )}
            >
              <div className="p-4 text-sm text-slate-600 dark:text-slate-400">
                {item.content}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
