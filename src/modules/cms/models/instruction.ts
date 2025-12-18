// CMS Hero Instruction Model
import { model } from "@medusajs/framework/utils"

export const Instruction = model.define("cms_instruction", {
  id: model.id().primaryKey(),
  title: model.text(),
  description: model.text().nullable(),
  image_url: model.text().nullable(),
  sort_order: model.number().default(0),
  is_active: model.boolean().default(true),
})

export default Instruction

