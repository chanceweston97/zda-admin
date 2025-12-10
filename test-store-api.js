/**
 * Test script to check Medusa Store API for products
 * Run with: node test-store-api.js
 */

const fs = require('fs')
const path = require('path')

// Try to load from frontend .env.local
let PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""
const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"

if (!PUBLISHABLE_KEY) {
  const frontendEnvPath = path.join(__dirname, '..', 'front', '.env.local')
  if (fs.existsSync(frontendEnvPath)) {
    const envContent = fs.readFileSync(frontendEnvPath, 'utf8')
    envContent.split('\n').forEach(line => {
      line = line.trim()
      if (line && !line.startsWith('#') && line.includes('=')) {
        const [key, ...valueParts] = line.split('=')
        const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '')
        if (key.trim() === 'NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY' && value) {
          PUBLISHABLE_KEY = value
        }
      }
    })
  }
}

console.log("🔍 Testing Medusa Store API...\n")
console.log(`Backend URL: ${MEDUSA_BACKEND_URL}`)
console.log(`Publishable Key: ${PUBLISHABLE_KEY ? PUBLISHABLE_KEY.substring(0, 20) + "..." : "NOT SET"}\n`)

if (!PUBLISHABLE_KEY) {
  console.error("❌ NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set!")
  process.exit(1)
}

async function testStoreAPI() {
  try {
    // Step 1: Get regions
    console.log("1️⃣ Fetching regions...")
    const regionsResponse = await fetch(`${MEDUSA_BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!regionsResponse.ok) {
      const errorText = await regionsResponse.text()
      console.error(`❌ Failed: ${regionsResponse.status} ${regionsResponse.statusText}`)
      console.error(`Error: ${errorText}`)
      return
    }

    const regionsData = await regionsResponse.json()
    const regions = regionsData.regions || []

    if (regions.length === 0) {
      console.error("❌ No regions found!")
      return
    }

    const region = regions[0]
    console.log(`✅ Found region: ${region.name} (ID: ${region.id})\n`)

    // Step 2: Test products endpoint with different queries
    console.log("2️⃣ Testing products endpoint...\n")

    // Test 1: Basic query
    console.log("Test 1: Basic query (no fields)")
    const basicUrl = `${MEDUSA_BACKEND_URL}/store/products?region_id=${region.id}&limit=10`
    console.log(`URL: ${basicUrl}`)
    
    const basicResponse = await fetch(basicUrl, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!basicResponse.ok) {
      const errorText = await basicResponse.text()
      console.error(`❌ Failed: ${basicResponse.status} ${basicResponse.statusText}`)
      console.error(`Error: ${errorText}`)
    } else {
      const basicData = await basicResponse.json()
      console.log(`✅ Response: ${basicData.count || 0} total, ${basicData.products?.length || 0} returned`)
      if (basicData.products && basicData.products.length > 0) {
        console.log(`   First product: ${basicData.products[0].title}`)
        console.log(`   Status: ${basicData.products[0].status || "undefined"}`)
      }
    }

    console.log("")

    // Test 2: With fields
    console.log("Test 2: With fields parameter")
    const fieldsUrl = `${MEDUSA_BACKEND_URL}/store/products?region_id=${region.id}&limit=10&fields=*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*categories`
    console.log(`URL: ${fieldsUrl.substring(0, 100)}...`)
    
    const fieldsResponse = await fetch(fieldsUrl, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!fieldsResponse.ok) {
      const errorText = await fieldsResponse.text()
      console.error(`❌ Failed: ${fieldsResponse.status} ${fieldsResponse.statusText}`)
      console.error(`Error: ${errorText}`)
    } else {
      const fieldsData = await fieldsResponse.json()
      console.log(`✅ Response: ${fieldsData.count || 0} total, ${fieldsData.products?.length || 0} returned`)
      if (fieldsData.products && fieldsData.products.length > 0) {
        const product = fieldsData.products[0]
        console.log(`   First product: ${product.title}`)
        console.log(`   Status: ${product.status || "undefined"}`)
        console.log(`   Variants: ${product.variants?.length || 0}`)
        console.log(`   Metadata: ${JSON.stringify(product.metadata || {})}`)
      }
    }

    console.log("")

    // Test 3: Check admin API (to see all products including drafts)
    console.log("Test 3: Checking admin API (requires auth, may fail)")
    const adminUrl = `${MEDUSA_BACKEND_URL}/admin/products?limit=10`
    const adminResponse = await fetch(adminUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    })

    if (adminResponse.ok) {
      const adminData = await adminResponse.json()
      console.log(`✅ Admin API: ${adminData.count || 0} total products`)
      if (adminData.products && adminData.products.length > 0) {
        console.log("   Products (including drafts):")
        adminData.products.forEach((p, i) => {
          console.log(`     ${i + 1}. ${p.title} - Status: ${p.status || "undefined"}`)
        })
      }
    } else {
      console.log(`⚠️  Admin API requires authentication (status: ${adminResponse.status})`)
    }

    console.log("\n" + "=".repeat(60))
    console.log("📊 SUMMARY")
    console.log("=".repeat(60))
    console.log("If store API returns 0 products but admin API shows products:")
    console.log("  - Products are likely in 'draft' status")
    console.log("  - Products need to be published in Medusa Admin")
    console.log("  - Or products are not linked to the sales channel")
    console.log("=".repeat(60))

  } catch (error) {
    console.error("\n❌ Error:", error.message)
    console.error(error.stack)
  }
}

testStoreAPI()

