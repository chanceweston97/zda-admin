// FAQs Management Page
import { Container, Heading, Button, Text, Input, Textarea, Label, Switch } from "@medusajs/ui"
import { useState, useEffect } from "react"

interface FAQItem {
  question: string
  answer: string
  order?: number
}

const FAQsPage = () => {
  const [loading, setLoading] = useState(true)
  const [formData, setFormData] = useState({
    name: "",
    title: "",
    contact_button_text: "",
    contact_button_link: "",
    items: [] as FAQItem[],
    is_active: true,
  })
  const [editingIndex, setEditingIndex] = useState<number | null>(null)
  const [newItem, setNewItem] = useState<FAQItem>({ question: "", answer: "", order: 0 })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      const response = await fetch("/admin/cms/faqs", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        if (data.faq) {
          setFormData({
            name: data.faq.name || "",
            title: data.faq.title || "",
            contact_button_text: data.faq.contact_button_text || "",
            contact_button_link: data.faq.contact_button_link || "",
            items: data.faq.items || [],
            is_active: data.faq.is_active ?? true,
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
      const response = await fetch("/admin/cms/faqs", {
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
    if (newItem.question && newItem.answer) {
      const order = formData.items.length + 1
      setFormData({
        ...formData,
        items: [...formData.items, { ...newItem, order }],
      })
      setNewItem({ question: "", answer: "", order: 0 })
    }
  }

  const handleEditItem = (index: number) => {
    setNewItem({ ...formData.items[index] })
    setEditingIndex(index)
  }

  const handleUpdateItem = () => {
    if (editingIndex !== null) {
      const updated = [...formData.items]
      updated[editingIndex] = { ...newItem }
      setFormData({ ...formData, items: updated })
      setEditingIndex(null)
      setNewItem({ question: "", answer: "", order: 0 })
    }
  }

  const handleRemoveItem = (index: number) => {
    setFormData({
      ...formData,
      items: formData.items.filter((_, i) => i !== index),
    })
  }

  const handleMoveItem = (index: number, direction: "up" | "down") => {
    const items = [...formData.items]
    const newIndex = direction === "up" ? index - 1 : index + 1
    if (newIndex >= 0 && newIndex < items.length) {
      [items[index], items[newIndex]] = [items[newIndex], items[index]]
      items.forEach((item, i) => {
        item.order = i + 1
      })
      setFormData({ ...formData, items })
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
        <Heading level="h1">FAQs</Heading>
        <Text className="text-gray-600 mt-2">
          Manage frequently asked questions
        </Text>
      </div>

      <div className="space-y-6">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Frequently Asked Questions"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="contact_button_text">Contact Button Text</Label>
            <Input
              id="contact_button_text"
              value={formData.contact_button_text}
              onChange={(e) => setFormData({ ...formData, contact_button_text: e.target.value })}
              placeholder="Contact Us"
            />
          </div>
          <div>
            <Label htmlFor="contact_button_link">Contact Button Link</Label>
            <Input
              id="contact_button_link"
              value={formData.contact_button_link}
              onChange={(e) => setFormData({ ...formData, contact_button_link: e.target.value })}
              placeholder="/contact"
            />
          </div>
        </div>

        <div>
          <Label>FAQ Items</Label>
          <div className="space-y-4 mt-2">
            {formData.items
              .sort((a, b) => (a.order || 0) - (b.order || 0))
              .map((item, index) => (
                <div key={index} className="border p-4 rounded">
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex-1">
                      <Text className="font-medium">Q{index + 1}: {item.question}</Text>
                      <Text className="text-sm text-gray-600 mt-1">{item.answer}</Text>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="transparent"
                        onClick={() => handleMoveItem(index, "up")}
                        disabled={index === 0}
                      >
                        ↑
                      </Button>
                      <Button
                        variant="transparent"
                        onClick={() => handleMoveItem(index, "down")}
                        disabled={index === formData.items.length - 1}
                      >
                        ↓
                      </Button>
                      <Button variant="transparent" onClick={() => handleEditItem(index)}>
                        Edit
                      </Button>
                      <Button variant="transparent" onClick={() => handleRemoveItem(index)}>
                        Remove
                      </Button>
                    </div>
                  </div>
                </div>
              ))}

            <div className="border-2 border-dashed p-4 rounded space-y-4">
              <Heading level="h3">{editingIndex !== null ? "Edit" : "Add"} FAQ Item</Heading>
              
              <div>
                <Label>Question *</Label>
                <Input
                  value={newItem.question}
                  onChange={(e) => setNewItem({ ...newItem, question: e.target.value })}
                />
              </div>

              <div>
                <Label>Answer *</Label>
                <Textarea
                  value={newItem.answer}
                  onChange={(e) => setNewItem({ ...newItem, answer: e.target.value })}
                  rows={4}
                />
              </div>

              <Button
                onClick={editingIndex !== null ? handleUpdateItem : handleAddItem}
                disabled={!newItem.question || !newItem.answer}
              >
                {editingIndex !== null ? "Update" : "Add"} FAQ
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
  label: "FAQ",
  icon: "QuestionMarkCircle",
  path: "/cms/faqs",
  parent: "CMS",
}

export default FAQsPage
