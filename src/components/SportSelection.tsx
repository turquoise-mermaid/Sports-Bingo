import { motion } from "motion/react";
import { Sport } from "../App";
import { Icon } from "@iconify/react";

interface SportSelectionProps {
  onSelectSport: (sport: Sport) => void;
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

export function SportSelection({ onSelectSport }: SportSelectionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <motion.div
        initial={{ scale: 0, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="text-center mb-8"
      >
        <h1 className="text-yellow-500 mb-2 tracking-tight uppercase">
          Sports Bingo
        </h1>
        <div className="h-1 w-20 bg-yellow-500 mx-auto mb-3"></div>
        <p className="text-neutral-400">Select a sport to begin</p>
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
