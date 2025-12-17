import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import ConfirmationModal from '../components/ConfirmationModal';
import IncomeChart from '../components/IncomeChart';
import { WorkEntry, PhaseType, CalculationResult, BenefitStatus } from '../types';
import { calculateStatus, formatCurrency, formatDateReadable, generateId, parseDate } from '../utils/logic';
import { THRESHOLDS_2025, EPE_DURATION } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';

const Dashboard: React.FC = () => {
  // Auth State
  const { user, loading: authLoading, signOut } = useAuth();
  
  // App State
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [status, setStatus] = useState<CalculationResult | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  
  // Selection State
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // UI State
  const [timelineView, setTimelineView] = useState<'current' | 'future'>('current');
  
  // Delete Modal State
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form State
  const [month, setMonth] = useState('');
  const [income, setIncome] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  const organicShape = { borderRadius: '45% 55% 70% 30% / 30% 30% 70% 70%' };

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      if (user && supabase) {
        const { data, error } = await supabase
          .from('work_entries')
          .select('*')
          .eq('user_id', user.id) 
          .order('month', { ascending: true });
        
        if (data && !error) {
          setEntries(data as WorkEntry[]);
        }
      } else {
        const saved = localStorage.getItem('disability_check_entries');
        if (saved) {
          try {
            setEntries(JSON.parse(saved));
          } catch (e) { console.error(e); }
        }
      }
      setIsLoadingData(false);
    };

    if (!authLoading) {
      loadData();
    }
  }, [user, authLoading]);

  // Update Status on entry change
  useEffect(() => {
    const result = calculateStatus(entries);
    setStatus(result);
    if (result.currentPhase === PhaseType.EPE) {
        setTimelineView('future');
    }
  }, [entries]);

  // Handle Save
  const saveEntry = async (newEntry: WorkEntry) => {
    setEntries(prev => {
        const updated = [...prev, newEntry];
        if (!user || !supabase) {
             localStorage.setItem('disability_check_entries', JSON.stringify(updated));
        }
        return updated;
    });
    
    setMonth('');
    setIncome('');
    setNote('');

    if (user && supabase) {
      const { data, error } = await supabase
        .from('work_entries')
        .insert([{ 
          month: newEntry.month,
          income: newEntry.income,
          note: newEntry.note,
          user_id: user.id 
        }])
        .select() 
        .single();
      
      if (error) {
        setEntries(prev => prev.filter(e => e.id !== newEntry.id));
        setFormError('Failed to save to cloud. Please check your connection.');
        setMonth(newEntry.month);
        setIncome(newEntry.income.toString());
        setNote(newEntry.note || '');
      } else if (data) {
        setEntries(prev => prev.map(e => e.id === newEntry.id ? { ...e, id: data.id } : e));
      }
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    if (selectedIds.length === entries.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(entries.map(e => e.id));
    }
  };

  const initiateDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIdsToDelete([id]);
  };

  const initiateBulkDelete = () => {
    if (selectedIds.length > 0) {
      setIdsToDelete(selectedIds);
    }
  };

  const confirmDelete = async () => {
    if (idsToDelete.length === 0) return;
    setIsDeleting(true);

    try {
        if (user && supabase) {
            const { error } = await supabase
                .from('work_entries')
                .delete()
                .in('id', idsToDelete)
                .eq('user_id', user.id);
            
            if (error) throw error;
        } else {
            const updated = entries.filter(e => !idsToDelete.includes(e.id));
            localStorage.setItem('disability_check_entries', JSON.stringify(updated));
        }

        setEntries(prev => prev.filter(e => !idsToDelete.includes(e.id)));
        setIdsToDelete([]);
        setSelectedIds([]);
    } catch (error) {
        console.error("Delete failed", error);
        alert("Could not delete entries. Please try refreshing the page.");
    } finally {
        setIsDeleting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!month || !income) return;

    const exists = entries.find(en => en.month === month);
    if (exists) {
        setFormError(`You already have an entry for ${formatDateReadable(month)}. Please delete it first if you wish to replace it.`);
        return;
    }

    const newEntry: WorkEntry = {
      id: generateId(),
      month,
      income: parseFloat(income),
      note
    };

    saveEntry(newEntry);
  };

  const getPhaseColor = (phase: PhaseType) => {
    switch (phase) {
      case PhaseType.TWP: return 'text-coral bg-peach/30';
      case PhaseType.EPE: return 'text-epeBlue bg-blue-50/50';
      case PhaseType.POST_EPE: return 'text-slate bg-gray-100/50';
      default: return 'text-slate bg-gray-100/50';
    }
  };

  const renderStatusLegend = () => {
    const legendItems = [
        { label: 'Paid', color: 'bg-successGreen', desc: 'Income < SGA' },
        { label: 'Grace Period', color: 'bg-blue-400', desc: '3-Month Safety Net' },
        { label: 'Suspended', color: 'bg-warningOrange', desc: 'Income > SGA' },
        { label: 'Terminated', color: 'bg-red-500', desc: 'Benefits Stopped' },
        { label: 'Trial Month', color: 'bg-coral', desc: 'TWP Usage' },
    ];

    return (
        <div className="mt-8 pt-6 border-t border-taupe/10">
            <h4 className="text-[10px] font-bold text-slate uppercase tracking-widest mb-4 opacity-60">Status Reference</h4>
            <div className="flex flex-wrap gap-x-8 gap-y-4">
                {legendItems.map((item) => (
                    <div key={item.label} className="flex items-center gap-3">
                        <div 
                            className={`w-3 h-3 ${item.color} shadow-sm`} 
                            style={organicShape}
                        />
                        <div>
                            <span className="block text-xs font-semibold text-burgundy leading-none mb-0.5">{item.label}</span>
                            <span className="block text-[10px] text-slate/60 leading-none">{item.desc}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
  };

  const renderEpeGrid = () => {
    const isProjected = !status?.epeStartDate;
    
    let epeStart: Date;
    if (isProjected) {
        const today = new Date();
        epeStart = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    } else {
        epeStart = parseDate(status!.epeStartDate!);
    }

    const months = [];
    
    for (let i = 0; i < EPE_DURATION; i++) {
        const d = new Date(epeStart);
        d.setMonth(d.getMonth() + i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const analyzedEntry = status?.entries.find(e => e.month === dateStr);
        const isPast = !isProjected && d < new Date();
        months.push({ date: d, dateStr, entry: analyzedEntry, isPast });
    }

    const year1 = months.slice(0, 12);
    const year2 = months.slice(12, 24);
    const year3 = months.slice(24, 36);

    const renderMonthDot = (m: any, idx: number) => {
        let bgClass = "bg-taupe/20"; 
        let title = `${m.dateStr}: No Record`;
        let label = "";
        let opacity = isProjected ? "opacity-60" : "opacity-100";
        let animation = "";

        if (m.entry) {
            if (!isProjected) animation = "animate-pop";
            
            switch(m.entry.benefitStatus) {
                case BenefitStatus.PAID:
                    bgClass = "bg-successGreen shadow-md shadow-successGreen/20";
                    title = `${m.dateStr}: Check Received (Income < SGA)`;
                    break;
                case BenefitStatus.GRACE:
                    bgClass = "bg-blue-400 shadow-md shadow-blue-400/20";
                    title = `${m.dateStr}: Grace Period (Check Received)`;
                    label = "GP";
                    break;
                case BenefitStatus.SUSPENDED:
                    bgClass = "bg-warningOrange shadow-md shadow-warningOrange/20";
                    title = `${m.dateStr}: Check Suspended (Income > SGA)`;
                    break;
                case BenefitStatus.TERMINATED:
                    bgClass = "bg-red-500 shadow-md shadow-red-500/20";
                    title = "Benefits Terminated";
                    break;
            }
        } else if (m.isPast) {
             bgClass = "bg-transparent border-slate/20 border";
             title = `${m.dateStr}: Missing Data`;
        }

        return (
            <div key={idx} className={`group relative ${opacity}`}>
                <div 
                    role="img"
                    aria-label={title}
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${bgClass} flex items-center justify-center text-[10px] text-white font-bold transition-all duration-300 hover:scale-110 cursor-help ${animation}`}
                    title={title}
                    style={{ animationDelay: `${idx * 30}ms` }}
                >
                    {label}
                </div>
            </div>
        );
    }

    const renderYearRow = (yearMonths: any[], yearNum: number) => (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 py-4 border-b border-taupe/10 last:border-0">
            <div className={`w-24 flex-shrink-0 ${isProjected ? 'opacity-50' : ''}`}>
                <span className="text-sm font-bold text-slate uppercase">Year {yearNum}</span>
                <span className="block text-xs text-slate/50">{yearMonths[0].date.getFullYear()}</span>
            </div>
            <div className="flex gap-2 flex-wrap">
                {yearMonths.map((m, idx) => renderMonthDot(m, idx))}
            </div>
        </div>
    );

    return (
        <div className="space-y-2 mt-6 relative">
            {isProjected && (
                <div className="mb-6 bg-taupe/10 rounded-xl p-4 flex items-start gap-4 border border-taupe/20 animate-fade-in-up">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 text-slate shadow-sm">
                        🔒
                    </div>
                    <div>
                        <h4 className="text-burgundy font-serif font-medium mb-1">Projected Future Timeline</h4>
                        <p className="text-slate text-sm font-light leading-relaxed">
                            This 36-month safety net is not active yet. It will begin automatically the month after your 9th Trial Work month is complete.
                        </p>
                    </div>
                </div>
            )}
            
            {renderYearRow(year1, 1)}
            {renderYearRow(year2, 2)}
            {renderYearRow(year3, 3)}
        </div>
    );
  };

  const forecast = (income: string) => {
      if (!income) return { message: "Enter an income amount to see how it affects your benefit check.", type: "neutral" };
      const amt = parseFloat(income);
      const isSga = amt >= THRESHOLDS_2025.sga;
      const isTwp = status?.currentPhase === PhaseType.TWP;
      
      if (isTwp) return { message: "You are in the Trial Work Period. You will receive your full benefit check regardless of this income.", type: "success" };
      if (isSga) return { message: "Warning: This income is above the SGA limit ($1,620). Unless you are in your Grace Period, your benefit check may be suspended for this month.", type: "warning" };
      return { message: "This income is below the SGA limit ($1,620). You should receive your full benefit check.", type: "success" };
  };

  const currentForecast = forecast(income);

  if (authLoading || isLoadingData) {
      return <Layout><div className="flex justify-center items-center h-[80vh] text-coral font-serif text-xl animate-pulse">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 fade-in-up gap-4">
            <div>
                <h1 className="text-4xl md:text-5xl font-serif text-burgundy mb-2">Your Dashboard</h1>
                <p className="text-xl text-slate font-light">
                    {user ? `Welcome, ${user.email}` : 'Tracking as Guest'}
                </p>
            </div>
            {user && (
                <button onClick={signOut} className="text-sm text-burgundy underline hover:text-coral transition-colors">
                    Sign Out
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="space-y-8 lg:col-span-1 fade-in-up delay-100">
            
            <Card variant="glass">
              <h2 className="text-lg font-serif text-burgundy mb-6">Current Phase</h2>
              
              {entries.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-slate mb-4 font-light">No work history found.</p>
                </div>
              ) : (
                <>
                  <div 
                    role="status"
                    aria-live="polite"
                    className={`text-center py-6 rounded-2xl mb-8 transition-colors duration-500 ${getPhaseColor(status?.currentPhase || PhaseType.UNKNOWN)}`}
                  >
                    <span className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Status</span>
                    <span className="text-2xl font-serif text-burgundy">{status?.currentPhase}</span>
                  </div>

                  {status?.currentPhase === PhaseType.TWP && (
                     <div className="space-y-6">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-slate">TWP Progress</span>
                            <span className="text-coral">{status.twpMonthsUsed} / 9</span>
                        </div>
                        <div className="w-full bg-peach/30 rounded-full h-1.5 overflow-hidden">
                            <div 
                                className="bg-gradient-to-r from-coral to-terracotta h-1.5 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(status.twpMonthsUsed / 9) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-slate font-light">
                           You have used <strong>{status.twpMonthsUsed}</strong> of your 9 trial work months.
                        </p>
                     </div>
                  )}

                  {(status?.currentPhase === PhaseType.EPE || status?.currentPhase === PhaseType.POST_EPE) && (
                      <div className="space-y-4 text-sm font-light">
                           <p className="text-charcoal leading-relaxed">
                               You are in the 36-month extended eligibility period. Your check depends on your monthly income relative to SGA.
                           </p>
                      </div>
                  )}
                </>
              )}
            </Card>

            <Card variant="glass" title="Add Work Month">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                  label="Month" 
                  type="month" 
                  value={month} 
                  onChange={(e) => setMonth(e.target.value)}
                  required
                />
                
                <div className="relative">
                  <label htmlFor="gross-income" className="text-sm font-semibold text-burgundy block mb-1.5">
                    Gross Income
                  </label>
                  <input
                    id="gross-income"
                    className="w-full px-4 py-3 rounded-xl border bg-white text-charcoal placeholder-slate/50 focus:outline-none focus:ring-2 focus:ring-coral border-taupe"
                    type="number" 
                    placeholder="0.00" 
                    min="0"
                    step="0.01"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    required
                  />
                </div>

                 <Input 
                    label="Notes" 
                    type="text" 
                    placeholder="e.g. Part-time job" 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                
                {formError && (
                    <div role="alert" className="p-4 bg-red-50 text-red-900 border-l-4 border-red-600 rounded-r-xl text-sm">
                        {formError}
                    </div>
                )}
                
                <div className={`p-4 rounded-xl text-sm border-l-4 ${currentForecast.type === 'warning' ? 'bg-orange-50 text-orange-900 border-warningOrange' : currentForecast.type === 'success' ? 'bg-green-50 text-green-900 border-successGreen' : 'bg-slate/5 text-slate-800 border-slate/30'}`}>
                    <strong className="block mb-1 text-xs uppercase tracking-wider opacity-80">Forecast</strong>
                    {currentForecast.message}
                </div>

                <Button type="submit" fullWidth className="bg-burgundy hover:bg-coral transition-all">Add Entry</Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-2 space-y-8 fade-in-up delay-200">
            
            {entries.length > 0 && (
              <Card variant="glass" title="Income Trends">
                  <IncomeChart entries={entries} />
              </Card>
            )}

             <Card variant="glass">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                     <div>
                        <h3 className="text-2xl font-serif text-burgundy mb-2">Timeline</h3>
                        <p className="text-slate font-light text-sm">Track your progress through the benefit phases.</p>
                     </div>
                     
                     <div className="flex p-1 bg-taupe/10 rounded-xl self-start">
                        <button 
                            onClick={() => setTimelineView('current')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timelineView === 'current' ? 'bg-white text-burgundy shadow-sm' : 'text-slate hover:text-burgundy'}`}
                        >
                            Current Phase
                        </button>
                        <button 
                            onClick={() => setTimelineView('future')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${timelineView === 'future' ? 'bg-white text-burgundy shadow-sm' : 'text-slate hover:text-burgundy'}`}
                        >
                            3-Year Outlook
                        </button>
                     </div>
                </div>
                
                <div>
                    {timelineView === 'current' ? (
                        <div className="relative py-12 px-4 overflow-x-auto no-scrollbar" tabIndex={0}>
                            <div className="flex gap-8 md:gap-12 min-w-max mx-auto px-4 justify-start md:justify-center">
                                {Array.from({ length: 9 }).map((_, idx) => {
                                    const isUsed = idx < (status?.twpMonthsUsed || 0);
                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-6 relative z-10">
                                            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-serif relative transition-all duration-500 ${isUsed ? 'text-white bg-coral shadow-luxury animate-pop' : 'bg-white border border-taupe/30 text-taupe'}`}>
                                                {idx + 1}
                                            </div>
                                            <span className={`text-[10px] uppercase tracking-wider font-bold ${isUsed ? 'text-coral' : 'text-slate/60'}`}>
                                                Month {idx + 1}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    ) : (
                        renderEpeGrid()
                    )}
                </div>

                {renderStatusLegend()}
             </Card>

             <Card variant="glass" title="Work History Log">
                <div className="mb-6 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        {entries.length > 0 && (
                            <button 
                                onClick={selectAll}
                                className="text-xs font-bold text-coral uppercase tracking-widest hover:underline"
                            >
                                {selectedIds.length === entries.length ? 'Deselect All' : 'Select All'}
                            </button>
                        )}
                        {selectedIds.length > 0 && (
                            <span className="text-xs font-medium text-slate">
                                {selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected
                            </span>
                        )}
                    </div>
                </div>

                {status?.entries.length === 0 ? (
                    <p className="text-slate font-light italic">No entries yet.</p>
                ) : (
                    <div className="space-y-3" role="list">
                        {status?.entries.map((entry, idx) => {
                            const isSelected = selectedIds.includes(entry.id);
                            return (
                                <div 
                                    key={entry.id} 
                                    className={`group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl transition-all duration-300 gap-4 border ${isSelected ? 'bg-coral/5 border-coral shadow-sm' : 'bg-white/40 hover:bg-white border-transparent'}`}
                                    role="listitem"
                                >
                                    <div className="flex items-center gap-4">
                                        <label className="relative flex items-center cursor-pointer">
                                            <input 
                                                type="checkbox" 
                                                className="sr-only" 
                                                checked={isSelected} 
                                                onChange={() => toggleSelect(entry.id)}
                                            />
                                            <div className={`w-5 h-5 rounded border-2 transition-all flex items-center justify-center ${isSelected ? 'bg-coral border-coral' : 'bg-white border-taupe group-hover:border-coral'}`}>
                                                {isSelected && (
                                                    <svg className="w-3.5 h-3.5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={4} d="M5 13l4 4L19 7" />
                                                    </svg>
                                                )}
                                            </div>
                                        </label>
                                        <div className="flex flex-col min-w-[140px]">
                                            <span className="font-serif text-burgundy text-lg">{formatDateReadable(entry.month)}</span>
                                            <span className="text-xs text-slate uppercase tracking-wider">{entry.phaseAtTime}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 flex-1 md:justify-end">
                                        <div className="flex flex-col md:items-end min-w-[100px]">
                                            <span className="font-sans font-medium text-charcoal">{formatCurrency(entry.income)}</span>
                                            {entry.note && <span className="text-xs text-slate font-light">{entry.note}</span>}
                                        </div>

                                        <div className="flex flex-wrap items-center justify-end gap-2 min-w-[160px]">
                                            <Badge status={entry.benefitStatus} />
                                        </div>
                                        
                                        <button 
                                            type="button"
                                            onClick={(e) => initiateDelete(entry.id, e)}
                                            className="text-slate hover:text-red-600 transition-colors opacity-50 hover:opacity-100 p-2"
                                            aria-label={`Delete ${formatDateReadable(entry.month)}`}
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {selectedIds.length > 0 && (
                    <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in-up">
                        <div className="bg-burgundy text-white px-6 py-4 rounded-2xl shadow-luxury flex items-center gap-8 border border-white/10 backdrop-blur-xl">
                            <span className="font-medium">{selectedIds.length} item{selectedIds.length !== 1 ? 's' : ''} selected</span>
                            <div className="flex gap-4">
                                <button 
                                    onClick={() => setSelectedIds([])}
                                    className="text-sm text-peach hover:text-white transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={initiateBulkDelete}
                                    className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold shadow-sm transition-all"
                                >
                                    Delete Selected
                                </button>
                            </div>
                        </div>
                    </div>
                )}
             </Card>
          </div>

        </div>
        
        <ConfirmationModal 
            isOpen={idsToDelete.length > 0}
            onClose={() => setIdsToDelete([])}
            onConfirm={confirmDelete}
            isLoading={isDeleting}
            title={idsToDelete.length > 1 ? "Bulk Delete" : "Delete Entry"}
            message={idsToDelete.length > 1 
              ? `Are you sure you want to delete these ${idsToDelete.length} entries? This cannot be undone.` 
              : `Are you sure you want to delete this entry? This action cannot be undone.`}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;