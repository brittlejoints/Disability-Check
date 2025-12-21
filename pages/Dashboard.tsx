import React, { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import Card from '../components/Card';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import ConfirmationModal from '../components/ConfirmationModal';
import IncomeChart from '../components/IncomeChart';
import { LoadingSpinner, WarningIcon, MilestoneIcon, announce } from '../components/AccessibleIcons';
import { WorkEntry, PhaseType, CalculationResult, BenefitStatus } from '../types';
import { calculateStatus, formatCurrency, formatDateReadable, generateId, parseDate } from '../utils/logic';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../utils/supabase';
import { Link } from 'react-router-dom';

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

  const dismissGuestWarning = () => {
    setShowGuestWarning(false);
    sessionStorage.setItem('dc_guest_warning_dismissed', 'true');
    announce("Guest warning dismissed.");
  };

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
        announce("Error: Failed to save entry.");
      } else if (data) {
        setEntries(prev => prev.map(e => e.id === newEntry.id ? { ...e, id: data.id } : e));
        announce("Entry successfully saved to cloud.");
      }
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => {
      const isSelecting = !prev.includes(id);
      announce(isSelecting ? "Item selected" : "Item deselected");
      return isSelecting ? [...prev, id] : prev.filter(i => i !== id);
    });
  };

  const confirmDelete = async () => {
    if (idsToDelete.length === 0) return;
    setIsDeleting(true);
    announce("Deleting items...");

    try {
        if (user && supabase) {
            await supabase.from('work_entries').delete().in('id', idsToDelete).eq('user_id', user.id);
        } else {
            const updated = entries.filter(e => !idsToDelete.includes(e.id));
            localStorage.setItem('disability_check_entries', JSON.stringify(updated));
        }
        setEntries(prev => prev.filter(e => !idsToDelete.includes(e.id)));
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

  const getPhaseColor = (phase: PhaseType) => {
    switch (phase) {
      case PhaseType.TWP: return 'text-coral bg-peach/30';
      case PhaseType.EPE: return 'text-epeBlue bg-blue-50/50';
      case PhaseType.POST_EPE: return 'text-slate bg-gray-100/50';
      default: return 'text-slate bg-gray-100/50';
    }
  };

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
        
        {showGuestWarning && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-burgundy/10 backdrop-blur-md animate-fade-in-up" role="dialog" aria-labelledby="warning-title">
            <div className="bg-white rounded-[2.5rem] shadow-luxury max-w-lg w-full p-10 text-center border border-taupe/10 relative">
               <div className="flex justify-center mb-8">
                  <WarningIcon size={64} label="Security Warning" />
               </div>
               <h3 id="warning-title" className="text-3xl font-serif text-burgundy mb-4">Guest Mode Warning</h3>
               <p className="text-slate font-light leading-relaxed mb-10">
                 Data is stored locally on this device. Create an account to prevent permanent loss.
               </p>
               <div className="flex flex-col gap-4">
                  <Link to="/auth" className="w-full">
                    <Button fullWidth className="bg-burgundy">Create Account to Sync</Button>
                  </Link>
                  <button onClick={dismissGuestWarning} className="text-sm text-slate underline hover:text-burgundy transition-colors focus:ring-2 focus:ring-coral rounded">
                    I understand, continue as guest
                  </button>
               </div>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 fade-in-up gap-4">
            <div>
                <h1 className="text-4xl md:text-5xl font-serif text-burgundy mb-2">Your Dashboard</h1>
                <p className="text-xl text-slate font-light">
                    {user ? `Welcome, ${user.email}` : 'Tracking as Guest'}
                </p>
            </div>
            {user && (
                <button onClick={signOut} className="text-sm text-burgundy underline hover:text-coral transition-colors p-2 focus:ring-2 focus:ring-coral rounded">
                    Sign Out
                </button>
            )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          <div className="lg:col-span-1 fade-in-up delay-100">
            <div className="lg:sticky lg:top-28 space-y-8">
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
                          className={`text-center py-6 rounded-2xl mb-8 transition-colors duration-500 relative ${getPhaseColor(status?.currentPhase || PhaseType.UNKNOWN)}`}
                      >
                          {status?.twpCompletedDate && (
                            <div className="absolute -top-4 -right-4 bg-white rounded-full p-1 shadow-md">
                               <MilestoneIcon size={32} label="TWP Completion Milestone" />
                            </div>
                          )}
                          <span className="block text-xs font-bold uppercase tracking-widest opacity-70 mb-1">Status</span>
                          <span className="text-2xl font-serif text-burgundy">{status?.currentPhase}</span>
                      </div>

                      {status?.currentPhase === PhaseType.TWP && (
                          <div className="space-y-6">
                              <div className="flex justify-between text-sm font-medium">
                                  <span className="text-slate">TWP Progress</span>
                                  <span className="text-coral" aria-live="polite">{status.twpMonthsUsed} / 9</span>
                              </div>
                              <div className="w-full bg-peach/30 rounded-full h-1.5 overflow-hidden" role="progressbar" aria-valuenow={status.twpMonthsUsed} aria-valuemin={0} aria-valuemax={9} aria-label="Trial Work Period progress">
                                  <div 
                                      className="bg-gradient-to-r from-coral to-terracotta h-1.5 rounded-full transition-all duration-1000 ease-out"
                                      style={{ width: `${(status.twpMonthsUsed / 9) * 100}%` }}
                                  ></div>
                              </div>
                              <p className="text-sm text-slate font-light">
                              Used <strong>{status.twpMonthsUsed}</strong> trial work months.
                              </p>
                          </div>
                      )}

                      {status?.twpCompletedDate && (
                        <div className="mt-4 p-4 bg-successGreen/5 border border-successGreen/10 rounded-xl text-center">
                           <p className="text-xs text-successGreen font-bold uppercase tracking-widest mb-1">Milestone</p>
                           <p className="text-sm text-charcoal">TWP Completed {formatDateReadable(status.twpCompletedDate)}</p>
                        </div>
                      )}
                      </>
                  )}
                </Card>

                <Card variant="glass" title="Add Work Month">
                  <form onSubmit={handleSubmit} className="space-y-6">
                      <Input label="Month" type="month" value={month} onChange={(e) => setMonth(e.target.value)} required />
                      <Input label="Gross Income" type="number" placeholder="0.00" min="0" step="0.01" value={income} onChange={(e) => setIncome(e.target.value)} required />
                      <Input label="Notes" type="text" placeholder="e.g. Part-time job" value={note} onChange={(e) => setNote(e.target.value)} />
                      {formError && <div role="alert" className="p-4 bg-red-50 text-red-900 border-l-4 border-red-600 rounded-r-xl text-sm">{formError}</div>}
                      <Button type="submit" fullWidth className="bg-burgundy hover:bg-coral">Add Entry</Button>
                  </form>
                </Card>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-8 fade-in-up delay-200">
            {entries.length > 0 && status && (
              <Card variant="glass" title="Income Trends">
                  <IncomeChart entries={status.entries} />
              </Card>
            )}

             <Card variant="glass" title="Work History Log">
                {status?.entries.length === 0 ? (
                    <p className="text-slate font-light italic">No entries yet.</p>
                ) : (
                    <div className="space-y-3" role="list">
                        {status?.entries.map((entry) => {
                            const isSelected = selectedIds.includes(entry.id);
                            return (
                                <div key={entry.id} className={`group flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl transition-all duration-300 gap-4 border ${isSelected ? 'bg-coral/5 border-coral shadow-sm' : 'bg-white/40 hover:bg-white border-transparent'}`} role="listitem">
                                    <div className="flex items-center gap-4">
                                        <input type="checkbox" className="w-5 h-5 rounded border-2 border-taupe text-coral focus:ring-coral cursor-pointer" checked={isSelected} onChange={() => toggleSelect(entry.id)} aria-label={`Select ${formatDateReadable(entry.month)} entry`} />
                                        <div className="flex flex-col min-w-[140px]">
                                            <span className="font-serif text-burgundy text-lg">{formatDateReadable(entry.month)}</span>
                                            <span className="text-xs text-slate uppercase tracking-wider">{entry.phaseAtTime}</span>
                                        </div>
                                    </div>
                                    <div className="flex flex-col md:flex-row md:items-center gap-4 md:gap-8 flex-1 md:justify-end">
                                        <div className="flex flex-col md:items-end min-w-[100px]">
                                            <span className="font-sans font-medium text-charcoal">{formatCurrency(entry.income)}</span>
                                        </div>
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
        
        <ConfirmationModal 
            isOpen={idsToDelete.length > 0}
            onClose={() => setIdsToDelete([])}
            onConfirm={confirmDelete}
            isLoading={isDeleting}
            title={idsToDelete.length > 1 ? "Bulk Delete" : "Delete Entry"}
        />
      </div>
    </Layout>
  );
};

export default Dashboard;