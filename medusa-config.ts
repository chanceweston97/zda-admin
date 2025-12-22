import { loadEnv, defineConfig } from "@medusajs/framework/utils"
import { join } from "path"

loadEnv(process.env.NODE_ENV || "development", process.cwd())

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
              // ✅ PERMANENT STORAGE (never deleted)
              upload_dir: "/var/medusa-media",

              // ✅ URL that Medusa stores in DB
              backend_url: "https://admin.zdacomm.com/static",
            },
          },
        ],
      },
    },
  ],
})
