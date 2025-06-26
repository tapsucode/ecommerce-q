import React from 'react';
import { useAuth } from '../../hooks/useAuth';
import Header from './Header';
import Sidebar from './Sidebar';
import ConnectionStatus from '../UI/ConnectionStatus';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <ConnectionStatus />
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;