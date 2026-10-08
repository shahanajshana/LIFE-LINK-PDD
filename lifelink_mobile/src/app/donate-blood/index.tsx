import React from 'react';
import DonateBlood from '../../pages/DonateBlood';
import MobileLayout from '../../components/MobileLayout';

export default function DonateBloodScreen() {
  return (
    <MobileLayout title="Donate Blood">
      <DonateBlood />
    </MobileLayout>
  );
}