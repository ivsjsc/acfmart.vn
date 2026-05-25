import 'package:go_router/go_router.dart';

import '../features/auth/presentation/login_screen.dart';
import '../features/cart/presentation/cart_screen.dart';
import '../features/catalog/presentation/catalog_screen.dart';
import '../features/checkout/presentation/checkout_screen.dart';
import '../features/home/presentation/home_screen.dart';
import '../features/notifications/presentation/notifications_screen.dart';
import '../features/orders/presentation/orders_screen.dart';
import '../features/product/presentation/product_detail_screen.dart';
import '../features/profile/presentation/profile_screen.dart';
import '../features/qr_verify/presentation/qr_verify_screen.dart';

final GoRouter appRouter = GoRouter(
  initialLocation: '/home',
  routes: [
    GoRoute(
      path: '/',
      redirect: (_, __) => '/home',
    ),
    GoRoute(
      path: '/login',
      builder: (_, __) => const LoginScreen(),
    ),
    GoRoute(
      path: '/home',
      builder: (_, __) => const HomeScreen(),
    ),
    GoRoute(
      path: '/catalog',
      builder: (_, __) => const CatalogScreen(),
    ),
    GoRoute(
      path: '/product/:id',
      builder: (_, state) => ProductDetailScreen(
        productId: state.pathParameters['id'] ?? '',
      ),
    ),
    GoRoute(
      path: '/cart',
      builder: (_, __) => const CartScreen(),
    ),
    GoRoute(
      path: '/checkout',
      builder: (_, __) => const CheckoutScreen(),
    ),
    GoRoute(
      path: '/orders',
      builder: (_, __) => const OrdersScreen(),
    ),
    GoRoute(
      path: '/notifications',
      builder: (_, __) => const NotificationsScreen(),
    ),
    GoRoute(
      path: '/qr-verify',
      builder: (_, __) => const QrVerifyScreen(),
    ),
    GoRoute(
      path: '/profile',
      builder: (_, __) => const ProfileScreen(),
    ),
  ],
);
