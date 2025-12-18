// CMS Hero Introduction Model
import { model } from "@medusajs/framework/utils"

export const Instruction = model.define("cms_instruction", {
  id: model.id().primaryKey(),
  name: model.text().nullable(),
  title: model.text().nullable(),
  description: model.text().nullable(),
  buttons: model.json().nullable(), // Array of { text: string, link: string }
  image: model.text().nullable(),
  is_active: model.boolean().default(true),
})

export default Instruction

