// FAQs Management Page
import { Container, Heading, Button, Table, Badge, Text, Input, Textarea, Label, Switch } from "@medusajs/ui"
import { useState, useEffect } from "react"

interface FAQ {
  id: string
  question: string
  answer: string
  sort_order: number
  is_active: boolean
}

const FAQsPage = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    question: "",
    answer: "",
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    loadFAQs()
  }, [])

  const loadFAQs = async () => {
    setLoading(true)
    try {
      const response = await fetch("/admin/cms/faqs", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setFaqs(data.faqs || [])
      }
    } catch (error) {
      console.error("Error loading FAQs:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setLoading(true)
    try {
      const method = editingId ? "PUT" : "POST"
      const body = editingId
        ? { id: editingId, ...formData }
        : formData

      const response = await fetch("/admin/cms/faqs", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setShowForm(false)
        setEditingId(null)
        setFormData({
          question: "",
          answer: "",
          sort_order: 0,
          is_active: true,
        })
        loadFAQs()
      }
    } catch (error) {
      console.error("Error saving:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (faq: FAQ) => {
    setEditingId(faq.id)
    setFormData({
      question: faq.question,
      answer: faq.answer,
      sort_order: faq.sort_order,
      is_active: faq.is_active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this FAQ?")) return

    try {
      const response = await fetch(`/admin/cms/faqs?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (response.ok) {
        loadFAQs()
      }
    } catch (error) {
      console.error("Error deleting:", error)
    }
  }

  if (showForm) {
    return (
      <Container>
        <div className="mb-4">
          <Heading level="h1">{editingId ? "Edit" : "Create"} FAQ</Heading>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="question">Question *</Label>
            <Input
              id="question"
              value={formData.question}
              onChange={(e) => setFormData({ ...formData, question: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="answer">Answer *</Label>
            <Textarea
              id="answer"
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              rows={6}
              required
            />
          </div>

          <div>
            <Label htmlFor="sort_order">Sort Order</Label>
            <Input
              id="sort_order"
              type="number"
              value={formData.sort_order}
              onChange={(e) => setFormData({ ...formData, sort_order: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
            />
            <Label htmlFor="is_active" className="ml-2">Active</Label>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} disabled={loading || !formData.question || !formData.answer}>
              {loading ? "Saving..." : "Save"}
            </Button>
            <Button variant="transparent" onClick={() => {
              setShowForm(false)
              setEditingId(null)
            }}>
              Cancel
            </Button>
          </div>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <div className="flex justify-between items-center mb-6">
        <div>
          <Heading level="h1">FAQs</Heading>
          <Text className="text-gray-600 mt-2">
            Manage frequently asked questions
          </Text>
        </div>
        <Button onClick={() => setShowForm(true)}>Add New FAQ</Button>
      </div>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Question</Table.HeaderCell>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {faqs.map((faq) => (
              <Table.Row key={faq.id}>
                <Table.Cell>{faq.question}</Table.Cell>
                <Table.Cell>{faq.sort_order}</Table.Cell>
                <Table.Cell>
                  <Badge color={faq.is_active ? "green" : "red"}>
                    {faq.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      variant="transparent"
                      onClick={() => handleEdit(faq)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="transparent"
                      onClick={() => handleDelete(faq.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      )}

      {faqs.length === 0 && !loading && (
        <div className="text-center py-12">
          <Text className="text-gray-500">No FAQs found. Create your first FAQ!</Text>
        </div>
      )}
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

