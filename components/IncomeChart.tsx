import * as React from 'react';
import { useMemo, useState } from 'react';
import { AnalyzedEntry } from '../types';
import { THRESHOLDS_2025 } from '../constants';
import { formatCurrency, formatDateReadable, parseDate } from '../utils/logic';

interface IncomeChartProps {
  entries: AnalyzedEntry[];
}

const IncomeChart: React.FC<IncomeChartProps> = ({ entries }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sort entries chronologically for display
  const data = useMemo(() => {
    return [...entries].sort((a, b) => a.month.localeCompare(b.month));
  }, [entries]);

  if (data.length === 0) return null;

  // Chart Dimensions
  const height = 300;
  const padding = { top: 40, right: 20, bottom: 40, left: 0 };
  const viewboxWidth = 1000;
  
  const highestIncome = Math.max(...data.map(e => e.income));
  const maxIncomeDomain = Math.max(highestIncome, THRESHOLDS_2025.sga * 1.2);
  const chartMaxY = Math.ceil(maxIncomeDomain / 500) * 500;
  
  const getY = (income: number) => {
    const drawingHeight = height - padding.top - padding.bottom;
    const ratio = income / chartMaxY;
    return height - padding.bottom - (ratio * drawingHeight);
  };

  const twpY = getY(THRESHOLDS_2025.twp);
  const sgaY = getY(THRESHOLDS_2025.sga);

  return (
    <div 
      className="w-full h-[350px] select-none relative"
      role="img"
      aria-label="Bar chart showing monthly income and benefit thresholds."
    >
       <div className="w-full h-full">
         <svg 
            width="100%" 
            height="100%" 
            viewBox={`0 0 ${viewboxWidth} ${height}`} 
            preserveAspectRatio="none" 
            className="overflow-visible"
            aria-hidden="true"
         >
            {/* Grid */}
            {[...Array(Math.floor(chartMaxY / 1000) + 1)].map((_, i) => {
                 const yVal = i * 1000;
                 if (yVal === 0) return null;
                 const yPos = getY(yVal);
                 return (
                     <g key={`grid-${yVal}`}>
                        <line x1="0" y1={yPos} x2={viewboxWidth} y2={yPos} stroke="#E5E7EB" strokeWidth="1" />
                        <text x="0" y={yPos - 4} fill="#9CA3AF" fontSize="10">{formatCurrency(yVal)}</text>
                     </g>
                 )
            })}
            
            {/* Thresholds */}
            <line x1="0" y1={twpY} x2={viewboxWidth} y2={twpY} stroke="#E8A573" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.6" />
            <line x1="0" y1={sgaY} x2={viewboxWidth} y2={sgaY} stroke="#C95233" strokeWidth="1.5" strokeDasharray="6,4" opacity="0.6" />

            {/* Bars */}
            {data.map((entry, i) => {
                const slotWidth = viewboxWidth / data.length;
                const barWidth = Math.min(60, slotWidth * 0.65);
                const x = (slotWidth * i) + (slotWidth - barWidth) / 2;
                const y = getY(entry.income);
                const barHeight = Math.max(height - padding.bottom - y, 4);
                
                let barColor = "#6B9E78"; // Default: Paid/Safe
                if (entry.income > THRESHOLDS_2025.sga) barColor = "#C95233";
                else if (entry.income > THRESHOLDS_2025.twp) barColor = "#E67E50";
                
                const showLabel = data.length <= 12 || i % Math.ceil(data.length / 12) === 0;

                return (
                    <g key={entry.id} 
                       onMouseEnter={() => setHoveredIndex(i)}
                       onMouseLeave={() => setHoveredIndex(null)}
                    >
                        <rect x={slotWidth * i} y={padding.top} width={slotWidth} height={height - padding.top - padding.bottom} fill="transparent" />
                        <rect x={x} y={y} width={barWidth} height={barHeight} fill={barColor} rx="6" className="transition-all duration-300 hover:brightness-95" />
                        {showLabel && (
                            <text x={x + barWidth/2} y={height - 15} textAnchor="middle" fill="#6B5B5F" fontSize="10" fontWeight="600" className="uppercase tracking-widest opacity-60">
                                {parseDate(entry.month).toLocaleDateString('en-US', { month: 'short' })}
                            </text>
                        )}
                    </g>
                );
            })}
         </svg>
         
         {/* Enhanced Tooltip */}
         {hoveredIndex !== null && data[hoveredIndex] && (
             <div 
                className="absolute pointer-events-none z-50 bg-white/95 backdrop-blur shadow-luxury rounded-2xl p-5 border border-taupe/10 transform -translate-x-1/2 -translate-y-full transition-all duration-150 animate-pop"
                style={{
                    left: `${((hoveredIndex + 0.5) / data.length) * 100}%`,
                    top: getY(data[hoveredIndex].income) - 20,
                    minWidth: '160px'
                }}
             >
                 <div className="flex flex-col gap-1">
                     <span className="text-[10px] font-bold text-slate uppercase tracking-widest border-b border-taupe/10 pb-2 mb-2">
                        {formatDateReadable(data[hoveredIndex].month)}
                     </span>
                     <span className="text-2xl font-serif text-burgundy">
                        {formatCurrency(data[hoveredIndex].income)}
                     </span>
                     <div className="flex items-center gap-2 mt-1">
                        <div className={`w-2 h-2 rounded-full ${data[hoveredIndex].income > THRESHOLDS_2025.sga ? 'bg-red-500' : 'bg-successGreen'}`}></div>
                        <span className="text-xs font-semibold text-charcoal">
                            {data[hoveredIndex].benefitStatus}
                        </span>
                     </div>
                     <span className="text-[9px] text-slate/60 italic uppercase tracking-tighter mt-1">
                        {data[hoveredIndex].income > THRESHOLDS_2025.sga ? 'Above SGA Limit' : 
                         data[hoveredIndex].income > THRESHOLDS_2025.twp ? 'TWP Service Month' : 'Below All Limits'}
                     </span>
                 </div>
                 <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-3 h-3 bg-white border-r border-b border-taupe/10"></div>
             </div>
         )}
       </div>
    </div>
  );
};

export default IncomeChart;