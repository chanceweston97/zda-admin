// Admin Widget: Custom Product Fields
// Adds custom fields to product pages for productType, cable customizer fields, etc.

import { defineWidgetConfig } from "@medusajs/admin-sdk"
import { Container, Heading, Input, Select, Textarea, Checkbox } from "@medusajs/ui"

const ProductCustomFields = () => {
  return (
    <Container>
      <Heading level="h2">Custom Product Fields</Heading>
      
      <div className="gap-y-4 flex flex-col">
        {/* Product Type */}
        <div>
          <label className="text-sm font-medium">Product Type</label>
          <Select name="metadata.productType">
            <option value="">Select Product Type</option>
            <option value="antenna">Antenna</option>
            <option value="cable">Cable</option>
            <option value="connector">Connector</option>
          </Select>
        </div>

        {/* Conditional fields based on product type will be added via JavaScript */}
        <div id="cable-fields" style={{ display: "none" }}>
          <label className="text-sm font-medium">Cable Series</label>
          <Input name="metadata.cableSeries" placeholder="Cable Series ID" />
          
          <label className="text-sm font-medium">Cable Type</label>
          <Input name="metadata.cableType" placeholder="Cable Type ID" />
          
          <label className="text-sm font-medium">Connector A</label>
          <Input name="metadata.connectorA" placeholder="Connector A ID" />
          
          <label className="text-sm font-medium">Connector B</label>
          <Input name="metadata.connectorB" placeholder="Connector B ID" />
          
          <label className="text-sm font-medium">Length Options (JSON)</label>
          <Textarea 
            name="metadata.lengthOptions" 
            placeholder='[{"length": "10", "price": 12.50}]'
          />
        </div>

        <div id="antenna-fields" style={{ display: "none" }}>
          <label className="text-sm font-medium">Gain Options (JSON)</label>
          <Textarea 
            name="metadata.gainOptions" 
            placeholder='[{"gain": "6", "price": 99.99}]'
          />
          
          <label className="text-sm font-medium">Features (comma-separated)</label>
          <Input name="metadata.features" placeholder="Feature 1, Feature 2" />
          
          <label className="text-sm font-medium">Applications (comma-separated)</label>
          <Input name="metadata.applications" placeholder="Application 1, Application 2" />
        </div>

        <div id="connector-fields" style={{ display: "none" }}>
          <label className="text-sm font-medium">Connector Price</label>
          <Input name="metadata.connectorPrice" type="number" placeholder="4.95" />
        </div>
      </div>
    </Container>
  )
}

export const config = defineWidgetConfig({
  zone: "product.details.after",
})

export default ProductCustomFields


