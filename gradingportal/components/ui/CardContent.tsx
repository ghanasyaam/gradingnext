import React from "react";

interface CardContentProps {
  children: React.ReactNode;
  className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className = "" }) => {
  return <div className={`p-4 text-gray-900 ${className}`}>{children}</div>;
};

