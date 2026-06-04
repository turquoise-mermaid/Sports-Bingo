import { motion } from "motion/react";
import { ArrowLeft } from "lucide-react";
import { Sport } from "../App";
import { Icon } from "@iconify/react";
import { Button } from "./ui/button";

interface SportSelectionProps {
  onSelectSport: (sport: Sport) => void;
  onBack: () => void;
}

const sports = [
  {
    id: "baseball" as Sport,
    name: "Baseball",
    icon: "mdi:baseball",
    color:
      "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border-2 border-green-500",
  },
  {
    id: "basketball" as Sport,
    name: "Basketball",
    icon: "mdi:basketball",
    color:
      "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border-2 border-green-500",
  },
  {
    id: "americanFootball" as Sport,
    name: "Football",
    icon: "mdi:football",
    color:
      "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border-2 border-green-500",
  },
  {
    id: "hockey" as Sport,
    name: "Hockey",
    icon: "mdi:hockey-sticks",
    color:
      "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border-2 border-green-500",
  },
  {
    id: "rugby" as Sport,
    name: "Rugby",
    icon: "mdi:rugby",
    color:
      "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border-2 border-green-500",
  },
  {
    id: "soccer" as Sport,
    name: "Soccer",
    icon: "mdi:soccer",
    color:
      "from-zinc-700 to-zinc-800 hover:from-zinc-600 hover:to-zinc-700 border-2 border-green-500",
  },
];

export function SportSelection({ onSelectSport, onBack }: SportSelectionProps) {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md mb-4">
        <Button
          onClick={onBack}
          variant="ghost"
          className="text-neutral-300 hover:bg-zinc-800 hover:text-green-500 h-8 px-3"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back
        </Button>
      </div>
      <motion.div
        initial={{ scale: 0, y: -50 }}
        animate={{ scale: 1, y: 0 }}
        transition={{ type: "spring", duration: 0.8 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl text-green-500 mb-2 tracking-tight uppercase">
          Select a Sport
        </h1>
        <div className="h-1 w-20 bg-green-500 mx-auto mb-3"></div>
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
            <div className="bg-green-500/10 p-2 rounded border border-green-500/30">
              <Icon icon={sport.icon} className="w-8 h-8 text-green-500" width={32} height={32} />
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
