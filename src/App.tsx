import React from 'react';
import Layout from './components/layout/Layout';
import MatrixPage from './pages/MatrixPage';
import BuilderPage from './pages/BuilderPage';
import { DataProvider, useData } from './context/store';
import { TooltipProvider } from './components/ui/tooltip';

function AppContent() {
    const { currentView } = useData();

    return (
        <Layout>
            {currentView === 'matrix' ? <MatrixPage /> : <BuilderPage />}
        </Layout>
    );
}

function App() {
    return (
        <DataProvider>
            <TooltipProvider>
                <AppContent />
            </TooltipProvider>
        </DataProvider>
    );
}

export default App;
