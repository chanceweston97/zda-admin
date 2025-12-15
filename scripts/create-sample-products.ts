/**
 * Script to create sample products in Medusa
 * 
 * Setup:
 * 1. Create an Admin API Token in Medusa Admin: Settings > API Token Management
 * 2. Set environment variable: export MEDUSA_ADMIN_API_KEY=your_token_here
 * 3. Make sure MEDUSA_BACKEND_URL is set (default: http://localhost:9000)
 * 
 * Run with: npx tsx scripts/create-sample-products.ts
 */

const MEDUSA_BACKEND_URL = process.env.MEDUSA_BACKEND_URL || "http://localhost:9000"
const MEDUSA_ADMIN_API_KEY = process.env.MEDUSA_ADMIN_API_KEY || ""

async function createSampleProducts() {
  if (!MEDUSA_ADMIN_API_KEY) {
    console.error("❌ MEDUSA_ADMIN_API_KEY environment variable is required")
    console.error("   Create an API token in Medusa Admin: Settings > API Token Management")
    process.exit(1)
  }

  try {
    console.log("🚀 Creating sample products...")

    const headers = {
      Authorization: `Bearer ${MEDUSA_ADMIN_API_KEY}`,
      "Content-Type": "application/json",
    }
    // First, get or create categories
    console.log("📁 Setting up categories...")
    
    // Create Antennas category
    let antennaCategory
    try {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/product-categories`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: "Antennas",
          handle: "antennas",
          is_internal: false,
        }),
      })
      if (response.ok) {
        antennaCategory = await response.json()
        console.log("✅ Created Antennas category")
      } else {
        // Try to find existing
        const listResponse = await fetch(`${MEDUSA_BACKEND_URL}/admin/product-categories`, { headers })
        const categories = await listResponse.json()
        antennaCategory = categories.product_categories?.find((cat: any) => cat.handle === "antennas")
        if (antennaCategory) {
          console.log("✅ Found existing Antennas category")
        }
      }
    } catch (error: any) {
      console.error("❌ Error with Antennas category:", error.message)
    }

    // Create Cables category
    let cableCategory
    try {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/product-categories`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: "Cables",
          handle: "cables",
          is_internal: false,
        }),
      })
      if (response.ok) {
        cableCategory = await response.json()
        console.log("✅ Created Cables category")
      } else {
        const listResponse = await fetch(`${MEDUSA_BACKEND_URL}/admin/product-categories`, { headers })
        const categories = await listResponse.json()
        cableCategory = categories.product_categories?.find((cat: any) => cat.handle === "cables")
        if (cableCategory) {
          console.log("✅ Found existing Cables category")
        }
      }
    } catch (error: any) {
      console.error("❌ Error with Cables category:", error.message)
    }

    // Create Connectors category
    let connectorCategory
    try {
      const response = await fetch(`${MEDUSA_BACKEND_URL}/admin/product-categories`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          name: "Connectors",
          handle: "connectors",
          is_internal: false,
        }),
      })
      if (response.ok) {
        connectorCategory = await response.json()
        console.log("✅ Created Connectors category")
      } else {
        const listResponse = await fetch(`${MEDUSA_BACKEND_URL}/admin/product-categories`, { headers })
        const categories = await listResponse.json()
        connectorCategory = categories.product_categories?.find((cat: any) => cat.handle === "connectors")
        if (connectorCategory) {
          console.log("✅ Found existing Connectors category")
        }
      }
    } catch (error: any) {
      console.error("❌ Error with Connectors category:", error.message)
    }

    // Get regions to get currency code
    const regionsResponse = await fetch(`${MEDUSA_BACKEND_URL}/store/regions`, { headers: { "Content-Type": "application/json" } })
    const regionsData = await regionsResponse.json()
    const region = regionsData.regions?.[0]
    if (!region) {
      throw new Error("No regions found. Please create a region in Medusa Admin first.")
    }

    console.log(`✅ Using region: ${region.name} (${region.currency_code})`)

    // Sample Antenna Product
    console.log("📡 Creating sample antenna product...")
    try {
      const productResponse = await fetch(`${MEDUSA_BACKEND_URL}/admin/products`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: "Yagi Directional Antenna 6dBi",
          handle: "yagi-directional-antenna-6dbi",
          subtitle: "High-gain directional antenna for point-to-point links",
          description: "Professional-grade Yagi directional antenna with 6dBi gain. Ideal for long-range point-to-point wireless links.",
          metadata: {
            productType: "antenna",
          },
          categories: antennaCategory?.product_category ? [{ id: antennaCategory.product_category.id }] : [],
          status: "published",
        }),
      })

      if (productResponse.ok) {
        const antennaProduct = await productResponse.json()
        
        // Create variant with price
        const variantResponse = await fetch(`${MEDUSA_BACKEND_URL}/admin/products/${antennaProduct.product.id}/variants`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: "6dBi",
            sku: "ANT-YAGI-6DBI",
            prices: [
              {
                amount: 8999, // $89.99 in cents
                currency_code: region.currency_code,
              },
            ],
            inventory_quantity: 50,
            manage_inventory: true,
          }),
        })

        if (variantResponse.ok) {
          console.log("✅ Created antenna product:", antennaProduct.product.title)
        } else {
          console.error("❌ Error creating variant:", await variantResponse.text())
        }
      } else {
        console.error("❌ Error creating antenna product:", await productResponse.text())
      }
    } catch (error: any) {
      console.error("❌ Error creating antenna product:", error.message)
    }

    // Sample Cable Product
    console.log("🔌 Creating sample cable product...")
    try {
      const productResponse = await fetch(`${MEDUSA_BACKEND_URL}/admin/products`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: "LMR-400 Coaxial Cable",
          handle: "lmr-400-coaxial-cable",
          subtitle: "Low-loss 50-ohm coaxial cable",
          description: "High-quality LMR-400 coaxial cable with low attenuation. Perfect for long cable runs.",
          metadata: {
            productType: "cable",
          },
          categories: cableCategory?.product_category ? [{ id: cableCategory.product_category.id }] : [],
          status: "published",
        }),
      })

      if (productResponse.ok) {
        const cableProduct = await productResponse.json()
        
        // Create variant with price
        const variantResponse = await fetch(`${MEDUSA_BACKEND_URL}/admin/products/${cableProduct.product.id}/variants`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: "10 ft",
            sku: "CBL-LMR400-10FT",
            prices: [
              {
                amount: 2499, // $24.99 in cents
                currency_code: region.currency_code,
              },
            ],
            inventory_quantity: 100,
            manage_inventory: true,
          }),
        })

        if (variantResponse.ok) {
          console.log("✅ Created cable product:", cableProduct.product.title)
        } else {
          console.error("❌ Error creating variant:", await variantResponse.text())
        }
      } else {
        console.error("❌ Error creating cable product:", await productResponse.text())
      }
    } catch (error: any) {
      console.error("❌ Error creating cable product:", error.message)
    }

    // Sample Connector Product
    console.log("🔗 Creating sample connector product...")
    try {
      const productResponse = await fetch(`${MEDUSA_BACKEND_URL}/admin/products`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          title: "N-Type Female Connector",
          handle: "n-type-female-connector",
          subtitle: "Standard N-type female RF connector",
          description: "High-quality N-type female connector for secure RF connections.",
          metadata: {
            productType: "connector",
          },
          categories: connectorCategory?.product_category ? [{ id: connectorCategory.product_category.id }] : [],
          status: "published",
        }),
      })

      if (productResponse.ok) {
        const connectorProduct = await productResponse.json()
        
        // Create variant with price
        const variantResponse = await fetch(`${MEDUSA_BACKEND_URL}/admin/products/${connectorProduct.product.id}/variants`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            title: "Standard",
            sku: "CONN-N-FEMALE",
            prices: [
              {
                amount: 1299, // $12.99 in cents
                currency_code: region.currency_code,
              },
            ],
            inventory_quantity: 200,
            manage_inventory: true,
          }),
        })

        if (variantResponse.ok) {
          console.log("✅ Created connector product:", connectorProduct.product.title)
        } else {
          console.error("❌ Error creating variant:", await variantResponse.text())
        }
      } else {
        console.error("❌ Error creating connector product:", await productResponse.text())
      }
    } catch (error: any) {
      console.error("❌ Error creating connector product:", error.message)
    }

    console.log("\n✅ Sample products created successfully!")
    console.log("📝 You can now view them in the Medusa Admin panel and on the store page.")
  } catch (error: any) {
    console.error("❌ Error creating sample products:", error)
    console.error("Error details:", error.message)
    if (error.response) {
      console.error("Response:", await error.response.text())
    }
    process.exit(1)
  }
}

// Run the script
createSampleProducts().catch((error) => {
  console.error("❌ Unhandled error:", error)
  process.exit(1)
})

