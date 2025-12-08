// Connector Model
// Represents connectors like "SMA-Male", "TNC-Female", etc.

import { model } from "@medusajs/framework/utils"

const Connector = model.define("connector", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text(),
  image_url: model.text().nullable(),
  order: model.number().nullable(),
  is_active: model.boolean().nullable(),
  category_id: model.text().nullable(), // Reference to category
  // Store pricing as JSON: [{ cable_type_id, price }]
  pricing: model.json().nullable(),
})

export default Connector


