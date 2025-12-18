// What We Offer Management Page
import { Container, Heading, Button, Text, Input, Textarea, Label, Switch } from "@medusajs/ui"
import { useState, useEffect } from "react"

interface OfferItem {
  title: string
  tags?: string[]
  description: string
  button: { text: string; link: string }
  image: string
  imagePosition?: "left" | "right"
}

const WhatWeOfferPage = () => {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    title: "",
    header_button_text: "",
    header_button_link: "",
    offer_items: [] as OfferItem[],
    is_active: true,
  })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newItem, setNewItem] = useState<OfferItem>({
    title: "",
    tags: [],
    description: "",
    button: { text: "", link: "" },
    image: "",
    imagePosition: "right",
  })
  const [newTag, setNewTag] = useState("")

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/admin/cms/what-we-offer", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        if (data.offer) {
          setFormData({
            title: data.offer.title || "",
            header_button_text: data.offer.header_button_text || "",
            header_button_link: data.offer.header_button_link || "",
            offer_items: data.offer.offer_items || [],
            is_active: data.offer.is_active ?? true,
          })
        }
      }
    } catch (error) {
      console.error("Error loading data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const response = await fetch("/admin/cms/what-we-offer", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        alert("Saved successfully!")
        loadData()
      }
    } catch (error) {
      console.error("Error saving:", error)
      alert("Failed to save")
    } finally {
      setLoading(false)
    }
  }

  const handleAddItem = () => {
    if (newItem.title && newItem.description && newItem.image) {
      setFormData({
        ...formData,
        offer_items: [...formData.offer_items, { ...newItem }],
      })
      setNewItem({
        title: "",
        tags: [],
        description: "",
        button: { text: "", link: "" },
        image: "",
        imagePosition: "right",
      })
    }
  }

  const handleEditItem = (index: number) => {
    setNewItem({ ...formData.offer_items[index] })
    setEditingIndex(index)
  }

  const handleUpdateItem = () => {
    if (editingIndex !== null) {
      const updated = [...formData.offer_items]
      updated[editingIndex] = { ...newItem }
      setFormData({ ...formData, offer_items: updated })
      setEditingIndex(null)
      setNewItem({
        title: "",
        tags: [],
        description: "",
        button: { text: "", link: "" },
        image: "",
        imagePosition: "right",
      })
    }
  }

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      offer_items: formData.offer_items.filter((_, i) => i !== index),
    })
  }

  const handleAddTag = () => {
    if (newTag.trim()) {
      setNewItem({
        ...newItem,
        tags: [...(newItem.tags || []), newTag.trim()],
      })
      setNewTag("")
    }
  }

  const handleRemoveTag = (tagIndex: number) => {
    setNewItem({
      ...newItem,
      tags: newItem.tags?.filter((_, i) => i !== tagIndex) || [],
    })
  }

  const handleFileUpload = async (file: File) => {
    try {
      const formData = new FormData()
      formData.append("files", file)

      const response = await fetch("/admin/uploads", {
        method: "POST",
        credentials: "include",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        const fileUrl = data.files?.[0]?.url || data.uploads?.[0]?.url || data.url
        if (fileUrl) {
          setNewItem((prev) => ({ ...prev, image: fileUrl }))
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  if (loading && !formData.title) {
    return (
      <Container>
        <Text>Loading...</Text>
      </Container>
    )
  }

  return (
    <Container>
      <div className="mb-6">
        <Heading level="h1">What We Offer</Heading>
        <Text className="text-gray-600 mt-2">
          Manage product/service offerings section
        </Text>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What We Offer"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="header_button_text">Header Button Text</Label>
            <Input
              id="header_button_text"
              value={formData.header_button_text}
              onChange={(e) => setFormData({ ...formData, header_button_text: e.target.value })}
            />
          </div>
          <div>
            <Label htmlFor="header_button_link">Header Button Link</Label>
            <Input
              id="header_button_link"
              value={formData.header_button_link}
              onChange={(e) => setFormData({ ...formData, header_button_link: e.target.value })}
            />
          </div>
        </div>

        <div>
          <Label>Offer Items</Label>
          <div className="space-y-4 mt-2">
            {formData.offer_items.map((item, index) => (
              <div key={index} className="border p-4 rounded">
                <div className="flex justify-between items-start mb-2">
                  <Text className="font-medium">{item.title}</Text>
                  <div className="flex gap-2">
                    <Button variant="transparent" onClick={() => handleEditItem(index)}>
                      Edit
                    </Button>
                    <Button variant="transparent" onClick={() => handleRemoveItem(index)}>
                      Remove
                    </Button>
                  </div>
                </div>
                {item.image && (
                  <img src={item.image} alt={item.title} className="w-32 h-32 object-cover rounded mb-2" />
                )}
              </div>
            ))}

            <div className="border-2 border-dashed p-4 rounded space-y-4">
              <Heading level="h3">{editingIndex !== null ? "Edit" : "Add"} Offer Item</Heading>
              
              <div>
                <Label>Title *</Label>
                <Input
                  value={newItem.title}
                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                />
              </div>

              <div>
                <Label>Description *</Label>
                <Textarea
                  value={newItem.description}
                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                  rows={4}
                />
              </div>

              <div>
                <Label>Tags</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    value={newTag}
                    onChange={(e) => setNewTag(e.target.value)}
                    onKeyPress={(e) => e.key === "Enter" && handleAddTag()}
                    placeholder="Add tag"
                  />
                  <Button onClick={handleAddTag}>Add</Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {newItem.tags?.map((tag, i) => (
                    <span key={i} className="px-2 py-1 bg-gray-100 rounded flex items-center gap-2">
                      {tag}
                      <button onClick={() => handleRemoveTag(i)}>×</button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Button Text</Label>
                  <Input
                    value={newItem.button.text}
                    onChange={(e) => setNewItem({ ...newItem, button: { ...newItem.button, text: e.target.value } })}
                  />
                </div>
                <div>
                  <Label>Button Link</Label>
                  <Input
                    value={newItem.button.link}
                    onChange={(e) => setNewItem({ ...newItem, button: { ...newItem.button, link: e.target.value } })}
                  />
                </div>
              </div>

              <div>
                <Label>Image *</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0]
                    if (file) handleFileUpload(file)
                  }}
                />
                <Input
                  value={newItem.image}
                  onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
                  placeholder="Or enter image URL"
                  className="mt-2"
                />
                {newItem.image && (
                  <img src={newItem.image} alt="Preview" className="w-32 h-32 object-cover rounded mt-2" />
                )}
              </div>

              <div>
                <Label>Image Position</Label>
                <select
                  value={newItem.imagePosition}
                  onChange={(e) => setNewItem({ ...newItem, imagePosition: e.target.value as "left" | "right" })}
                  className="w-full p-2 border rounded"
                >
                  <option value="left">Left</option>
                  <option value="right">Right</option>
                </select>
              </div>

              <Button
                onClick={editingIndex !== null ? handleUpdateItem : handleAddItem}
                disabled={!newItem.title || !newItem.description || !newItem.image}
              >
                {editingIndex !== null ? "Update" : "Add"} Item
              </Button>
            </div>
          </div>
        </div>

        <div>
          <Switch
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
          <Label htmlFor="is_active" className="ml-2">Active</Label>
        </div>

        <div className="flex gap-2">
          <Button onClick={handleSave} disabled={loading}>
            {loading ? "Saving..." : "Save"}
          </Button>
        </div>
      </div>
    </Container>
  )
}

export const config = {
  label: "What We Offer",
  icon: "Gift",
  parent: "CMS",
}

export default WhatWeOfferPage

