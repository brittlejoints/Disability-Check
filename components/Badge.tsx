import React from 'react';
import { BenefitStatus } from '../types';

interface BadgeProps {
  status: BenefitStatus;
  className?: string;
}

const Badge: React.FC<BadgeProps> = ({ status, className = '' }) => {
  let styles = "bg-gray-100 text-slate border-gray-200";
  let icon = null;
  let tooltip = "";

  switch (status) {
    case BenefitStatus.PAID:
      styles = "bg-successGreen/10 text-successGreen border-successGreen/20";
      tooltip = "Full benefit check received. Income is safe (< SGA or during TWP).";
      icon = (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
        </svg>
      );
      break;
    case BenefitStatus.GRACE:
      styles = "bg-blue-50 text-blue-600 border-blue-200";
      tooltip = "Grace Period: You get paid for 3 months after TWP even if earning above the limit.";
      icon = (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
      break;
    case BenefitStatus.SUSPENDED:
      styles = "bg-warningOrange/10 text-warningOrange border-warningOrange/20";
      tooltip = "Check is withheld because earnings exceed the SGA limit during EPE.";
      icon = (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
        </svg>
      );
      break;
    case BenefitStatus.TERMINATED:
      styles = "bg-red-50 text-red-600 border-red-200";
      tooltip = "Benefits have stopped. You may need Expedited Reinstatement if you stop working.";
      icon = (
        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      );
      break;
    default:
        styles = "bg-slate/10 text-slate border-slate/10";
  }

  // Handle UNKNOWN or other statuses by returning null or a default
  if (status === BenefitStatus.UNKNOWN) return null;

  return (
    <span 
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold tracking-wide uppercase border cursor-help transition-opacity hover:opacity-80 ${styles} ${className}`}
        title={tooltip}
    >
      {icon}
      {status}
    </span>
  );
};

export default Badge;