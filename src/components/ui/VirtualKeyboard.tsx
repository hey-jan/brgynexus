"use client";

import React, { useRef, useState, useEffect } from "react";
import Keyboard from "react-simple-keyboard";
import "react-simple-keyboard/build/css/index.css";
import { motion, AnimatePresence } from "framer-motion";

interface VirtualKeyboardProps {
  inputName: string;
  inputValue: string;
  onChange: (value: string) => void;
  isOpen: boolean;
  onClose: () => void;
  layoutName?: "default" | "shift";
}

export function VirtualKeyboard({ 
  inputName, 
  inputValue, 
  onChange, 
  isOpen, 
  onClose, 
  layoutName = "default" 
}: VirtualKeyboardProps) {
  const keyboard = useRef<any>(null);
  const [layout, setLayout] = useState<"default" | "shift">(layoutName);

  // Sync internal keyboard state with external inputValue changes
  useEffect(() => {
    if (keyboard.current) {
      keyboard.current.setInput(inputValue);
    }
  }, [inputValue, inputName, isOpen]);

  const onKeyPress = (button: string) => {
    if (button === "{shift}" || button === "{lock}") {
      setLayout(layout === "default" ? "shift" : "default");
    }
    if (button === "{close}") {
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="absolute bottom-0 left-0 w-full z-50 bg-slate-900/95 backdrop-blur-xl border-t border-white/20 p-3 pb-4 shadow-[0_-10px_40px_rgba(0,0,0,0.5)]"
        >
          <div className="max-w-6xl mx-auto">
             <div className="flex justify-end items-center mb-2 px-2">
               <button 
                 onClick={onClose} 
                 className="text-slate-300 hover:text-white px-6 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-600 rounded-xl text-sm font-bold uppercase tracking-wider transition-all shadow-sm"
               >
                 Close Keyboard
               </button>
             </div>
            <div className="bg-slate-800/50 rounded-2xl p-2 border border-white/10 kiosk-keyboard">
              <Keyboard
                keyboardRef={r => (keyboard.current = r)}
                layoutName={layout}
                onChange={onChange}
                onKeyPress={onKeyPress}
                theme={"hg-theme-default hg-layout-default myTheme"}
                layout={{
                  default: [
                    "1 2 3 4 5 6 7 8 9 0 - = {bksp}",
                    "q w e r t y u i o p [ ] \\",
                    "a s d f g h j k l ; ' {enter}",
                    "{shift} z x c v b n m , . / {shift}",
                    "{space}"
                  ],
                  shift: [
                    "! @ # $ % ^ & * ( ) _ + {bksp}",
                    "Q W E R T Y U I O P { } |",
                    "A S D F G H J K L : \" {enter}",
                    "{shift} Z X C V B N M < > ? {shift}",
                    "{space}"
                  ]
                }}
                display={{
                  "{bksp}": "Backspace ⌫",
                  "{enter}": "Enter ↵",
                  "{shift}": "Shift ⇧",
                  "{space}": "Space",
                  "{lock}": "Caps Lock ⇪",
                }}
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
