import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
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
  
  // UI State
  const [timelineView, setTimelineView] = useState<'current' | 'future'>('current');
  
  // Form State
  const [month, setMonth] = useState('');
  const [income, setIncome] = useState('');
  const [note, setNote] = useState('');

  // Initial Load (Strategy: Supabase if logged in, LocalStorage if guest)
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      if (user && supabase) {
        // Load from Supabase
        const { data, error } = await supabase
          .from('work_entries')
          .select('*')
          .eq('user_id', user.id) // Strict RLS enforcement
          .order('month', { ascending: true });
        
        if (data && !error) {
          setEntries(data as WorkEntry[]);
        }
      } else {
        // Load from LocalStorage
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
    // Auto-switch view if moved to EPE
    if (result.currentPhase === PhaseType.EPE) {
        setTimelineView('future');
    }
  }, [entries]);

  // Handle Save (Supabase vs LocalStorage)
  const saveEntry = async (newEntry: WorkEntry) => {
    if (user && supabase) {
      // Optimistic update
      setEntries(prev => [...prev, newEntry]);
      
      const { error } = await supabase
        .from('work_entries')
        .insert([{ 
          month: newEntry.month,
          income: newEntry.income,
          note: newEntry.note,
          user_id: user.id 
        }]);
      
      if (error) {
        console.error('Save failed', error);
        alert('Failed to save to cloud. Please check your connection.');
        setEntries(prev => prev.filter(e => e.id !== newEntry.id));
      }
    } else {
      const updated = [...entries, newEntry];
      setEntries(updated);
      localStorage.setItem('disability_check_entries', JSON.stringify(updated));
    }
  };

  const deleteEntry = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this entry?')) {
      if (user && supabase) {
        // Optimistic delete
        const prevEntries = [...entries];
        setEntries(prev => prev.filter(e => e.id !== id));

        const { error } = await supabase
          .from('work_entries')
          .delete()
          .match({ id: id, user_id: user.id });
          
        if (error) {
           const entryToDelete = prevEntries.find(e => e.id === id);
           if (entryToDelete) {
             await supabase
                .from('work_entries')
                .delete()
                .match({ month: entryToDelete.month, user_id: user.id });
           }
        }
      } else {
        const updated = entries.filter(e => e.id !== id);
        setEntries(updated);
        localStorage.setItem('disability_check_entries', JSON.stringify(updated));
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!month || !income) return;

    // Duplicate check
    const exists = entries.find(en => en.month === month);
    if (exists) {
        alert(`You already have an entry for ${month}. Please delete it first if you wish to replace it.`);
        return;
    }

    const newEntry: WorkEntry = {
      id: generateId(),
      month,
      income: parseFloat(income),
      note
    };

    saveEntry(newEntry);
    setMonth('');
    setIncome('');
    setNote('');
  };

  // --- DEBUG / DEMO HELPER ---
  const loadDemoData = () => {
    if(!window.confirm("This will clear your current entries and load a sample 9-month completed Trial Work Period. Continue?")) return;
    
    // Generate 9 months of data ending last month
    const demoEntries: WorkEntry[] = [];
    const today = new Date();
    for(let i=9; i>0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const mStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        demoEntries.push({
            id: generateId(),
            month: mStr,
            income: 1300, // Above TWP ($1050) but below SGA ($1620)
            note: "Demo Data: TWP Month"
        });
    }
    
    // Save locally for guest, warning for cloud
    if(user) {
        alert("Demo data is local-only for safety. Sign out to test properly or manually add entries.");
    } else {
        localStorage.setItem('disability_check_entries', JSON.stringify(demoEntries));
        setEntries(demoEntries);
        window.location.reload();
    }
  }


  // --- RENDER HELPERS ---

  const getPhaseColor = (phase: PhaseType) => {
    switch (phase) {
      case PhaseType.TWP: return 'text-coral bg-peach/30';
      case PhaseType.EPE: return 'text-epeBlue bg-blue-50/50';
      case PhaseType.POST_EPE: return 'text-slate bg-gray-100/50';
      default: return 'text-slate bg-gray-100/50';
    }
  };

  // 36-Month EPE Visualization
  const renderEpeGrid = () => {
    // If we have an actual EPE start date, use it.
    // If not (Projected view), calculate a hypothetical start date (e.g. next month)
    const isProjected = !status?.epeStartDate;
    
    let epeStart: Date;
    if (isProjected) {
        const today = new Date();
        epeStart = new Date(today.getFullYear(), today.getMonth() + 1, 1); // Next month
    } else {
        epeStart = parseDate(status!.epeStartDate!);
    }

    const months = [];
    
    // Generate 36 months of EPE
    for (let i = 0; i < EPE_DURATION; i++) {
        const d = new Date(epeStart);
        d.setMonth(d.getMonth() + i);
        const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        
        // Find entry for this month
        const analyzedEntry = status?.entries.find(e => e.month === dateStr);
        const isPast = !isProjected && d < new Date();
        
        months.push({ date: d, dateStr, entry: analyzedEntry, isPast });
    }

    // Split into 3 years (rows)
    const year1 = months.slice(0, 12);
    const year2 = months.slice(12, 24);
    const year3 = months.slice(24, 36);

    const renderMonthDot = (m: any, idx: number) => {
        let bgClass = "bg-taupe/20"; // Default (Future/Empty)
        let borderClass = "border-transparent";
        let title = `${m.dateStr}: No Record`;
        let label = "";
        let opacity = isProjected ? "opacity-40" : "opacity-100";

        if (m.entry) {
            switch(m.entry.benefitStatus) {
                case BenefitStatus.PAID:
                    bgClass = "bg-successGreen";
                    title = `${m.dateStr}: Check Received (Income < SGA)`;
                    break;
                case BenefitStatus.GRACE:
                    bgClass = "bg-blue-400";
                    title = `${m.dateStr}: Grace Period (Check Received)`;
                    label = "GP";
                    break;
                case BenefitStatus.SUSPENDED:
                    bgClass = "bg-warningOrange";
                    title = `${m.dateStr}: Check Suspended (Income > SGA)`;
                    break;
                case BenefitStatus.TERMINATED:
                    bgClass = "bg-red-500";
                    title = "Benefits Terminated";
                    break;
            }
        } else if (m.isPast) {
             bgClass = "bg-transparent border-slate/20 border"; // Past but no data
             title = `${m.dateStr}: Missing Data`;
        }

        return (
            <div key={idx} className={`group relative ${opacity}`}>
                <div 
                    className={`w-8 h-8 md:w-10 md:h-10 rounded-full ${bgClass} ${borderClass} flex items-center justify-center text-[10px] text-white font-bold transition-all duration-300 hover:scale-110 cursor-help`}
                    title={title}
                >
                    {label}
                </div>
                {/* Tooltip only if not projected or is interactive */}
                {!isProjected && (
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-max bg-charcoal text-white text-xs px-2 py-1 rounded shadow-lg z-20">
                        {title}
                    </div>
                )}
            </div>
        );
    }

    const renderYearRow = (yearMonths: any[], yearNum: number) => (
        <div className="flex flex-col md:flex-row items-start md:items-center gap-4 py-4 border-b border-taupe/10 last:border-0">
            <div className={`w-24 flex-shrink-0 ${isProjected ? 'opacity-40' : ''}`}>
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
                <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-sm rounded-xl border border-taupe/10 text-center p-4">
                    <div className="w-12 h-12 bg-taupe/20 rounded-full flex items-center justify-center mb-3">
                        🔒
                    </div>
                    <p className="text-burgundy font-serif text-lg mb-1">Projected View</p>
                    <p className="text-slate text-sm max-w-sm">
                        This 3-year safety net activates automatically once you complete your 9 Trial Work months.
                    </p>
                </div>
            )}
            
            {renderYearRow(year1, 1)}
            {renderYearRow(year2, 2)}
            {renderYearRow(year3, 3)}
            
            <div className="flex flex-wrap gap-4 text-xs text-slate mt-6 pt-4 border-t border-taupe/10 opacity-70">
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-successGreen"></div> Paid
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-400"></div> Grace Period
                </div>
                <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-warningOrange"></div> Suspended
                </div>
                 <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-taupe/20"></div> Future
                </div>
            </div>
        </div>
    );
  };

  // Forecast Card logic
  const getForecast = () => {
      // Return a default "Empty" state if no input
      if (!income) return { message: "Enter an income amount to see how it affects your benefit check.", type: "neutral" };
      
      const amt = parseFloat(income);
      const isSga = amt >= THRESHOLDS_2025.sga;
      const isTwp = status?.currentPhase === PhaseType.TWP;
      
      let message = "";
      let type = "neutral";

      if (isTwp) {
          message = "You are in the Trial Work Period. You will receive your full benefit check regardless of this income.";
          type = "success";
      } else {
          // EPE Logic simplified forecast
          if (isSga) {
             message = "Warning: This income is above the SGA limit ($1,620). Unless you are in your Grace Period, your benefit check may be suspended for this month.";
             type = "warning";
          } else {
             message = "This income is below the SGA limit ($1,620). You should receive your full benefit check.";
             type = "success";
          }
      }

      return { message, type };
  };

  const forecast = getForecast();

  if (authLoading || isLoadingData) {
      return <Layout><div className="flex justify-center items-center h-[80vh] text-coral font-serif text-xl">Loading...</div></Layout>;
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Header */}
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
          
          {/* LEFT COLUMN: Status & Form */}
          <div className="space-y-8 lg:col-span-1 fade-in-up delay-100">
            
            {/* 1. Status Card */}
            <Card variant="glass">
              <h2 className="text-lg font-serif text-burgundy mb-6">Current Phase</h2>
              
              {entries.length === 0 ? (
                <div className="text-center py-8">
                    <p className="text-slate mb-4 font-light">No work history found.</p>
                     {!user && (
                         <button onClick={loadDemoData} className="text-xs text-coral hover:underline">
                            Load Demo Data (Complete TWP)
                         </button>
                    )}
                </div>
              ) : (
                <>
                  <div className={`text-center py-6 rounded-2xl mb-8 ${getPhaseColor(status?.currentPhase || PhaseType.UNKNOWN)}`}>
                    <span className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Status</span>
                    <span className="text-2xl font-serif text-burgundy">{status?.currentPhase}</span>
                  </div>

                  {/* TWP Specific Status */}
                  {status?.currentPhase === PhaseType.TWP && (
                     <div className="space-y-6">
                        <div className="flex justify-between text-sm font-medium">
                            <span className="text-slate">TWP Progress</span>
                            <span className="text-coral">{status.twpMonthsUsed} / 9</span>
                        </div>
                        <div className="w-full bg-peach/30 rounded-full h-1.5">
                            <div 
                                className="bg-coral h-1.5 rounded-full transition-all duration-1000 ease-out"
                                style={{ width: `${(status.twpMonthsUsed / 9) * 100}%` }}
                            ></div>
                        </div>
                        <p className="text-sm text-slate font-light">
                           You have used <strong>{status.twpMonthsUsed}</strong> of your 9 trial work months. Benefits are protected.
                        </p>
                        <p className="text-xs text-slate/60 italic border-l-2 border-coral/30 pl-3">
                           Note: Only months with income above <strong>{formatCurrency(THRESHOLDS_2025.twp)}</strong> count toward this total.
                        </p>
                     </div>
                  )}

                  {/* EPE Specific Status */}
                  {(status?.currentPhase === PhaseType.EPE || status?.currentPhase === PhaseType.POST_EPE) && (
                      <div className="space-y-4 text-sm font-light">
                           <p className="text-charcoal leading-relaxed">
                               You are in the 36-month extended eligibility period. Your check depends on your monthly income relative to SGA.
                           </p>
                          <div className="flex justify-between py-2 border-b border-taupe/10">
                              <span>EPE Ends</span>
                              <span className="font-medium text-charcoal">{formatDateReadable(status?.epeEndDate || '')}</span>
                          </div>
                      </div>
                  )}
                </>
              )}
            </Card>

            {/* 2. Add Entry Form */}
            <Card variant="glass" title="Add Work Month">
              <form onSubmit={handleSubmit} className="space-y-6">
                <Input 
                  label="Month" 
                  type="month" 
                  value={month} 
                  onChange={(e) => setMonth(e.target.value)}
                  required
                />
                <Input 
                    label="Gross Income" 
                    type="number" 
                    placeholder="0.00" 
                    min="0"
                    step="0.01"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    helperText={`Limits: TWP $${THRESHOLDS_2025.twp} / SGA $${THRESHOLDS_2025.sga}`}
                    required
                />
                 <Input 
                    label="Notes" 
                    type="text" 
                    placeholder="e.g. Part-time job" 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                
                {/* Real-time Forecast */}
                <div className={`p-4 rounded-xl text-sm leading-relaxed transition-all duration-300
                    ${forecast.type === 'warning' ? 'bg-warningOrange/10 text-charcoal border border-warningOrange/30' : 
                      forecast.type === 'success' ? 'bg-successGreen/10 text-charcoal border border-successGreen/30' :
                      'bg-slate/5 text-slate border border-slate/10'
                    }`}>
                    <strong className="block mb-1 text-xs uppercase tracking-wider opacity-70">Forecast</strong>
                    {forecast.message}
                </div>

                <Button type="submit" fullWidth className="bg-burgundy hover:bg-coral">Add Entry</Button>
              </form>
            </Card>
          </div>

          {/* RIGHT COLUMN: Timeline & History */}
          <div className="lg:col-span-2 space-y-8 fade-in-up delay-200">
            
            {/* 3. Timeline / Long Term Tracker */}
             <Card variant="glass">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                     <div>
                        <h3 className="text-2xl font-serif text-burgundy mb-2">
                            Timeline
                        </h3>
                        <p className="text-slate font-light text-sm">
                            {timelineView === 'current' 
                                ? 'Your progress through the current work phase.' 
                                : 'A forward look at your 3-year benefit safety net.'}
                        </p>
                     </div>
                     
                     {/* View Toggles */}
                     <div className="flex p-1 bg-taupe/20 rounded-lg self-start">
                        <button 
                            onClick={() => setTimelineView('current')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timelineView === 'current' ? 'bg-white text-burgundy shadow-sm' : 'text-slate hover:text-burgundy'}`}
                        >
                            Current Phase
                        </button>
                        <button 
                            onClick={() => setTimelineView('future')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${timelineView === 'future' ? 'bg-white text-burgundy shadow-sm' : 'text-slate hover:text-burgundy'}`}
                        >
                            3-Year Outlook
                        </button>
                     </div>
                </div>
                
                {timelineView === 'current' ? (
                    /* TWP 9-Month View */
                    <div className="relative py-10 px-4 overflow-x-auto no-scrollbar">
                         {status?.currentPhase === PhaseType.EPE || status?.currentPhase === PhaseType.POST_EPE ? (
                             <div className="text-center py-10 text-slate">
                                 <p className="mb-4">Trial Work Period Completed!</p>
                                 <Button onClick={() => setTimelineView('future')} variant="outline" className="text-sm">View EPE Outlook</Button>
                             </div>
                         ) : (
                            <div className="flex gap-8 md:gap-12 min-w-max mx-auto px-4">
                                {Array.from({ length: 9 }).map((_, idx) => {
                                    const isUsed = idx < (status?.twpMonthsUsed || 0);
                                    return (
                                        <div key={idx} className="flex flex-col items-center gap-4 relative z-10">
                                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-serif transition-all duration-700
                                                ${isUsed 
                                                    ? 'bg-coral text-white shadow-lg scale-110' 
                                                    : 'bg-white border border-taupe/30 text-taupe'}`}
                                                >
                                                {idx + 1}
                                            </div>
                                            <span className="text-[10px] text-slate uppercase tracking-wider font-bold">Month {idx + 1}</span>
                                        </div>
                                    )
                                })}
                                <div className="absolute top-[64px] left-8 right-8 h-px bg-taupe/20 -z-0"></div>
                            </div>
                         )}
                    </div>
                ) : (
                    /* EPE 36-Month Grid View */
                    renderEpeGrid()
                )}
             </Card>

             {/* 4. Detailed History Table */}
             <Card variant="glass" title="Work History Log">
                {status?.entries.length === 0 ? (
                    <p className="text-slate font-light italic">No entries yet.</p>
                ) : (
                    <div className="overflow-hidden">
                        <div className="space-y-2">
                           {status?.entries.map((entry) => (
                               <div key={entry.id} className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-white/40 hover:bg-white/80 rounded-2xl transition-all duration-300 gap-4 border border-transparent hover:shadow-sm">
                                   <div className="flex items-center gap-4">
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

                                        {/* Status Badge */}
                                        <div className="flex flex-wrap items-center justify-end gap-2 min-w-[160px]">
                                            {/* TWP PHASE SPECIFIC BADGES */}
                                            {entry.phaseAtTime === PhaseType.TWP && (
                                                entry.isTwpMonth ? (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-coral/10 text-coral border border-coral/20">
                                                        TWP Service Month
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate/10 text-slate border border-slate/20">
                                                        Below Limit
                                                    </span>
                                                )
                                            )}
                                            
                                            {/* PAYMENT STATUS BADGES */}
                                            {entry.benefitStatus === BenefitStatus.PAID && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-successGreen/10 text-successGreen border border-successGreen/20">
                                                    Check Received
                                                </span>
                                            )}
                                            {entry.benefitStatus === BenefitStatus.GRACE && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-600 border border-blue-200">
                                                    Grace Period
                                                </span>
                                            )}
                                            {entry.benefitStatus === BenefitStatus.SUSPENDED && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-warningOrange/10 text-warningOrange border border-warningOrange/20">
                                                    Check Suspended
                                                </span>
                                            )}
                                            {entry.benefitStatus === BenefitStatus.TERMINATED && (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-600 border border-red-200">
                                                    Terminated
                                                </span>
                                            )}
                                        </div>
                                        
                                        <button 
                                            onClick={() => deleteEntry(entry.id)}
                                            className="self-end md:self-auto text-slate/40 hover:text-red-600 transition-colors opacity-100 md:opacity-0 group-hover:opacity-100"
                                            title="Delete Entry"
                                        >
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                            </svg>
                                        </button>
                                   </div>
                               </div>
                           ))}
                        </div>
                    </div>
                )}
             </Card>
          </div>

        </div>
      </div>
    </Layout>
  );
};

export default Dashboard;