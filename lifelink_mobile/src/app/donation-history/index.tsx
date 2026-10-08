import React from 'react';
import DonationHistory from '../../pages/DonationHistory';
import MobileLayout from '../../components/MobileLayout';

export default function DonationHistoryScreen() {
  return (
    <MobileLayout title="Donation History">
      <DonationHistory />
    </MobileLayout>
  );
}