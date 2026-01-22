[README.md](https://github.com/user-attachments/files/24809891/README.md)
# All U Moves — Matriz Maestra

**App Web Premium para selección y análisis de ejercicios basado en 17 dimensiones técnicas y clínicas.**

## 🎯 Identidad y Objetivo
La matriz no es solo una "lista de ejercicios". Es una **biblioteca operativa** diseñada para navegar, filtrar, seleccionar, dosificar y exportar borradores (microciclos) con precisión clínica. Prioriza la claridad, la velocidad de navegación y una estética premium.

## 🏗 Modelo de Datos (Las 17 Dimensiones)
Cada variante de ejercicio se analiza bajo estas dimensiones obligatorias:

### Dimensión 1: Identidad y Logística
1.  **Nombre Técnico**: Estándar internacional.
2.  **Arquetipo(s)**: Squat, Hinge, Push, Pull, Lunge, Carry, Rotation.
3.  **Setup Time & ROI**: Ratio entre la utilidad del ejercicio y el costo de montaje/error.
4.  **Equipamiento**: Herramienta principal (Barra, KB, Mancuerna, etc.).

### Dimensión 2: Hipertrofia y Biomecánica
5.  **Perfil de Resistencia**: Dónde es más difícil (Acortamiento, Estiramiento, Constante).
6.  **Estabilidad Externa**: Grado de restricción (1-5).
7.  **Saturación & Loadability**: Capacidad de sobrecarga progresiva.
8.  **Limiting Factor**: Qué fallo muscular limita el ejercicio.
9.  **Enfoque Regional**: Targets primarios y secundarios.

### Dimensión 3: Performance & VBT
10. **Categoría Isométrica (Natera)**: Push / Hold / Switch.
11. **Categoría Excéntrica (Jordan)**: Slow / Braking / Overspeed.
12. **Naturaleza**:
    *   **Grind**: Fuerza controlada.
    *   **Semi-ballistic**: Aceleración con carga media (ej: KB Swing).
    *   **Ballistic**: Máxima velocidad/despegue (ej: Saltos).
13. **Auditabilidad**: ¿Es VBT-Ready? ¿Testeable con Dinamómetro?

### Dimensión 4: Rehab, Tendón y Salud
14. **Fase Rehab**: 1 (Agudo) a 4 (Retorno al deporte).
15. **Estadio Tendón**: Carga, Almacenamiento, Compresión, etc.
16. **Gestión PIA (Suelo Pélvico)**: Clasificación Ideal vs Conservadora (Decompresivo / Hiperpresivo).
17. **Amenaza Potencial**: Riesgo perceptual general del ejercicio (Bajo/Medio/Alto).

---

## 🧠 Lógica Heurística (Flags Automáticos)

El sistema calcula automáticamente banderas de advertencia:

*   **⚠️ HYP_ADV (Hypertrophy Advantage)**: Verifica si el *Factor Limitante* coincide con el *Target Primario*. Si no coinciden (ej: un ejercicio de "Glúteo" limitado por "Agarre"), te avisa que no es ideal para hipertrofia avanzada.
*   **📡 ONLINE_RISK**: Combina ROI, Estabilidad, Carga Axial e Impacto. Si es inestable y de alto impacto/carga, se marca como *Prohibido* o *Precaución* para prescripción online.
*   **🍑 PF_RISK (Suelo Pélvico)**: Detecta ejercicios Hiperpresivos o de Alto Impacto combinado con Carga Axial, alertando sobre riesgos para el suelo pélvico.

---

## 🛠 Manual de Uso

### 1. Exploración (La Matriz)
*   **Buscador Fuzzy**: Escribe "sentadilla", "gluteo" o "salto" y el sistema encontrará coincidencias tolerantes a errores.
*   **Filtros Laterales**: Refina por Arquetipo, Target, Riesgo, etc.
*   **Column Picker**: Usa el botón "Columnas" sobre la tabla para mostrar/ocultar cualquiera de las 17 dimensiones.
*   **Drawer de Detalles**: Haz clic en cualquier fila para ver la ficha técnica completa con todos los flags y explicaciones.

### 2. Constructor (Microciclo Builder)
*   **Añadir**: Desde el Drawer de un ejercicio, pulsa "Agregar al Microciclo".
*   **Organizar**: Arrastra y suelta las tarjetas entre los días (Columnas).
*   **Personalizar**:
    *   **Strength**: Define Sets, Reps y RIR.
    *   **Plyo**: Define Contactos o Tiempo.
    *   **Separadores**: Usa separadores para dividir bloques (Calentamiento, Principal, etc.).
*   **Analizar**: Pulsa el botón **"Resumen"** (📊) para ver el balance de carga por target y perfil de intensidad.

### 3. Importar y Exportar
*   **Importar JSON**: Carga tu propia base de datos (`exercises.json`) usando el botón de subida en la barra superior.
*   **Exportar CSV**: Descarga una tabla plana para Excel.
*   **Imprimir PDF**: Genera una vista limpia para guardar o imprimir ("Modo Clínico").

---

## 💻 Stack Tecnológico
*   **Frontend**: React + Vite + TypeScript.
*   **UI**: Tailwind CSS + Shadcn UI (Diseño Premium).
*   **Datos**: Local JSON (Sin base de datos externa).
*   **Despliegue**: GitHub Pages (Automático).

Creado para **All U Moves**.
