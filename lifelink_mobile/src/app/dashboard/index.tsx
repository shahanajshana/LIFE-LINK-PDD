import React from 'react';
import Dashboard from '../../pages/Dashboard';
import MobileLayout from '../../components/MobileLayout';

export default function DashboardScreen() {
  return (
    <MobileLayout title="LifeLink Dashboard">
      <Dashboard />
    </MobileLayout>
  );
}