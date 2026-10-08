import React from 'react';
import DonorList from '../../pages/DonorList';
import MobileLayout from '../../components/MobileLayout';

export default function DonorListScreen() {
  return (
    <MobileLayout title="Verified Donors">
      <DonorList />
    </MobileLayout>
  );
}