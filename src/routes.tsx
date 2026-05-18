import React from 'react'
import { Navigate, createBrowserRouter } from "react-router-dom"
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
import UserSupportChatScreen from "./features/account/components/UserSupportChatScreen"
import { WishlistScreen } from "./features/wishlist"
import { CompareScreen } from "./features/compare"
import { ShopDetailScreen } from "./features/shop"
import { NotFound } from "./pages/NotFound"
import { Placeholder } from "./pages/Placeholder"
import { AntiCounterfeitPage } from "./pages/AntiCounterfeitPage"
import AntiCounterfeitReportPage from "./pages/AntiCounterfeitReportPage"
import { NewsPage } from "./pages/NewsPage"
import { AboutUsPage } from "./pages/AboutUsPage"
import { PrivacyPolicyPage } from "./pages/PrivacyPolicyPage"
import { PrivacyPolicyBuyer } from "./pages/PrivacyPolicyBuyer"
import { PrivacyPolicySeller } from "./pages/PrivacyPolicySeller"
import { ReturnPolicyPage } from "./pages/ReturnPolicyPage"
import ShippingPolicy from "./pages/ShippingPolicy"
import { DataProtectionPolicyPage } from "./pages/DataProtectionPolicyPage"
import { TermsOfServicePage } from "./pages/TermsOfServicePage"
import { SellerTermsPage } from "./pages/SellerTermsPage"
import { SellerFeesPage } from "./pages/SellerFeesPage"
import { PaymentPolicyPage } from "./pages/PaymentPolicyPage"
import GuideModeratorPage from "./pages/GuideModeratorPage"
import GuideSellerPage from "./pages/GuideSellerPage"
import { LiveCommerceScreen } from "./features/live"
import LiveStreamRoomScreen from "./features/live/LiveStreamRoomScreen"
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
  SellerShopCustomizeScreen,
  SellerOrderTrackScreen,
  SellerChannelLanding,
  SellerChatScreen,
  SellerAnalyticsScreen,
  SellerFinanceScreen,
  SellerVouchersScreen,
  SellerSettingsScreen,
  SellerLiveScreen,
  SellerLiveFormScreen,
  SellerLiveStudioScreen,
} from "./features/seller"
import {
  AdminLayout,
  AdminGuard,
  AdminDashboardScreen,
  VendorModerationScreen,
  ProductModerationScreen,
  UserManagementScreen,
  BannerManagementScreen,
  CounterfeitReportsScreen,
  AuditLogScreen,
  AdminSettingsScreen,
  AdminSupportChatScreen,
} from "./features/admin"
import {
  QRVerifyScreen,
  ReportCounterfeitScreen,
  VerificationCabinetScreen,
} from "./features/qr-verify";
import ProductVerificationScreen from "./features/qr-verify/components/ProductVerificationScreen";
import { SocialFeed } from "./features/social";
import { PublicProfileScreen, PersonalTimelineScreen } from "./features/profile";
import NotificationScreen from "./features/notifications/NotificationScreen";
import { SearchResultsScreen } from "./features/search";

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
      { path: "/checkout/success/:id", element: <OrderSuccessScreen /> },
      { path: "/aivy", element: <AivyPage /> },
      
      // Authentication routes
      { path: "/login", element: <LoginScreen /> },
      { path: "/login/cloud", element: <LoginCloudScreen /> },
      { path: "/login/store", element: <LoginStoreScreen /> },
      { path: "/login/online", element: <LoginOnlineScreen /> },
      { path: "/signup", element: <SignupScreen /> },
      { path: "/forgot-password", element: <ForgotPasswordScreen /> },
      { path: "/auth/zalo/callback", element: <ZaloCallbackScreen /> },
      
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
          { path: "vouchers", element: <VoucherScreen /> },
          { path: "settings", element: <SettingsScreen /> },
          { path: "chat", element: <ChatScreen /> },
          { path: "support", element: <UserSupportChatScreen /> },
          { path: "addresses", element: <AddressManagementScreen /> },
          { path: "timeline", element: <PersonalTimelineScreen /> },
        ],
      },
      { path: "/account/notifications", element: <NotificationScreen /> },
      { path: "/affiliate", element: <AffiliateDashboardScreen /> },
      { path: "/live", element: <LiveCommerceScreen /> },
      { path: "/live/:id", element: <LiveStreamRoomScreen /> },
      { path: "/seller-register", element: <SellerRegistrationScreen /> },
      // Public landing for the seller channel — also reachable by non-sellers,
      // who see a CTA to register as a seller.
      { path: "/seller-channel", element: <SellerChannelLanding /> },
      { path: "/shops/:id", element: <ShopDetailScreen /> },
      // Public profile page — anyone can visit, only public+approved
      // reviews appear. /account/timeline is the authenticated counterpart.
      { path: "/u/:userId", element: <PublicProfileScreen /> },

      // Feature routes
      { path: "/categories", element: <CategoryListingScreen /> },
      { path: "/search", element: <SearchResultsScreen /> },
      { path: "/qr-verify", element: <QRVerifyScreen /> },
      { path: "/qr-verify/cabinet", element: <VerificationCabinetScreen /> },
      { path: "/qr-verify/product/:id", element: <ProductVerificationScreen /> },
      { path: "/report-counterfeit", element: <ReportCounterfeitScreen /> },
      { path: "/wishlist", element: <WishlistScreen /> },
      { path: "/notifications", element: <NotificationScreen /> },

      // Legal pages
      { path: "/legal/return", element: <ReturnPolicyPage /> },
      { path: "/legal/shipping", element: <ShippingPolicy /> },
      { path: "/legal/terms", element: <TermsOfServicePage /> },
      { path: "/legal/seller-terms", element: <SellerTermsPage /> },
      { path: "/legal/seller-fees", element: <SellerFeesPage /> },
      { path: "/legal/payment", element: <PaymentPolicyPage /> },
      { path: "/legal/data-protection", element: <DataProtectionPolicyPage /> },
      { path: "/legal/privacy-buyer", element: <PrivacyPolicyBuyer /> },
      { path: "/legal/privacy-seller", element: <PrivacyPolicySeller /> },
      { path: "/legal/privacy", element: <PrivacyPolicyPage /> },

      // Guide pages
      { path: "/admin/guide/moderator", element: <GuideModeratorPage /> },
      { path: "/guide/seller", element: <GuideSellerPage /> },

      // Social feed route
      { path: "/social", element: <SocialFeed /> },

      // Static
      { path: "/about", element: <AboutUsPage /> },
      { path: "/help", element: <HelpCenterScreen /> },
      { path: "/contact", element: <ContactScreen /> },
      { path: "/anti-counterfeit", element: <AntiCounterfeitPage /> },
      { path: "/news", element: <NewsPage /> },
      { path: "/legal/counterfeit", element: <AntiCounterfeitReportPage /> },

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
      // /seller/orders/track must come before /seller/orders/:id so
      // React Router doesn't match "track" as an order id.
      { path: "orders/track", element: <SellerOrderTrackScreen /> },
      { path: "orders/:id", element: <SellerOrderDetailScreen /> },
      { path: "products", element: <SellerProductsScreen /> },
      { path: "products/new", element: <SellerProductFormScreen /> },
      { path: "products/:id", element: <SellerProductFormScreen /> },
      { path: "chat", element: <SellerChatScreen /> },
      { path: "marketing", element: <Navigate to="/seller/vouchers" replace /> },
      { path: "vouchers", element: <SellerVouchersScreen /> },
      { path: "analytics", element: <SellerAnalyticsScreen /> },
      { path: "finance", element: <SellerFinanceScreen /> },
      // Livestream: list / create / studio. The /new path must come before
      // /:id so the router does not match "new" as a stream id.
      { path: "live", element: <SellerLiveScreen /> },
      { path: "live/new", element: <SellerLiveFormScreen /> },
      { path: "live/:id", element: <SellerLiveStudioScreen /> },
      { path: "shop", element: <SellerShopScreen /> },
      { path: "shop/customize", element: <SellerShopCustomizeScreen /> },
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
      { path: "products", element: <ProductModerationScreen /> },
      { path: "users", element: <UserManagementScreen /> },
      { path: "banners", element: <BannerManagementScreen /> },
      { path: "reports", element: <CounterfeitReportsScreen /> },
      { path: "audit-logs", element: <AuditLogScreen /> },
      { path: "support", element: <AdminSupportChatScreen /> },
      { path: "settings", element: <AdminSettingsScreen /> },
    ],
  },
]);
