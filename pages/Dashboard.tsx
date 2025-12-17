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
  
  // UI State
  const [timelineView, setTimelineView] = useState<'current' | 'future'>('current');
  
  // Delete Modal State
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Form State
  const [month, setMonth] = useState('');
  const [income, setIncome] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);

  // Initial Load
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      if (user && supabase) {
        // Load from Supabase
        const { data, error } = await supabase
          .from('work_entries')
          .select('*')
          .eq('user_id', user.id) 
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

  // Handle Save
  const saveEntry = async (newEntry: WorkEntry) => {
    // 1. Optimistic Update (Update UI immediately)
    setEntries(prev => {
        const updated = [...prev, newEntry];
        // If guest mode, sync to LS immediately
        if (!user || !supabase) {
             localStorage.setItem('disability_check_entries', JSON.stringify(updated));
        }
        return updated;
    });
    
    // Clear inputs immediately
    setMonth('');
    setIncome('');
    setNote('');

    // 2. Cloud Sync (if logged in)
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
        console.error('Save failed', error);
        
        // Revert the optimistic update
        setEntries(prev => prev.filter(e => e.id !== newEntry.id));
        
        // Show error and restore inputs
        setFormError('Failed to save to cloud. Please check your connection.');
        setMonth(newEntry.month);
        setIncome(newEntry.income.toString());
        setNote(newEntry.note || '');
      } else if (data) {
        // Success: Update the temporary ID with the real UUID from Supabase
        setEntries(prev => prev.map(e => e.id === newEntry.id ? { ...e, id: data.id } : e));
      }
    }
  };

  const initiateDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setEntryToDelete(id);
  };

  const confirmDelete = async () => {
    if (!entryToDelete) return;
    setIsDeleting(true);

    const id = entryToDelete;
    const prevEntries = [...entries];
    const entryObj = prevEntries.find(e => e.id === id);

    try {
        if (user && supabase) {
            if (!entryObj) throw new Error("Entry not found");

            let deleteSuccess = false;

            // Attempt 1: Delete by ID (if it looks like a valid UUID)
            if (id.length > 30) {
                 const { error } = await supabase
                    .from('work_entries')
                    .delete()
                    .eq('id', id)
                    .eq('user_id', user.id);
                
                 if (!error) deleteSuccess = true;
            }

            // Attempt 2: Fallback to delete by Month
            if (!deleteSuccess) {
                console.log("Using fallback delete by month...");
                const { error } = await supabase
                    .from('work_entries')
                    .delete()
                    .eq('month', entryObj.month)
                    .eq('user_id', user.id);
                
                if (error) throw error;
            }
        } else {
            // Guest Mode
            const updated = entries.filter(e => e.id !== id);
            localStorage.setItem('disability_check_entries', JSON.stringify(updated));
        }

        // Update UI State (Success)
        setEntries(prev => prev.filter(e => e.id !== id));
        setEntryToDelete(null); // Close modal
    } catch (error) {
        console.error("Delete failed", error);
        alert("Could not delete entry. Please try refreshing the page.");
    } finally {
        setIsDeleting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!month || !income) return;

    // Duplicate check
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

  // --- DEBUG / DEMO HELPER ---
  const loadDemoData = () => {
    if(!window.confirm("This will clear your current entries and load a sample 9-month completed Trial Work Period. Continue?")) return;
    
    const demoEntries: WorkEntry[] = [];
    const today = new Date();
    for(let i=9; i>0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const mStr = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
        demoEntries.push({
            id: generateId(),
            month: mStr,
            income: 1300,
            note: "Demo Data: TWP Month"
        });
    }
    
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
            
            <div className="flex flex-wrap gap-4 text-xs text-slate mt-6 pt-4 border-t border-taupe/10 opacity-70">
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-successGreen"></div> Paid</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-blue-400"></div> Grace Period</div>
                <div className="flex items-center gap-2"><div className="w-3 h-3 rounded-full bg-warningOrange"></div> Suspended</div>
            </div>
        </div>
    );
  };

  // Forecast Card logic
  const getForecast = () => {
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

  // Get label for delete modal
  const entryToDeleteLabel = entryToDelete 
    ? formatDateReadable(entries.find(e => e.id === entryToDelete)?.month || '') 
    : 'this item';

  if (authLoading || isLoadingData) {
      return <Layout><div className="flex justify-center items-center h-[80vh] text-coral font-serif text-xl animate-pulse">Loading...</div></Layout>;
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
                  <div 
                    role="status"
                    aria-live="polite"
                    aria-atomic="true"
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
                        <div className="w-full bg-peach/30 rounded-full h-1.5 overflow-hidden" aria-hidden="true">
                            <div 
                                className="bg-gradient-to-r from-coral to-terracotta h-1.5 rounded-full transition-all duration-1000 ease-out"
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
                
                <div className="relative">
                  <div className="flex justify-between items-center mb-1.5">
                    <label htmlFor="gross-income" className="text-sm font-semibold text-burgundy">
                      Gross Income
                    </label>
                    <a 
                        href="#/income-guide" 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs font-bold text-coral hover:text-terracotta hover:underline transition-colors focus:outline-none"
                    >
                        Need help calculating?
                    </a>
                  </div>
                  <input
                    id="gross-income"
                    className="w-full px-4 py-3 rounded-xl border bg-white text-charcoal placeholder-slate/50 
                      focus:outline-none focus:ring-2 focus:ring-coral focus:border-coral transition-colors border-taupe"
                    type="number" 
                    placeholder="0.00" 
                    min="0"
                    step="0.01"
                    value={income}
                    onChange={(e) => setIncome(e.target.value)}
                    required
                  />
                  <p className="text-xs text-slate mt-1.5">Limits: TWP ${THRESHOLDS_2025.twp} / SGA ${THRESHOLDS_2025.sga}</p>
                </div>

                 <Input 
                    label="Notes" 
                    type="text" 
                    placeholder="e.g. Part-time job" 
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                />
                
                {/* ACCESSIBLE ERROR ALERT */}
                {formError && (
                    <div 
                      role="alert" 
                      aria-live="assertive" 
                      className="flex items-start gap-3 p-4 bg-red-50 text-red-900 border-l-4 border-red-600 rounded-r-xl shadow-sm animate-fade-in-up"
                    >
                        <div className="flex-shrink-0 text-red-600 mt-0.5">
                           <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                           </svg>
                        </div>
                        <div>
                           <h4 className="text-sm font-bold leading-none mb-1">Action Required</h4>
                           <p className="text-sm leading-snug">{formError}</p>
                        </div>
                    </div>
                )}
                
                {/* ACCESSIBLE FORECAST */}
                <div 
                    aria-live="polite"
                    className={`flex items-start gap-3 p-4 rounded-xl text-sm leading-relaxed transition-all duration-500 ease-out border-l-4
                    ${forecast.type === 'warning' ? 'bg-orange-50 text-orange-900 border-warningOrange' : 
                      forecast.type === 'success' ? 'bg-green-50 text-green-900 border-successGreen' :
                      'bg-slate/5 text-slate-800 border-slate/30'
                    }`}
                >
                    <div className="flex-shrink-0 mt-0.5">
                         {forecast.type === 'warning' ? (
                            <svg className="w-5 h-5 text-orange-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                         ) : forecast.type === 'success' ? (
                            <svg className="w-5 h-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                         ) : (
                             <svg className="w-5 h-5 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                             </svg>
                         )}
                    </div>
                    <div>
                        <strong className="block mb-1 text-xs uppercase tracking-wider opacity-80">Forecast</strong>
                        {forecast.message}
                    </div>
                </div>

                <Button type="submit" fullWidth className="bg-burgundy hover:bg-coral shadow-lg shadow-coral/20 hover:shadow-xl hover:shadow-coral/30 transform hover:-translate-y-0.5 transition-all duration-300">Add Entry</Button>
              </form>
            </Card>
          </div>

          {/* RIGHT COLUMN: Timeline & History */}
          <div className="lg:col-span-2 space-y-8 fade-in-up delay-200">
            
            {/* NEW CHART CARD */}
            {entries.length > 0 && (
              <Card variant="glass" title="Income Trends">
                  <IncomeChart entries={entries} />
                  <div className="flex flex-wrap gap-4 md:gap-6 mt-6 justify-center text-xs text-slate">
                      <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-[#6B9E78]"></span> Below TWP
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-[#E67E50]"></span> TWP Usage
                      </div>
                      <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded bg-[#C95233]"></span> Over SGA
                      </div>
                  </div>
              </Card>
            )}

            {/* 3. Timeline / Long Term Tracker */}
             <Card variant="glass">
                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                     <div>
                        <h3 className="text-2xl font-serif text-burgundy mb-2">Timeline</h3>
                        <p className="text-slate font-light text-sm">
                            {timelineView === 'current' 
                                ? 'Your progress through the current work phase.' 
                                : 'A forward look at your 3-year benefit safety net.'}
                        </p>
                     </div>
                     
                     <div className="flex p-1 bg-taupe/10 rounded-xl self-start border border-taupe/10">
                        <button 
                            onClick={() => setTimelineView('current')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${timelineView === 'current' ? 'bg-white text-burgundy shadow-sm' : 'text-slate hover:text-burgundy'}`}
                            aria-selected={timelineView === 'current'}
                        >
                            Current Phase
                        </button>
                        <button 
                            onClick={() => setTimelineView('future')}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${timelineView === 'future' ? 'bg-white text-burgundy shadow-sm' : 'text-slate hover:text-burgundy'}`}
                            aria-selected={timelineView === 'future'}
                        >
                            3-Year Outlook
                        </button>
                     </div>
                </div>
                
                <div aria-live="polite" aria-atomic="true">
                    {timelineView === 'current' ? (
                        /* TWP 9-Month View */
                        <div 
                            className="relative py-12 px-4 overflow-x-auto no-scrollbar outline-none focus:ring-2 focus:ring-coral focus:ring-offset-2 rounded-xl"
                            tabIndex={0}
                            role="region"
                            aria-label="Trial Work Period Timeline"
                        >
                            {status?.currentPhase === PhaseType.EPE || status?.currentPhase === PhaseType.POST_EPE ? (
                                <div className="text-center py-10 text-slate fade-in-up">
                                    <p className="mb-4 text-lg">Trial Work Period Completed!</p>
                                    <Button onClick={() => setTimelineView('future')} variant="outline" className="text-sm">View EPE Outlook</Button>
                                </div>
                            ) : (
                                <div className="flex gap-8 md:gap-12 min-w-max mx-auto px-4 justify-start md:justify-center">
                                    {/* Background Line */}
                                    <div className="absolute top-[88px] left-8 right-8 h-0.5 bg-taupe/20 -z-0 rounded-full" aria-hidden="true">
                                    <div 
                                        className="h-full bg-gradient-to-r from-coral to-terracotta transition-all duration-1000 ease-out rounded-full opacity-50"
                                        style={{ width: `${(status?.twpMonthsUsed || 0) * 11}%` }} 
                                    ></div>
                                    </div>

                                    {Array.from({ length: 9 }).map((_, idx) => {
                                        const isUsed = idx < (status?.twpMonthsUsed || 0);
                                        const isNext = idx === (status?.twpMonthsUsed || 0);
                                        
                                        // Stagger delay for entry animation
                                        const delayStyle = { animationDelay: `${idx * 150}ms` };
                                        
                                        // Accessible label
                                        const label = `Month ${idx+1}: ${isUsed ? 'Used' : 'Available'}`;

                                        return (
                                            <div key={idx} className="flex flex-col items-center gap-6 relative z-10 group" aria-label={label} role="img">
                                                <div 
                                                    style={delayStyle}
                                                    className={`
                                                        w-14 h-14 rounded-full flex items-center justify-center text-xl font-serif relative overflow-hidden transition-all duration-500
                                                        ${isUsed 
                                                            ? 'text-white shadow-luxury animate-pop' 
                                                            : 'bg-white border border-taupe/30 text-taupe'}
                                                        ${isNext ? 'border-coral border-2 border-dashed shadow-soft' : ''}
                                                    `}
                                                >
                                                    {/* Gradient Background Layer for used state */}
                                                    {isUsed && (
                                                        <div className="absolute inset-0 bg-gradient-to-br from-coral to-terracotta opacity-100" />
                                                    )}
                                                    
                                                    {/* Number */}
                                                    <span className="relative z-10">{idx + 1}</span>
                                                </div>
                                                
                                                {/* Label */}
                                                <span className={`text-[10px] uppercase tracking-wider font-bold transition-colors duration-300 ${isUsed ? 'text-coral' : 'text-slate/60'}`}>
                                                    Month {idx + 1}
                                                </span>
                                            </div>
                                        )
                                    })}
                                </div>
                            )}
                        </div>
                    ) : (
                        renderEpeGrid()
                    )}
                </div>
             </Card>

             {/* 4. Detailed History Table */}
             <Card variant="glass" title="Work History Log">
                {/* NEW LEGEND START */}
                <div className="mb-8 p-6 bg-white/60 rounded-2xl border border-taupe/10">
                    <div className="flex items-center gap-2 mb-4 opacity-80">
                         <svg className="w-5 h-5 text-burgundy" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                         <h4 className="text-xs font-bold text-burgundy uppercase tracking-widest">Understanding Your Status</h4>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {/* Paid */}
                        <div className="space-y-2">
                             <div className="flex items-center gap-2 text-successGreen">
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" /></svg>
                                 <span className="font-bold text-sm">Check Received</span>
                             </div>
                             <p className="text-xs text-slate font-light leading-relaxed">
                                 Safe. Earnings are below SGA ({formatCurrency(THRESHOLDS_2025.sga)}) OR you are in your Trial Work Period.
                             </p>
                        </div>
                        {/* Grace */}
                        <div className="space-y-2">
                             <div className="flex items-center gap-2 text-blue-600">
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                 <span className="font-bold text-sm">Grace Period</span>
                             </div>
                             <p className="text-xs text-slate font-light leading-relaxed">
                                 Protected. A 3-month safety net after TWP ends. You get paid even if you earn over the limit.
                             </p>
                        </div>
                        {/* Suspended */}
                        <div className="space-y-2">
                             <div className="flex items-center gap-2 text-warningOrange">
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                                 <span className="font-bold text-sm">Suspended</span>
                             </div>
                             <p className="text-xs text-slate font-light leading-relaxed">
                                 No Check. Earnings exceeded SGA ({formatCurrency(THRESHOLDS_2025.sga)}) during the Extended Period (EPE).
                             </p>
                        </div>
                        {/* Terminated */}
                        <div className="space-y-2">
                             <div className="flex items-center gap-2 text-red-600">
                                 <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                                 <span className="font-bold text-sm">Terminated</span>
                             </div>
                             <p className="text-xs text-slate font-light leading-relaxed">
                                 Benefits Stopped. The EPE has ended and earnings remain high.
                             </p>
                        </div>
                    </div>
                </div>

                {status?.entries.length === 0 ? (
                    <p className="text-slate font-light italic">No entries yet.</p>
                ) : (
                    <div className="overflow-hidden">
                        <div className="space-y-3" role="list">
                           {status?.entries.map((entry, idx) => (
                               <div 
                                 key={entry.id} 
                                 className="group flex flex-col md:flex-row md:items-center justify-between p-5 bg-white/40 hover:bg-white rounded-2xl transition-all duration-300 gap-4 border border-transparent hover:shadow-soft hover:scale-[1.01]"
                                 style={{ animationDelay: `${idx * 50}ms` }}
                                 role="listitem"
                               >
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

                                        <div className="flex flex-wrap items-center justify-end gap-2 min-w-[160px]">
                                            {/* TWP Status Badges */}
                                            {entry.phaseAtTime === PhaseType.TWP && (
                                                entry.isTwpMonth ? 
                                                 <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-coral/10 text-coral border border-coral/20">TWP Service Month</span>
                                                 : <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-slate/10 text-slate border border-slate/20">Below Limit</span>
                                            )}

                                            {/* Benefit Status Badge */}
                                            <Badge status={entry.benefitStatus} />
                                        </div>
                                        
                                        <button 
                                            type="button"
                                            onClick={(e) => initiateDelete(entry.id, e)}
                                            className="self-end md:self-auto text-slate hover:text-red-600 transition-colors opacity-50 hover:opacity-100 p-2 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-red-500 rounded-lg"
                                            title="Delete Entry"
                                            aria-label={`Delete entry for ${formatDateReadable(entry.month)}`}
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
        
        {/* DELETE CONFIRMATION MODAL */}
        <ConfirmationModal 
            isOpen={!!entryToDelete}
            onClose={() => setEntryToDelete(null)}
            onConfirm={confirmDelete}
            isLoading={isDeleting}
            title="Delete Entry"
            message={`Are you sure you want to delete the entry for ${entryToDelete ? (entries.find(e => e.id === entryToDelete)?.month ? formatDateReadable(entries.find(e => e.id === entryToDelete)!.month) : 'this item') : 'this item'}? This action cannot be undone.`}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;