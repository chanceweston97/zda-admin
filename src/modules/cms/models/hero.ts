// CMS Hero Banner Model
import { model } from "@medusajs/framework/utils"

export const Hero = model.define("cms_hero", {
  id: model.id().primaryKey(),
  name: model.text().nullable(),
  background_image: model.text().nullable(),
  title: model.text().nullable(),
  buttons: model.json().nullable(), // Array of { text: string, link: string }
  brand_name: model.text().nullable(),
  card_image: model.text().nullable(),
  card_title: model.text().nullable(),
  card_description: model.text().nullable(),
  product_slug: model.text().nullable(), // For linking to product
  discounted_price: model.text().nullable(),
  sort_order: model.number().default(0),
  is_active: model.boolean().default(true),
})

export default Hero

