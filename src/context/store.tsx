import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { ExerciseVariant, ExerciseVariantWithFlags, MicrocycleItem, FilterState } from '@/types';
import sampleData from '@/data/exercises.sample.json';
import { enrichExercises } from '@/lib/heuristics';
import Fuse from 'fuse.js';

interface DataContextType {
    exercises: ExerciseVariantWithFlags[];
    filteredExercises: ExerciseVariantWithFlags[];
    filters: FilterState;
    setFilters: React.Dispatch<React.SetStateAction<FilterState>>;
    microcycle: Microcycle;
    currentDayId: string;
    setCurrentDayId: (id: string) => void;
    addDay: () => void;
    removeDay: (id: string) => void;
    addToMicrocycle: (exercise: ExerciseVariantWithFlags) => void;
    removeFromMicrocycle: (itemId: string, dayId: string) => void;
    updateMicrocycleItem: (itemId: string, dayId: string, updates: Partial<MicrocycleItem>) => void;
    clearMicrocycle: () => void;
    selectedExercise: ExerciseVariantWithFlags | null;
    setSelectedExercise: (ex: ExerciseVariantWithFlags | null) => void;
    currentView: 'matrix' | 'builder';
    setCurrentView: (view: 'matrix' | 'builder') => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: ReactNode }) {
    // 1. Load Data
    const [rawExercises, setRawExercises] = useState<ExerciseVariant[]>([]);
    const [exercises, setExercises] = useState<ExerciseVariantWithFlags[]>([]);

    // 2. State
    const [filters, setFilters] = useState<FilterState>({
        search: "",
        arquetipo: "all",
        target: "all",
        onlyVbt: false,
        lowRisk: false,
    });

    // State
    const [microcycle, setMicrocycle] = useState<Microcycle>(() => {
        const saved = localStorage.getItem('aum-microcycle-v2');
        if (saved) return JSON.parse(saved);
        // Default init
        return {
            name: "Nuevo Microciclo",
            days: { "day-1": { id: "day-1", label: "Día 1", exercises: [] } },
            dayOrder: ["day-1"]
        };
    });

    const [currentDayId, setCurrentDayId] = useState<string>("day-1");
    const [selectedExercise, setSelectedExercise] = useState<ExerciseVariantWithFlags | null>(null);
    const [currentView, setCurrentView] = useState<'matrix' | 'builder'>('matrix');

    // Initial Load
    useEffect(() => {
        const loaded = sampleData as unknown as ExerciseVariant[];
        setRawExercises(loaded);
        const enriched = enrichExercises(loaded);
        setExercises(enriched);
    }, []);

    // Persistence
    useEffect(() => {
        localStorage.setItem('aum-microcycle-v2', JSON.stringify(microcycle));
    }, [microcycle]);

    // Filtering Logic
    // We use Fuse.js for fuzzy search on the "search" filter
    // And standard filter for others
    const filteredExercises = React.useMemo(() => {
        let result = exercises;

        // 1. Specific Filters
        if (filters.arquetipo !== 'all') {
            result = result.filter(ex =>
                ex.arquetipos.some(a => a.toLowerCase() === filters.arquetipo)
            );
        }

        if (filters.target !== 'all') {
            result = result.filter(ex =>
                ex.targetPrimarios.some(t => t.toLowerCase() === filters.target)
            );
        }

        if (filters.onlyVbt) {
            result = result.filter(ex => ex.vbtReady);
        }

        if (filters.lowRisk) {
            result = result.filter(ex => ex.amenazaPotencial === 'Bajo');
        }

        // 2. Fuzzy Search
        if (filters.search) {
            const fuse = new Fuse(result, {
                keys: ['nombreTecnico', 'arquetipos', 'targetPrimarios', 'limitingFactor'],
                threshold: 0.3,
            });
            result = fuse.search(filters.search).map(r => r.item);
        }

        return result;
    }, [exercises, filters]);

    // Actions
    const addToMicrocycle = (exercise: ExerciseVariantWithFlags) => {
        // Add to currently selected day
        const day = microcycle.days[currentDayId];
        if (!day) return;

        // Allow duplicates? Yes, but need unique ID.
        const newItem: MicrocycleItem = {
            id: crypto.randomUUID(),
            exerciseId: exercise.id,
            variant: exercise,
            sets: 3,
            reps: "8-12",
            rir: "2",
            notes: ""
        };

        setMicrocycle(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [currentDayId]: {
                    ...day,
                    exercises: [...day.exercises, newItem]
                }
            }
        }));
    };

    const removeFromMicrocycle = (itemId: string, dayId: string) => {
        const day = microcycle.days[dayId];
        if (!day) return;

        setMicrocycle(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [dayId]: {
                    ...day,
                    exercises: day.exercises.filter(i => i.id !== itemId)
                }
            }
        }));
    };

    const updateMicrocycleItem = (itemId: string, dayId: string, updates: Partial<MicrocycleItem>) => {
        const day = microcycle.days[dayId];
        if (!day) return;

        setMicrocycle(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [dayId]: {
                    ...day,
                    exercises: day.exercises.map(i => i.id === itemId ? { ...i, ...updates } : i)
                }
            }
        }));
    };

    const addDay = () => {
        const newId = `day-${Date.now()}`; // distinct enough
        const dayNumber = microcycle.dayOrder.length + 1;

        setMicrocycle(prev => ({
            ...prev,
            days: {
                ...prev.days,
                [newId]: { id: newId, label: `Día ${dayNumber}`, exercises: [] }
            },
            dayOrder: [...prev.dayOrder, newId]
        }));
        setCurrentDayId(newId);
    };

    const removeDay = (dayId: string) => {
        if (microcycle.dayOrder.length <= 1) return; // Prevent deleting last day

        setMicrocycle(prev => {
            const newDays = { ...prev.days };
            delete newDays[dayId];
            const newOrder = prev.dayOrder.filter(id => id !== dayId);

            return {
                ...prev,
                days: newDays,
                dayOrder: newOrder
            };
        });

        // If we deleted current day, switch to the first one available
        if (currentDayId === dayId) {
            const newOrder = microcycle.dayOrder.filter(id => id !== dayId);
            setCurrentDayId(newOrder[0]);
        }
    };


    const clearMicrocycle = () => {
        setMicrocycle({
            name: "Nuevo Microciclo",
            days: { "day-1": { id: "day-1", label: "Día 1", exercises: [] } },
            dayOrder: ["day-1"]
        });
        setCurrentDayId("day-1");
    };


    return (
        <DataContext.Provider value={{
            exercises,
            filteredExercises,
            filters,
            setFilters,
            microcycle,
            currentDayId,
            setCurrentDayId,
            addDay,
            removeDay,
            addToMicrocycle,
            removeFromMicrocycle,
            updateMicrocycleItem,
            clearMicrocycle,
            selectedExercise,
            setSelectedExercise,
            currentView,
            setCurrentView
        }}>
            {children}
        </DataContext.Provider>
    );
}

export function useData() {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
}
