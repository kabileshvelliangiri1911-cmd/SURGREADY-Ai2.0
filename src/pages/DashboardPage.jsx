import React from 'react';
import { useAuth } from '../context/AuthContext';
import { DoctorDashboard } from '../components/dashboard/DoctorDashboard';
import { ManagementDashboard } from '../components/dashboard/ManagementDashboard';
import { NurseDashboard } from '../components/dashboard/NurseDashboard';
import { PatientDashboard } from '../components/dashboard/PatientDashboard';

export const DashboardPage = () => {
  const { currentUser } = useAuth();

  // Role-Based Dashboard Routing based on authenticated database role
  const userRole = (currentUser?.role || 'doctor').toLowerCase();

  switch (userRole) {
    case 'management':
      return <ManagementDashboard />;
    case 'nurse':
      return <NurseDashboard />;
    case 'patient':
      return <PatientDashboard />;
    case 'doctor':
    default:
      return <DoctorDashboard />;
  }
};
