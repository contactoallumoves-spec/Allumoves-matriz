import React from "react";
import { useData } from "@/context/store";
import { DataTable } from "@/components/matrix/DataTable";
import { columns } from "@/components/matrix/Columns";
import { ExerciseDrawer } from "@/components/exercise/ExerciseDrawer"; // Need to create this
import { Sheet, SheetContent } from "@/components/ui/sheet";

export default function MatrixPage() {
    const { filteredExercises, selectedExercise, setSelectedExercise } = useData();

    return (
        <div className="h-full flex flex-col space-y-4">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl font-bold tracking-tight text-primary">Matriz Maestra</h1>
                <p className="text-muted-foreground">
                    Explora y selecciona ejercicios basándote en 17 dimensiones de análisis.
                </p>
            </div>

            <DataTable
                columns={columns}
                data={filteredExercises}
                onRowClick={(row) => setSelectedExercise(row)}
            />

            {/* Detail Drawer */}
            <Sheet open={!!selectedExercise} onOpenChange={(open) => !open && setSelectedExercise(null)}>
                <SheetContent className="w-full sm:max-w-xl overflow-y-auto">
                    {selectedExercise && <ExerciseDrawer exercise={selectedExercise} />}
                </SheetContent>
            </Sheet>
        </div>
    );
}
