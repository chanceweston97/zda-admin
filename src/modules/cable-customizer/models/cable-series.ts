// Cable Series Model
// Represents cable series like "RG Series" and "LMR Series"

import { model } from "@medusajs/framework/utils"

const CableSeries = model.define("cable_series", {
  id: model.id().primaryKey(),
  name: model.text(),
  slug: model.text(),
  order: model.number().nullable(),
})

export default CableSeries


