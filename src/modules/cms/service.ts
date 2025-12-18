// CMS Service - CRUD operations for CMS content
import { MedusaService } from "@medusajs/framework/utils"
import Hero from "./models/hero"
import Instruction from "./models/instruction"
import FAQ from "./models/faq"

class CMSService extends MedusaService({
  Hero,
  Instruction,
  FAQ,
}) {
  // Hero Banner methods
  async listHeroes(filters?: { is_active?: boolean }) {
    const query: any = {}
    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active
    }
    const heroes = await this.listHero_(query)
    return heroes.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
  }

  async getHero(id: string) {
    return await this.retrieveHero_(id)
  }

  async createHero(data: {
    title: string
    description?: string
    image_url: string
    sort_order?: number
    is_active?: boolean
  }) {
    return await this.createHero_({
      title: data.title,
      description: data.description || null,
      image_url: data.image_url,
      sort_order: data.sort_order || 0,
      is_active: data.is_active ?? true,
    })
  }

  async updateHero(id: string, data: Partial<{
    title: string
    description: string
    image_url: string
    sort_order: number
    is_active: boolean
  }>) {
    return await this.updateHero_(id, data)
  }

  async deleteHero(id: string) {
    return await this.deleteHero_(id)
  }

  // Instruction methods
  async listInstructions(filters?: { is_active?: boolean }) {
    const query: any = {}
    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active
    }
    const instructions = await this.listInstruction_(query)
    return instructions.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
  }

  async getInstruction(id: string) {
    return await this.retrieveInstruction_(id)
  }

  async createInstruction(data: {
    title: string
    description?: string
    image_url?: string
    sort_order?: number
    is_active?: boolean
  }) {
    return await this.createInstruction_({
      title: data.title,
      description: data.description || null,
      image_url: data.image_url || null,
      sort_order: data.sort_order || 0,
      is_active: data.is_active ?? true,
    })
  }

  async updateInstruction(id: string, data: Partial<{
    title: string
    description: string
    image_url: string
    sort_order: number
    is_active: boolean
  }>) {
    return await this.updateInstruction_(id, data)
  }

  async deleteInstruction(id: string) {
    return await this.deleteInstruction_(id)
  }

  // FAQ methods
  async listFAQs(filters?: { is_active?: boolean }) {
    const query: any = {}
    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active
    }
    const faqs = await this.listFAQ_(query)
    return faqs.sort((a: any, b: any) => (a.sort_order || 0) - (b.sort_order || 0))
  }

  async getFAQ(id: string) {
    return await this.retrieveFAQ_(id)
  }

  async createFAQ(data: {
    question: string
    answer: string
    sort_order?: number
    is_active?: boolean
  }) {
    return await this.createFAQ_({
      question: data.question,
      answer: data.answer,
      sort_order: data.sort_order || 0,
      is_active: data.is_active ?? true,
    })
  }

  async updateFAQ(id: string, data: Partial<{
    question: string
    answer: string
    sort_order: number
    is_active: boolean
  }>) {
    return await this.updateFAQ_(id, data)
  }

  async deleteFAQ(id: string) {
    return await this.deleteFAQ_(id)
  }
}

export default CMSService

