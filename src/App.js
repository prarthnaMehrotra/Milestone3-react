// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import LandingPage from './components/LandingPage'; // Import your LandingPage component
import 'bootstrap/dist/css/bootstrap.min.css'; // Import Bootstrap CSS
import AdminDashboard from './components/AdminDashboard';
import ManageCategories from './components/ManageCategories';
import ManageEvents from './components/ManageEvents';
import ManageOrganizers from './components/ManageOrganizers';
import ViewRevenue from './components/ViewRevenue';
import Profile from './components/Profile';
import Bookings from './components/Bookings';
import OrganizerDashboard from './components/OrganizerDashboard';
import OrganizerManageEvents from './components/OrganizerManageEvents';
import OrganizerRevenue from './components/OrganizerRevenue';

const App = () => {
  return (
    <Router>
      <div>
        {/* Routes */}
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/admin-dashboard" element={<AdminDashboard />} />
          <Route path="/organizer-dashboard" element={<OrganizerDashboard />} />
          <Route path="/user-profile" element={<Profile />} />
          <Route path="/user-bookings" element={<Bookings />} />
          <Route path="/ManageCategories" element={<ManageCategories />} />
          <Route path="/ManageEvents" element={<ManageEvents />} />
          <Route path="/ManageOrganizers" element={<ManageOrganizers />} />
          <Route path="/ViewRevenue" element={<ViewRevenue />} />
          <Route path="/OrganizerManageEvents" element={<OrganizerManageEvents />} />
          <Route path="/OrganizerRevenue" element={<OrganizerRevenue />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
