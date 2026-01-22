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
    microcycle: MicrocycleItem[];
    addToMicrocycle: (exercise: ExerciseVariantWithFlags) => void;
    removeFromMicrocycle: (exerciseId: string) => void;
    updateMicrocycleItem: (id: string, updates: Partial<MicrocycleItem>) => void;
    clearMicrocycle: () => void;
    selectedExercise: ExerciseVariantWithFlags | null;
    setSelectedExercise: (ex: ExerciseVariantWithFlags | null) => void;
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

    const [microcycle, setMicrocycle] = useState<MicrocycleItem[]>(() => {
        // Init from LocalStorage
        const saved = localStorage.getItem('aum-microcycle');
        return saved ? JSON.parse(saved) : [];
    });

    const [selectedExercise, setSelectedExercise] = useState<ExerciseVariantWithFlags | null>(null);

    // Initial Load
    useEffect(() => {
        // In a real app, this might fetch from a URL if we replaced the file with an API
        // Here we just cast the import. 
        // Note: JSON import in Vite is typed automatically usually, but we cast to be safe
        const loaded = sampleData as unknown as ExerciseVariant[];
        setRawExercises(loaded);
        const enriched = enrichExercises(loaded);
        setExercises(enriched);
    }, []);

    // Persist Cart
    useEffect(() => {
        localStorage.setItem('aum-microcycle', JSON.stringify(microcycle));
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
        if (microcycle.find(i => i.exerciseId === exercise.id)) return; // No duplicates for now

        const newItem: MicrocycleItem = {
            exerciseId: exercise.id,
            variant: exercise,
            sets: 3,
            reps: "8-12",
            rir: "2",
            notes: ""
        };
        setMicrocycle([...microcycle, newItem]);
    };

    const removeFromMicrocycle = (id: string) => {
        setMicrocycle(microcycle.filter(i => i.exerciseId !== id));
    };

    const updateMicrocycleItem = (id: string, updates: Partial<MicrocycleItem>) => {
        setMicrocycle(microcycle.map(i => i.exerciseId === id ? { ...i, ...updates } : i));
    };

    const clearMicrocycle = () => setMicrocycle([]);


    return (
        <DataContext.Provider value={{
            exercises,
            filteredExercises,
            filters,
            setFilters,
            microcycle,
            addToMicrocycle,
            removeFromMicrocycle,
            updateMicrocycleItem,
            clearMicrocycle,
            selectedExercise,
            setSelectedExercise
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
