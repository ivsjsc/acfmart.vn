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
import { AffiliateDashboardScreen } from "./features/affiliate"
import {
  AccountLayout,
  AccountScreen,
  WalletScreen,
  VoucherScreen,
  SettingsScreen,
  ChatScreen,
  AddressManagementScreen,
} from "./features/account"
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
        element: <CategoryListingScreen />,
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
        element: <Placeholder title="Trang Shop" description="Phase 3" />,
      },

      // Account (nested)
      {
        path: "/account",
        element: <AccountLayout />,
        children: [
          { index: true, element: <AccountScreen /> },
          { path: "wallet", element: <WalletScreen /> },
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
        element: (
          <Placeholder title="Livestream Commerce" description="Live Commerce – Phase 3" />
        ),
      },
      {
        path: "/live/:id",
        element: (
          <Placeholder title="Phòng Livestream" description="Phase 3" />
        ),
      },

      // Seller
      {
        path: "/seller-register",
        element: (
          <Placeholder
            title="Đăng ký bán hàng"
            description="Seller Registration – Phase 3"
          />
        ),
      },

      // Static
      { path: "/about", element: <Placeholder title="Về acfmart" /> },
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
])