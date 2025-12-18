import { loadEnv, defineConfig } from '@medusajs/framework/utils'

loadEnv(process.env.NODE_ENV || 'development', process.cwd())

// Get backend URL for file service
// Note: backend_url should be the base URL only, NOT including /static
// Medusa automatically serves static files from the static directory
const getBackendUrl = () => {
  return process.env.MEDUSA_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:9000"
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
    },
  },
  modules: [
    {
      resolve: "./src/modules/cable-customizer",
    },
    {
      resolve: "@medusajs/medusa/payment",

    },
   
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
  ],
})
