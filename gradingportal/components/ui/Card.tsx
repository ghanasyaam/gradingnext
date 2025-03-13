import React from "react";

interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className = "" }) => {
  return (
    <div className="bg-white bg-opacity-100 shadow-lg rounded-2xl p-6 border border-gray-200 text-gray-900">
      {children}
    </div>
  );
};
