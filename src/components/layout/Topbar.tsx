import { Search, Sun, Moon, Download, Dumbbell } from "lucide-react";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Badge } from "../ui/badge";
import { useState } from "react";
import { useData } from "@/context/store";

export default function Topbar() {
    const [isDark, setIsDark] = useState(false); // Mock theme state
    const { filters, setFilters, microcycle, setCurrentView } = useData();

    return (
        <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="flex h-16 items-center px-6 gap-4">
                {/* Logo Section */}
                <div className="flex items-center gap-2 font-bold text-lg md:text-xl tracking-tight text-primary mr-4">
                    <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-black">
                        A
                    </div>
                    <span className="hidden md:inline-block">All U Moves</span>
                    <span className="text-xs font-normal text-muted-foreground ml-1">Matriz Maestra</span>
                </div>

                {/* Search Bar - Global Fuzzy Search */}
                <div className="flex-1 max-w-xl relative hidden md:flex">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Buscar por ejercicio, nombre técnico, o target..."
                        className="pl-9 bg-muted/20 border-muted/50 focus-visible:ring-primary/20"
                        value={filters.search}
                        onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    />
                </div>

                {/* Right Actions */}
                <div className="ml-auto flex items-center space-x-2">

                    {/* Microcycle Builder Action */}
                    <Button
                        variant="outline"
                        className="relative gap-2 border-primary/20 text-primary hover:bg-primary/5 transition-all hover:shadow-premium-sm"
                        onClick={() => setCurrentView('builder')}
                    >
                        <Dumbbell className="h-4 w-4" />
                        <span className="hidden sm:inline">Microciclo</span>
                        {microcycle.length > 0 && (
                            <Badge variant="default" className="ml-1 px-1.5 py-0 h-5 text-[10px] animate-in zoom-in">{microcycle.length}</Badge>
                        )}
                        {microcycle.length === 0 && (
                            <Badge variant="secondary" className="ml-1 px-1 py-0 h-5 text-[10px]">0</Badge>
                        )}
                    </Button>

                    <Button variant="ghost" size="icon" title="Exportar Vista">
                        <Download className="h-4 w-4" />
                    </Button>

                    <Button variant="ghost" size="icon" onClick={() => setIsDark(!isDark)}>
                        <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                        <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                        <span className="sr-only">Toggle theme</span>
                    </Button>
                </div>
            </div>
        </header>
    );
}
