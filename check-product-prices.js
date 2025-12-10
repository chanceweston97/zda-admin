/**
 * Script to check if products have prices set
 * Run with: node check-product-prices.js
 * 
 * This will show which products/variants are missing prices
 */

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
let PUBLISHABLE_KEY = process.env.NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY || ""

// Try to load from frontend .env.local
const fs = require('fs')
const path = require('path')

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

console.log("🔍 Checking product prices...\n")
console.log(`Backend URL: ${MEDUSA_BACKEND_URL}`)
console.log(`Publishable Key: ${PUBLISHABLE_KEY ? PUBLISHABLE_KEY.substring(0, 20) + "..." : "NOT SET"}\n`)

if (!PUBLISHABLE_KEY) {
  console.error("❌ NEXT_PUBLIC_MEDUSA_PUBLISHABLE_KEY is not set!")
  process.exit(1)
}

async function checkPrices() {
  try {
    // Get regions
    const regionsResponse = await fetch(`${MEDUSA_BACKEND_URL}/store/regions`, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!regionsResponse.ok) {
      console.error(`❌ Failed to fetch regions: ${regionsResponse.status}`)
      return
    }

    const regionsData = await regionsResponse.json()
    const regions = regionsData.regions || []

    if (regions.length === 0) {
      console.error("❌ No regions found!")
      return
    }

    const region = regions[0]
    console.log(`Using region: ${region.name} (Currency: ${region.currency_code})\n`)

    // Get products
    const productsUrl = `${MEDUSA_BACKEND_URL}/store/products?region_id=${region.id}&limit=100&fields=*variants.calculated_price,+variants.inventory_quantity,*variants.images,+metadata,+tags,*categories`
    
    const productsResponse = await fetch(productsUrl, {
      headers: {
        "x-publishable-api-key": PUBLISHABLE_KEY,
        "Content-Type": "application/json",
      },
    })

    if (!productsResponse.ok) {
      const errorText = await productsResponse.text()
      console.error(`❌ Failed to fetch products: ${productsResponse.status}`)
      console.error(`Error: ${errorText}`)
      return
    }

    const productsData = await productsResponse.json()
    const products = productsData.products || []

    console.log(`Found ${products.length} products\n`)

    if (products.length === 0) {
      console.log("⚠️  No products found. Check if products are published.")
      return
    }

    // Check each product for prices
    console.log("📊 Price Analysis:\n")
    let productsWithPrices = 0
    let productsWithoutPrices = 0
    let totalVariants = 0
    let variantsWithPrices = 0

    products.forEach((product, index) => {
      const variants = product.variants || []
      totalVariants += variants.length

      let hasAnyPrice = false
      variants.forEach((variant) => {
        if (variant.calculated_price?.calculated_amount) {
          hasAnyPrice = true
          variantsWithPrices++
        }
      })

      if (hasAnyPrice) {
        productsWithPrices++
      } else {
        productsWithoutPrices++
        console.log(`❌ ${index + 1}. ${product.title}`)
        console.log(`   Variants: ${variants.length}`)
        console.log(`   ⚠️  No prices set for any variant!`)
        console.log(`   → Go to Admin → Products → ${product.title} → Variants → Edit variant → Set prices`)
        console.log("")
      }
    })

    console.log("=".repeat(60))
    console.log("📊 SUMMARY")
    console.log("=".repeat(60))
    console.log(`Total products: ${products.length}`)
    console.log(`Products with prices: ${productsWithPrices} ✅`)
    console.log(`Products without prices: ${productsWithoutPrices} ❌`)
    console.log(`Total variants: ${totalVariants}`)
    console.log(`Variants with prices: ${variantsWithPrices} ✅`)
    console.log(`Variants without prices: ${totalVariants - variantsWithPrices} ❌`)
    console.log("=".repeat(60))

    if (productsWithoutPrices > 0) {
      console.log("\n⚠️  ACTION REQUIRED:")
      console.log("   Some products don't have prices set.")
      console.log("   To fix:")
      console.log("   1. Go to Medusa Admin → Products")
      console.log("   2. Open each product without prices")
      console.log("   3. Go to Variants tab")
      console.log("   4. Edit each variant")
      console.log("   5. Set prices in the 'Prices' section")
      console.log("   6. Enter amount in cents (e.g., 1500 = $15.00)")
      console.log("   7. Save")
    } else {
      console.log("\n✅ All products have prices set!")
    }

  } catch (error) {
    console.error("\n❌ Error:", error.message)
    if (error.cause) {
      console.error("Cause:", error.cause)
    }
  }
}

checkPrices()

