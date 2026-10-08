import React from 'react';
import Notification from '../../pages/Notification';
import MobileLayout from '../../components/MobileLayout';

export default function NotificationsScreen() {
  return (
    <MobileLayout title="Notifications">
      <Notification />
    </MobileLayout>
  );
}