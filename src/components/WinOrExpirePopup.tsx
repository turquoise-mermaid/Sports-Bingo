import {motion} from "motion/react";
import {Button} from "./ui/button";
import React from "react";

export function WinOrExpirePopup({
                                     title,
                                     message,
                                     onYes,
                                     onNo,
                                     borderColor = 'border-green-500',
                                     icon,
                                 }: {
    title: string;
    message: string;
    onYes: () => void;
    onNo: () => void;
    borderColor?: string;
    icon?: React.ReactNode;
}) {
    return (
        <>
            <motion.div
                initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                className="fixed inset-0 backdrop-blur-sm z-50" style={{backgroundColor: 'rgba(0,0,0,0.7)'}}
            />
            <motion.div
                initial={{opacity: 0}}
                animate={{opacity: 1}}
                exit={{opacity: 0}}
                className="fixed inset-0 z-50 flex items-center justify-center px-4"
            >
                <motion.div
                    initial={{scale: 0.8}}
                    animate={{scale: 1}}
                    exit={{scale: 0.8}}
                    transition={{type: 'spring', damping: 25}}
                    className={`w-full max-w-md bg-zinc-800 border-2 ${borderColor} rounded-lg p-6 text-center`}
                >
                    {icon && <div className="flex justify-center mb-3">{icon}</div>}
                    <h3 className="text-neutral-200 uppercase tracking-wider mb-3">{title}</h3>
                    <p className="text-neutral-400 mb-6">{message}</p>
                    <div className="flex gap-3">
                        <Button onClick={onNo} variant="outline"
                                className="flex-1 border-zinc-600 text-neutral-300 hover:bg-zinc-700 h-10">No</Button>
                        <Button onClick={onYes}
                                className="flex-1 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-zinc-900 h-10">Yes</Button>
                    </div>
                </motion.div>
            </motion.div>
        </>
    );
}