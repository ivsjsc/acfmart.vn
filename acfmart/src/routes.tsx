import { createBrowserRouter } from "react-router-dom";

import { MainLayout } from "./layouts/MainLayout";
import { AdminLayout } from "./layouts/AdminLayout";

import { HomePage } from "./pages/HomePage";
import { ProductDetailPage } from "./pages/ProductDetailPage";
import { ProductListPage } from "./pages/ProductListPage";
import { CartPage } from "./pages/CartPage";
import { CheckoutPage } from "./pages/CheckoutPage";
import { OrderHistoryPage } from "./pages/OrderHistoryPage";
import { OrderDetailPage } from "./pages/OrderDetailPage";
import { UserProfilePage } from "./pages/UserProfilePage";
import { UserSettingsPage } from "./pages/UserSettingsPage";
import { VendorProfilePage } from "./pages/VendorProfilePage";
import { VendorSettingsPage } from "./pages/VendorSettingsPage";
import { VendorProductListPage } from "./pages/VendorProductListPage";
import { VendorProductDetailPage } from "./pages/VendorProductDetailPage";
import { VendorOrderHistoryPage } from "./pages/VendorOrderHistoryPage";
import { VendorOrderDetailPage } from "./pages/VendorOrderDetailPage";
import { VendorDashboardPage } from "./pages/VendorDashboardPage";
import { AdminGuard } from "./components/AdminGuard";
import { AdminDashboardScreen } from "./screens/AdminDashboardScreen";
import { VendorModerationScreen } from "./screens/VendorModerationScreen";
import { UserManagementScreen } from "./screens/UserManagementScreen";
import { BannerManagementScreen } from "./screens/BannerManagementScreen";
import { AuditLogScreen } from "./screens/AuditLogScreen";
import { Placeholder } from "./components/Placeholder";
import { ReturnPolicyPage } from "./pages/ReturnPolicyPage";
import { ShippingPolicy } from "./pages/ShippingPolicy";
import { TermsOfUsePage } from "./pages/TermsOfUsePage";
import { DataProtectionPolicyPage } from "./pages/DataProtectionPolicyPage";
import { PrivacyPolicyBuyer } from "./pages/PrivacyPolicyBuyer";
import { PrivacyPolicySeller } from "./pages/PrivacyPolicySeller";
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "/products/:id", element: <ProductDetailPage /> },
      { path: "/products", element: <ProductListPage /> },
      { path: "/cart", element: <CartPage /> },
      { path: "/checkout", element: <CheckoutPage /> },
      { path: "/orders", element: <OrderHistoryPage /> },
      { path: "/orders/:id", element: <OrderDetailPage /> },
      { path: "/profile", element: <UserProfilePage /> },
      { path: "/settings", element: <UserSettingsPage /> },
      { path: "/vendor/:id", element: <VendorProfilePage /> },
      { path: "/vendor/:id/settings", element: <VendorSettingsPage /> },
      { path: "/vendor/:id/products", element: <VendorProductListPage /> },
      { path: "/vendor/:id/products/:id", element: <VendorProductDetailPage /> },
      { path: "/vendor/:id/orders", element: <VendorOrderHistoryPage /> },
      { path: "/vendor/:id/orders/:id", element: <VendorOrderDetailPage /> },
      { path: "/vendor/:id/dashboard", element: <VendorDashboardPage /> },

      // Social feed route
      { path: "/social", element: <SocialFeed /> },

      // Admin portal - DIFFERENT LAYOUT (no public header/footer, custom sidebar)
      // Wrapped in AdminGuard: enforces Firebase auth + admin role
      {
        path: "/admin",
        element: (
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      ),
        children: [
          { index: true, element: <AdminDashboardScreen /> },
          { path: "vendors", element: <VendorModerationScreen /> },
          { path: "users", element: <UserManagementScreen /> },
          { path: "banners", element: <BannerManagementScreen /> },
          { path: "reports", element: <Placeholder title="Báo cáo hàng giả" /> },
          { path: "audit-logs", element: <AuditLogScreen /> },
          { path: "settings", element: <Placeholder title="Cài đặt hệ thống" /> },
        ],
      },

      // Legal pages
      { path: "/legal/return", element: <ReturnPolicyPage /> },
      { path: "/legal/shipping", element: <ShippingPolicy /> },
      { path: "/legal/terms", element: <TermsOfUsePage /> },
      { path: "/legal/data-protection", element: <DataProtectionPolicyPage /> },
      { path: "/legal/privacy-buyer", element: <PrivacyPolicyBuyer /> },
      { path: "/legal/privacy-seller", element: <PrivacyPolicySeller /> },
      { path: "/legal/privacy", element: <PrivacyPolicyPage /> },

      // Catch-all route
      { path: "*", element: <NotFoundPage /> },
    ],
  },
  { path: "/login", element: <LoginPage /> },
  { path: "/signup", element: <SignupPage /> },
]);
