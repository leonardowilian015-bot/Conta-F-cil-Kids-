
import { motion } from "motion/react";
import { LucideIcon, Gamepad2 } from "lucide-react";

interface MascotProps {
  message?: string;
  mood?: 'happy' | 'thinking' | 'celebrating' | 'neutral';
  icon?: LucideIcon;
  color?: string;
  bg?: string;
}

export const Mascot = ({ 
  message, 
  mood = 'neutral', 
  icon: Icon = Gamepad2, 
  color = 'text-indigo-600', 
  bg = 'bg-indigo-100' 
}: MascotProps) => {
  const variants = {
    neutral: { y: [0, -10, 0], transition: { repeat: Infinity, duration: 3 } },
    happy: { scale: [1, 1.1, 1], transition: { repeat: Infinity, duration: 0.5 } },
    thinking: { rotate: [0, 5, -5, 0], transition: { repeat: Infinity, duration: 2 } },
    celebrating: { y: [0, -30, 0], scale: [1, 1.2, 1], transition: { repeat: Infinity, duration: 0.4 } }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <motion.div
        animate={variants[mood]}
        className={`w-32 h-32 ${bg} rounded-full border-4 border-white shadow-lg flex items-center justify-center relative`}
      >
        {Icon === Gamepad2 ? (
          <>
            {/* Orelhas de Urso (Nilo) */}
            <div className="absolute -top-2 -left-2 w-10 h-10 bg-amber-500 rounded-full border-4 border-white" />
            <div className="absolute -top-2 -right-2 w-10 h-10 bg-amber-500 rounded-full border-4 border-white" />
            
            {/* Rosto */}
            <div className="flex gap-4 z-10">
              <div className="w-4 h-4 bg-slate-800 rounded-full" />
              <div className="w-4 h-4 bg-slate-800 rounded-full" />
            </div>
            
            {/* Focinho */}
            <div className="absolute bottom-8 w-10 h-8 bg-amber-100 rounded-full flex items-center justify-center">
              <div className="w-3 h-2 bg-slate-800 rounded-full mb-2" />
            </div>

            {/* Boca */}
            <div className={`absolute bottom-6 w-8 h-4 border-b-4 border-slate-800 rounded-full z-10 ${mood === 'happy' ? 'h-6' : ''}`} />
          </>
        ) : (
          <Icon className={`w-20 h-20 ${color}`} />
        )}
      </motion.div>
      
      {message && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white p-4 rounded-2xl shadow-md border-2 border-brand-blue max-w-xs text-center relative"
        >
          <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white border-t-2 border-l-2 border-brand-blue rotate-45" />
          <p className="text-lg font-bold text-slate-700">{message}</p>
        </motion.div>
      )}
    </div>
  );
};
