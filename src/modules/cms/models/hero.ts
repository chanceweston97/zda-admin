// CMS Hero Banner Model
import { model } from "@medusajs/framework/utils"

export const Hero = model.define("cms_hero", {
  id: model.id().primaryKey(),
  title: model.text(),
  description: model.text().nullable(),
  image_url: model.text(),
  sort_order: model.number().default(0),
  is_active: model.boolean().default(true),
})

export default Hero

