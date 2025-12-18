// CMS FAQ Model
import { model } from "@medusajs/framework/utils"

export const FAQ = model.define("cms_faq", {
  id: model.id().primaryKey(),
  question: model.text(),
  answer: model.text(),
  sort_order: model.number().default(0),
  is_active: model.boolean().default(true),
})

export default FAQ

