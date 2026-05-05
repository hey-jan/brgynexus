"use client";

import React from "react";
import { cn } from "@/utils/utils";
import { motion } from "framer-motion";

interface KioskButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "danger";
  size?: "lg" | "xl" | "2xl";
  icon?: React.ReactNode;
}

export const KioskButton = ({
  children,
  className,
  variant = "primary",
  size = "xl",
  icon,
  ...props
}: KioskButtonProps) => {
  const variants = {
    primary: "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-[0_0_40px_rgba(59,130,246,0.5)] border border-blue-400/30",
    secondary: "bg-white/10 backdrop-blur-md text-white border border-white/20 hover:bg-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.2)]",
    outline: "bg-transparent border-2 border-blue-400 text-blue-200 hover:bg-blue-900/40 shadow-sm",
    danger: "bg-gradient-to-r from-red-500 to-rose-600 text-white shadow-[0_0_40px_rgba(220,38,38,0.4)] border border-red-400/30",
  };

  const sizes = {
    lg: "px-8 py-4 text-xl rounded-2xl",
    xl: "px-12 py-8 text-3xl font-bold rounded-3xl min-h-[120px]",
    "2xl": "px-16 py-12 text-4xl font-extrabold rounded-[40px] min-h-[200px]",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02, y: -2 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "flex items-center justify-center gap-6 transition-colors duration-200 w-full group overflow-hidden relative before:absolute before:inset-0 before:bg-white/10 before:opacity-0 hover:before:opacity-100 before:transition-opacity",
        variants[variant],
        sizes[size],
        className
      )}
      {...props as any}
    >
      {icon && <span className="flex-shrink-0 transition-transform duration-300 group-hover:scale-110 drop-shadow-md z-10">{icon}</span>}
      <div className="w-full text-left flex flex-col justify-center z-10 drop-shadow-sm">{children}</div>
    </motion.button>
  );
};
