// CMS FAQ Model
import { model } from "@medusajs/framework/utils"

export const FAQ = model.define("cms_faq", {
  id: model.id().primaryKey(),
  name: model.text().nullable(),
  title: model.text().nullable(),
  contact_button_text: model.text().nullable(),
  contact_button_link: model.text().nullable(),
  items: model.json(), // Array of { question: string, answer: string, order: number }
  is_active: model.boolean().default(true),
})

export default FAQ

