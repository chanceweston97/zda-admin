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
  
  // In production, always use HTTPS domain instead of IP addresses or HTTP
  // Check if we're in production by looking at NODE_ENV or if URL contains production domain
  const isProduction = process.env.NODE_ENV === 'production' || 
                       baseUrl.includes('admin.zdacomm.com') ||
                       baseUrl.includes('zdacomm.com')
  
  if (isProduction) {
    // Always use HTTPS domain in production
    if (process.env.MEDUSA_ADMIN_URL) {
      baseUrl = process.env.MEDUSA_ADMIN_URL
    } else {
      // Force HTTPS and use domain name
      baseUrl = 'https://admin.zdacomm.com'
    }
    
    // Ensure it's HTTPS (not HTTP)
    if (baseUrl.startsWith('http://')) {
      baseUrl = baseUrl.replace('http://', 'https://')
    }
    
    // Replace any IP address (with or without port) with the domain
    baseUrl = baseUrl.replace(/https?:\/\/\d+\.\d+\.\d+\.\d+(:\d+)?/, 'https://admin.zdacomm.com')
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
              // Use external directory in production (set via MEDUSA_STATIC_DIR env var)
              // In production: /var/www/medusa-uploads (set in .medusa/server/.env)
              // In development: static (relative path, works with yarn dev)
              upload_dir: process.env.MEDUSA_STATIC_DIR || process.env.STATIC_DIR || "static",
              backend_url: getBackendUrl(),
            },
          },
        ],
      },
    },
  ],
})
