import React, { useMemo, useState } from 'react';
import { WorkEntry } from '../types';
import { THRESHOLDS_2025 } from '../constants';
import { formatCurrency, formatDateReadable, parseDate } from '../utils/logic';

interface IncomeChartProps {
  entries: WorkEntry[];
}

const IncomeChart: React.FC<IncomeChartProps> = ({ entries }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // Sort entries chronologically
  const data = useMemo(() => {
    return [...entries].sort((a, b) => a.month.localeCompare(b.month));
  }, [entries]);

  if (data.length === 0) return null;

  // Chart Dimensions & Configuration
  const height = 300;
  const padding = { top: 40, right: 20, bottom: 40, left: 0 };
  const viewboxWidth = 1000;
  
  // Determine scales
  // Max Y is either the highest income or the SGA limit + buffer, rounded up to nearest 100
  const highestIncome = Math.max(...data.map(e => e.income));
  const maxIncomeDomain = Math.max(highestIncome, THRESHOLDS_2025.sga * 1.2);
  const chartMaxY = Math.ceil(maxIncomeDomain / 500) * 500;
  
  const getY = (income: number) => {
    const drawingHeight = height - padding.top - padding.bottom;
    const ratio = income / chartMaxY;
    return height - padding.bottom - (ratio * drawingHeight);
  };

  // Threshold Y positions
  const twpY = getY(THRESHOLDS_2025.twp);
  const sgaY = getY(THRESHOLDS_2025.sga);

  return (
    <div 
      className="w-full h-[350px] select-none relative"
      role="img"
      aria-label="Bar chart showing monthly income history. Dashed lines indicate TWP and SGA thresholds."
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
            {/* Background Grid Lines (Optional - e.g. every $1000) */}
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
            
            {/* --- THRESHOLD LINES --- */}
            
            {/* TWP Line */}
            <line 
                x1="0" y1={twpY} x2={viewboxWidth} y2={twpY} 
                stroke="#E8A573" strokeWidth="2" strokeDasharray="6,4" opacity="0.8" 
            />
            <text x="10" y={twpY - 8} fill="#E8A573" fontSize="12" fontWeight="bold">
                TWP ({formatCurrency(THRESHOLDS_2025.twp)})
            </text>

            {/* SGA Line */}
            <line 
                x1="0" y1={sgaY} x2={viewboxWidth} y2={sgaY} 
                stroke="#C95233" strokeWidth="2" strokeDasharray="6,4" opacity="0.8" 
            />
            <text x={viewboxWidth - 10} y={sgaY - 8} textAnchor="end" fill="#C95233" fontSize="12" fontWeight="bold">
                SGA ({formatCurrency(THRESHOLDS_2025.sga)})
            </text>


            {/* --- BARS --- */}
            {data.map((entry, i) => {
                const slotWidth = viewboxWidth / data.length;
                const barWidth = Math.min(60, slotWidth * 0.65);
                const x = (slotWidth * i) + (slotWidth - barWidth) / 2;
                const y = getY(entry.income);
                const barHeight = Math.max(height - padding.bottom - y, 4); // Min height 4px
                
                // Color Logic
                const isSga = entry.income > THRESHOLDS_2025.sga;
                const isTwp = entry.income > THRESHOLDS_2025.twp;
                
                let barColor = "#6B9E78"; // successGreen (Below TWP)
                if (isSga) barColor = "#C95233"; // terracotta (Above SGA)
                else if (isTwp) barColor = "#E67E50"; // coral (Above TWP)
                
                // Label Logic (Show mostly, hide if crowded)
                const showLabel = data.length <= 12 || i % Math.ceil(data.length / 12) === 0;

                return (
                    <g key={entry.id} 
                       onMouseEnter={() => setHoveredIndex(i)}
                       onMouseLeave={() => setHoveredIndex(null)}
                       className="group"
                    >
                        {/* Hover Highlight Area (invisible but captures mouse) */}
                        <rect 
                            x={slotWidth * i} 
                            y={padding.top} 
                            width={slotWidth} 
                            height={height - padding.top - padding.bottom} 
                            fill="transparent" 
                        />
                        
                        {/* The Bar */}
                        <rect 
                            x={x} 
                            y={y} 
                            width={barWidth} 
                            height={barHeight} 
                            fill={barColor} 
                            rx="4"
                            className="transition-opacity duration-200 hover:opacity-80"
                        />

                        {/* Month Label */}
                        {showLabel && (
                            <text 
                                x={x + barWidth/2} 
                                y={height - 15} 
                                textAnchor="middle" 
                                fill="#6B5B5F" 
                                fontSize="11"
                                fontWeight="500"
                                className="uppercase tracking-wide"
                            >
                                {parseDate(entry.month).toLocaleDateString('en-US', { month: 'short', year: '2-digit' })}
                            </text>
                        )}
                    </g>
                );
            })}
         </svg>
         
         {/* --- TOOLTIP --- */}
         {hoveredIndex !== null && data[hoveredIndex] && (
             <div 
                className="absolute pointer-events-none z-20 bg-white/95 backdrop-blur shadow-luxury rounded-xl p-3 border border-taupe/20 transform -translate-x-1/2 -translate-y-full transition-all duration-75"
                style={{
                    left: `${((hoveredIndex + 0.5) / data.length) * 100}%`,
                    top: getY(data[hoveredIndex].income) - 16,
                    minWidth: '120px'
                }}
                aria-hidden="true"
             >
                 <div className="text-center">
                     <p className="text-[10px] text-slate uppercase font-bold tracking-wider mb-1">
                        {formatDateReadable(data[hoveredIndex].month)}
                     </p>
                     <p className="text-xl font-serif text-burgundy font-medium">
                        {formatCurrency(data[hoveredIndex].income)}
                     </p>
                     <p className="text-[10px] text-slate/60 mt-1 italic">
                        {data[hoveredIndex].income > THRESHOLDS_2025.sga ? 'Above SGA' : 
                         data[hoveredIndex].income > THRESHOLDS_2025.twp ? 'TWP Month' : 'Below Limits'}
                     </p>
                 </div>
                 {/* Little triangle arrow */}
                 <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 w-2 h-2 bg-white border-r border-b border-taupe/20"></div>
             </div>
         )}
       </div>
    </div>
  );
};

export default IncomeChart;