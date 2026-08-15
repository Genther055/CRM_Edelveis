import { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Login } from './components/Login';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { Calculator } from './components/Calculator';
import { Clients } from './components/Clients';
import { Production } from './components/Production';
import { Warehouse } from './components/Warehouse';
import { Leads } from './components/Leads';
import { Deals } from './components/Deals';
import { Delivery } from './components/Delivery';
import { Tasks } from './components/Tasks';
import { Chats } from './components/Chats';
import { Documents } from './components/Documents';
import { Finance } from './components/Finance';
import { Triggers } from './components/Triggers';
import { Settings } from './components/Settings';
import { Profile } from './components/Profile';
import { Employees } from './components/Employees';
import { PM } from './components/PM';
import './App.css';

function AppContent() {
  const { currentUser } = useApp();
  const [activeTab, setActiveTab] = useState('dashboard');

  if (!currentUser) {
    return <Login />;
  }

  const role = currentUser.role;

  return (
    <div className="app-container">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />
      
      {activeTab === 'dashboard' && (
        <Dashboard setActiveTab={setActiveTab} />
      )}
      
      {activeTab === 'leads' && ['admin', 'manager'].includes(role) && (
        <Leads />
      )}

      {activeTab === 'clients' && ['admin', 'manager'].includes(role) && (
        <Clients />
      )}

      {activeTab === 'employees' && ['admin', 'manager'].includes(role) && (
        <Employees />
      )}

      {activeTab === 'pm' && ['admin', 'manager'].includes(role) && (
        <PM />
      )}

      {activeTab === 'deals' && ['admin', 'manager'].includes(role) && (
        <Deals />
      )}

      {activeTab === 'delivery' && ['admin', 'manager'].includes(role) && (
        <Delivery />
      )}
      
      {activeTab === 'calculator' && ['admin', 'manager'].includes(role) && (
        <Calculator />
      )}
      
      {activeTab === 'warehouse' && ['admin', 'manager'].includes(role) && (
        <Warehouse />
      )}

      {activeTab === 'production' && (
        <Production />
      )}

      {activeTab === 'tasks' && (
        <Tasks />
      )}

      {activeTab === 'chats' && ['admin', 'manager'].includes(role) && (
        <Chats />
      )}

      {activeTab === 'documents' && ['admin', 'manager'].includes(role) && (
        <Documents />
      )}

      {activeTab === 'finance' && ['admin', 'manager'].includes(role) && (
        <Finance />
      )}

      {activeTab === 'triggers' && ['admin'].includes(role) && (
        <Triggers />
      )}

      {activeTab === 'settings' && ['admin'].includes(role) && (
        <Settings />
      )}

      {activeTab === 'profile' && (
        <Profile />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
