"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface WordRevealProps {
  text: string
  delay?: number
  className?: string
  splitBy?: "word" | "character" | "sentence"
  maxWidth?: string
}

export function WordReveal({ 
  text, 
  delay = 0.15, 
  className,
  splitBy = "word",
  maxWidth
}: WordRevealProps) {
  // Split the text based on the specified method
  let items: string[] = [];
  
  if (splitBy === "word") {
    items = text.split(" ");
  } else if (splitBy === "character") {
    items = text.split("");
  } else if (splitBy === "sentence") {
    items = text.split(". ").map(sentence => sentence + (sentence.endsWith(".") ? "" : ". "));
  }

  // Animation variants for each item
  const container = {
    hidden: { opacity: 0 },
    visible: (i = 1) => ({
      opacity: 1,
      transition: { staggerChildren: delay, delayChildren: delay * i },
    }),
  }

  const child = {
    visible: {
      opacity: 1,
      y: 0,
      filter: "blur(0px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
    hidden: {
      opacity: 0,
      y: 20,
      filter: "blur(10px)",
      transition: {
        type: "spring",
        damping: 12,
        stiffness: 100,
      },
    },
  }

  // Add the maxWidth style if provided
  const style = maxWidth ? { maxWidth } : undefined;

  return (
    <motion.div
      className={cn("flex flex-wrap", className)}
      style={style}
      variants={container}
      initial="hidden"
      animate="visible"
    >
      {items.map((item, index) => (
        <motion.span
          variants={child}
          key={index}
          className={cn(
            splitBy === "word" && "mr-[0.4em] last:mr-0",
            splitBy === "character" && "mr-[0.05em] last:mr-0"
          )}
        >
          {item}
          {splitBy === "word" && index !== items.length - 1 && " "}
        </motion.span>
      ))}
    </motion.div>
  )
} 