// CMS What We Offer Model
import { model } from "@medusajs/framework/utils"

export const WhatWeOffer = model.define("cms_what_we_offer", {
  id: model.id().primaryKey(),
  title: model.text().nullable(),
  header_button_text: model.text().nullable(),
  header_button_link: model.text().nullable(),
  offer_items: model.json(), // Array of offer items
  is_active: model.boolean().default(true),
})

export default WhatWeOffer

