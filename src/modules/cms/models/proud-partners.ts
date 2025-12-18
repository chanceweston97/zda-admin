// CMS Proud Partners Model
import { model } from "@medusajs/framework/utils"

export const ProudPartners = model.define("cms_proud_partners", {
  id: model.id().primaryKey(),
  title: model.text().nullable(),
  partners: model.json(), // Array of { name: string, logo: string }
  is_active: model.boolean().default(true),
})

export default ProudPartners

