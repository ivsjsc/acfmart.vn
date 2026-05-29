# ACFMart Android - Test Guide

## 📋 Overview

This document describes the automated test suite for the ACFMart Android checkout flow.

## 🧪 Test Categories

### 1. Unit Tests (Fast, No Device Required)

Location: `app/src/test/java/`

#### ShippingAddressTest.kt
Tests shipping address validation logic that must match Firestore rules.

**Test Cases:**
- ✅ Valid address with all fields
- ✅ Phone format validation (8-20 digits)
- ✅ Phone with special characters (+, -, spaces)
- ✅ Invalid phone (too short, too long, letters)
- ✅ Empty required fields (name, address, ward, district, city)
- ✅ toMap() serialization for Firestore

**Run:**
```bash
./gradlew.bat test --tests "vn.acfmart.mobile.core.order.ShippingAddressTest"
```

#### CartItemTest.kt
Tests cart item calculations and data operations.

**Test Cases:**
- ✅ Line total calculation (price × quantity)
- ✅ toMap() serialization
- ✅ Grouping items by shopId
- ✅ Subtotal calculation from multiple items
- ✅ Empty cart handling

**Run:**
```bash
./gradlew.bat test --tests "vn.acfmart.mobile.core.cart.CartItemTest"
```

#### OrderCreationTest.kt
Tests order creation business logic and Firestore rules compliance.

**Test Cases:**
- ✅ Order code generation (ACF + timestamp)
- ✅ Shipping fee allocation (single shop)
- ✅ Shipping fee allocation (multiple shops - proportional)
- ✅ Multi-shop order grouping
- ✅ Total validation (≤ 100 million VND)
- ✅ Payment status mapping (COD vs non-COD)
- ✅ ShippingOrigin structure (all required fields)
- ✅ ShippingAddress structure (Firestore compliant)
- ✅ Timeline event structure
- ✅ Order data structure validation
- ✅ Multi-shop order code generation

**Run:**
```bash
./gradlew.bat test --tests "vn.acfmart.mobile.core.order.OrderCreationTest"
```

#### CheckoutViewModelTest.kt
Tests CheckoutViewModel UI state management and validation.

**Test Cases:**
- ✅ Initial state defaults
- ✅ Form validation (empty address, empty cart, valid form)
- ✅ Subtotal calculation
- ✅ Total calculation (subtotal + shipping)
- ✅ Field updates (name, phone, address)
- ✅ Payment method selection
- ✅ Error state management
- ✅ Order success state
- ✅ Submitting state behavior
- ✅ Multiple items calculation

**Run:**
```bash
./gradlew.bat test --tests "vn.acfmart.mobile.features.store.presentation.CheckoutViewModelTest"
```

### 2. UI Tests (Requires Emulator/Device)

Location: `app/src/androidTest/java/`

#### CheckoutScreenUiTest.kt
Tests CheckoutScreen Compose UI components.

**Test Cases:**
- ⏳ Shipping address form rendering
- ⏳ Payment method section display
- ⏳ Order summary display

**Run:**
```bash
./gradlew.bat connectedAndroidTest --tests "vn.acfmart.mobile.features.store.presentation.CheckoutScreenUiTest"
```

## 🚀 Running Tests

### Run All Unit Tests
```bash
cd d:\IVS\Apps\DEVELOPER\acfmart\apps\android-app
.\gradlew.bat test
```

### Run Specific Test Class
```bash
.\gradlew.bat test --tests "vn.acfmart.mobile.core.order.ShippingAddressTest"
```

### Run All Tests (Unit + UI)
```bash
.\gradlew.bat connectedCheck
```

### Run Tests with Coverage
```bash
.\gradlew.bat testDebugUnitTest jacocoTestReport
```

### View Test Reports
```bash
# Open in browser
start app\build\reports\tests\testDebugUnitTest\index.html
```

## 📊 Test Coverage Goals

| Component | Target Coverage | Current Status |
|-----------|----------------|----------------|
| ShippingAddress validation | 100% | ✅ Complete |
| CartItem calculations | 100% | ✅ Complete |
| Order creation logic | 90% | ✅ Complete |
| CheckoutViewModel state | 85% | ✅ Complete |
| CheckoutScreen UI | 60% | ⏳ Partial |

## 🔍 Testing Firestore Rules Compliance

The checkout flow must comply with strict Firestore rules. Here's how we test that:

### 1. ShippingAddress Validation
Must match `isValidShippingAddress()` in firestore.rules:
```javascript
function isValidShippingAddress(data) {
  return data is map &&
    data.keys().hasOnly(['name', 'phone', 'address', 'ward', 'district', 'city', ...]) &&
    nonEmptyString(data.name, 120) &&
    data.phone.matches('^[0-9+()\\-\\s]{8,20}$') &&
    ...
}
```

**Tested in:** `ShippingAddressTest.kt`

### 2. ShippingOrigin Validation
Must match `isValidShippingOrigin()` in firestore.rules:
```javascript
function isValidShippingOrigin(data) {
  return data is map &&
    nonEmptyString(data.warehouseId, 120) &&
    nonEmptyString(data.warehouseName, 120) &&
    ...
}
```

**Tested in:** `OrderCreationTest.kt`

### 3. Order Document Validation
Must match `isValidInitialOrder()` in firestore.rules:
```javascript
function isValidInitialOrder() {
  return request.resource.data.keys().hasOnly([...]) &&
    request.resource.data.customerId == request.auth.uid &&
    request.resource.data.total <= 100000000 &&
    ...
}
```

**Tested in:** `OrderCreationTest.kt`

## 🛠️ Test Utilities

### Test Data Factories

```kotlin
// Create valid shipping address
fun createValidAddress() = ShippingAddress(
    name = "Nguyen Van A",
    phone = "0901234567",
    address = "123 Le Loi",
    ward = "Ben Nghe",
    district = "Quan 1",
    city = "TP. Ho Chi Minh"
)

// Create test cart item
fun createTestCartItem(price: Double = 100000.0, quantity: Int = 1) = CartItem(
    productId = "prod_test",
    title = "Test Product",
    price = price,
    image = "http://image.url",
    shopId = "shop1",
    shopName = "Test Shop",
    quantity = quantity
)
```

## 🐛 Common Test Issues

### Issue: Tests fail with "Unresolved reference"
**Solution:** Sync Gradle after adding test dependencies
```bash
./gradlew.bat clean build
```

### Issue: Coroutines test fails
**Solution:** Ensure test dispatcher is set up
```kotlin
@Before
fun setup() {
    Dispatchers.setMain(StandardTestDispatcher())
}
```

### Issue: UI tests timeout
**Solution:** Increase test timeout or use fake data instead of real Firebase

## 📈 Continuous Integration

### GitHub Actions Example
```yaml
name: Android Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Run Unit Tests
        run: cd apps/android-app && ./gradlew test
      - name: Upload Test Reports
        uses: actions/upload-artifact@v3
        with:
          name: test-reports
          path: apps/android-app/app/build/reports/tests/
```

## 🔮 Future Test Enhancements

### 1. Integration Tests with Firebase Emulator
```kotlin
@Test
fun checkoutFlow_completeOrder_orderCreatedInFirestore() {
    // 1. Use Firebase emulator
    // 2. Create user
    // 3. Add items to cart
    // 4. Complete checkout
    // 5. Verify order in Firestore
    // 6. Verify cart cleared
}
```

### 2. Screenshot Tests
```kotlin
@Test
fun checkoutScreen_matchesDesign() {
    // Capture screenshot
    // Compare with baseline
    // Flag visual regressions
}
```

### 3. Performance Tests
```kotlin
@Test
fun checkoutScreen_rendersWithin16ms() {
    // Measure frame rendering time
    // Ensure no jank
}
```

### 4. Accessibility Tests
```kotlin
@Test
fun checkoutScreen_accessibleForScreenReaders() {
    // Verify content descriptions
    // Check contrast ratios
    // Test with TalkBack
}
```

## 📚 Learning Resources

- [Android Testing Documentation](https://developer.android.com/training/testing)
- [Compose Testing](https://developer.android.com/jetpack/compose/testing)
- [Kotlin Coroutines Testing](https://kotlinlang.org/docs/coroutines-test.html)
- [Truth Assertions](https://truth.dev/)
- [Mockito Kotlin](https://github.com/mockito/mockito-kotlin)

## ✅ Test Checklist Before Release

- [ ] All unit tests pass
- [ ] UI tests pass on emulator
- [ ] Manual checkout flow tested
- [ ] Firestore rules compliance verified
- [ ] Edge cases tested (empty cart, invalid address, network error)
- [ ] Performance acceptable (< 2s order creation)
- [ ] Error messages user-friendly
- [ ] Cart cleared after successful order
- [ ] Order appears in Orders screen
