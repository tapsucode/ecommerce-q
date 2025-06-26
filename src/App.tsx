import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout';
import Dashboard from './pages/Dashboard/Dashboard';
import Products from './pages/Products/Products';
import Inventory from './pages/Inventory/Inventory';
import Orders from './pages/Orders/Orders';
import Customers from './pages/Customers/Customers';
import Promotions from './pages/Promotions/Promotions';
import Suppliers from './pages/Suppliers/Suppliers';
import PurchaseOrders from './pages/PurchaseOrders/PurchaseOrders';
import Reports from './pages/Reports/Reports';

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/orders" element={<Orders />} />
      </Routes>
    </Layout>
      </Router>
  );
}

export default App;