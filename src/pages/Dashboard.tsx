
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import ModelDashboard from '../components/ModelDashboard';
import UserDashboard from '../components/UserDashboard';
import Header from '../components/Header';

const Dashboard = () => {
  const { user } = useAuth();

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-hotelite-black">
      <Header />
      <main className="container mx-auto px-4 py-8">
        {user.userType === 'model' ? <ModelDashboard /> : <UserDashboard />}
      </main>
    </div>
  );
};

export default Dashboard;
