// Cable Customizer Module Service
// Provides methods to manage cable series, types, and connectors

import { MedusaService } from "@medusajs/framework/utils"
import CableSeries from "./models/cable-series"
import CableType from "./models/cable-type"
import Connector from "./models/connector"

class CableCustomizerService extends MedusaService({
  CableSeries,
  CableType,
  Connector,
}) {
  // Cable Series methods
  // MedusaService automatically generates: listCableSeries_, retrieveCableSeries_, createCableSeries_, etc.
  async listCableSeries() {
    return await this.listCableSeries_({})
  }

  async retrieveCableSeries(id: string) {
    return await this.retrieveCableSeries_(id)
  }

  async createCableSeries(data: { name: string; slug: string; order?: number }) {
    return await this.createCableSeries_(data)
  }

  // Cable Type methods
  async listCableTypes(filters?: { series_id?: string; is_active?: boolean }) {
    const query: any = {}
    if (filters?.series_id) {
      query.series_id = filters.series_id
    }
    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active
    }
    return await this.listCableTypes_(query)
  }

  async retrieveCableType(id: string) {
    return await this.retrieveCableType_(id)
  }

  async createCableType(data: any) {
    return await this.createCableType_(data)
  }

  // Connector methods
  async listConnectors(filters?: { is_active?: boolean }) {
    const query: any = {}
    if (filters?.is_active !== undefined) {
      query.is_active = filters.is_active
    }
    return await this.listConnectors_(query)
  }

  async retrieveConnector(id: string) {
    return await this.retrieveConnector_(id)
  }

  async createConnector(data: any) {
    return await this.createConnector_(data)
  }

  // Helper: Get connector price for a specific cable type
  async getConnectorPrice(connectorId: string, cableTypeId: string): Promise<number | null> {
    const connector = await this.retrieveConnector(connectorId)
    if (!connector || !connector.pricing) return null

    const pricing = Array.isArray(connector.pricing) ? connector.pricing : []
    const priceEntry = pricing.find((p: any) => p.cable_type_id === cableTypeId)
    return priceEntry?.price ?? null
  }
}

export default CableCustomizerService

