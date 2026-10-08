import React from 'react';
import Emergency from '../../pages/Emergency';
import MobileLayout from '../../components/MobileLayout';

export default function EmergencyScreen() {
  return (
    <MobileLayout title="Emergency SOS">
      <Emergency />
    </MobileLayout>
  );
}