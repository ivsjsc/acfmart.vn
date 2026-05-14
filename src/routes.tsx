import React from 'react'
import { createBrowserRouter } from "react-router-dom"
import { MainLayout } from "./layouts/MainLayout"
import HomeScreen from "./features/home/components/HomeScreen"
import { AivyPage } from "./features/aivy"
import {
  LoginScreen,
  LoginCloudScreen,
  LoginStoreScreen,
  LoginOnlineScreen,
  SignupScreen,
  ForgotPasswordScreen,
  ZaloCallbackScreen,
} from "./features/auth"
import {
  ProductDetailScreen,
  CategoryListingScreen,
} from "./features/product"
import { CartScreen } from "./features/cart"
import { CheckoutScreen, OrderSuccessScreen } from "./features/checkout"
import { OrderManagementScreen, OrderDetailScreen, TrackOrderScreen } from "./features/order"
import OrderReviewScreen from "./features/order/components/OrderReviewScreen"
import ReturnRequestScreen from "./features/order/components/ReturnRequestScreen"
import { AffiliateDashboardScreen } from "./features/affiliate"
import {
  AccountLayout,
  AccountScreen,
  WalletScreen,
  VoucherScreen,
  SettingsScreen,
  ChatScreen,
  AddressManagementScreen,
  LoyaltyScreen,
} from "./features/account"
import { WishlistScreen } from "./features/wishlist"
import { CompareScreen } from "./features/compare"
import { ShopDetailScreen } from "./features/shop"
import { NotFound } from "./pages/NotFound"
import { Placeholder } from "./pages/Placeholder"
import { AboutUsPage } from "./pages/AboutUsPage"
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage"
import { PrivacyPolicyBuyer } from "./pages/PrivacyPolicyBuyer"
import { PrivacyPolicySeller } from "./pages/PrivacyPolicySeller"
import { ReturnPolicyPage } from "./pages/ReturnPolicyPage"
import ShippingPolicy from "./pages/ShippingPolicy"
import { DataProtectionPolicyPage } from "./pages/DataProtectionPolicyPage"
import { TermsOfUsePage } from "./pages/TermsOfUsePage"
import GuideCreateModeratorPage from "./pages/GuideCreateModeratorPage"
import GuideModeratorPage from "./pages/GuideModeratorPage"
import GuideSellerPage from "./pages/GuideSellerPage"
import { LiveCommerceScreen } from "./features/live"
import { HelpCenterScreen } from "./features/help"
import { ContactScreen } from "./features/contact"
import {
  SellerLayout,
  SellerGuard,
  SellerRegistrationScreen,
  SellerDashboardScreen,
  SellerProductsScreen,
  SellerProductFormScreen,
  SellerOrdersScreen,
  SellerOrderDetailScreen,
  SellerShopScreen,
  SellerChatScreen,
  SellerMarketingScreen,
  SellerAnalyticsScreen,
  SellerFinanceScreen,
  SellerSettingsScreen,
} from "./features/seller"
import {
  AdminLayout,
  AdminGuard,
  AdminDashboardScreen,
  VendorModerationScreen,
  UserManagementScreen,
  BannerManagementScreen,
  AuditLogScreen,
} from "./features/admin"
import { QRVerifyScreen } from "./features/qr-verify";
import { SocialFeed } from "./features/social";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      { index: true, element: <HomeScreen /> },
      {
        path: "products/:id",
        element: <ProductDetailScreen />,
      },
      {
        path: "categories/:slug/*",
        element: <CategoryListingScreen />,
      },
      { path: "/cart", element: <CartScreen /> },
      { path: "/checkout", element: <CheckoutScreen /> },
      { path: "/checkout/success", element: <OrderSuccessScreen /> },
      { path: "/aivy", element: <AivyPage /> },
      
      // Authentication routes
      { path: "/login", element: <LoginScreen /> },
      { path: "/login/cloud", element: <LoginCloudScreen /> },
      { path: "/login/store", element: <LoginStoreScreen /> },
      { path: "/login/online", element: <LoginOnlineScreen /> },
      { path: "/signup", element: <SignupScreen /> },
      { path: "/forgot-password", element: <ForgotPasswordScreen /> },
      
      // Account routes
      {
        path: "/account",
        element: <AccountLayout />,
        children: [
          { index: true, element: <AccountScreen /> },
          { path: "orders", element: <OrderManagementScreen /> },
          { path: "orders/:id", element: <OrderDetailScreen /> },
          { path: "orders/:orderId/review", element: <OrderReviewScreen /> },
          { path: "orders/:orderId/return", element: <ReturnRequestScreen /> },
          { path: "track", element: <TrackOrderScreen /> },
          { path: "wishlist", element: <WishlistScreen /> },
          { path: "compare", element: <CompareScreen /> },
          { path: "wallet", element: <WalletScreen /> },
          { path: "loyalty", element: <LoyaltyScreen /> },
          { path: "vouchers", element: <WishlistScreen /> },
          { path: "settings", element: <SettingsScreen /> },
          { path: "chat", element: <ChatScreen /> },
          { path: "addresses", element: <AddressManagementScreen /> },
        ],
      },
      { path: "/account/notifications", element: <Placeholder title="Thông báo" /> },
      { path: "/affiliate", element: <AffiliateDashboardScreen /> },
      { path: "/live", element: <LiveCommerceScreen /> },
      { path: "/live/:id", element: <Placeholder title="Phòng Livestream" description="Phase 3" /> },
      { path: "/seller-register", element: <SellerRegistrationScreen /> },
      { path: "/shops/:id", element: <ShopDetailScreen /> },

      // Feature routes
      { path: "/categories", element: <CategoryListingScreen /> },
      { path: "/qr-verify", element: <QRVerifyScreen /> },
      { path: "/wishlist", element: <WishlistScreen /> },
      { path: "/notifications", element: <Placeholder title="Thông báo" /> },

      // Legal pages
      { path: "/legal/return", element: <ReturnPolicyPage /> },
      { path: "/legal/shipping", element: <ShippingPolicy /> },
      { path: "/legal/terms", element: <TermsOfUsePage /> },
      { path: "/legal/data-protection", element: <DataProtectionPolicyPage /> },
      { path: "/legal/privacy-buyer", element: <PrivacyPolicyBuyer /> },
      { path: "/legal/privacy-seller", element: <PrivacyPolicySeller /> },
      { path: "/legal/privacy", element: <PrivacyPolicyPage /> },

      // Guide pages
      { path: "/guide/create-moderator", element: <GuideCreateModeratorPage /> },
      { path: "/guide/moderator", element: <GuideModeratorPage /> },
      { path: "/guide/seller", element: <GuideSellerPage /> },

      // Social feed route
      { path: "/social", element: <SocialFeed /> },

      // Static
      { path: "/about", element: <AboutUsPage /> },
      { path: "/help", element: <HelpCenterScreen /> },
      { path: "/contact", element: <ContactScreen /> },
      { path: "/anti-counterfeit", element: <Placeholder title="Chương trình chống hàng giả" /> },
      { path: "/news", element: <Placeholder title="Tin tức" /> },
      { path: "/legal/counterfeit", element: <Placeholder title="Chống hàng giả" /> },

      { path: "*", element: <NotFound /> },
    ],
  },
  // Seller portal - DIFFERENT LAYOUT (no public header/footer, custom sidebar)
  // Wrapped in SellerGuard: enforces Firebase auth + active vendor status
  {
    path: "/seller",
    element: (
      <SellerGuard>
        <SellerLayout />
      </SellerGuard>
    ),
    children: [
      { index: true, element: <SellerDashboardScreen /> },
      { path: "orders", element: <SellerOrdersScreen /> },
      { path: "orders/:id", element: <SellerOrderDetailScreen /> },
      { path: "products", element: <SellerProductsScreen /> },
      { path: "products/new", element: <SellerProductFormScreen /> },
      { path: "products/:id", element: <SellerProductFormScreen /> },
      { path: "chat", element: <SellerChatScreen /> },
      { path: "marketing", element: <SellerMarketingScreen /> },
      { path: "analytics", element: <SellerAnalyticsScreen /> },
      { path: "finance", element: <SellerFinanceScreen /> },
      { path: "shop", element: <SellerShopScreen /> },
      { path: "settings", element: <SellerSettingsScreen /> },
    ],
  },
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
]);