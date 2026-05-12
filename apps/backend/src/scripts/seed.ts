import {
  createApiKeysWorkflow,
  createCollectionsWorkflow,
  createProductCategoriesWorkflow,
  createProductsWorkflow,
  createRegionsWorkflow,
  createSalesChannelsWorkflow,
  createShippingOptionsWorkflow,
  createShippingProfilesWorkflow,
  createStockLocationsWorkflow,
  createTaxRegionsWorkflow,
  linkSalesChannelsToApiKeyWorkflow,
  linkSalesChannelsToStockLocationWorkflow,
  updateStoresWorkflow,
} from "@medusajs/medusa/core-flows"
import { 
  IProductModuleService,
  IPricingModuleService,
  IRegionModuleService,
  IFulfillmentModuleService,
  ISalesChannelModuleService,
  MedusaApp,
  ContainerRegistrationKeys,
} from "@medusajs/types";
import { initialize } from "@medusajs/framework";
import { Modules } from "@medusajs/framework/modules";
import { createAdminUser } from "./utils/create-admin-user";

async function seedData() {
  console.log("Seeding data...");
  
  // Initialize the Medusa application
  const { container } = await initialize({
    container: await MedusaApp({
      modulesConfig: {
        [Modules.PRODUCT]: true,
        [Modules.PRICING]: true,
        [Modules.REGION]: true,
        [Modules.FULFILLMENT]: true,
        [Modules.SALES_CHANNEL]: true,
      },
      projectConfig: {
        databaseUrl: process.env.DATABASE_URL,
        jwtSecret: process.env.JWT_SECRET || "supersecret",
        cookieSecret: process.env.COOKIE_SECRET || "supersecret",
      },
    }),
  });
  
  // Get the services
  const productService: IProductModuleService = container.resolve(Modules.PRODUCT);
  const pricingService: IPricingModuleService = container.resolve(Modules.PRICING);
  const regionService: IRegionModuleService = container.resolve(Modules.REGION);
  const fulfillmentService: IFulfillmentModuleService = container.resolve(Modules.FULFILLMENT);
  const salesChannelService: ISalesChannelModuleService = container.resolve(Modules.SALES_CHANNEL);
  
  // Create a sales channel
  const [salesChannel] = await salesChannelService.createSalesChannels([
    {
      name: "ACFMart Storefront",
      description: "Main storefront for ACFMart",
    },
  ]);
  
  // Create a region
  const [region] = await regionService.createRegions([
    {
      name: "Vietnam",
      currency_code: "vnd",
      countries: ["VN"],
      payment_providers: ["manual"],
      fulfillment_providers: ["manual"],
    },
  ]);
  
  // Create a fulfillment provider
  await fulfillmentService.createProviders([
    {
      name: "Standard Shipping",
      provider_id: "manual-fulfillment",
      config: {
        requires_shipping: true,
      },
    },
  ]);
  
  // Create some products
  const [product] = await productService.createProducts([
    {
      title: "Sample Product",
      handle: "sample-product",
      subtitle: "High quality product",
      description: "This is a sample product for demonstration purposes",
      is_giftcard: false,
      discountable: true,
      sales_channels: [
        {
          id: salesChannel.id,
        },
      ],
      variants: [
        {
          title: "Default Variant",
          sku: "SAMPLE-001",
          ean: "1234567890123",
          prices: [
            {
              amount: 100000, // 100,000 VND
              currency_code: "vnd",
            },
          ],
          options: [],
          inventory_items: [],
        },
      ],
    },
  ]);
  
  console.log("Data seeded successfully!");
  
  // Create an admin user
  await createAdminUser(container);
}

seedData().catch(console.error);

export default async function seedAcfmartData({ container }: ExecArgs) {
  const logger = container.resolve(ContainerRegistrationKeys.LOGGER)
  const link = container.resolve(ContainerRegistrationKeys.LINK)
  const query = container.resolve(ContainerRegistrationKeys.QUERY)
  const fulfillmentModuleService: IFulfillmentModuleService = container.resolve(
    ModuleRegistrationName.FULFILLMENT
  )
  const salesChannelModuleService: ISalesChannelModuleService =
    container.resolve(ModuleRegistrationName.SALES_CHANNEL)
  const storeModuleService: IStoreModuleService = container.resolve(
    ModuleRegistrationName.STORE
  )

  logger.info("🌱 acfmart seed — bắt đầu...")

  const countries = ["vn"]

  // 1. Default sales channel
  const [store] = await storeModuleService.listStores()
  let defaultSalesChannel = await salesChannelModuleService.listSalesChannels({
    name: "acfmart Storefront",
  })
  if (!defaultSalesChannel.length) {
    const { result: salesChannelResult } = await createSalesChannelsWorkflow(
      container
    ).run({
      input: {
        salesChannelsData: [
          {
            name: "acfmart Storefront",
          },
        ],
      },
    })
    defaultSalesChannel = salesChannelResult
  }

  // 2. Store config: VND default
  await updateStoresWorkflow(container).run({
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
  })

  // 3. Region: Vietnam
  const { result: regionResult } = await createRegionsWorkflow(container).run({
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
  })
  const region = regionResult[0]
  logger.info(`✓ Region "Việt Nam" id=${region.id}`)

  // 4. Tax region (5% VAT mặc định, có thể chỉnh sau)
  await createTaxRegionsWorkflow(container).run({
    input: countries.map((country_code) => ({
      country_code,
      provider_id: "tp_system",
    })),
  })

  // 5. Stock location (Kho Hà Nội + HCM)
  const { result: stockLocationResult } = await createStockLocationsWorkflow(
    container
  ).run({
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
  })

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationResult[0].id },
    [Modules.FULFILLMENT]: { fulfillment_provider_id: "manual_manual" },
  })

  // 6. Shipping profile + shipping options
  const shippingProfiles = await fulfillmentModuleService.listShippingProfiles({
    type: "default",
  })
  let shippingProfile = shippingProfiles.length ? shippingProfiles[0] : null
  if (!shippingProfile) {
    const { result: shippingProfileResult } =
      await createShippingProfilesWorkflow(container).run({
        input: {
          data: [{ name: "Default", type: "default" }],
        },
      })
    shippingProfile = shippingProfileResult[0]
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
  })

  await link.create({
    [Modules.STOCK_LOCATION]: { stock_location_id: stockLocationResult[0].id },
    [Modules.FULFILLMENT]: { fulfillment_set_id: fulfillmentSet.id },
  })

  await createShippingOptionsWorkflow(container).run({
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
  })

  // 7. Publishable API key
  const { result: apiKeyResult } = await createApiKeysWorkflow(container).run({
    input: {
      api_keys: [
        {
          title: "acfmart Storefront Publishable Key",
          type: "publishable",
          created_by: "",
        },
      ],
    },
  })
  const publishableApiKey = apiKeyResult[0]

  await linkSalesChannelsToApiKeyWorkflow(container).run({
    input: {
      id: publishableApiKey.id,
      add: [defaultSalesChannel[0].id],
    },
  })

  await linkSalesChannelsToStockLocationWorkflow(container).run({
    input: {
      id: stockLocationResult[0].id,
      add: [defaultSalesChannel[0].id],
    },
  })

  // 8. Categories
  const { result: categoryResult } = await createProductCategoriesWorkflow(
    container
  ).run({
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
  })

  const catBySlug = Object.fromEntries(categoryResult.map((c) => [c.handle, c]))

  // 9. Collection: "Đã xác thực ACF"
  const { result: collectionResult } = await createCollectionsWorkflow(
    container
  ).run({
    input: {
      collections: [
        {
          title: "Đã xác thực ACF",
          handle: "verified-acf",
          metadata: { acf_verified: true },
        },
      ],
    },
  })

  // 10. Sample products
  await createProductsWorkflow(container).run({
    input: {
      products: [
        {
          title: "Son Dưỡng Môi SPF 15 Natural Beauty 4g",
          category_ids: [catBySlug["my-pham"].id],
          collection_id: collectionResult[0].id,
          description:
            "Son dưỡng môi chiết xuất thiên nhiên, chống nắng SPF 15, dưỡng ẩm 24h. Đã được Quỹ Chống Hàng Giả Việt Nam xác thực chính hãng.",
          handle: "son-duong-spf15-natural-beauty",
          weight: 50,
          status: "published" as any,
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
          description:
            "Tai nghe không dây cao cấp, chống ồn chủ động ANC, pin 40h, kết nối Bluetooth 5.3.",
          handle: "tai-nghe-khong-day-pro-anc",
          weight: 300,
          status: "published" as any,
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
          status: "published" as any,
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
          description:
            "Nồi chiên không dầu dung tích 5L, công suất 1500W, 8 chế độ nấu tự động.",
          handle: "noi-chien-khong-dau-5l-sunhouse",
          weight: 5000,
          status: "published" as any,
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
          status: "published" as any,
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
          status: "published" as any,
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
          ].flatMap((size) =>
            ["Đen", "Trắng", "Xám"].map((color) => ({
              title: `${size} - ${color}`,
              sku: `ACF-AT-001-${size}-${color.substring(0, 2).toUpperCase()}`,
              options: { Size: size, Màu: color },
              manage_inventory: true,
              prices: [{ amount: 199000, currency_code: "vnd" }],
            }))
          ),
          sales_channels: [{ id: defaultSalesChannel[0].id }],
          metadata: { brand: "Fashion House" },
        },
      ],
    },
  })

  logger.info("✅ Seed acfmart xong!")
  logger.info("")
  logger.info("📋 Tóm tắt:")
  logger.info(`   - Region: Việt Nam (VND)`)
  logger.info(`   - Categories: 8`)
  logger.info(`   - Sample products: 6`)
  logger.info(`   - Shipping options: 3 (Tiêu chuẩn, Nhanh, COD)`)
  logger.info(`   - Stock locations: 2 (HN, HCM)`)
  logger.info("")
  logger.info("🔑 Publishable API key (copy vào frontend .env.local):")
  logger.info(`   VITE_MEDUSA_PUBLISHABLE_KEY=${publishableApiKey.token}`)
  logger.info(`   VITE_MEDUSA_REGION_ID=${region.id}`)
}
