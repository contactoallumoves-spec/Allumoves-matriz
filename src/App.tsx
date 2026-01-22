import React from 'react';
import Layout from './components/layout/Layout';
import MatrixPage from './pages/MatrixPage';
import { DataProvider } from './context/store';
import { TooltipProvider } from './components/ui/tooltip';

function App() {
    return (
        <DataProvider>
            <TooltipProvider>
                <Layout>
                    <MatrixPage />
                </Layout>
            </TooltipProvider>
        </DataProvider>
    );
}

export default App;
