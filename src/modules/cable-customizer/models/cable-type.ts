// Cable Type Model
// Represents specific cable types like "LMR 400", "RG 58", etc.

import { model } from "@medusajs/framework/utils"

const CableType = model.define("cable_type", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text(),
  series_id: model.text().nullable(), // Reference to cable series
  price_per_foot: model.number().nullable(),
  image_url: model.text().nullable(),
  order: model.number().nullable(),
  is_active: model.boolean().nullable(),
  category_id: model.text().nullable(), // Reference to category
  sku: model.text().nullable(),
  quantity: model.number().nullable(),
  // Store length options as JSON
  length_options: model.json().nullable(),
  // Store description and specifications as JSON (rich text)
  description: model.json().nullable(),
  specifications: model.json().nullable(),
})

export default CableType


