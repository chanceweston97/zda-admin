// Admin Widget: Custom Product Fields
// Adds Product Type selector and antenna-specific fields

import { defineWidgetConfig, useAdminCustomQuery } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Select, Textarea, Label } from "@medusajs/ui"
import { useState, useEffect } from "react"

const ProductCustomFields = () => {
  const [productType, setProductType] = useState<string>("")
  const [isSaving, setIsSaving] = useState(false)
  const [productId, setProductId] = useState<string | null>(null)
  const [metadata, setMetadata] = useState<Record<string, any>>({})
  const [product, setProduct] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [saveMessage, setSaveMessage] = useState<string>("")
  const [uploadingImage, setUploadingImage] = useState(false)
  const [uploadingPdf, setUploadingPdf] = useState(false)

  // Slug generation function (matches Sanity's slugify)
  const slugify = (text: string): string => {
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
  }

  // Auto-generate handle from title when handle field is focused
  useEffect(() => {
    let retryCount = 0
    const maxRetries = 10

    const setupHandleAutoGeneration = () => {
      // Find the title input field in the main product form
      let titleInput = document.querySelector('input[name="title"]') as HTMLInputElement
      if (!titleInput) {
        titleInput = document.querySelector('input[placeholder*="Title" i]') as HTMLInputElement
      }
      if (!titleInput) {
        titleInput = document.querySelector('input[aria-label*="title" i]') as HTMLInputElement
      }
      if (!titleInput) {
        const titleLabel = Array.from(document.querySelectorAll('label')).find(
          (label) => label.textContent?.toLowerCase().includes('title')
        )
        if (titleLabel) {
          const labelFor = titleLabel.getAttribute('for')
          if (labelFor) {
            titleInput = document.querySelector(`input#${labelFor}`) as HTMLInputElement
          }
        }
      }

      // Find handle input field
      let handleInput = document.querySelector('input[name="handle"]') as HTMLInputElement
      if (!handleInput) {
        handleInput = document.querySelector('input[placeholder*="Handle" i]') as HTMLInputElement
      }
      if (!handleInput) {
        handleInput = document.querySelector('input[aria-label*="handle" i]') as HTMLInputElement
      }
      if (!handleInput) {
        const handleLabel = Array.from(document.querySelectorAll('label')).find(
          (label) => label.textContent?.toLowerCase().includes('handle') || label.textContent?.toLowerCase().includes('slug')
        )
        if (handleLabel) {
          const labelFor = handleLabel.getAttribute('for')
          if (labelFor) {
            handleInput = document.querySelector(`input#${labelFor}`) as HTMLInputElement
          }
        }
      }

      if (!titleInput || !handleInput) {
        retryCount++
        if (retryCount < maxRetries) {
          setTimeout(setupHandleAutoGeneration, 500)
        }
        return
      }

      // Generate handle from title
      const generateHandle = () => {
        if (titleInput.value && (!handleInput.value || handleInput.value.trim() === "")) {
          const generated = slugify(titleInput.value)
          handleInput.value = generated
          
          // Trigger events so Medusa form picks it up
          const inputEvent = new Event('input', { bubbles: true })
          handleInput.dispatchEvent(inputEvent)
          
          const changeEvent = new Event('change', { bubbles: true })
          handleInput.dispatchEvent(changeEvent)

          // Try React synthetic events
          const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
            window.HTMLInputElement.prototype,
            'value'
          )?.set
          if (nativeInputValueSetter) {
            nativeInputValueSetter.call(handleInput, generated)
            const reactEvent = new Event('input', { bubbles: true })
            handleInput.dispatchEvent(reactEvent)
          }
        }
      }

      // Generate handle when handle field is focused (if title exists)
      handleInput.addEventListener('focus', () => {
        if (titleInput.value && (!handleInput.value || handleInput.value.trim() === "")) {
          generateHandle()
        }
      })

      // Also watch for title changes
      titleInput.addEventListener('input', generateHandle)
      titleInput.addEventListener('blur', generateHandle)

      // Generate on initial load if title exists but handle doesn't
      if (titleInput.value && (!handleInput.value || handleInput.value.trim() === "")) {
        generateHandle()
      }
    }

    // Setup after a delay to ensure DOM is ready
    setTimeout(setupHandleAutoGeneration, 1000)
  }, [])

  // Hide material field and remove Height, Width, Length, Weight, MID code, HS code from Attributes
  // Also hide "Type" field from Organize sidebar
  useEffect(() => {
    const hideFields = () => {
      // Hide material field
      const materialInput = document.querySelector('input[name="material"]') as HTMLElement
      if (materialInput) {
        const materialField = materialInput.closest('.field, [class*="field"], [class*="Field"]')
        if (materialField) {
          (materialField as HTMLElement).style.display = 'none'
        }
      }

      // Hide "Type" field from Organize sidebar
      const typeInput = document.querySelector('input[name="type"], select[name="type"]') as HTMLElement
      if (typeInput) {
        const typeField = typeInput.closest('.field, [class*="field"], [class*="Field"], [class*="organize"]')
        if (typeField) {
          (typeField as HTMLElement).style.display = 'none'
        }
      }
      
      // Also try to find by label text
      const typeLabel = Array.from(document.querySelectorAll('label')).find(
        (label) => label.textContent?.toLowerCase().includes('type') && 
                   label.textContent?.toLowerCase() !== 'product type'
      )
      if (typeLabel) {
        const labelFor = typeLabel.getAttribute('for')
        if (labelFor) {
          const typeField = document.querySelector(`input#${labelFor}, select#${labelFor}`) as HTMLElement
          if (typeField) {
            const fieldContainer = typeField.closest('.field, [class*="field"], [class*="Field"], [class*="organize"]')
            if (fieldContainer) {
              (fieldContainer as HTMLElement).style.display = 'none'
            }
          }
        }
      }

      // Remove Height, Width, Length, Weight, MID code, HS code from Attributes
      const attributeFields = ['height', 'width', 'length', 'weight', 'mid_code', 'hs_code']
      attributeFields.forEach((fieldName) => {
        const fieldInput = document.querySelector(`input[name="${fieldName}"], input[name*="${fieldName}" i]`) as HTMLElement
        if (fieldInput) {
          const fieldContainer = fieldInput.closest('.field, [class*="field"], [class*="Field"], [class*="attribute"]')
          if (fieldContainer) {
            (fieldContainer as HTMLElement).style.display = 'none'
          }
        }
      })
    }

    // Run immediately and also after delays to catch dynamically loaded fields
    hideFields()
    setTimeout(hideFields, 1000)
    setTimeout(hideFields, 2000)
    setTimeout(hideFields, 3000)
  }, [])

  // Get product ID from URL
  useEffect(() => {
    const updateProductId = () => {
      const path = window.location.pathname
      const match = path.match(/\/products\/([^\/]+)/)
      if (match && match[1]) {
        setProductId(match[1])
      }
    }

    updateProductId()
    const interval = setInterval(updateProductId, 1000)
    return () => clearInterval(interval)
  }, [])

  // Load current product data
  useEffect(() => {
    if (!productId) {
      setIsLoading(false)
      return
    }

    const loadData = async () => {
      try {
        // Load product
        const productResponse = await fetch(`/admin/products/${productId}`, {
          headers: {
            "Content-Type": "application/json",
          },
          credentials: "include",
        })

        if (productResponse.ok) {
          const data = await productResponse.json()
          const productData = data.product
          setProduct(productData)
          const currentMetadata = productData?.metadata || {}
          setMetadata(currentMetadata)
          
          // Get product type from metadata or try to detect from categories
          let detectedType = currentMetadata.productType || ""
          
          // If not in metadata, try to detect from categories
          if (!detectedType) {
            const categories = productData?.categories || []
            for (const cat of categories) {
              const catName = (cat.name || "").toLowerCase()
              const catHandle = (cat.handle || "").toLowerCase()
              
              if (catName.includes("antenna") || catHandle.includes("antenna")) {
                detectedType = "antenna"
                break
              } else if (catName.includes("cable") || catHandle.includes("cable")) {
                detectedType = "cable"
                break
              } else if (catName.includes("connector") || catHandle.includes("connector")) {
                detectedType = "connector"
                break
              }
            }
          }
          
          setProductType(detectedType)
        }
      } catch (error) {
        console.error("Error loading data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [productId])

  // Save metadata
  const saveMetadata = async (newMetadata: Record<string, any>) => {
    if (!productId) return false

    setIsSaving(true)
    try {
      const response = await fetch(`/admin/products/${productId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          metadata: newMetadata,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || "Failed to save")
      }

      const responseData = await response.json()
      const updatedMetadata = responseData.product?.metadata || newMetadata
      setMetadata(updatedMetadata)
      setSaveMessage("Saved successfully!")
      setTimeout(() => setSaveMessage(""), 3000)
      return true
    } catch (error: any) {
      console.error("Error saving metadata:", error)
      setSaveMessage(`Error: ${error.message || "Failed to save"}`)
      setTimeout(() => setSaveMessage(""), 5000)
      return false
    } finally {
      setIsSaving(false)
    }
  }

  // Handle product type change
  const handleProductTypeChange = async (value: string) => {
    setProductType(value)
    setIsSaving(true)
    const newMetadata = { ...metadata, productType: value }
    await saveMetadata(newMetadata)
    setIsSaving(false)
  }

  // Handle metadata field changes
  const handleMetadataChange = async (field: string, value: any) => {
    const newMetadata = { ...metadata, [field]: value }
    setMetadata(newMetadata)
    await saveMetadata(newMetadata)
  }

  // Handle file upload with proper saving
  const handleFileUpload = async (file: File, field: string) => {
    if (!productId || !file) return

    const formData = new FormData()
    formData.append("files", file)

    try {
      if (field === "datasheetImage") {
        setUploadingImage(true)
      } else if (field === "datasheetPdf") {
        setUploadingPdf(true)
      }

      // Upload file to Medusa
      // In Medusa admin widgets, we need to use the same authentication as the admin panel
      // The admin panel uses cookies for authentication, so credentials: "include" should work
      // However, if you get "Unauthorized", it might mean:
      // 1. File service plugin is not configured in medusa-config.ts
      // 2. The endpoint path is incorrect
      // 3. Authentication cookies are not being sent
      
      // Try relative URL first (works if widget is in same origin as admin)
      let uploadResponse
      try {
        uploadResponse = await fetch("/admin/uploads", {
          method: "POST",
          credentials: "include", // Include cookies for authentication
          // Don't set Content-Type - browser will set it with boundary for FormData
          body: formData,
        })
      } catch (fetchError: any) {
        // If relative URL fails, try with full URL
        const baseUrl = typeof window !== 'undefined' ? window.location.origin : ''
        uploadResponse = await fetch(`${baseUrl}/admin/uploads`, {
          method: "POST",
          credentials: "include",
          body: formData,
        })
      }

      if (!uploadResponse.ok) {
        const errorText = await uploadResponse.text()
        let errorData
        try {
          errorData = JSON.parse(errorText)
        } catch {
          errorData = { message: errorText || "Failed to upload file" }
        }
        
        // Log detailed error for debugging
        console.error("Upload error response:", {
          status: uploadResponse.status,
          statusText: uploadResponse.statusText,
          error: errorData,
        })
        
        throw new Error(errorData.message || `Upload failed: ${uploadResponse.status} ${uploadResponse.statusText}`)
      }

      const uploadData = await uploadResponse.json()
      
      // Handle different response formats from Medusa
      let fileUrl: string | null = null
      
      // Try different possible response structures (Medusa v2 uses "files" array)
      if (uploadData.files && Array.isArray(uploadData.files) && uploadData.files.length > 0) {
        fileUrl = uploadData.files[0].url || null
      } else if (uploadData.uploads && Array.isArray(uploadData.uploads) && uploadData.uploads.length > 0) {
        fileUrl = uploadData.uploads[0].url || null
      } else if (uploadData.url) {
        fileUrl = uploadData.url
      } else if (Array.isArray(uploadData) && uploadData.length > 0) {
        fileUrl = uploadData[0].url || null
      } else if (uploadData.file) {
        fileUrl = uploadData.file.url || null
      } else if (uploadData.data && uploadData.data.url) {
        fileUrl = uploadData.data.url
      } else if (uploadData.upload && uploadData.upload.url) {
        fileUrl = uploadData.upload.url
      }

      // Log for debugging (only in development)
      if (process.env.NODE_ENV === 'development') {
        console.log("Upload response:", uploadData)
        console.log("Extracted file URL:", fileUrl)
      }

      if (!fileUrl) {
        console.error("Upload response structure:", JSON.stringify(uploadData, null, 2))
        throw new Error("No file URL returned from upload. Response: " + JSON.stringify(uploadData))
      }

      // Save the file URL to metadata
      const updatedMetadata = { ...metadata, [field]: fileUrl }
      const saved = await saveMetadata(updatedMetadata)
      
      if (saved) {
        setSaveMessage("File uploaded and saved successfully!")
        setTimeout(() => setSaveMessage(""), 3000)
      }
    } catch (error: any) {
      console.error(`Error uploading ${field}:`, error)
      setSaveMessage(`Error uploading file: ${error.message || "Failed to upload"}`)
      setTimeout(() => setSaveMessage(""), 5000)
    } finally {
      if (field === "datasheetImage") {
        setUploadingImage(false)
      } else if (field === "datasheetPdf") {
        setUploadingPdf(false)
      }
    }
  }

  if (isLoading) {
    return (
      <Container>
        <Heading level="h2">Custom Product Fields</Heading>
        <p className="text-sm text-gray-500 mt-2">Loading...</p>
      </Container>
    )
  }

  if (!productId) {
    return (
      <Container>
        <Heading level="h2">Custom Product Fields</Heading>
        <p className="text-sm text-gray-500 mt-2">No product selected</p>
      </Container>
    )
  }

  const isAntenna = productType === "antenna" || productType === "antennas"

  return (
    <Container>
      <Heading level="h2">Custom Product Fields</Heading>
      {saveMessage && (
        <div className={`mt-2 p-2 rounded text-sm ${saveMessage.includes("Error") ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"}`}>
          {saveMessage}
        </div>
      )}
      
      <div className="gap-y-4 flex flex-col mt-4">
        {/* Product Type - Moved from Organize sidebar */}
        <div className="flex flex-col gap-2">
          <Label htmlFor="productType" className="text-sm font-medium">
            Product Type *
          </Label>
          <Select value={productType} onValueChange={handleProductTypeChange} disabled={isSaving}>
            <Select.Trigger id="productType" className="w-full">
              <Select.Value placeholder="Select Product Type">
                {productType ? (
                  productType.charAt(0).toUpperCase() + productType.slice(1)
                ) : (
                  "Select Product Type"
                )}
              </Select.Value>
            </Select.Trigger>
            <Select.Content>
              <Select.Item value="antenna">Antenna</Select.Item>
              <Select.Item value="cable">Cable</Select.Item>
              <Select.Item value="connector">Connector</Select.Item>
            </Select.Content>
          </Select>
          {isSaving && <p className="text-xs text-gray-500">Saving...</p>}
        </div>

        {/* ANTENNA FIELDS - Show all fields when Product Type is "Antennas" */}
        {isAntenna && (
          <div className="flex flex-col gap-4 mt-4 p-4 border border-gray-200 rounded-lg">
            <h3 className="text-sm font-semibold">Antenna Fields</h3>
            
            {/* Datasheet Image - File Upload */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="datasheetImage" className="text-sm font-medium">
                Datasheet Image
              </Label>
              <div className="flex flex-col gap-2">
                <input
                  id="datasheetImage"
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(file, "datasheetImage")
                    }
                  }}
                  disabled={uploadingImage || isSaving}
                  className="text-sm"
                />
                {metadata.datasheetImage && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Current URL:</p>
                    <a
                      href={metadata.datasheetImage}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline break-all"
                    >
                      {metadata.datasheetImage}
                    </a>
                  </div>
                )}
                {uploadingImage && <p className="text-xs text-gray-500">Uploading...</p>}
              </div>
            </div>

            {/* Datasheet PDF - File Upload */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="datasheetPdf" className="text-sm font-medium">
                Datasheet PDF
              </Label>
              <div className="flex flex-col gap-2">
                <input
                  id="datasheetPdf"
                  type="file"
                  accept="application/pdf"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) {
                      handleFileUpload(file, "datasheetPdf")
                    }
                  }}
                  disabled={uploadingPdf || isSaving}
                  className="text-sm"
                />
                {metadata.datasheetPdf && (
                  <div className="mt-2">
                    <p className="text-xs text-gray-600 mb-1">Current URL:</p>
                    <a
                      href={metadata.datasheetPdf}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:underline break-all"
                    >
                      {metadata.datasheetPdf}
                    </a>
                  </div>
                )}
                {uploadingPdf && <p className="text-xs text-gray-500">Uploading...</p>}
              </div>
            </div>

            {/* Features - Plain text */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="features" className="text-sm font-medium">
                Features (Optional)
              </Label>
              <Textarea
                id="features"
                placeholder="Enter product features (plain text)"
                value={typeof metadata.features === 'string' ? metadata.features : (Array.isArray(metadata.features) ? metadata.features.join('\n') : '')}
                onChange={(e) => {
                  setMetadata({ ...metadata, features: e.target.value })
                }}
                onBlur={(e) => handleMetadataChange("features", e.target.value.trim() || null)}
                rows={4}
                disabled={isSaving}
              />
              <p className="text-xs text-gray-500">Enter features as plain text (each line will be displayed separately)</p>
            </div>

            {/* Applications - Plain text */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="applications" className="text-sm font-medium">
                Applications (Optional)
              </Label>
              <Textarea
                id="applications"
                placeholder="Enter product applications (plain text)"
                value={typeof metadata.applications === 'string' ? metadata.applications : (Array.isArray(metadata.applications) ? metadata.applications.join('\n') : '')}
                onChange={(e) => {
                  setMetadata({ ...metadata, applications: e.target.value })
                }}
                onBlur={(e) => handleMetadataChange("applications", e.target.value.trim() || null)}
                rows={4}
                disabled={isSaving}
              />
              <p className="text-xs text-gray-500">Enter applications as plain text (each line will be displayed separately)</p>
            </div>

            {/* Specifications - Plain text */}
            <div className="flex flex-col gap-2">
              <Label htmlFor="specifications" className="text-sm font-medium">
                Specifications (Optional)
              </Label>
              <Textarea
                id="specifications"
                placeholder="Enter product specifications (plain text)"
                value={metadata.specifications || ''}
                onChange={(e) => {
                  setMetadata({ ...metadata, specifications: e.target.value })
                }}
                onBlur={(e) => handleMetadataChange("specifications", e.target.value.trim() || null)}
                rows={6}
                disabled={isSaving}
              />
              <p className="text-xs text-gray-500">Enter specifications as plain text</p>
            </div>
          </div>
        )}

        {/* Note about variants */}
        <div className="mt-4 p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-800">
            <strong>Note:</strong> Category is managed in the Organize sidebar. 
            For Antennas, create variants for Gain Options. For Cables, create variants for Length Options. 
            The variant titles should match the gain/length values (e.g., "6dBi", "10 ft").
          </p>
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductCustomFields
