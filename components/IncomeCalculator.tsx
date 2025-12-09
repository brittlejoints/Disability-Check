import React, { useState, useEffect } from 'react';
import Button from './Button';
import Input from './Input';
import { generateId, calculateAttributedIncome, formatDateReadable, formatCurrency } from '../utils/logic';

interface IncomeCalculatorProps {
  targetMonth: string;
  onApply: (total: number) => void;
  onClose: () => void;
}

interface IncomeItem {
  id: string;
  amount: string;
  expenses: string; // Only used for SE
  start: string;
  end: string;
}

type CalculatorMode = 'w2' | 'se';

const IncomeCalculator: React.FC<IncomeCalculatorProps> = ({ targetMonth, onApply, onClose }) => {
  const [mode, setMode] = useState<CalculatorMode>('w2');
  const [items, setItems] = useState<IncomeItem[]>([
    { id: generateId(), amount: '', expenses: '', start: '', end: '' }
  ]);
  const [totalAttributed, setTotalAttributed] = useState(0);

  // Recalculate whenever items or mode change
  useEffect(() => {
    let sum = 0;
    items.forEach(item => {
        if(item.amount && item.start && item.end) {
            let baseAmount = parseFloat(item.amount);
            
            // For Self-Employed: Deduct expenses to get Net Earnings (NESE)
            if (mode === 'se' && item.expenses) {
                baseAmount -= parseFloat(item.expenses);
            }

            // If expenses exceed revenue, count as 0 (loss), not negative for SGA purposes usually
            baseAmount = Math.max(0, baseAmount);

            sum += calculateAttributedIncome(
                baseAmount,
                item.start,
                item.end,
                targetMonth
            );
        }
    });
    setTotalAttributed(sum);
  }, [items, targetMonth, mode]);

  const addItem = () => {
    setItems([...items, { id: generateId(), amount: '', expenses: '', start: '', end: '' }]);
  };

  const removeItem = (id: string) => {
    if(items.length > 1) {
        setItems(items.filter(s => s.id !== id));
    } else {
        // Reset last one
        setItems([{ id: generateId(), amount: '', expenses: '', start: '', end: '' }]);
    }
  };

  const updateItem = (id: string, field: keyof IncomeItem, value: string) => {
    setItems(items.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  // Terminology helpers
  const labels = mode === 'w2' ? {
      title: 'Gross Wages',
      item: 'Pay Stub',
      amount: 'Gross Amount',
      add: 'Add Another Pay Stub',
      helper: 'Enter gross wages (before taxes) for each pay period.'
  } : {
      title: 'Net Earnings',
      item: 'Project / Invoice',
      amount: 'Gross Revenue',
      add: 'Add Another Source',
      helper: 'Enter gross revenue and deductible business expenses to calculate Net Earnings (NESE).'
  };

  return (
    <div 
        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-charcoal/20 backdrop-blur-sm animate-fade-in-up"
        role="dialog"
        aria-modal="true"
        aria-labelledby="calculator-title"
    >
      <div className="bg-white rounded-3xl shadow-luxury w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-6 md:p-8 bg-blush border-b border-taupe/10">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 id="calculator-title" className="text-2xl font-serif text-burgundy mb-2">Income Calculator</h3>
                    <p className="text-slate font-light text-sm">
                        Calculating <strong>{labels.title}</strong> for <strong>{formatDateReadable(targetMonth)}</strong>.
                        We prorate amounts across split dates.
                    </p>
                </div>
                <button 
                    onClick={onClose} 
                    className="text-slate hover:text-burgundy transition-colors focus:outline-none focus:ring-2 focus:ring-coral rounded-lg p-1"
                    aria-label="Close Calculator"
                >
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
            </div>

            {/* Mode Toggle */}
            <div className="flex p-1 bg-taupe/10 rounded-xl border border-taupe/10 relative" role="group" aria-label="Income Type">
                <button 
                    onClick={() => setMode('w2')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'w2' ? 'bg-white text-burgundy shadow-sm' : 'text-slate hover:text-burgundy'}`}
                    aria-pressed={mode === 'w2'}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                    Employee (Gross Wages)
                </button>
                <button 
                    onClick={() => setMode('se')}
                    className={`flex-1 py-3 rounded-lg text-sm font-bold transition-all duration-300 flex items-center justify-center gap-2 ${mode === 'se' ? 'bg-white text-burgundy shadow-sm' : 'text-slate hover:text-burgundy'}`}
                    aria-pressed={mode === 'se'}
                >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    Self-Employed (Net Earnings)
                </button>
            </div>
             <p className="mt-3 text-xs text-slate italic bg-white/50 p-2 rounded-lg border border-taupe/10">
                {labels.helper}
            </p>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar flex-1 bg-gray-50/30">
            <div className="space-y-6">
                {items.map((item, index) => {
                    let baseAmount = parseFloat(item.amount || '0');
                    let netAmount = baseAmount;

                    if (mode === 'se' && item.expenses) {
                        netAmount = Math.max(0, baseAmount - parseFloat(item.expenses));
                    }

                    const attributed = (item.amount && item.start && item.end) 
                        ? calculateAttributedIncome(netAmount, item.start, item.end, targetMonth)
                        : 0;

                    return (
                        <div key={item.id} className="p-5 rounded-2xl border border-taupe/20 bg-white shadow-sm relative group transition-shadow hover:shadow-md">
                            <div className="flex justify-between items-center mb-4">
                                <span className="text-xs font-bold text-coral uppercase tracking-wider">{labels.item} #{index + 1}</span>
                                <button 
                                    onClick={() => removeItem(item.id)} 
                                    className="text-slate/40 hover:text-red-500 transition-colors"
                                    title="Remove Item"
                                    aria-label={`Remove ${labels.item} ${index + 1}`}
                                >
                                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <Input 
                                    label={labels.amount}
                                    type="number" 
                                    placeholder="0.00"
                                    value={item.amount}
                                    onChange={(e) => updateItem(item.id, 'amount', e.target.value)}
                                />
                                {mode === 'se' && (
                                     <Input 
                                        label="Business Expenses"
                                        type="number" 
                                        placeholder="0.00"
                                        value={item.expenses}
                                        onChange={(e) => updateItem(item.id, 'expenses', e.target.value)}
                                        className="text-red-600"
                                    />
                                )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                                <Input 
                                    label="Start Date" 
                                    type="date"
                                    value={item.start}
                                    onChange={(e) => updateItem(item.id, 'start', e.target.value)}
                                />
                                <Input 
                                    label="End Date" 
                                    type="date"
                                    value={item.end}
                                    onChange={(e) => updateItem(item.id, 'end', e.target.value)}
                                />
                            </div>

                            {/* Item Result Preview */}
                            {(attributed > 0 || (mode === 'se' && item.amount)) && (
                                <div className="mt-4 pt-4 border-t border-taupe/10 flex justify-between text-sm items-center">
                                    {mode === 'se' && (
                                        <div className="flex flex-col">
                                            <span className="text-xs text-slate">Calculation: Revenue - Expenses</span>
                                            <span className="font-semibold text-charcoal">
                                                {formatCurrency(parseFloat(item.amount || '0'))} - {formatCurrency(parseFloat(item.expenses || '0'))} = <span className="text-burgundy">{formatCurrency(netAmount)} Net</span>
                                            </span>
                                        </div>
                                    )}
                                    <div className="ml-auto text-right">
                                        <span className="text-slate mr-2 block text-xs">Prorated for {formatDateReadable(targetMonth)}</span>
                                        <span className="font-bold text-burgundy text-lg">{formatCurrency(attributed)}</span>
                                    </div>
                                </div>
                            )}
                        </div>
                    );
                })}

                <button 
                    onClick={addItem}
                    className="w-full py-4 border-2 border-dashed border-taupe/30 rounded-2xl text-slate hover:text-coral hover:border-coral hover:bg-coral/5 transition-all text-sm font-medium flex items-center justify-center gap-2 group"
                >
                    <div className="w-6 h-6 rounded-full bg-taupe/20 text-slate group-hover:bg-coral group-hover:text-white flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                        </svg>
                    </div>
                    {labels.add}
                </button>
            </div>
        </div>

        {/* Footer */}
        <div className="p-6 md:p-8 bg-white border-t border-taupe/10 flex flex-col md:flex-row items-center justify-between gap-6 z-10 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
            <div className="text-center md:text-left">
                <p className="text-xs text-slate uppercase tracking-wider font-bold mb-1">Total {mode === 'se' ? 'Net ' : ''}Income</p>
                <p className="text-3xl font-serif text-burgundy">{formatCurrency(totalAttributed)}</p>
            </div>
            <div className="flex gap-4 w-full md:w-auto">
                <Button variant="outline" onClick={onClose} className="flex-1 md:flex-none border-taupe text-slate hover:border-burgundy hover:text-burgundy">Cancel</Button>
                <Button onClick={() => onApply(totalAttributed)} className="flex-1 md:flex-none bg-burgundy hover:bg-coral shadow-lg hover:shadow-xl hover:-translate-y-0.5">
                    Use Calculated Amount
                </Button>
            </div>
        </div>

      </div>
    </div>
  );
};

export default IncomeCalculator;