import * as React from 'react';
import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import ConfirmationModal from '../components/ConfirmationModal';
import IncomeChart from '../components/IncomeChart';
import IncomeCalculator from '../components/IncomeCalculator';
import { LoadingSpinner, WarningIcon, MilestoneIcon, announce, CalculatorIcon } from '../components/AccessibleIcons';
import { WorkEntry, PhaseType, CalculationResult, BenefitStatus } from '../types';
import { calculateStatus, formatCurrency, formatDateReadable, generateId } from '../utils/logic';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { Link } from 'react-router-dom';
import { EmptyStatePlot, JourneyPlot, ProtectivePlot, ConnectionPlot, MilestoneMosaic } from '../components/GeometricIllustrations';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [status, setStatus] = useState<CalculationResult | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [month, setMonth] = useState('');
  const [income, setIncome] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isCalcOpen, setIsCalcOpen] = useState(false);

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
        const warningDismissed = sessionStorage.getItem('dc_guest_warning_dismissed');
        if (!warningDismissed) setShowGuestWarning(true);
      }
      setIsLoadingData(false);
      announce("Work history data loaded.");
    };

    if (!authLoading) loadData();
  }, [user, authLoading]);

  useEffect(() => {
    const result = calculateStatus(entries);
    setStatus(result);
  }, [entries]);

  const saveEntry = async (newEntry: WorkEntry) => {
    announce("Saving entry for " + formatDateReadable(newEntry.month));
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
        setFormError('Failed to save to cloud.');
      } else if (data) {
        setEntries(prev => prev.map(e => e.id === newEntry.id ? { ...e, id: data.id } : e));
      }
    }
  };

  const confirmDelete = async () => {
    if (idsToDelete.length === 0) return;
    setIsDeleting(true);
    try {
        if (user && supabase) {
            await supabase.from('work_entries').delete().in('id', idsToDelete).eq('user_id', user.id);
        } 
        const updated = entries.filter(e => !idsToDelete.includes(e.id));
        if (!user || !supabase) {
            localStorage.setItem('disability_check_entries', JSON.stringify(updated));
        }
        setEntries(updated);
        setIdsToDelete([]);
        setSelectedIds([]);
        announce("Deletion complete.");
    } catch (error) {
        announce("Error: Deletion failed.");
    } finally {
        setIsDeleting(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!month || !income) return;
    if (entries.find(en => en.month === month)) {
        setFormError(`Already have an entry for ${formatDateReadable(month)}.`);
        return;
    }
    saveEntry({ id: generateId(), month, income: parseFloat(income), note });
  };

  const renderStatusIllustration = () => {
    if (entries.length === 0) return <EmptyStatePlot ariaLabel="Quiet waiting scene" className="w-full h-auto rounded-3xl" />;
    if (status?.currentPhase === PhaseType.TWP) return <JourneyPlot ariaLabel="Guided journey" className="w-full h-auto rounded-3xl" />;
    if (status?.currentPhase === PhaseType.EPE) return <ProtectivePlot ariaLabel="Protection phase" className="w-full h-auto rounded-3xl" />;
    return <ConnectionPlot ariaLabel="Stable connection" className="w-full h-auto rounded-3xl" />;
  };

  /**
   * IRREGULAR BLOB GRID (TWP Tracking)
   * Renders 9 organic "uniformly irregular" blobs for Trial Work Period months.
   * Features unique warm colors for each month.
   */
  const TWPGrid = ({ count }: { count: number }) => {
    const shapes = [
      '60% 40% 30% 70% / 60% 30% 70% 40%',
      '30% 60% 70% 40% / 50% 60% 30% 60%',
      '40% 60% 40% 60% / 60% 40% 60% 40%',
      '65% 35% 55% 45% / 45% 55% 35% 65%',
      '50% 50% 50% 50% / 50% 50% 50% 50%',
      '35% 65% 45% 55% / 65% 35% 55% 45%',
      '60% 40% 60% 40% / 40% 60% 40% 60%',
      '45% 55% 65% 35% / 35% 65% 45% 55%',
      '55% 45% 35% 65% / 65% 35% 55% 45%'
    ];

    const warmColors = [
      '#E67E50', // Coral
      '#C95233', // Terracotta
      '#E8A573', // Warning Orange
      '#A0522D', // Sienna
      '#CD5C5C', // Indian Red
      '#D2691E', // Chocolate
      '#4A1520', // Burgundy (Dark contrast)
      '#E2725B', // Terra Cotta Light
      '#8B4513'  // Saddle Brown
    ];

    return (
      <div className="grid grid-cols-3 gap-4 mb-8" role="grid" aria-label="Trial Work Period progress">
        {[...Array(9)].map((_, i) => {
          const isUsed = i < count;
          const blobColor = warmColors[i % warmColors.length];
          const isDark = i === 6 || i === 8; // Burgundy or Saddle Brown
          
          return (
            <div 
              key={i} 
              style={{ 
                borderRadius: shapes[i % shapes.length],
                backgroundColor: isUsed ? blobColor : 'transparent',
                borderColor: isUsed ? blobColor : '#D4B5A7',
                borderOpacity: isUsed ? 1 : 0.2
              }}
              className={`
                aspect-square flex items-center justify-center transition-all duration-1000 ease-out border-2
                ${isUsed 
                  ? 'shadow-luxury rotate-0 scale-100' 
                  : 'bg-white/40 rotate-6 scale-90 opacity-60'}
              `}
            >
              {isUsed && (
                <svg 
                  className={`w-6 h-6 animate-pop ${isDark ? 'text-white' : 'text-white'}`} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor"
                  aria-hidden="true"
                >
                  <path d="M20 6L9 17L4 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  /**
   * EPE PREVIEW (36-Month Timeline Roadmap)
   * Always visible as a visual goal. 
   * Input disabled (grayscale) until all 9 TWP months are used.
   */
  const EPEPreview = ({ isLocked, startDate, endDate }: { isLocked: boolean, startDate?: string | null, endDate?: string | null }) => (
    <div className={`mt-10 pt-8 border-t border-taupe/10 transition-all duration-1000 ${isLocked ? 'grayscale opacity-40' : 'opacity-100'}`}>
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
           <h4 className="text-sm font-serif text-burgundy">3-Year Safety Net (EPE)</h4>
           {isLocked && (
             <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-taupe/10 border border-taupe/20 text-[9px] text-slate font-bold uppercase tracking-widest">
               <svg className="w-2.5 h-2.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
               </svg>
               Locked
             </span>
           )}
        </div>
        {!isLocked && startDate && (
           <span className="text-[10px] text-epeBlue font-bold uppercase tracking-widest">Ends {formatDateReadable(endDate || '')}</span>
        )}
      </div>

      <div className="space-y-4">
        {/* Full 36-month Roadmap visualization */}
        <div className="flex items-center gap-1">
          {[...Array(36)].map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 h-2 rounded-full transition-all duration-500 ${isLocked ? 'bg-taupe/10' : 'bg-epeBlue/20'} ${!isLocked && i === 0 ? 'bg-epeBlue animate-pulse' : ''}`}
            ></div>
          ))}
        </div>
        
        <div className="grid grid-cols-3 gap-4 text-center">
           {[1, 2, 3].map(year => (
             <div key={year} className="flex flex-col gap-1">
                <span className="text-[9px] font-bold text-slate/40 uppercase tracking-tighter">Year {year}</span>
                <div className={`h-1.5 rounded-full ${isLocked ? 'bg-taupe/5' : 'bg-epeBlue/10'}`}></div>
             </div>
           ))}
        </div>

        <p className="text-[10px] text-slate font-light leading-relaxed">
          {isLocked 
            ? "Your 36-month Extended Period of Eligibility roadmap. Complete 9 trial months to activate." 
            : "Safety net active. Benefits resume automatically during any month income is below SGA."}
        </p>
      </div>
    </div>
  );

  if (authLoading || isLoadingData) {
      return (
        <Layout>
          <div className="flex flex-col justify-center items-center h-[80vh] gap-6" aria-live="polite">
            <LoadingSpinner size={64} label="Loading your dashboard..." />
            <p className="text-burgundy font-serif text-xl animate-pulse">Loading Dashboard...</p>
          </div>
        </Layout>
      );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Guest Warning */}
        {showGuestWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-burgundy/10 backdrop-blur-md animate-fade-in-up" role="dialog">
            <div className="bg-white rounded-[2.5rem] shadow-luxury max-w-lg w-full p-10 text-center border border-taupe/10 relative">
               <WarningIcon size={64} className="mx-auto mb-6 text-warningOrange" />
               <h3 className="text-3xl font-serif text-burgundy mb-4">Guest Mode</h3>
               <p className="text-slate font-light leading-relaxed mb-10">Data is local to this device. Sync to the cloud to prevent loss.</p>
               <Link to="/auth" className="w-full">
                  <Button fullWidth className="bg-burgundy mb-4">Create Account</Button>
               </Link>
               <button onClick={() => setShowGuestWarning(false)} className="text-sm text-slate underline">Continue as Guest</button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 fade-in-up gap-4">
            <div>
                <span className="text-coral font-bold tracking-[0.4em] text-[10px] uppercase mb-4 block">Personal Tracking</span>
                <h1 className="text-5xl md:text-6xl font-serif text-burgundy mb-2">Clarity Workspace</h1>
                <p className="text-xl text-slate font-light">{user ? user.email : 'Guest Session'}</p>
            </div>
            {user && (
                <button onClick={signOut} className="text-sm text-burgundy underline hover:text-coral transition-colors p-2 focus:ring-2 focus:ring-coral rounded">Sign Out</button>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Visual Status (4 Cols) */}
          <div className="lg:col-span-4 space-y-8 fade-in-up delay-100">
            <Card variant="glass" className="overflow-hidden p-0 pb-12 h-fit">
              <div className="relative mb-10">
                 {renderStatusIllustration()}
                 <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60"></div>
              </div>
              
              <div className="px-8 text-center">
                <span className="text-xs font-bold text-coral uppercase tracking-widest opacity-70 mb-2 block">Current Milestone</span>
                <h2 className="text-3xl font-serif text-burgundy mb-10">{status?.currentPhase}</h2>
                
                {/* 9 ORGANIC BLOBS - ALWAYS VISIBLE */}
                <div className="animate-fade-in-up">
                  <TWPGrid count={status?.twpMonthsUsed || 0} />
                  <p className="text-sm text-slate font-medium">
                    <span className="text-coral font-bold">{status?.twpMonthsUsed || 0}</span> of <span className="text-burgundy">9</span> Trial Work months used.
                  </p>
                </div>

                {/* EPE ROADMAP PREVIEW - ALWAYS VISIBLE */}
                <EPEPreview 
                  isLocked={!status?.twpCompletedDate} 
                  startDate={status?.epeStartDate}
                  endDate={status?.epeEndDate}
                />

                {status?.twpCompletedDate && status.currentPhase !== PhaseType.TWP && (
                  <div className="mt-8 p-6 bg-successGreen/5 border border-successGreen/10 rounded-2xl flex items-center gap-4 animate-pop">
                      <MilestoneMosaic ariaLabel="" className="w-12 h-12" />
                      <div className="text-left">
                         <p className="text-[10px] text-successGreen font-bold uppercase tracking-widest mb-1">Safety Net Locked</p>
                         <p className="text-sm text-charcoal">Completed {formatDateReadable(status.twpCompletedDate || '')}</p>
                      </div>
                  </div>
                )}
              </div>
            </Card>

            <Card variant="glass" title="Log Income">
              <form onSubmit={handleSubmit} className="space-y-6">
                  <Input label="Month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} required />
                  <div className="relative">
                    <Input label="Gross Income" type="number" placeholder="0.00" value={income} onChange={(e) => setIncome(e.target.value)} required />
                    <button type="button" onClick={() => setIsCalcOpen(true)} className="absolute right-3 top-9 p-2 text-taupe hover:text-coral transition-colors" title="Open Income Calculator">
                       <CalculatorIcon size={20} animated={false} />
                    </button>
                  </div>
                  <Input label="Notes" type="text" placeholder="Optional notes..." value={note} onChange={(e) => setNote(e.target.value)} />
                  {formError && <div className="p-3 bg-red-50 text-red-700 rounded-xl text-xs font-medium">{formError}</div>}
                  <Button type="submit" fullWidth className="bg-burgundy">Add Entry</Button>
              </form>
            </Card>
          </div>

          {/* Right Column: Data Log (8 Cols) */}
          <div className="lg:col-span-8 space-y-8 fade-in-up delay-200">
            {entries.length > 0 && status && (
              <Card variant="glass" title="Historical Trends">
                  <IncomeChart entries={status.entries} />
              </Card>
            )}

             <Card variant="glass">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                  <h3 className="text-2xl font-serif font-medium text-burgundy tracking-tight">Work History Log</h3>
                  {entries.length > 0 && (
                    <div className="flex items-center gap-6">
                      <button onClick={() => setSelectedIds(selectedIds.length === entries.length ? [] : entries.map(e => e.id))} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate/50 hover:text-burgundy transition-colors">
                        {selectedIds.length === entries.length ? 'Clear Selection' : 'Select All'}
                      </button>
                      {selectedIds.length > 0 && (
                        <Button variant="danger" onClick={() => setIdsToDelete(selectedIds)} className="px-5 py-2 text-xs rounded-full animate-pop">
                          Delete ({selectedIds.length})
                        </Button>
                      )}
                    </div>
                  )}
                </div>

                {entries.length === 0 ? (
                    <div className="py-24 text-center">
                        <EmptyStatePlot ariaLabel="" className="w-32 h-32 mx-auto mb-8 opacity-40" />
                        <p className="text-slate font-light italic text-xl">Your work journey begins with your first entry.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {status?.entries.map((entry) => {
                            const isSelected = selectedIds.includes(entry.id);
                            return (
                                <div key={entry.id} className={`group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] transition-all duration-500 gap-4 border ${isSelected ? 'bg-coral/5 border-coral/30 shadow-sm' : 'bg-white/40 hover:bg-white border-transparent'}`}>
                                    <div className="flex items-center gap-6">
                                        <input type="checkbox" className="w-6 h-6 rounded-full border-2 border-taupe text-coral focus:ring-coral cursor-pointer" checked={isSelected} onChange={() => setSelectedIds(prev => prev.includes(entry.id) ? prev.filter(i => i !== entry.id) : [...prev, entry.id])} aria-label={`Select entry for ${formatDateReadable(entry.month)}`} />
                                        <div>
                                            <span className="font-serif text-burgundy text-xl block mb-1">{formatDateReadable(entry.month)}</span>
                                            <span className="text-[10px] text-slate font-bold uppercase tracking-widest opacity-60">{entry.phaseAtTime}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-12 flex-1 md:justify-end">
                                        <span className="font-sans font-medium text-charcoal text-lg">{formatCurrency(entry.income)}</span>
                                        <Badge status={entry.benefitStatus} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
             </Card>
          </div>
        </div>
        
        {isCalcOpen && (
          <IncomeCalculator 
            targetMonth={month || new Date().toISOString().slice(0, 7)}
            onApply={(val) => { setIncome(val.toString()); setIsCalcOpen(false); }}
            onClose={() => setIsCalcOpen(false)}
          />
        )}

        <ConfirmationModal 
            isOpen={idsToDelete.length > 0}
            onClose={() => setIdsToDelete([])}
            onConfirm={confirmDelete}
            isLoading={isDeleting}
            title="Remove Entries"
            message={`Are you sure you want to delete ${idsToDelete.length} month(s) from your history?`}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;