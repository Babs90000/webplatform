import React from "react";
import styles from "./PlaceholderBlock.module.css";
import { BlockType } from "@/types";

interface PlaceholderBlockProps {
  type: BlockType;
}

export const PlaceholderBlock: React.FC<PlaceholderBlockProps> = ({ type }) => {
  return (
    <div className={styles.placeholder}>
      <svg 
        className={styles.icon}
        viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M12 22C17.5 22 22 17.5 22 12C22 6.5 17.5 2 12 2C6.5 2 2 6.5 2 12C2 17.5 6.5 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 8V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 16H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
      <div className={styles.type}>{type}</div>
      <p className={styles.text}>This block is under construction (Phase 2).</p>
    </div>
  );
};
