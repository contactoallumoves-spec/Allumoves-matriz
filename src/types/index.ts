export type Intensity = "Baja" | "Media" | "Alta";
export type Scale1to5 = 1 | 2 | 3 | 4 | 5;
export type Scale0to3 = 0 | 1 | 2 | 3;
export type RehabPhase = 1 | 2 | 3 | 4;

export type NateraOption = "ISO-Push" | "ISO-Hold" | "ISO-Switch" | "No aplica";
export type JordanOption = "Slow Eccentric" | "Braking" | "Overspeed" | "No aplica";
export type NatureOption = "Grind" | "Semi-ballistic" | "Ballistic";
export type PiaType = "Decompresivo" | "Manejable" | "Hiperpresivo";

export interface ExerciseVariant {
    id: string; // Unique ID
    nombreTecnico: string; // 1
    arquetipos: string[]; // 2
    setupTime: "Alto" | "Bajo"; // 3.a ROI is derived usually, but let's keep it simple or combined
    roi: "Alto" | "Bajo"; // 3.b
    equipamiento: string; // 4
    perfilResistencia: string; // 5
    estabilidadExterna: Scale1to5; // 6
    saturacion: Intensity; // 7.a
    loadability: Intensity; // 7.b
    limitingFactor: string[]; // 8 (Top 3)

    // 9 Enfoque Regional
    targetPrimarios: string[]; // 1-3
    targetSecundarios: string[]; // 1-5

    natera: NateraOption; // 10
    jordan: JordanOption; // 11
    naturaleza: NatureOption; // 12

    // 13 Auditabilidad
    vbtReady: boolean;
    dynamoTests: boolean;
    camaraApp: boolean;

    faseRehab: RehabPhase; // 14
    estadioTendon: string[]; // 15

    piaIdeal: PiaType; // 16.a
    piaConservador: PiaType; // 16.b

    amenazaPotencial: "Bajo" | "Medio" | "Alto"; // 17

    // Extra Operational Fields
    cargaAxial: Scale0to3;
    impacto: Scale0to3;
    demandaTecnica: Scale1to5;
    fatigaLocal: Scale1to5;
    fatigaSistemica: Scale1to5;
    valsalvaProbable: boolean;

    kpiPrimario: string;
    kpiSecundarios: string[];

    observaciones?: string;
    supuestos?: string;
}

export interface RiskFlags {
    HYP_ADV: boolean; // Hypertrophy Advantage Check
    ONLINE_RISK: "OK" | "Precaución" | "Prohibido";
    PF_RISK: "OK" | "Precaución" | "Contraindicado";
    pfRiskReason?: string;
}

// Extended interface with computed flags
export interface ExerciseVariantWithFlags extends ExerciseVariant {
    flags: RiskFlags;
}

export interface MicrocycleItem {
    id: string; // Unique instance ID (to allow same exercise multiple times)
    exerciseId: string;
    variant: ExerciseVariantWithFlags;
    sets: number;
    reps: string; // "8-12" or "ISO 10s"
    rir: string; // "2"
    notes: string;
}

export interface MicrocycleDay {
    id: string; // "day-1"
    label: string; // "Día 1"
    exercises: MicrocycleItem[];
}

export interface Microcycle {
    name: string;
    days: { [key: string]: MicrocycleDay }; // keyed by id
    dayOrder: string[]; // ["day-1", "day-2"]
}

export interface FilterState {
    search: string;
    arquetipo: string;
    target: string;
    onlyVbt: boolean;
    lowRisk: boolean;
}
