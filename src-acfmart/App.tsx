import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import { StoreProvider } from './store';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ErrorBoundary } from './components/ErrorBoundary';
import { SkipToContent } from './components/SkipToContent';
import { PrivateRoute } from './components/guards/PrivateRoute';
import { ProductMarketplace } from './components/ProductMarketplace';
import { CustomerView } from './pages/Customer';
import { ModeratorView } from './pages/Moderator';
import { AdminView } from './pages/Admin';
import { CarrierView } from './pages/Carrier';
import { ShopView } from './pages/Shop';
import { AboutACF } from './pages/AboutACF';
import { Contact } from './pages/Contact';
import Checkout from './pages/Checkout';
import { ProductDetail } from './pages/ProductDetail';
import { SearchResultsPage } from './pages/SearchResultsPage';
import DevelopmentPlan from './pages/DevelopmentPlan';
import { Cart } from './components/Cart';
import { Activities } from './pages/Activities';
import { Legal } from './pages/Legal';
import { Media } from './pages/Media';
import OrderManagement from './components/OrderManagement';
import SellerApprovalWorkflow from './components/SellerApprovalWorkflow';
import RouteStatus from './components/RouteStatus';
import ProductManagement from './components/ProductManagement';
import ProductApproval from './components/ProductApproval';
import Register from './pages/Register';
import BecomeSeller from './pages/BecomeSeller';
import SellerApplicationManagement from './pages/SellerApplicationManagement';
import UserProfile from './pages/UserProfile';
import { NotFound } from './pages/NotFound';
import { Unauthorized } from './pages/Unauthorized';
import './index.css';

const App: React.FC = () => {
  return (
    <ErrorBoundary>
      <StoreProvider>
        <LanguageProvider>
          <Router>
            <SkipToContent />
            <div className="min-h-screen flex flex-col">
              <Header />
              <main id="main-content" className="flex-grow" role="main">
                <Routes>
                  {/* Public routes */}
                  <Route path="/" element={<ProductMarketplace />} />
                  <Route path="/shop" element={<ProductMarketplace />} />
                  <Route path="/about" element={<AboutACF />} />
                  <Route path="/activities" element={<Activities />} />
                  <Route path="/legal" element={<Legal />} />
                  <Route path="/media" element={<Media />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/product/:id" element={<ProductDetail />} />
                  <Route path="/search" element={<SearchResultsPage />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/development-plan" element={<DevelopmentPlan />} />
                  <Route path="/unauthorized" element={<Unauthorized />} />

                  {/* Authenticated routes */}
                  <Route path="/customer" element={<PrivateRoute><CustomerView /></PrivateRoute>} />
                  <Route path="/cart" element={<PrivateRoute><Cart onClose={() => {}} /></PrivateRoute>} />
                  <Route path="/checkout" element={<PrivateRoute><Checkout /></PrivateRoute>} />
                  <Route path="/orders" element={<PrivateRoute><OrderManagement /></PrivateRoute>} />
                  <Route path="/profile" element={<PrivateRoute><UserProfile /></PrivateRoute>} />
                  <Route path="/become-seller" element={<PrivateRoute><BecomeSeller /></PrivateRoute>} />

                  {/* Seller routes */}
                  <Route path="/shop-owner" element={
                    <PrivateRoute requiredRoles={['shop', 'shop_manager', 'shop_staff']}>
                      <ShopView />
                    </PrivateRoute>
                  } />
                  <Route path="/product-management" element={
                    <PrivateRoute requiredRoles={['shop', 'shop_manager', 'shop_staff']}>
                      <ProductManagement />
                    </PrivateRoute>
                  } />
                  <Route path="/route-status" element={
                    <PrivateRoute requiredRoles={['carrier', 'admin', 'super_admin']}>
                      <RouteStatus />
                    </PrivateRoute>
                  } />

                  {/* Carrier routes */}
                  <Route path="/carrier" element={
                    <PrivateRoute requiredRoles={['carrier', 'admin', 'super_admin']}>
                      <CarrierView />
                    </PrivateRoute>
                  } />

                  {/* Moderator routes */}
                  <Route path="/moderator" element={
                    <PrivateRoute requiredRoles={['moderator', 'admin', 'super_admin']}>
                      <ModeratorView />
                    </PrivateRoute>
                  } />
                  <Route path="/seller-approval" element={
                    <PrivateRoute requiredRoles={['moderator', 'admin', 'super_admin']}>
                      <SellerApprovalWorkflow />
                    </PrivateRoute>
                  } />
                  <Route path="/product-approval" element={
                    <PrivateRoute requiredRoles={['moderator', 'admin', 'super_admin']}>
                      <ProductApproval />
                    </PrivateRoute>
                  } />

                  {/* Admin routes */}
                  <Route path="/admin" element={
                    <PrivateRoute requiredRoles={['admin', 'super_admin']}>
                      <AdminView />
                    </PrivateRoute>
                  } />
                  <Route path="/admin/seller-applications" element={
                    <PrivateRoute requiredRoles={['admin', 'super_admin']}>
                      <SellerApplicationManagement />
                    </PrivateRoute>
                  } />

                  {/* 404 catch-all */}
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </LanguageProvider>
      </StoreProvider>
    </ErrorBoundary>
  );
};

export default App;
