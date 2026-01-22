import { ExerciseVariant, RiskFlags } from "@/types";

export function calculateRiskFlags(exercise: ExerciseVariant): RiskFlags {
    const flags: RiskFlags = {
        HYP_ADV: true,
        ONLINE_RISK: "OK",
        PF_RISK: "OK",
    };

    // 1. HYP_ADV Check
    // Logic: if limitingFactor[0] != targetPrimario[0] -> NO (false), else OK (true)
    // We assume strings might not match case perfectly, so we normalize.
    if (
        exercise.limitingFactor.length > 0 &&
        exercise.targetPrimarios.length > 0
    ) {
        const primaryLimiter = exercise.limitingFactor[0].toLowerCase();
        const primaryTarget = exercise.targetPrimarios[0].toLowerCase();

        // Simple containment check or direct match
        if (!primaryLimiter.includes(primaryTarget) && !primaryTarget.includes(primaryLimiter)) {
            flags.HYP_ADV = false;
        }
    }

    // 2. ONLINE_RISK
    // Logic: ROI + estabilidad (<=2) + cargaAxial (=3) + (ballistic/semi o impacto>=2)
    // Interpretation: If ALL conditions meet? Or accumulative? 
    // "usando: ROI + estabilidad (<=2) + cargaAxial (=3) + (ballistic/semi o impacto>=2)" implies a combination for high risk.
    // Let's implement a rule: If Stability <= 2 AND (Ballistic/Semi OR Impact >=2) -> Caution.
    // If PLUS CargaAxial == 3 -> Prohibido.
    const lowStability = exercise.estabilidadExterna <= 2;
    const highImpactOrDynamics = exercise.naturaleza !== "Grind" || exercise.impacto >= 2;
    const maxAxialLoad = exercise.cargaAxial === 3;

    if (lowStability && highImpactOrDynamics) {
        if (maxAxialLoad) {
            flags.ONLINE_RISK = "Prohibido";
        } else {
            flags.ONLINE_RISK = "Precaución";
        }
    }

    // 3. PF_RISK (Pelvic Floor)
    // Logic: PIA conservador hiperpresivo OR impacto>=2 => al menos Precaución 
    // y si además cargaAxial=3 => puede ser Contraindicado
    const isHiperpresivo = exercise.piaConservador === "Hiperpresivo";
    const highImpact = exercise.impacto >= 2;

    if (isHiperpresivo || highImpact) {
        if (exercise.cargaAxial === 3) {
            flags.PF_RISK = "Contraindicado";
            flags.pfRiskReason = "Alta Carga Axial + Hiperpresión/Impacto";
        } else {
            flags.PF_RISK = "Precaución";
            flags.pfRiskReason = "Impacto o Presión Intra-abdominal";
        }
    }

    return flags;
}

export function enrichExercises(exercises: ExerciseVariant[]) {
    return exercises.map(ex => ({
        ...ex,
        flags: calculateRiskFlags(ex)
    }));
}
