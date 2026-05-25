import React, { Suspense } from 'react'
import { Navigate, createBrowserRouter } from "react-router-dom"
import { Loader2 } from "lucide-react"
import { MainLayout } from "./layouts/MainLayout"

// ---------------------------------------------------------------------------
// Lazy-loading wrapper — shows a centered spinner while a chunk loads.
// ---------------------------------------------------------------------------
function LazyFallback() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Loader2 className="animate-spin text-brand-red-500" size={28} />
    </div>
  )
}

// ---------------------------------------------------------------------------
// Storefront — eager imports (critical path, small)
// ---------------------------------------------------------------------------
import HomeScreen from "./features/home/components/HomeScreen"
import {
  LoginScreen,
  LoginCloudScreen,
  LoginStoreScreen,
  LoginOnlineScreen,
  SignupScreen,
  ForgotPasswordScreen,
  ZaloCallbackScreen,
} from "./features/auth"

// ---------------------------------------------------------------------------
// Storefront — lazy imports (non-critical, loaded on demand)
// ---------------------------------------------------------------------------
const AivyPage = React.lazy(() => import("./features/aivy").then(m => ({ default: m.AivyPage })))
const ProductDetailScreen = React.lazy(() => import("./features/product").then(m => ({ default: m.ProductDetailScreen })))
const CategoryListingScreen = React.lazy(() => import("./features/product").then(m => ({ default: m.CategoryListingScreen })))
const CartScreen = React.lazy(() => import("./features/cart").then(m => ({ default: m.CartScreen })))
const CheckoutScreen = React.lazy(() => import("./features/checkout").then(m => ({ default: m.CheckoutScreen })))
const OrderSuccessScreen = React.lazy(() => import("./features/checkout").then(m => ({ default: m.OrderSuccessScreen })))
const OrderManagementScreen = React.lazy(() => import("./features/order").then(m => ({ default: m.OrderManagementScreen })))
const OrderDetailScreen = React.lazy(() => import("./features/order").then(m => ({ default: m.OrderDetailScreen })))
const TrackOrderScreen = React.lazy(() => import("./features/order").then(m => ({ default: m.TrackOrderScreen })))
const OrderReviewScreen = React.lazy(() => import("./features/order/components/OrderReviewScreen"))
const ReturnRequestScreen = React.lazy(() => import("./features/order/components/ReturnRequestScreen"))
const AffiliateDashboardScreen = React.lazy(() => import("./features/affiliate").then(m => ({ default: m.AffiliateDashboardScreen })))
const AffiliateRedirectScreen = React.lazy(() => import("./features/affiliate").then(m => ({ default: m.AffiliateRedirectScreen })))
const AffiliateMarketplaceScreen = React.lazy(() => import("./features/affiliate").then(m => ({ default: m.AffiliateMarketplaceScreen })))
const AccountLayout = React.lazy(() => import("./features/account").then(m => ({ default: m.AccountLayout })))
const AccountScreen = React.lazy(() => import("./features/account").then(m => ({ default: m.AccountScreen })))
const WalletScreen = React.lazy(() => import("./features/account").then(m => ({ default: m.WalletScreen })))
const VoucherScreen = React.lazy(() => import("./features/account").then(m => ({ default: m.VoucherScreen })))
const SettingsScreen = React.lazy(() => import("./features/account").then(m => ({ default: m.SettingsScreen })))
const ChatScreen = React.lazy(() => import("./features/account").then(m => ({ default: m.ChatScreen })))
const AddressManagementScreen = React.lazy(() => import("./features/account").then(m => ({ default: m.AddressManagementScreen })))
const LoyaltyScreen = React.lazy(() => import("./features/account").then(m => ({ default: m.LoyaltyScreen })))
const UserSupportChatScreen = React.lazy(() => import("./features/account/components/UserSupportChatScreen"))
const WishlistScreen = React.lazy(() => import("./features/wishlist").then(m => ({ default: m.WishlistScreen })))
const CompareScreen = React.lazy(() => import("./features/compare").then(m => ({ default: m.CompareScreen })))
const ShopDetailScreen = React.lazy(() => import("./features/shop").then(m => ({ default: m.ShopDetailScreen })))
const LiveCommerceScreen = React.lazy(() => import("./features/live").then(m => ({ default: m.LiveCommerceScreen })))
const LiveStreamRoomScreen = React.lazy(() => import("./features/live/LiveStreamRoomScreen"))
const HelpCenterScreen = React.lazy(() => import("./features/help").then(m => ({ default: m.HelpCenterScreen })))
const ContactScreen = React.lazy(() => import("./features/contact").then(m => ({ default: m.ContactScreen })))
const QRVerifyScreen = React.lazy(() => import("./features/qr-verify").then(m => ({ default: m.QRVerifyScreen })))
const ReportCounterfeitScreen = React.lazy(() => import("./features/qr-verify").then(m => ({ default: m.ReportCounterfeitScreen })))
const VerificationCabinetScreen = React.lazy(() => import("./features/qr-verify").then(m => ({ default: m.VerificationCabinetScreen })))
const ProductVerificationScreen = React.lazy(() => import("./features/qr-verify/components/ProductVerificationScreen"))
const PublicProfileScreen = React.lazy(() => import("./features/profile").then(m => ({ default: m.PublicProfileScreen })))
const PersonalTimelineScreen = React.lazy(() => import("./features/profile").then(m => ({ default: m.PersonalTimelineScreen })))
const NotificationScreen = React.lazy(() => import("./features/notifications/NotificationScreen"))
const SearchResultsScreen = React.lazy(() => import("./features/search").then(m => ({ default: m.SearchResultsScreen })))

// Pages (legal, static — very rarely visited)
const NotFound = React.lazy(() => import("./pages/NotFound").then(m => ({ default: m.NotFound })))
const AntiCounterfeitPage = React.lazy(() => import("./pages/AntiCounterfeitPage").then(m => ({ default: m.AntiCounterfeitPage })))
const AntiCounterfeitReportPage = React.lazy(() => import("./pages/AntiCounterfeitReportPage"))
const NewsPage = React.lazy(() => import("./pages/NewsPage").then(m => ({ default: m.NewsPage })))
const AboutUsPage = React.lazy(() => import("./pages/AboutUsPage").then(m => ({ default: m.AboutUsPage })))
const PrivacyPolicyPage = React.lazy(() => import("./pages/PrivacyPolicyPage").then(m => ({ default: m.PrivacyPolicyPage })))
const PrivacyPolicyBuyer = React.lazy(() => import("./pages/PrivacyPolicyBuyer").then(m => ({ default: m.PrivacyPolicyBuyer })))
const PrivacyPolicySeller = React.lazy(() => import("./pages/PrivacyPolicySeller").then(m => ({ default: m.PrivacyPolicySeller })))
const ReturnPolicyPage = React.lazy(() => import("./pages/ReturnPolicyPage").then(m => ({ default: m.ReturnPolicyPage })))
const ShippingPolicy = React.lazy(() => import("./pages/ShippingPolicy"))
const PolicyCenterPage = React.lazy(() => import("./pages/PolicyCenterPage").then(m => ({ default: m.PolicyCenterPage })))
const DataProtectionPolicyPage = React.lazy(() => import("./pages/DataProtectionPolicyPage").then(m => ({ default: m.DataProtectionPolicyPage })))
const TermsOfServicePage = React.lazy(() => import("./pages/TermsOfServicePage").then(m => ({ default: m.TermsOfServicePage })))
const SellerTermsPage = React.lazy(() => import("./pages/SellerTermsPage").then(m => ({ default: m.SellerTermsPage })))
const SellerFeesPage = React.lazy(() => import("./pages/SellerFeesPage").then(m => ({ default: m.SellerFeesPage })))
const PaymentPolicyPage = React.lazy(() => import("./pages/PaymentPolicyPage").then(m => ({ default: m.PaymentPolicyPage })))
const GuideModeratorPage = React.lazy(() => import("./pages/GuideModeratorPage"))
const GuideSellerPage = React.lazy(() => import("./pages/GuideSellerPage"))

// ---------------------------------------------------------------------------
// Seller portal — entire portal is lazy (separate chunk)
// ---------------------------------------------------------------------------
const SellerLayout = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerLayout })))
const SellerGuard = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerGuard })))
const SellerRegistrationScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerRegistrationScreen })))
const SellerDashboardScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerDashboardScreen })))
const SellerProductsScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerProductsScreen })))
const SellerProductFormScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerProductFormScreen })))
const SellerOrdersScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerOrdersScreen })))
const SellerOrderDetailScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerOrderDetailScreen })))
const SellerShopScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerShopScreen })))
const SellerShopCustomizeScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerShopCustomizeScreen })))
const SellerOrderTrackScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerOrderTrackScreen })))
const SellerChannelLanding = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerChannelLanding })))
const SellerChatScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerChatScreen })))
const SellerAnalyticsScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerAnalyticsScreen })))
const SellerQrVerifiedScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerQrVerifiedScreen })))
const SellerFinanceScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerFinanceScreen })))
const SellerVouchersScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerVouchersScreen })))
const SellerSettingsScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerSettingsScreen })))
const SellerKycScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerKycScreen })))
const SellerLiveScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerLiveScreen })))
const SellerLiveFormScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerLiveFormScreen })))
const SellerLiveStudioScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerLiveStudioScreen })))
const SellerAffiliatePlansScreen = React.lazy(() => import("./features/seller").then(m => ({ default: m.SellerAffiliatePlansScreen })))

// ---------------------------------------------------------------------------
// Admin portal — entire portal is lazy (separate chunk)
// ---------------------------------------------------------------------------
const AdminLayout = React.lazy(() => import("./features/admin").then(m => ({ default: m.AdminLayout })))
const AdminGuard = React.lazy(() => import("./features/admin").then(m => ({ default: m.AdminGuard })))
const AdminDashboardScreen = React.lazy(() => import("./features/admin").then(m => ({ default: m.AdminDashboardScreen })))
const VendorModerationScreen = React.lazy(() => import("./features/admin").then(m => ({ default: m.VendorModerationScreen })))
const ProductModerationScreen = React.lazy(() => import("./features/admin").then(m => ({ default: m.ProductModerationScreen })))
const UserManagementScreen = React.lazy(() => import("./features/admin").then(m => ({ default: m.UserManagementScreen })))
const BannerManagementScreen = React.lazy(() => import("./features/admin").then(m => ({ default: m.BannerManagementScreen })))
const CounterfeitReportsScreen = React.lazy(() => import("./features/admin").then(m => ({ default: m.CounterfeitReportsScreen })))
const AuditLogScreen = React.lazy(() => import("./features/admin").then(m => ({ default: m.AuditLogScreen })))
const AdminSettingsScreen = React.lazy(() => import("./features/admin").then(m => ({ default: m.AdminSettingsScreen })))
const AdminSupportChatScreen = React.lazy(() => import("./features/admin").then(m => ({ default: m.AdminSupportChatScreen })))
const PortalImagesScreen = React.lazy(() => import("./features/admin").then(m => ({ default: m.PortalImagesScreen })))
const CodReconciliationScreen = React.lazy(() => import("./features/admin").then(m => ({ default: m.CodReconciliationScreen })))
const ReturnDisputeScreen = React.lazy(() => import("./features/admin").then(m => ({ default: m.ReturnDisputeScreen })))

// ---------------------------------------------------------------------------
// Social portal — entire portal is lazy (separate chunk)
// ---------------------------------------------------------------------------
const SocialFeed = React.lazy(() => import("./features/social").then(m => ({ default: m.SocialFeed })))
const SocialLayout = React.lazy(() => import("./features/social").then(m => ({ default: m.SocialLayout })))
const SocialGuard = React.lazy(() => import("./features/social").then(m => ({ default: m.SocialGuard })))
const SocialDashboardScreen = React.lazy(() => import("./features/social").then(m => ({ default: m.SocialDashboardScreen })))
const SocialCommunityScreen = React.lazy(() => import("./features/social").then(m => ({ default: m.SocialCommunityScreen })))
const SocialTrendingScreen = React.lazy(() => import("./features/social").then(m => ({ default: m.SocialTrendingScreen })))

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
      { path: "/affiliate/marketplace", element: <AffiliateMarketplaceScreen /> },
      { path: "/aff/:code", element: <AffiliateRedirectScreen /> },
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
      { path: "/legal", element: <PolicyCenterPage /> },
      { path: "/policy", element: <PolicyCenterPage /> },
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
      <Suspense fallback={<LazyFallback />}>
        <SellerGuard>
          <SellerLayout />
        </SellerGuard>
      </Suspense>
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
      { path: "marketing", element: <Navigate to="/seller/affiliate-plans" replace /> },
      { path: "affiliate-plans", element: <SellerAffiliatePlansScreen /> },
      { path: "kyc", element: <SellerKycScreen /> },
      { path: "vouchers", element: <SellerVouchersScreen /> },
      { path: "analytics", element: <SellerAnalyticsScreen /> },
      { path: "qr-verified", element: <SellerQrVerifiedScreen /> },
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
      <Suspense fallback={<LazyFallback />}>
        <AdminGuard>
          <AdminLayout />
        </AdminGuard>
      </Suspense>
    ),
    children: [
      { index: true, element: <AdminDashboardScreen /> },
      { path: "vendors", element: <VendorModerationScreen /> },
      { path: "products", element: <ProductModerationScreen /> },
      { path: "users", element: <UserManagementScreen /> },
      { path: "banners", element: <BannerManagementScreen /> },
      { path: "portal-images", element: <PortalImagesScreen /> },
      { path: "reports", element: <CounterfeitReportsScreen /> },
      { path: "cod-reconciliation", element: <CodReconciliationScreen /> },
      { path: "refund-disputes", element: <ReturnDisputeScreen /> },
      { path: "audit-logs", element: <AuditLogScreen /> },
      { path: "support", element: <AdminSupportChatScreen /> },
      { path: "settings", element: <AdminSettingsScreen /> },
    ],
  },
  // Social portal - DIFFERENT LAYOUT (no public header/footer, custom sidebar)
  // Wrapped in SocialGuard: enforces Firebase auth
  // Served on acfmartonline.web.app / acfmart.online
  {
    path: "/social",
    element: (
      <Suspense fallback={<LazyFallback />}>
        <SocialGuard>
          <SocialLayout />
        </SocialGuard>
      </Suspense>
    ),
    children: [
      { index: true, element: <SocialDashboardScreen /> },
      { path: "feed", element: <SocialFeed /> },
      { path: "community", element: <SocialCommunityScreen /> },
      { path: "affiliate", element: <AffiliateDashboardScreen /> },
      { path: "live", element: <LiveCommerceScreen /> },
      { path: "live/:id", element: <LiveStreamRoomScreen /> },
      { path: "trending", element: <SocialTrendingScreen /> },
      { path: "aivy", element: <AivyPage /> },
      { path: "profile", element: <PersonalTimelineScreen /> },
      { path: "notifications", element: <NotificationScreen /> },
      { path: "settings", element: <SettingsScreen /> },
    ],
  },
]);
