import React from 'react';
import Hospitals from '../../pages/Hospitals';
import MobileLayout from '../../components/MobileLayout';

export default function HospitalsScreen() {
  return (
    <MobileLayout title="Nearby Hospitals">
      <Hospitals />
    </MobileLayout>
  );
}