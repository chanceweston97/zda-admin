import { loadEnv, defineConfig } from '@medusajs/framework/utils'
import { join } from 'path'

// Load env from current directory and .medusa/server (for production)
loadEnv(process.env.NODE_ENV || 'development', process.cwd())
// Also try loading from .medusa/server if it exists (production build)
const serverEnvPath = join(process.cwd(), '.medusa', 'server')
try {
  loadEnv(process.env.NODE_ENV || 'development', serverEnvPath)
} catch (e) {
  // Ignore if .medusa/server doesn't exist (development)
}

// Get backend URL for file service
// Include /static in the URL so file-local provider generates correct URLs
const getBackendUrl = () => {
  let baseUrl = process.env.MEDUSA_BACKEND_URL || process.env.BACKEND_URL || "http://localhost:9000"
  
  // In production, ensure we use HTTPS domain instead of IP addresses
  if (process.env.NODE_ENV === 'production') {
    // If URL contains IP address, replace with HTTPS domain
    if (baseUrl.includes('18.224.229.214') || baseUrl.startsWith('http://')) {
      // Use the configured HTTPS domain if available, otherwise convert to HTTPS
      if (process.env.MEDUSA_ADMIN_URL) {
        baseUrl = process.env.MEDUSA_ADMIN_URL
      } else if (baseUrl.includes('admin.zdacomm.com')) {
        baseUrl = baseUrl.replace('http://', 'https://')
      } else {
        // Fallback: replace IP with HTTPS domain
        baseUrl = baseUrl.replace(/http:\/\/[^/]+/, 'https://admin.zdacomm.com')
      }
    }
  }
  
  // Remove trailing slash if present, then add /static
  return baseUrl.replace(/\/$/, "") + "/static"
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
