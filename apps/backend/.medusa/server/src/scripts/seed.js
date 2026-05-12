"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = seedAcfmartData;
const core_flows_1 = require("@medusajs/medusa/core-flows");
const utils_1 = require("@medusajs/framework/utils");
async function seedAcfmartData({ container }) {
    const logger = container.resolve(utils_1.ContainerRegistrationKeys.LOGGER);
    const link = container.resolve(utils_1.ContainerRegistrationKeys.LINK);
    const query = container.resolve(utils_1.ContainerRegistrationKeys.QUERY);
    const fulfillmentModuleService = container.resolve(utils_1.ModuleRegistrationName.FULFILLMENT);
    const salesChannelModuleService = container.resolve(utils_1.ModuleRegistrationName.SALES_CHANNEL);
    const storeModuleService = container.resolve(utils_1.ModuleRegistrationName.STORE);
    logger.info("🌱 acfmart seed — bắt đầu...");
    const countries = ["vn"];
    // 1. Default sales channel
    const [store] = await storeModuleService.listStores();
    let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
        name: "acfmart Storefront",
    });
    if (!defaultSalesChannel.length) {
        const { result: salesChannelResult } = await (0, core_flows_1.createSalesChannelsWorkflow)(container).run({
            input: {
                salesChannelsData: [
                    {
                        name: "acfmart Storefront",
                    },
                ],
            },
        });
        defaultSalesChannel = salesChannelResult;
    }
    // 2. Store config: VND default
    await (0, core_flows_1.updateStoresWorkflow)(container).run({
        input: {
            selector: { id: store.id },
            update: {
                supported_currencies: [
                    { currency_code: "vnd", is_default: true },
                    { currency_code: "usd" },
                ],
                default_sales_channel_id: defaultSalesChannel[0].id,
            },
        },
    });
    // 3. Region: Vietnam
    const { result: regionResult } = await (0, core_flows_1.createRegionsWorkflow)(container).run({
        input: {
            regions: [
                {
                    name: "Việt Nam",
                    currency_code: "vnd",
                    countries,
                    payment_providers: ["pp_system_default"],
                },
            ],
        },
    });
    const region = regionResult[0];
    logger.info(`✓ Region "Việt Nam" id=${region.id}`);
    // 4. Tax region (5% VAT mặc định, có thể chỉnh sau)
    await (0, core_flows_1.createTaxRegionsWorkflow)(container).run({
        input: countries.map((country_code) => ({
            country_code,
            provider_id: "tp_system",
        })),
    });
    // 5. Stock location (Kho Hà Nội + HCM)
    const { result: stockLocationResult } = await (0, core_flows_1.createStockLocationsWorkflow)(container).run({
        input: {
            locations: [
                {
                    name: "Kho Hà Nội",
                    address: {
                        city: "Hà Nội",
                        country_code: "VN",
                        address_1: "Số 1, Đường Láng",
                    },
                },
                {
                    name: "Kho TP. Hồ Chí Minh",
                    address: {
                        city: "TP. Hồ Chí Minh",
                        country_code: "VN",
                        address_1: "Số 1, Nguyễn Huệ",
                    },
                },
            ],
        },
    });
    await link.create({
        [utils_1.Modules.STOCK_LOCATION]: { stock_location_id: stockLocationResult[0].id },
        [utils_1.Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
    });
    // 6. Shipping profile + shipping options
    const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
        type: "default",
    });
    let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null;
    if (!shippingProfile) {
        const { result: shippingProfileResult } = await (0, core_flows_1.createShippingProfilesWorkflow)(container).run({
            input: {
                data: [{ name: "Default", type: "default" }],
            },
        });
        shippingProfile = shippingProfileResult[0];
    }
    const fulfillmentSet = await fulfillmentModuleService.createFulfillmentSets({
        name: "acfmart Việt Nam",
        type: "shipping",
        service_zones: [
            {
                name: "Toàn quốc",
                geo_zones: [{ country_code: "vn", type: "country" }],
            },
        ],
    });
    await link.create({
        [utils_1.Modules.STOCK_LOCATION]: { stock_location_id: stockLocationResult[0].id },
        [utils_1.Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
    });
    await (0, core_flows_1.createShippingOptionsWorkflow)(container).run({
        input: [
            {
                name: "Giao hàng tiêu chuẩn (2-4 ngày)",
                price_type: "flat",
                provider_id: "manual_manual",
                service_zone_id: fulfillmentSet.service_zones[0].id,
                shipping_profile_id: shippingProfile.id,
                type: {
                    label: "Tiêu chuẩn",
                    description: "Giao toàn quốc 2-4 ngày",
                    code: "standard",
                },
                prices: [
                    { currency_code: "vnd", amount: 30000 },
                    { region_id: region.id, amount: 30000 },
                ],
                rules: [
                    { attribute: "enabled_in_store", value: "true", operator: "eq" },
                    { attribute: "is_return", value: "false", operator: "eq" },
                ],
            },
            {
                name: "Giao hàng nhanh (1-2 ngày, nội thành)",
                price_type: "flat",
                provider_id: "manual_manual",
                service_zone_id: fulfillmentSet.service_zones[0].id,
                shipping_profile_id: shippingProfile.id,
                type: {
                    label: "Nhanh",
                    description: "Nội thành Hà Nội/HCM, 1-2 ngày",
                    code: "express",
                },
                prices: [
                    { currency_code: "vnd", amount: 50000 },
                    { region_id: region.id, amount: 50000 },
                ],
                rules: [
                    { attribute: "enabled_in_store", value: "true", operator: "eq" },
                    { attribute: "is_return", value: "false", operator: "eq" },
                ],
            },
            {
                name: "Thu hộ COD",
                price_type: "flat",
                provider_id: "manual_manual",
                service_zone_id: fulfillmentSet.service_zones[0].id,
                shipping_profile_id: shippingProfile.id,
                type: { label: "COD", description: "Thanh toán khi nhận hàng", code: "cod" },
                prices: [
                    { currency_code: "vnd", amount: 35000 },
                    { region_id: region.id, amount: 35000 },
                ],
                rules: [
                    { attribute: "enabled_in_store", value: "true", operator: "eq" },
                    { attribute: "is_return", value: "false", operator: "eq" },
                ],
            },
        ],
    });
    // 7. Publishable API key
    const { result: apiKeyResult } = await (0, core_flows_1.createApiKeysWorkflow)(container).run({
        input: {
            api_keys: [
                {
                    title: "acfmart Storefront Publishable Key",
                    type: "publishable",
                    created_by: "",
                },
            ],
        },
    });
    const publishableApiKey = apiKeyResult[0];
    await (0, core_flows_1.linkSalesChannelsToApiKeyWorkflow)(container).run({
        input: {
            id: publishableApiKey.id,
            add: [defaultSalesChannel[0].id],
        },
    });
    await (0, core_flows_1.linkSalesChannelsToStockLocationWorkflow)(container).run({
        input: {
            id: stockLocationResult[0].id,
            add: [defaultSalesChannel[0].id],
        },
    });
    // 8. Categories
    const { result: categoryResult } = await (0, core_flows_1.createProductCategoriesWorkflow)(container).run({
        input: {
            product_categories: [
                { name: "Mỹ phẩm", handle: "my-pham", is_active: true },
                { name: "Thời trang", handle: "thoi-trang", is_active: true },
                { name: "Điện tử", handle: "dien-tu", is_active: true },
                { name: "Sức khoẻ", handle: "suc-khoe", is_active: true },
                { name: "Mẹ & Bé", handle: "me-be", is_active: true },
                { name: "Gia dụng", handle: "gia-dung", is_active: true },
                { name: "Thực phẩm", handle: "thuc-pham", is_active: true },
                { name: "Sách", handle: "sach", is_active: true },
            ],
        },
    });
    const catBySlug = Object.fromEntries(categoryResult.map((c) => [c.handle, c]));
    // 9. Collection: "Đã xác thực ACF"
    const { result: collectionResult } = await (0, core_flows_1.createCollectionsWorkflow)(container).run({
        input: {
            collections: [
                {
                    title: "Đã xác thực ACF",
                    handle: "verified-acf",
                    metadata: { acf_verified: true },
                },
            ],
        },
    });
    // 10. Sample products
    await (0, core_flows_1.createProductsWorkflow)(container).run({
        input: {
            products: [
                {
                    title: "Son Dưỡng Môi SPF 15 Natural Beauty 4g",
                    category_ids: [catBySlug["my-pham"].id],
                    collection_id: collectionResult[0].id,
                    description: "Son dưỡng môi chiết xuất thiên nhiên, chống nắng SPF 15, dưỡng ẩm 24h. Đã được Quỹ Chống Hàng Giả Việt Nam xác thực chính hãng.",
                    handle: "son-duong-spf15-natural-beauty",
                    weight: 50,
                    status: "published",
                    shipping_profile_id: shippingProfile.id,
                    images: [
                        { url: "https://placehold.co/600x600/dc2626/ffffff?text=Son+Dưỡng" },
                    ],
                    options: [{ title: "Màu", values: ["Hồng nude", "Đỏ cam"] }],
                    variants: [
                        {
                            title: "Hồng nude",
                            sku: "ACF-SON-001-NUDE",
                            options: { Màu: "Hồng nude" },
                            manage_inventory: true,
                            prices: [{ amount: 180000, currency_code: "vnd" }],
                        },
                        {
                            title: "Đỏ cam",
                            sku: "ACF-SON-001-RED",
                            options: { Màu: "Đỏ cam" },
                            manage_inventory: true,
                            prices: [{ amount: 180000, currency_code: "vnd" }],
                        },
                    ],
                    sales_channels: [{ id: defaultSalesChannel[0].id }],
                    metadata: { acf_verified: true, brand: "Natural Beauty" },
                },
                {
                    title: "Tai Nghe Không Dây Pro ANC",
                    category_ids: [catBySlug["dien-tu"].id],
                    collection_id: collectionResult[0].id,
                    description: "Tai nghe không dây cao cấp, chống ồn chủ động ANC, pin 40h, kết nối Bluetooth 5.3.",
                    handle: "tai-nghe-khong-day-pro-anc",
                    weight: 300,
                    status: "published",
                    shipping_profile_id: shippingProfile.id,
                    images: [
                        { url: "https://placehold.co/600x600/f59e0b/ffffff?text=Tai+Nghe" },
                    ],
                    options: [{ title: "Màu", values: ["Đen", "Trắng"] }],
                    variants: [
                        {
                            title: "Đen",
                            sku: "ACF-TN-001-BLK",
                            options: { Màu: "Đen" },
                            manage_inventory: true,
                            prices: [{ amount: 990000, currency_code: "vnd" }],
                        },
                        {
                            title: "Trắng",
                            sku: "ACF-TN-001-WHT",
                            options: { Màu: "Trắng" },
                            manage_inventory: true,
                            prices: [{ amount: 990000, currency_code: "vnd" }],
                        },
                    ],
                    sales_channels: [{ id: defaultSalesChannel[0].id }],
                    metadata: { acf_verified: true, brand: "TechZone" },
                },
                {
                    title: "Mặt Nạ Vitamin C Hộp 30 Miếng",
                    category_ids: [catBySlug["my-pham"].id],
                    collection_id: collectionResult[0].id,
                    description: "Mặt nạ giấy chứa Vitamin C 5%, làm sáng da, mờ thâm.",
                    handle: "mat-na-vitamin-c-30-mieng",
                    weight: 400,
                    status: "published",
                    shipping_profile_id: shippingProfile.id,
                    images: [
                        { url: "https://placehold.co/600x600/22c55e/ffffff?text=Mặt+Nạ" },
                    ],
                    options: [{ title: "Loại", values: ["Hộp 30 miếng"] }],
                    variants: [
                        {
                            title: "Hộp 30 miếng",
                            sku: "ACF-MN-001",
                            options: { Loại: "Hộp 30 miếng" },
                            manage_inventory: true,
                            prices: [{ amount: 280000, currency_code: "vnd" }],
                        },
                    ],
                    sales_channels: [{ id: defaultSalesChannel[0].id }],
                    metadata: { acf_verified: true, brand: "Skin Lab" },
                },
                {
                    title: "Nồi Chiên Không Dầu 5L Sunhouse",
                    category_ids: [catBySlug["gia-dung"].id],
                    collection_id: collectionResult[0].id,
                    description: "Nồi chiên không dầu dung tích 5L, công suất 1500W, 8 chế độ nấu tự động.",
                    handle: "noi-chien-khong-dau-5l-sunhouse",
                    weight: 5000,
                    status: "published",
                    shipping_profile_id: shippingProfile.id,
                    images: [
                        { url: "https://placehold.co/600x600/0ea5e9/ffffff?text=Nồi+Chiên" },
                    ],
                    options: [{ title: "Dung tích", values: ["5L"] }],
                    variants: [
                        {
                            title: "5L",
                            sku: "ACF-NC-001-5L",
                            options: { "Dung tích": "5L" },
                            manage_inventory: true,
                            prices: [{ amount: 1490000, currency_code: "vnd" }],
                        },
                    ],
                    sales_channels: [{ id: defaultSalesChannel[0].id }],
                    metadata: { acf_verified: true, brand: "Sunhouse" },
                },
                {
                    title: "Sữa Rửa Mặt Cetaphil 500ml",
                    category_ids: [catBySlug["suc-khoe"].id],
                    collection_id: collectionResult[0].id,
                    description: "Sữa rửa mặt dịu nhẹ Cetaphil, dành cho mọi loại da.",
                    handle: "sua-rua-mat-cetaphil-500ml",
                    weight: 550,
                    status: "published",
                    shipping_profile_id: shippingProfile.id,
                    images: [
                        { url: "https://placehold.co/600x600/8b5cf6/ffffff?text=Sữa+Rửa" },
                    ],
                    options: [{ title: "Dung tích", values: ["500ml"] }],
                    variants: [
                        {
                            title: "500ml",
                            sku: "ACF-CET-001",
                            options: { "Dung tích": "500ml" },
                            manage_inventory: true,
                            prices: [{ amount: 450000, currency_code: "vnd" }],
                        },
                    ],
                    sales_channels: [{ id: defaultSalesChannel[0].id }],
                    metadata: { acf_verified: true, brand: "Cetaphil" },
                },
                {
                    title: "Áo Thun Cotton Premium Unisex",
                    category_ids: [catBySlug["thoi-trang"].id],
                    description: "Áo thun cotton 100% mềm mịn, dáng unisex, 5 màu.",
                    handle: "ao-thun-cotton-premium-unisex",
                    weight: 200,
                    status: "published",
                    shipping_profile_id: shippingProfile.id,
                    images: [
                        { url: "https://placehold.co/600x600/ec4899/ffffff?text=Áo+Thun" },
                    ],
                    options: [
                        { title: "Size", values: ["S", "M", "L", "XL"] },
                        { title: "Màu", values: ["Đen", "Trắng", "Xám"] },
                    ],
                    variants: [
                        "S",
                        "M",
                        "L",
                        "XL",
                    ].flatMap((size) => ["Đen", "Trắng", "Xám"].map((color) => ({
                        title: `${size} - ${color}`,
                        sku: `ACF-AT-001-${size}-${color.substring(0, 2).toUpperCase()}`,
                        options: { Size: size, Màu: color },
                        manage_inventory: true,
                        prices: [{ amount: 199000, currency_code: "vnd" }],
                    }))),
                    sales_channels: [{ id: defaultSalesChannel[0].id }],
                    metadata: { brand: "Fashion House" },
                },
            ],
        },
    });
    logger.info("✅ Seed acfmart xong!");
    logger.info("");
    logger.info("📋 Tóm tắt:");
    logger.info(`   - Region: Việt Nam (VND)`);
    logger.info(`   - Categories: 8`);
    logger.info(`   - Sample products: 6`);
    logger.info(`   - Shipping options: 3 (Tiêu chuẩn, Nhanh, COD)`);
    logger.info(`   - Stock locations: 2 (HN, HCM)`);
    logger.info("");
    logger.info("🔑 Publishable API key (copy vào frontend .env.local):");
    logger.info(`   VITE_MEDUSA_PUBLISHABLE_KEY=${publishableApiKey.token}`);
    logger.info(`   VITE_MEDUSA_REGION_ID=${region.id}`);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2VlZC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uLy4uLy4uL3NyYy9zY3JpcHRzL3NlZWQudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUEyQkEsa0NBdWNDO0FBbGVELDREQWNvQztBQU9wQyxxREFJa0M7QUFFbkIsS0FBSyxVQUFVLGVBQWUsQ0FBQyxFQUFFLFNBQVMsRUFBWTtJQUNuRSxNQUFNLE1BQU0sR0FBRyxTQUFTLENBQUMsT0FBTyxDQUFDLGlDQUF5QixDQUFDLE1BQU0sQ0FBQyxDQUFBO0lBQ2xFLE1BQU0sSUFBSSxHQUFHLFNBQVMsQ0FBQyxPQUFPLENBQUMsaUNBQXlCLENBQUMsSUFBSSxDQUFDLENBQUE7SUFDOUQsTUFBTSxLQUFLLEdBQUcsU0FBUyxDQUFDLE9BQU8sQ0FBQyxpQ0FBeUIsQ0FBQyxLQUFLLENBQUMsQ0FBQTtJQUNoRSxNQUFNLHdCQUF3QixHQUE4QixTQUFTLENBQUMsT0FBTyxDQUMzRSw4QkFBc0IsQ0FBQyxXQUFXLENBQ25DLENBQUE7SUFDRCxNQUFNLHlCQUF5QixHQUM3QixTQUFTLENBQUMsT0FBTyxDQUFDLDhCQUFzQixDQUFDLGFBQWEsQ0FBQyxDQUFBO0lBQ3pELE1BQU0sa0JBQWtCLEdBQXdCLFNBQVMsQ0FBQyxPQUFPLENBQy9ELDhCQUFzQixDQUFDLEtBQUssQ0FDN0IsQ0FBQTtJQUVELE1BQU0sQ0FBQyxJQUFJLENBQUMsOEJBQThCLENBQUMsQ0FBQTtJQUUzQyxNQUFNLFNBQVMsR0FBRyxDQUFDLElBQUksQ0FBQyxDQUFBO0lBRXhCLDJCQUEyQjtJQUMzQixNQUFNLENBQUMsS0FBSyxDQUFDLEdBQUcsTUFBTSxrQkFBa0IsQ0FBQyxVQUFVLEVBQUUsQ0FBQTtJQUNyRCxJQUFJLG1CQUFtQixHQUFHLE1BQU0seUJBQXlCLENBQUMsaUJBQWlCLENBQUM7UUFDMUUsSUFBSSxFQUFFLG9CQUFvQjtLQUMzQixDQUFDLENBQUE7SUFDRixJQUFJLENBQUMsbUJBQW1CLENBQUMsTUFBTSxF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