// Escrow module for ACF platform
// This module handles escrow payments between buyers and sellers

const { 
  ModulesSdkUtils,
  initializeModule,
} = require("@medusajs/framework/utils")
const { EscrowService } = require("./service")
const { migrations } = require("./migrations")

module.exports = initializeModule({
  service: EscrowService,
  migrations,
  loaders: [ModulesSdkUtils.loaders.registered_modules_loader],
  name: "escrow",
})