import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import manualPayment from "@medusajs/medusa/payment-manual"


loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Get backend URL for file service
const getBackendUrl = () => {
  const baseUrl = process.env.MEDUSA_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:9000"
  return baseUrl.endsWith("/static") ? baseUrl : baseUrl + "/static"
}

module.exports = defineConfig({
  projectConfig: {
    databaseUrl: process.env.DATABASE_URL,
    http: {
      storeCors: process.env.STORE_CORS!,
      adminCors: process.env.ADMIN_CORS!,
      authCors: process.env.AUTH_CORS!,
      jwtSecret: process.env.JWT_SECRET || "supersecret",
      cookieSecret: process.env.COOKIE_SECRET || "supersecret",
    }
  },
  modules: [
    {
      resolve: "./src/modules/cable-customizer",
      options: {
        payment: {
          manual: {
            driver: manualPayment,
            options: {
              enabled: true,
            },
          },
        },
      },
    },
    // Register File Module with backend_url option
    // This is required for file uploads to use the correct server URL
    // See: https://docs.medusajs.com/resources/infrastructure-modules/file/local
    {
      resolve: "@medusajs/medusa/file",
      options: {
        providers: [
          {
            resolve: "@medusajs/medusa/file-local",
            id: "local",
            options: {
              upload_dir: "static",
              backend_url: getBackendUrl(),
            },
          },
        ],
      },
    },
    // Stripe payment provider removed - payments are handled on the frontend
    // Frontend processes Stripe payments directly, then creates orders in Medusa
  ],
})
