import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { OfficerSidebar } from './components/OfficerSidebar';
import { OfficerHeader } from './components/OfficerHeader';
import { LandingPage } from './pages/LandingPage';
import { SubmitComplaintPage } from './pages/SubmitComplaintPage';
import { TrackComplaintPage } from './pages/TrackComplaintPage';
import { OfficerOverview } from './pages/Officer/OfficerOverview';
import { ComplaintsListPage } from './pages/Officer/ComplaintsListPage';
import { ComplaintDetailPage } from './pages/Officer/ComplaintDetailPage';
import { ResponsibilityGraphPage } from './pages/Officer/ResponsibilityGraphPage';
import { GeospatialMapPage } from './pages/Officer/GeospatialMapPage';
import { RecurrenceMonitoringPage } from './pages/Officer/RecurrenceMonitoringPage';
import { AdminPage } from './pages/Officer/AdminPage';
import { api } from './services/api';

// Public Layout
const PublicLayout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-[#F7F9FC]">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

// Officer Console Layout
const OfficerLayout: React.FC = () => {
  const [recurrenceCount, setRecurrenceCount] = useState(0);

  useEffect(() => {
    api.getRecurrenceAlerts()
      .then((alerts) => setRecurrenceCount(alerts.length))
      .catch(() => setRecurrenceCount(0));
  }, []);

  return (
    <div className="flex h-screen bg-[#F7F9FC] overflow-hidden">
      <OfficerSidebar recurrenceCount={recurrenceCount} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <OfficerHeader recurrenceCount={recurrenceCount} />
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Citizen Portal */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<LandingPage />} />
          <Route path="/submit" element={<SubmitComplaintPage />} />
          <Route path="/track" element={<TrackComplaintPage />} />
        </Route>

        {/* Municipal Officer Portal */}
        <Route path="/officer" element={<OfficerLayout />}>
          <Route index element={<OfficerOverview />} />
          <Route path="complaints" element={<ComplaintsListPage />} />
          <Route path="complaints/:id" element={<ComplaintDetailPage />} />
          <Route path="graph" element={<ResponsibilityGraphPage />} />
          <Route path="map" element={<GeospatialMapPage />} />
          <Route path="recurrence" element={<RecurrenceMonitoringPage />} />
          <Route path="admin" element={<AdminPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
