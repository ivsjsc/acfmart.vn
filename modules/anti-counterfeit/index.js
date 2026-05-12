// Anti-counterfeit module for ACF platform
// This module handles product authentication, QR code generation, and counterfeit reporting

const { 
  ModulesSdkUtils,
  initializeModule,
} = require("@medusajs/framework/utils")
const { AntiCounterfeitService } = require("./service")
const { migrations } = require("./migrations")

module.exports = initializeModule({
  service: AntiCounterfeitService,
  migrations,
  loaders: [ModulesSdkUtils.loaders.registered_modules_loader],
  name: "anti-counterfeit",
})