import React from "react";

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => {
  return (
    <div 
      className={`p-6 text-gray-800 transition-all duration-200 ${className}`}
    >
      {children}
    </div>
  );
};