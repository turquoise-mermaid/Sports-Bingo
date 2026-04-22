import { motion } from "motion/react";
import { Sport } from "../App";
import { Icon } from "@iconify/react";

interface SportSelectionProps {
  onSelectSport: (sport: Sport) => void;
  onBack: () => void;
}

const sports = [
  {
    id: "soccer" as Sport,
    name: "Soccer",
    icon: "mdi:soccer",
    color:
      "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border-2 border-yellow-500",
  },
  {
    id: "americanFootball" as Sport,
    name: "Football",
    icon: "mdi:football",
    color:
      "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border-2 border-yellow-500",
  },
  {
    id: "baseball" as Sport,
    name: "Baseball",
    icon: "mdi:baseball",
    color:
      "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border-2 border-yellow-500",
  },
  {
    id: "basketball" as Sport,
    name: "Basketball",
    icon: "mdi:basketball",
    color:
      "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border-2 border-yellow-500",
  },
  {
    id: "tennis" as Sport,
    name: "Tennis",
    icon: "mdi:tennis-ball",
    color:
      "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border-2 border-yellow-500",
  },
  {
    id: "hockey" as Sport,
    name: "Hockey",
    icon: "mdi:hockey-sticks",
    color:
      "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border-2 border-yellow-500",
  },
];

export function SportSelection({ onSelectSport, onBack }: SportSelectionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md flex items-center mb-6">
        <button
          onClick={onBack}
          className="text-neutral-400 hover:text-yellow-500 transition-colors flex items-center gap-1 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          Back
        </button>
      </div>
      <motion.div
        initial={{ scale: 0, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="text-center mb-8"
      >
        <h1 className="text-yellow-500 mb-2 tracking-tight uppercase">
          Select a Sport
        </h1>
        <div className="h-1 w-20 bg-yellow-500 mx-auto mb-3"></div>
        <p className="text-neutral-400">Choose your sport to build your board</p>
      </motion.div>

      <div className="grid grid-cols-1 gap-3 w-full max-w-md">
        {sports.map((sport, index) => (
          <motion.button
            key={sport.id}
            initial={{ x: -100, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1, type: "spring" }}
            whileHover={{ scale: 1.02, x: 8 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelectSport(sport.id)}
            className={`bg-gradient-to-r ${sport.color} text-neutral-200 p-4 rounded shadow-xl flex items-center gap-3 transition-all`}
          >
            <div className="bg-yellow-500/10 p-2 rounded border border-yellow-500/30">
              <Icon icon={sport.icon} className="w-8 h-8 text-yellow-500" width={32} height={32} />
            </div>
            <span className="text-xl uppercase tracking-wide">
              {sport.name}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
