import React from "react";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
}

export const Card: React.FC<CardProps> = ({ title, subtitle, children, className = "", ...props }) => {
  return (
    <div className={`lpu-card p-5 ${className}`} {...props}>
      {title && <h3 className="font-semibold text-lpu-black text-base">{title}</h3>}
      {subtitle && <p className="text-xs text-lpu-gray-dark mb-3">{subtitle}</p>}
      {children}
    </div>
  );
};

export default Card;
