"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.quoteShippingProviders = quoteShippingProviders;
exports.createShippingProviderOrder = createShippingProviderOrder;
exports.trackShippingProviderOrder = trackShippingProviderOrder;
const env_1 = require("./env");
function configuredProviders() {
    const providers = [];
    if ((0, env_1.hasEnv)("GHN_TOKEN") && (0, env_1.hasEnv)("GHN_SHOP_ID")) {
        providers.push("ghn");
    }
    if ((0, env_1.hasEnv)("GHTK_TOKEN")) {
        providers.push("ghtk");
    }
    if ((0, env_1.hasEnv)("JNT_API_KEY") && (0, env_1.hasEnv)("JNT_SECRET")) {
        providers.push("jnt");
    }
    return providers;
}
async function requestJson(url, options) {
    const res = await fetch(url, options);
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
        const message = typeof data?.message === "string"
            ? data.message
            : typeof data?.error === "string"
                ? data.error
                : `HTTP ${res.status}`;
        throw new Error(message);
    }
    return data;
}
async function ghnRequest(path, body) {
    const token = (0, env_1.requireEnv)("GHN_TOKEN");
    const shopId = (0, env_1.requireEnv)("GHN_SHOP_ID");
    const baseUrl = (0, env_1.env)("GHN_BASE_URL") || "https://online-gateway.ghn.vn/shiip/public-api";
    const data = await requestJson(`${baseUrl}${path}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Token: token,
            ShopId: shopId,
        },
        body: JSON.stringify(body),
    });
    if (data.code !== 200) {
        throw new Error(data.message || "GHN request failed");
    }
    return data.data;
}
async function quoteGhn(from, to, parcel) {
    const services = [
        { id: Number((0, env_1.env)("GHN_STANDARD_SERVICE_ID") || 53320), code: "STANDARD", name: "GHN tiêu chuẩn" },
        { id: Number((0, env_1.env)("GHN_EXPRESS_SERVICE_ID") || 53321), code: "EXPRESS", name: "GHN giao nhanh" },
    ];
    const quotes = await Promise.allSettled(services.map(async (service) => {
        const data = await ghnRequest("/v2/shipping-order/fee", {
            service_id: service.id,
            from_district_id: Number(from.districtCode || 0),
            to_district_id: Number(to.districtCode || 0),
            to_ward_code: to.wardCode || "",
            weight: parcel.weight,
            length: parcel.length || 20,
            width: parcel.width || 15,
            height: parcel.height || 10,
            insurance_value: parcel.declaredValue,
        });
        return {
            serviceCode: service.code,
            serviceName: service.name,
            providerId: "ghn",
            providerName: "Giao Hàng Nhanh",
            providerLogo: "https://placehold.co/40x40/dc2626/ffffff?text=GHN",
            fee: data.service_fee,
            insuranceFee: data.insurance_fee,
            codFee: 0,
            totalFee: data.total,
            estimatedDeliveryDays: service.code === "EXPRESS" ? { min: 1, max: 2 } : { min: 2, max: 4 },
            cutoffTime: "16:00",
        };
    }));
    return quotes.flatMap((quote) => (quote.status === "fulfilled" ? [quote.value] : []));
}
async function createGhnOrder(input) {
    const serviceId = input.serviceCode === "EXPRESS"
        ? Number((0, env_1.env)("GHN_EXPRESS_SERVICE_ID") || 53321)
        : Number((0, env_1.env)("GHN_STANDARD_SERVICE_ID") || 53320);
    const data = await ghnRequest("/v2/shipping-order/create", {
        payment_type_id: input.metadata?.codAmount > 0 ? 2 : 1,
        note: input.metadata?.note || "",
        required_note: "CHOXEMHANGKHONGTHU",
        from_name: input.from.name,
        from_phone: input.from.phone,
        from_address: input.from.fullAddress,
        from_ward_name: input.from.wardName,
        from_district_name: input.from.districtName,
        from_province_name: input.from.provinceName,
        to_name: input.to.name,
        to_phone: input.to.phone,
        to_address: input.to.fullAddress,
        to_ward_name: input.to.wardName,
        to_district_name: input.to.districtName,
        to_province_name: input.to.provinceName,
        cod_amount: input.metadata?.codAmount || 0,
        weight: input.parcel.weight,
        length: input.parcel.length || 20,
        width: input.parcel.width || 15,
        height: input.parcel.height || 10,
        service_id: serviceId,
        insurance_value: input.parcel.declaredValue,
        items: input.parcel.items.map((item) => ({
            name: item.name,
            quantity: item.quantity,
            weight: item.weight,
            price: item.value,
        })),
    });
    return {
        trackingNumber: data.order_code,
        providerId: "ghn",
        serviceCode: input.serviceCode,
        fee: data.total_fee,
        estimatedDeliveryDate: data.expected_delivery_time,
    };
}
async function trackGhn(trackingNumber) {
    const data = await ghnRequest("/v2/shipping-order/detail", { order_code: trackingNumber });
    return {
        trackingNumber,
        currentStatus: data.status,
        events: (data.log || []).map((event) => ({
            timestamp: event.updated_date,
            status: event.status,
            note: event.description,
        })),
    };
}
async function ghtkRequest(path, method = "GET", body) {
    const token = (0, env_1.requireEnv)("GHTK_TOKEN");
    const baseUrl = (0, env_1.env)("GHTK_BASE_URL") || "https://services.giaohangtietkiem.vn";
    const data = await requestJson(`${baseUrl}${path}`, {
        method,
        headers: {
            "Content-Type": "application/json",
            Token: token,
        },
        body: body ? JSON.stringify(body) : undefined,
    });
    if (data.success === false) {
        throw new Error(data.message || "GHTK request failed");
    }
    return data;
}
async function quoteGhtk(from, to, parcel) {
    const query = new URLSearchParams({
        pick_province: from.provinceName,
        pick_district: from.districtName,
        province: to.provinceName,
        district: to.districtName,
        address: to.fullAddress,
        weight: String(parcel.weight),
        value: String(parcel.declaredValue),
        deliver_option: "none",
        transport: "road",
    });
    const data = await ghtkRequest(`/services/shipment/fee?${query.toString()}`);
    return [
        {
            serviceCode: "STANDARD",
            serviceName: data.fee.name || "GHTK tiêu chuẩn",
            providerId: "ghtk",
            providerName: "Giao Hàng Tiết Kiệm",
            providerLogo: "https://placehold.co/40x40/22c55e/ffffff?text=GHTK",
            fee: data.fee.fee,
            insuranceFee: data.fee.insurance_fee || 0,
            codFee: 0,
            totalFee: data.fee.fee + (data.fee.insurance_fee || 0),
            estimatedDeliveryDays: { min: 2, max: 4 },
        },
    ];
}
async function createGhtkOrder(input) {
    const orderCode = input.metadata?.orderCode || `ACF${Date.now()}`;
    const data = await ghtkRequest("/services/shipment/order/?ver=1.5", "POST", {
        products: input.parcel.items.map((item) => ({
            name: item.name,
            weight: item.weight / 1000,
            quantity: item.quantity,
            product_code: "",
        })),
        order: {
            id: orderCode,
            pick_name: input.from.name,
            pick_address: input.from.fullAddress,
            pick_province: input.from.provinceName,
            pick_district: input.from.districtName,
            pick_ward: input.from.wardName,
            pick_tel: input.from.phone,
            tel: input.to.phone,
            name: input.to.name,
            address: input.to.fullAddress,
            province: input.to.provinceName,
            district: input.to.districtName,
            ward: input.to.wardName,
            is_freeship: "0",
            pick_money: input.metadata?.codAmount || 0,
            note: input.metadata?.note || "",
            value: input.parcel.declaredValue,
            transport: "road",
        },
    });
    return {
        trackingNumber: data.order.label,
        providerId: "ghtk",
        serviceCode: "STANDARD",
        fee: data.order.fee,
        pickupDate: data.order.estimated_pick_time,
        estimatedDeliveryDate: data.order.estimated_deliver_time,
    };
}
async function trackGhtk(trackingNumber) {
    const data = await ghtkRequest(`/services/shipment/v2/${encodeURIComponent(trackingNumber)}`);
    return {
        trackingNumber,
        currentStatus: data.order.status_text,
        events: [],
    };
}
async function quoteShippingProviders(input) {
    const providers = configuredProviders();
    if (!providers.length) {
        throw new Error("No shipping providers are configured");
    }
    const requests = providers
        .filter((provider) => provider !== "jnt")
        .map((provider) => provider === "ghn"
        ? quoteGhn(input.from, input.to, input.parcel)
        : quoteGhtk(input.from, input.to, input.parcel));
    const settled = await Promise.allSettled(requests);
    const rates = settled
        .flatMap((result) => (result.status === "fulfilled" ? result.value : []))
        .sort((a, b) => a.totalFee - b.totalFee);
    if (!rates.length) {
        throw new Error("No shipping rates are available for this route");
    }
    return rates;
}
async function createShippingProviderOrder(input) {
    if (input.providerId === "ghn") {
        return createGhnOrder(input);
    }
    if (input.providerId === "ghtk") {
        return createGhtkOrder(input);
    }
    throw new Error("J&T order creation requires a signed server integration and is not enabled");
}
async function trackShippingProviderOrder(providerId, trackingNumber) {
    if (providerId === "ghn") {
        return trackGhn(trackingNumber);
    }
    if (providerId === "ghtk") {
        return trackGhtk(trackingNumber);
    }
    throw new Error("Tracking for this provider is not enabled");
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2hpcHBpbmctcHJvdmlkZXJzLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vLi4vLi4vc3JjL2xpYi9zaGlwcGluZy1wcm92aWRlcnMudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFzVUEsd0RBNEJDO0FBRUQsa0VBZUM7QUFFRCxnRUFXQztBQWhZRCwrQkFBK0M7QUFnQi9DLFNBQVMsbUJBQW1CO0lBQzFCLE1BQU0sU0FBUyxHQUF5QixFQUFFLENBQUE7SUFDMUMsSUFBSSxJQUFBLFlBQU0sRUFBQyxXQUFXLENBQUMsSUFBSSxJQUFBLFlBQU0sRUFBQyxhQUFhLENBQUMsRUFBRSxDQUFDO1FBQ2pELFNBQVMsQ0FBQyxJQUFJLENBQUMsS0FBMkIsQ0FBQyxDQUFBO0lBQzdDLENBQUM7SUFDRCxJQUFJLElBQUEsWUFBTSxFQUFDLFlBQVksQ0FBQyxFQUFFLENBQUM7UUFDekIsU0FBUyxDQUFDLElBQUksQ0FBQyxNQUE0QixDQUFDLENBQUE7SUFDOUMsQ0FBQztJQUNELElBQUksSUFBQSxZQUFNLEVBQUMsYUFBYSxDQUFDLElBQUksSUFBQSxZQUFNLEVBQUMsWUFBWSxDQUFDLEVBQUUsQ0FBQztRQUNsRCxTQUFTLENBQUMsSUFBSSxDQUFDLEtBQTJCLENBQUMsQ0FBQTtJQUM3QyxDQUFDO0lBQ0QsT0FBTyxTQUFTLENBQUE7QUFDbEIsQ0FBQztBQUVELEtBQUssVUFBVSxXQUFXLENBQ3hCLEdBQVcsRUFDWCxPQUEyRDtJQUUzRCxNQUFNLEdBQUcsR0FBRyxNQUFNLEtBQUssQ0FBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUE7SUFDckMsTUFBTSxJQUFJLEdBQUcsTUFBTSxHQUFHLENBQUMsSUFBSSxFQUFFLENBQUMsS0FBSyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQTtJQUMvQyxJQUFJLENBQUMsR0FBRyxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ1osTUFBTSxPQUFPLEdBQ1gsT0FBTyxJQUFJ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