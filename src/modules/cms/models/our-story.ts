// CMS Our Story Model
import { model } from "@medusajs/framework/utils"

export const OurStory = model.define("cms_our_story", {
  id: model.id().primaryKey(),
  // Hero Section
  hero_title: model.text().nullable(),
  hero_description: model.text().nullable(),
  // What We Focus On
  focus_title: model.text().nullable(),
  focus_intro_text: model.text().nullable(),
  focus_items: model.json().nullable(), // Array of { title: string, description: string }
  focus_closing_text: model.text().nullable(),
  focus_image: model.text().nullable(),
  // Let's Work Together
  work_title: model.text().nullable(),
  work_intro_text: model.text().nullable(),
  work_subtitle: model.text().nullable(),
  work_items: model.json().nullable(), // Array of strings
  work_closing_text: model.text().nullable(),
  work_image: model.text().nullable(),
  work_buttons: model.json().nullable(), // Array of { text: string, link: string }
  is_active: model.boolean().default(true),
})

export default OurStory

