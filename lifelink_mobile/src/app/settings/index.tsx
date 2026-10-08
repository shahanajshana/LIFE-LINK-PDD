import React from 'react';
import Settings from '../../pages/Settings';
import MobileLayout from '../../components/MobileLayout';

export default function SettingsScreen() {
  return (
    <MobileLayout title="Settings & Profile">
      <Settings />
    </MobileLayout>
  );
}