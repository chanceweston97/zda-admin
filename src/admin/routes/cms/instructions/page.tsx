// Hero Instructions Management Page
import { Container, Heading, Button, Table, Badge, Text, Input, Textarea, Label, Switch } from "@medusajs/ui"
import { useState, useEffect } from "react"

interface Instruction {
  id: string
  title: string
  description?: string
  image_url?: string
  sort_order: number
  is_active: boolean
}

const InstructionsPage = () => {
  const [instructions, setInstructions] = useState<Instruction[]>([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    image_url: "",
    sort_order: 0,
    is_active: true,
  })

  useEffect(() => {
    loadInstructions()
  }, [])

  const loadInstructions = async () => {
    setLoading(true)
    try {
      const response = await fetch("/admin/cms/instructions", {
        credentials: "include",
      })
      if (response.ok) {
        const data = await response.json()
        setInstructions(data.instructions || [])
      }
    } catch (error) {
      console.error("Error loading instructions:", error)
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

      const response = await fetch("/admin/cms/instructions", {
        method,
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(body),
      })

      if (response.ok) {
        setShowForm(false)
        setEditingId(null)
        setFormData({
          title: "",
          description: "",
          image_url: "",
          sort_order: 0,
          is_active: true,
        })
        loadInstructions()
      }
    } catch (error) {
      console.error("Error saving:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (instruction: Instruction) => {
    setEditingId(instruction.id)
    setFormData({
      title: instruction.title,
      description: instruction.description || "",
      image_url: instruction.image_url || "",
      sort_order: instruction.sort_order,
      is_active: instruction.is_active,
    })
    setShowForm(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this instruction?")) return

    try {
      const response = await fetch(`/admin/cms/instructions?id=${id}`, {
        method: "DELETE",
        credentials: "include",
      })
      if (response.ok) {
        loadInstructions()
      }
    } catch (error) {
      console.error("Error deleting:", error)
    }
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
          setFormData((prev) => ({ ...prev, image_url: fileUrl }))
        }
      }
    } catch (error) {
      console.error("Error uploading file:", error)
    }
  }

  if (showForm) {
    return (
      <Container>
        <div className="mb-4">
          <Heading level="h1">{editingId ? "Edit" : "Create"} Hero Instruction</Heading>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
            />
          </div>

          <div>
            <Label htmlFor="image">Image</Label>
            <Input
              id="image"
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file)
              }}
            />
            {formData.image_url && (
              <div className="mt-2">
                <img src={formData.image_url} alt="Preview" className="w-32 h-32 object-cover rounded" />
                <Input
                  value={formData.image_url}
                  onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                  className="mt-2"
                  placeholder="Or enter image URL"
                />
              </div>
            )}
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
            <Button onClick={handleSave} disabled={loading || !formData.title}>
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
          <Heading level="h1">Hero Instructions</Heading>
          <Text className="text-gray-600 mt-2">
            Manage hero section introduction content
          </Text>
        </div>
        <Button onClick={() => setShowForm(true)}>Add New Instruction</Button>
      </div>

      {loading ? (
        <Text>Loading...</Text>
      ) : (
        <Table>
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Title</Table.HeaderCell>
              <Table.HeaderCell>Order</Table.HeaderCell>
              <Table.HeaderCell>Status</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {instructions.map((instruction) => (
              <Table.Row key={instruction.id}>
                <Table.Cell>{instruction.title}</Table.Cell>
                <Table.Cell>{instruction.sort_order}</Table.Cell>
                <Table.Cell>
                  <Badge color={instruction.is_active ? "green" : "red"}>
                    {instruction.is_active ? "Active" : "Inactive"}
                  </Badge>
                </Table.Cell>
                <Table.Cell>
                  <div className="flex gap-2">
                    <Button
                      variant="transparent"
                      onClick={() => handleEdit(instruction)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="transparent"
                      onClick={() => handleDelete(instruction.id)}
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

      {instructions.length === 0 && !loading && (
        <div className="text-center py-12">
          <Text className="text-gray-500">No instructions found. Create your first instruction!</Text>
        </div>
      )}
    </Container>
  )
}

export const config = {
  label: "Hero Instruction",
  icon: "DocumentText",
  parent: "CMS",
}

export default InstructionsPage

