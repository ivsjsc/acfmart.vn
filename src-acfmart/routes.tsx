import { createBrowserRouter } from "react-router-dom"
import { MainLayout } from "./layouts/MainLayout"
import HomeScreen from "./features/home/components/HomeScreen"
import { AivyPage } from "./features/aivy"
import {
  LoginScreen,
  SignupScreen,
  ForgotPasswordScreen,
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

export const router = createBrowserRouter([
  {
    element: <MainLayout />,
    children: [
      { path: "/", element: <HomeScreen /> },

      // Aivy (AI assistant)
      { path: "/aivy", element: <AivyPage /> },

      // Auth
      { path: "/login", element: <LoginScreen /> },
      { path: "/signup", element: <SignupScreen /> },
      { path: "/forgot-password", element: <ForgotPasswordScreen /> },

      // Product
      { path: "/products/:id", element: <ProductDetailScreen /> },
      { path: "/categories", element: <CategoryListingScreen /> },
      { path: "/categories/:slug", element: <CategoryListingScreen /> },
      {
        path: "/search",
        element: <SearchResultsScreen />,
      },
      {
        path: "/brands/:id",
        element: <Placeholder title="Trang thương hiệu" description="Brand Page – Phase 3" />,
      },
      {
        path: "/wishlist",
        element: <WishlistScreen />,
      },
      {
        path: "/compare",
        element: <CompareScreen />,
      },

      // Cart & Checkout
      { path: "/cart", element: <CartScreen /> },
      { path: "/checkout", element: <CheckoutScreen /> },
      { path: "/order-success/:id", element: <OrderSuccessScreen /> },

      // Orders
      { path: "/orders", element: <OrderManagementScreen /> },
      { path: "/orders/:id", element: <OrderDetailScreen /> },
      { path: "/orders/:id/review", element: <OrderReviewScreen /> },
      { path: "/orders/:id/return", element: <ReturnRequestScreen /> },
      {
        path: "/track-order",
        element: <TrackOrderScreen />,
      },

      // QR Verify & Anti-counterfeit (Phase 3)
      {
        path: "/qr-verify",
        element: <QRVerifyScreen />,
      },
      {
        path: "/qr-verify/cabinet",
        element: (
          <VerificationCabinetScreen />
        ),
      },
      {
        path: "/report-counterfeit",
        element: (
          <ReportCounterfeitScreen />
        ),
      },
      {
        path: "/shop-certification/:shopId",
        element: <ShopCertificationScreen />,
      },
      {
        path: "/shops/:id",
        element: <ShopDetailScreen />,
      },

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
      { path: "/legal/seller-terms", element: <Placeholder title="Điều khoản người bán" /> },
      { path: "/legal/seller-fees", element: <Placeholder title="Chính sách phí người bán" /> },

      // Static
      { path: "/about", element: <Placeholder title="Về nền tảng" /> },
      { path: "/help", element: <HelpCenterScreen /> },
      { path: "/contact", element: <ContactScreen /> },
      { path: "/anti-counterfeit", element: <Placeholder title="Chương trình chống hàng giả" /> },
      { path: "/news", element: <Placeholder title="Tin tức" /> },
      { path: "/legal/terms", element: <Placeholder title="Điều khoản sử dụng" /> },
      { path: "/legal/privacy", element: <Placeholder title="Chính sách bảo mật" /> },
      { path: "/legal/return", element: <Placeholder title="Chính sách đổi trả" /> },
      { path: "/legal/shipping", element: <Placeholder title="Chính sách vận chuyển" /> },

      { path: "*", element: <NotFound /> },
    ],
  },
  // Seller portal - DIFFERENT LAYOUT (no public header/footer, custom sidebar)
  {
    path: "/seller",
    element: <SellerLayout />,
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
])
