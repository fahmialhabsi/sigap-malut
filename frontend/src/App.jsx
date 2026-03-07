import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Import other components and routes
import DashboardPublik from './path/to/DashboardPublik'; // Adjust the import path as necessary
import DashboardPublikLayout from './path/to/DashboardPublikLayout'; // Adjust the import path as necessary

const App = () => {
    return (
        <Router>
            <Routes>
                <Route path="/dashboard-publik" element={<DashboardPublikLayout><DashboardPublik /></DashboardPublikLayout>} />
                {/* Existing routes go here */}
            </Routes>
        </Router>
    );
};

export default App;