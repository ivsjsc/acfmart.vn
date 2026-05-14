import React from 'react'
import { createBrowserRouter } from "react-router-dom"
import { MainLayout } from "./layouts/MainLayout"
import HomeScreen from "./features/home/components/HomeScreen"
import { AivyPage } from "./features/aivy"
import {
  LoginScreen,
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
import { OrderManagementScreen, OrderDetailScreen } from "./features/order"
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
import { ShopDetailScreen } from "./features/shop"
import { SearchResultsScreen } from "./features/search"
import {
  QRVerifyScreen,
  VerificationCabinetScreen,
  ReportCounterfeitScreen
} from "./features/qr-verify"
import {
  ShopCertificationScreen
} from "./features/shop-certification"
import TrackOrderScreen from "./features/order/components/TrackOrderScreen"
import { WishlistScreen } from "./features/wishlist/WishlistScreen"
import { CompareScreen } from "./features/compare/CompareScreen"
import { ContactScreen } from "./features/contact/ContactScreen"
import { HelpCenterScreen } from "./features/help/HelpCenterScreen"
import { LiveCommerceScreen } from "./features/live"
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
import { Placeholder } from "./pages/Placeholder"
import { NotFound } from "./pages/NotFound"
import { SellerTermsPage } from "./pages/SellerTermsPage"
import { SellerFeesPage } from "./pages/SellerFeesPage"
import PrivacyPolicyBuyer from "./pages/PrivacyPolicyBuyer"
import PrivacyPolicySeller from "./pages/PrivacyPolicySeller"
import PrivacyPolicy from "./pages/PrivacyPolicy"
import { ReturnPolicyPage } from "./pages/ReturnPolicyPage"
import ShippingPolicy from "./pages/ShippingPolicy"
import { TermsOfServicePage } from "./pages/TermsOfServicePage"
import { DataProtectionPolicyPage } from "./pages/DataProtectionPolicyPage"
import { AntiCounterfeitPage } from "./pages/AntiCounterfeitPage"
import GuideCreateModeratorPage from "./pages/GuideCreateModeratorPage"
import GuideModeratorPage from "./pages/GuideModeratorPage"
import GuideSellerPage from "./pages/GuideSellerPage"
import {
  AdminLayout,
  AdminGuard,
  AdminDashboardScreen,
  VendorModerationScreen,
  UserManagementScreen,
  BannerManagementScreen,
  AuditLogScreen,
} from "./features/admin"

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

      // Account (standalone screens)
      { path: "/account/orders", element: <OrderManagementScreen /> },
      { path: "/account/orders/:id", element: <OrderDetailScreen /> },
      { path: "/account/orders/:orderId/review", element: <OrderReviewScreen /> },
      { path: "/account/orders/:orderId/return", element: <ReturnRequestScreen /> },
      { path: "/account/track", element: <TrackOrderScreen /> },
      { path: "/account/wishlist", element: <WishlistScreen /> },
      { path: "/account/compare", element: <CompareScreen /> },

      // Auth (standalone screens)
      { path: "/login", element: <LoginScreen /> },
      { path: "/signup", element: <SignupScreen /> },
      { path: "/forgot-password", element: <ForgotPasswordScreen /> },
      { path: "/auth/zalo/callback", element: <ZaloCallbackScreen /> },

      // Shops
      { path: "/brand-stores", element: <Placeholder title="Trang thương hiệu" description="Brand Page – Phase 3" /> },
      { path: "/shops/:id", element: <ShopDetailScreen /> },

      // Account (nested)
      {
        path: "/account",
        element: <AccountLayout />,
        children: [
          { index: true, element: <AccountScreen /> },
          { path: "wallet", element: <WalletScreen /> },
          { path: "loyalty", element: <LoyaltyScreen /> },
          { path: "vouchers", element: <VoucherScreen /> },
          { path: "settings", element: <SettingsScreen /> },
          { path: "chat", element: <ChatScreen /> },
          { path: "addresses", element: <AddressManagementScreen /> },
        ],
      },
      {
        path: "/notifications",
        element: <Placeholder title="Thông báo" />,
      },

      // Affiliate
      { path: "/affiliate", element: <AffiliateDashboardScreen /> },

      // Live commerce (Phase 3)
      {
        path: "/live",
        element: <LiveCommerceScreen />,
      },
      {
        path: "/live/:id",
        element: (
          <Placeholder title="Phòng Livestream" description="Phase 3" />
        ),
      },

      // Seller registration (uses main layout)
      { path: "/seller-register", element: <SellerRegistrationScreen /> },
      { path: "/legal/seller-terms", element: <SellerTermsPage /> },
      { path: "/legal/seller-fees", element: <SellerFeesPage /> },

      // Privacy policies
      { path: "/legal/privacy-buyer", element: <PrivacyPolicyBuyer /> },
      { path: "/legal/privacy-seller", element: <PrivacyPolicySeller /> },
      { path: "/legal/privacy", element: <PrivacyPolicy /> },
      { path: "/legal/return", element: <ReturnPolicyPage /> },
      { path: "/legal/shipping", element: <ShippingPolicy /> },
      { path: "/legal/terms", element: <TermsOfServicePage /> },
      { path: "/legal/data-protection", element: <DataProtectionPolicyPage /> },
      { path: "/legal/anti-counterfeit", element: <AntiCounterfeitPage /> },
      { path: "/guide/create-moderator", element: <GuideCreateModeratorPage /> },
      { path: "/guide/moderator", element: <GuideModeratorPage /> },
      { path: "/guide/seller", element: <GuideSellerPage /> },

      // Static
      { path: "/about", element: <Placeholder title="Về nền tảng" /> },
      { path: "/help", element: <HelpCenterScreen /> },
      { path: "/contact", element: <ContactScreen /> },
      { path: "/anti-counterfeit", element: <Placeholder title="Chương trình chống hàng giả" /> },
      { path: "/news", element: <Placeholder title="Tin tức" /> },
      { path: "/legal/counterfeit", element: <Placeholder title="Chống hàng giả" /> },
      { path: "/legal/terms", element: <Placeholder title="Điều khoản sử dụng" /> },
      { path: "/legal/shipping", element: <ShippingPolicy /> },

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
  // Admin/Moderator portal
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
])