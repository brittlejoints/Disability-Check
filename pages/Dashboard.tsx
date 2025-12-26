import * as React from 'react';
import { useState, useEffect, useCallback } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import ConfirmationModal from '../components/ConfirmationModal';
import IncomeChart from '../components/IncomeChart';
import IncomeCalculator from '../components/IncomeCalculator';
import { LoadingSpinner, WarningIcon, MilestoneIcon, announce, CalculatorIcon, SuccessIcon } from '../components/AccessibleIcons';
import { WorkEntry, PhaseType, CalculationResult, BenefitStatus } from '../types';
import { calculateStatus, formatCurrency, formatDateReadable, generateId } from '../utils/logic';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { Link } from 'react-router-dom';
import { EmptyStatePlot, JourneyPlot, ProtectivePlot, ConnectionPlot, MilestoneMosaic } from '../components/GeometricIllustrations';

const STORAGE_KEY = 'disability_check_entries';

const Dashboard: React.FC = () => {
  const { user, loading: authLoading, signOut } = useAuth();
  const [entries, setEntries] = useState<WorkEntry[]>([]);
  const [status, setStatus] = useState<CalculationResult | null>(null);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [showGuestWarning, setShowGuestWarning] = useState(false);
  const [hasLocalDataToSync, setHasLocalDataToSync] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [idsToDelete, setIdsToDelete] = useState<string[]>([]);
  const [isDeleting, setIsDeleting] = useState(false);
  const [month, setMonth] = useState('');
  const [income, setIncome] = useState('');
  const [note, setNote] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [isCalcOpen, setIsCalcOpen] = useState(false);

  // Persistence Helper: Save to Local Storage safely
  const persistToLocal = useCallback((updatedEntries: WorkEntry[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedEntries));
    } catch (e) {
      console.error("Local storage persistence failed:", e);
    }
  }, []);

  useEffect(() => {
    const loadData = async () => {
      setIsLoadingData(true);
      
      // Load guest data from localStorage
      const localDataRaw = localStorage.getItem(STORAGE_KEY);
      let localEntries: WorkEntry[] = [];
      if (localDataRaw) {
        try {
          localEntries = JSON.parse(localDataRaw);
        } catch (e) { 
          console.error("Corrupt local data", e);
          localStorage.removeItem(STORAGE_KEY);
        }
      }

      if (user && supabase) {
        // Logged in: Load from Cloud
        const { data, error } = await supabase
          .from('work_entries')
          .select('*')
          .eq('user_id', user.id) 
          .order('month', { ascending: true });
        
        if (data && !error) {
          setEntries(data as WorkEntry[]);
          // If we have local data that isn't in the cloud, flag for sync
          if (localEntries.length > 0) {
            setHasLocalDataToSync(true);
          }
        }
      } else {
        // Guest Mode: Use Local Storage
        setEntries(localEntries);
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

  const handleSyncLocalToCloud = async () => {
    if (!user || !supabase) return;
    setIsSyncing(true);
    
    const localDataRaw = localStorage.getItem(STORAGE_KEY);
    if (!localDataRaw) return;
    
    try {
      const localEntries = JSON.parse(localDataRaw) as WorkEntry[];
      
      const payload = localEntries.map(e => ({
        month: e.month,
        income: e.income,
        note: e.note || '',
        user_id: user.id
      }));

      // Upsert avoids duplicate month conflicts
      const { data, error } = await supabase
        .from('work_entries')
        .upsert(payload, { onConflict: 'user_id,month' })
        .select();

      if (error) throw error;

      if (data) setEntries(data as WorkEntry[]);
      
      localStorage.removeItem(STORAGE_KEY);
      setHasLocalDataToSync(false);
      announce("Sync complete. Your work history is now saved to your account.");
    } catch (e) {
      console.error("Sync failed:", e);
      setFormError("Migration to cloud failed. Please try again.");
    } finally {
      setIsSyncing(false);
    }
  };

  const saveEntry = async (newEntry: WorkEntry) => {
    announce("Saving entry for " + formatDateReadable(newEntry.month));
    
    // Optimistic state update
    setEntries(prev => {
        const updated = [...prev, newEntry].sort((a, b) => a.month.localeCompare(b.month));
        if (!user) persistToLocal(updated);
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
        if (!user) persistToLocal(updated);
        
        setEntries(updated);
        setIdsToDelete([]);
        setSelectedIds([]);
        announce("Entry deleted.");
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
      '#E67E50', '#C95233', '#E8A573', '#A0522D', '#CD5C5C', '#D2691E', '#4A1520', '#E2725B', '#8B4513'
    ];

    return (
      <div className="grid grid-cols-3 gap-4 mb-8" role="grid" aria-label="Trial Work Period progress">
        {[...Array(9)].map((_, i) => {
          const isUsed = i < count;
          const blobColor = warmColors[i % warmColors.length];
          
          return (
            <div 
              key={i} 
              style={{ 
                borderRadius: shapes[i % shapes.length],
                backgroundColor: isUsed ? blobColor : 'transparent',
                borderColor: isUsed ? blobColor : '#D4B5A7',
              }}
              className={`
                aspect-square flex items-center justify-center transition-all duration-1000 ease-out border-2
                ${isUsed 
                  ? 'shadow-luxury rotate-0 scale-100' 
                  : 'bg-white/40 rotate-6 scale-90 opacity-60'}
              `}
            >
              {isUsed && (
                <svg className={`w-6 h-6 animate-pop text-white`} viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path d="M20 6L9 17L4 12" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              )}
            </div>
          );
        })}
      </div>
    );
  };

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
        <div className="flex items-center gap-1">
          {[...Array(36)].map((_, i) => (
            <div 
              key={i} 
              className={`flex-1 h-2 rounded-full transition-all duration-500 ${isLocked ? 'bg-taupe/10' : 'bg-epeBlue/20'} ${!isLocked && i === 0 ? 'bg-epeBlue animate-pulse' : ''}`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );

  if (authLoading || isLoadingData) {
      return (
        <Layout>
          <div className="flex flex-col justify-center items-center h-[80vh] gap-6" aria-live="polite">
            <LoadingSpinner size={64} label="Loading your workspace..." />
            <p className="text-burgundy font-serif text-xl animate-pulse">Initializing Workspace...</p>
          </div>
        </Layout>
      );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        
        {/* Sync Local Data to Cloud Banner */}
        {hasLocalDataToSync && user && (
          <div className="mb-12 p-6 bg-burgundy text-white rounded-[2rem] shadow-luxury flex flex-col md:flex-row items-center justify-between gap-6 animate-pop">
             <div className="flex items-center gap-5">
                <div className="w-12 h-12 rounded-full bg-white/10 flex items-center justify-center">
                   <SuccessIcon size={24} className="text-peach" />
                </div>
                <div>
                   <h4 className="text-xl font-serif">Cloud Migration Available</h4>
                   <p className="text-sm text-peach/70">You have history on this device that isn't in your account yet.</p>
                </div>
             </div>
             <div className="flex gap-4">
                <button 
                  onClick={() => { setHasLocalDataToSync(false); localStorage.removeItem(STORAGE_KEY); }}
                  className="text-sm font-medium hover:underline text-peach/50"
                >
                  Dismiss & Clear Local
                </button>
                <Button 
                  onClick={handleSyncLocalToCloud} 
                  disabled={isSyncing}
                  className="bg-coral text-white border-transparent"
                >
                  {isSyncing ? 'Migrating...' : 'Save to Cloud Account'}
                </Button>
             </div>
          </div>
        )}

        {/* Persistent Guest Warning */}
        {showGuestWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-burgundy/10 backdrop-blur-md animate-fade-in-up" role="dialog">
            <div className="bg-white rounded-[2.5rem] shadow-luxury max-w-lg w-full p-10 text-center border border-taupe/10 relative">
               <WarningIcon size={64} className="mx-auto mb-6 text-warningOrange" />
               <h3 className="text-3xl font-serif text-burgundy mb-4">Guest Access</h3>
               <p className="text-slate font-light leading-relaxed mb-10">You are tracking data locally. If you clear your browser history or switch devices, <strong>all entries will be lost</strong>.</p>
               <Link to="/auth" className="w-full">
                  <Button fullWidth className="bg-burgundy mb-4">Protect My Data (Sign Up)</Button>
               </Link>
               <button onClick={() => { setShowGuestWarning(false); sessionStorage.setItem('dc_guest_warning_dismissed', 'true'); }} className="text-sm text-slate underline">Continue as Guest</button>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 fade-in-up gap-4">
            <div>
                <span className="text-coral font-bold tracking-[0.4em] text-[10px] uppercase mb-4 block">Work Clarity</span>
                <h1 className="text-5xl md:text-6xl font-serif text-burgundy mb-2">Income Log</h1>
                <p className="text-xl text-slate font-light">
                  {user ? (
                    <span className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-successGreen animate-pulse"></div>
                      {user.email}
                    </span>
                  ) : 'Guest Session (Offline Only)'}
                </p>
            </div>
            {user && (
                <button onClick={signOut} className="text-sm text-burgundy underline hover:text-coral transition-colors p-2 focus:ring-2 focus:ring-coral rounded">Sign Out</button>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-4 space-y-8 fade-in-up delay-100">
            <Card variant="glass" className="overflow-hidden p-0 pb-12 h-fit">
              <div className="relative mb-10">
                 {renderStatusIllustration()}
                 <div className="absolute inset-0 bg-gradient-to-t from-white via-transparent to-transparent opacity-60"></div>
              </div>
              
              <div className="px-8 text-center">
                <span className="text-xs font-bold text-coral uppercase tracking-widest opacity-70 mb-2 block">Status Summary</span>
                <h2 className="text-3xl font-serif text-burgundy mb-10">{status?.currentPhase}</h2>
                <div className="animate-fade-in-up">
                  <TWPGrid count={status?.twpMonthsUsed || 0} />
                  <p className="text-sm text-slate font-medium">
                    <span className="text-coral font-bold">{status?.twpMonthsUsed || 0}</span> of <span className="text-burgundy">9</span> months used.
                  </p>
                </div>
                <EPEPreview 
                  isLocked={!status?.twpCompletedDate} 
                  startDate={status?.epeStartDate}
                  endDate={status?.epeEndDate}
                />
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
                  <Button type="submit" fullWidth className="bg-burgundy">Add to Log</Button>
              </form>
            </Card>
          </div>

          <div className="lg:col-span-8 space-y-8 fade-in-up delay-200">
            {entries.length > 0 && status && (
              <Card variant="glass" title="Earnings History">
                  <IncomeChart entries={status.entries} />
              </Card>
            )}

             <Card variant="glass">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-10 gap-4">
                  <h3 className="text-2xl font-serif font-medium text-burgundy tracking-tight">Work Entry Log</h3>
                  {entries.length > 0 && (
                    <div className="flex items-center gap-6">
                      <button onClick={() => setSelectedIds(selectedIds.length === entries.length ? [] : entries.map(e => e.id))} className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate/50 hover:text-burgundy transition-colors">
                        {selectedIds.length === entries.length ? 'Deselect All' : 'Select All'}
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
                        <p className="text-slate font-light italic text-xl">Log your first month of work to begin tracking progress.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {status?.entries.map((entry) => {
                            const isSelected = selectedIds.includes(entry.id);
                            return (
                                <div key={entry.id} className={`group flex flex-col md:flex-row md:items-center justify-between p-6 rounded-[2rem] transition-all duration-500 gap-4 border ${isSelected ? 'bg-coral/5 border-coral/30' : 'bg-white/40 hover:bg-white border-transparent'}`}>
                                    <div className="flex items-center gap-6">
                                        <input type="checkbox" className="w-6 h-6 rounded-full border-2 border-taupe text-coral focus:ring-coral cursor-pointer" checked={isSelected} onChange={() => setSelectedIds(prev => prev.includes(entry.id) ? prev.filter(i => i !== entry.id) : [...prev, entry.id])} />
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
            title="Delete Entries"
            message={`Remove ${idsToDelete.length} entries from your history?`}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;