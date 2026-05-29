package vn.acfmart.mobile.core.order

import com.google.common.truth.Truth.assertThat
import org.junit.Test

/**
 * Unit tests for ShippingAddress validation logic.
 * Tests must match Firestore rules: isValidShippingAddress()
 */
class ShippingAddressTest {

    @Test
    fun `valid shipping address passes validation`() {
        val address = ShippingAddress(
            name = "Nguyen Van A",
            phone = "0901234567",
            address = "123 Le Loi",
            ward = "Ben Nghe",
            district = "Quan 1",
            city = "TP. Ho Chi Minh"
        )

        assertThat(address.isValid()).isTrue()
    }

    @Test
    fun `phone with valid format passes - 10 digits`() {
        val address = ShippingAddress(
            name = "Test User",
            phone = "0901234567",
            address = "123 Test St",
            ward = "Ward",
            district = "District",
            city = "City"
        )

        assertThat(address.isValid()).isTrue()
    }

    @Test
    fun `phone with valid format passes - 11 digits`() {
        val address = ShippingAddress(
            name = "Test User",
            phone = "01234567890",
            address = "123 Test St",
            ward = "Ward",
            district = "District",
            city = "City"
        )

        assertThat(address.isValid()).isTrue()
    }

    @Test
    fun `phone with plus sign passes`() {
        val address = ShippingAddress(
            name = "Test User",
            phone = "+84901234567",
            address = "123 Test St",
            ward = "Ward",
            district = "District",
            city = "City"
        )

        assertThat(address.isValid()).isTrue()
    }

    @Test
    fun `phone with dashes passes`() {
        val address = ShippingAddress(
            name = "Test User",
            phone = "090-123-4567",
            address = "123 Test St",
            ward = "Ward",
            district = "District",
            city = "City"
        )

        assertThat(address.isValid()).isTrue()
    }

    @Test
    fun `phone too short fails validation`() {
        val address = ShippingAddress(
            name = "Test User",
            phone = "1234567", // 7 digits - too short
            address = "123 Test St",
            ward = "Ward",
            district = "District",
            city = "City"
        )

        assertThat(address.isValid()).isFalse()
    }

    @Test
    fun `phone too long fails validation`() {
        val address = ShippingAddress(
            name = "Test User",
            phone = "012345678901234567890", // 21 digits - too long
            address = "123 Test St",
            ward = "Ward",
            district = "District",
            city = "City"
        )

        assertThat(address.isValid()).isFalse()
    }

    @Test
    fun `phone with letters fails validation`() {
        val address = ShippingAddress(
            name = "Test User",
            phone = "0901234abc",
            address = "123 Test St",
            ward = "Ward",
            district = "District",
            city = "City"
        )

        assertThat(address.isValid()).isFalse()
    }

    @Test
    fun `empty name fails validation`() {
        val address = ShippingAddress(
            name = "",
            phone = "0901234567",
            address = "123 Test St",
            ward = "Ward",
            district = "District",
            city = "City"
        )

        assertThat(address.isValid()).isFalse()
    }

    @Test
    fun `empty address fails validation`() {
        val address = ShippingAddress(
            name = "Test User",
            phone = "0901234567",
            address = "",
            ward = "Ward",
            district = "District",
            city = "City"
        )

        assertThat(address.isValid()).isFalse()
    }

    @Test
    fun `empty ward fails validation`() {
        val address = ShippingAddress(
            name = "Test User",
            phone = "0901234567",
            address = "123 Test St",
            ward = "",
            district = "District",
            city = "City"
        )

        assertThat(address.isValid()).isFalse()
    }

    @Test
    fun `empty district fails validation`() {
        val address = ShippingAddress(
            name = "Test User",
            phone = "0901234567",
            address = "123 Test St",
            ward = "Ward",
            district = "",
            city = "City"
        )

        assertThat(address.isValid()).isFalse()
    }

    @Test
    fun `empty city fails validation`() {
        val address = ShippingAddress(
            name = "Test User",
            phone = "0901234567",
            address = "123 Test St",
            ward = "Ward",
            district = "District",
            city = ""
        )

        assertThat(address.isValid()).isFalse()
    }

    @Test
    fun `empty phone fails validation`() {
        val address = ShippingAddress(
            name = "Test User",
            phone = "",
            address = "123 Test St",
            ward = "Ward",
            district = "District",
            city = "City"
        )

        assertThat(address.isValid()).isFalse()
    }

    @Test
    fun `toMap produces correct structure`() {
        val address = ShippingAddress(
            name = "Nguyen Van A",
            phone = "0901234567",
            address = "123 Le Loi",
            ward = "Ben Nghe",
            district = "Quan 1",
            city = "TP. HCM"
        )

        val map = address.toMap()

        assertThat(map).containsKey("name")
        assertThat(map).containsKey("phone")
        assertThat(map).containsKey("address")
        assertThat(map).containsKey("ward")
        assertThat(map).containsKey("district")
        assertThat(map).containsKey("city")
        assertThat(map["name"]).isEqualTo("Nguyen Van A")
        assertThat(map["phone"]).isEqualTo("0901234567")
        assertThat(map).hasSize(6)
    }
}
