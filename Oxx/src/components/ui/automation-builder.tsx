"use client"

import * as React from "react"
import { useState } from "react"
import { Plus, Trash2, Save, Play, Settings, Zap, Clock, Webhook, FileText, MessageSquare, Ticket, BookOpen, Square, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

interface TriggerConfig {
  type: string
  condition: Record<string, any>
}

interface ActionConfig {
  type: string
  config: Record<string, any>
}

interface Automation {
  id?: string
  name: string
  description?: string
  enabled: boolean
  trigger: TriggerConfig
  actions: ActionConfig[]
}

const triggerTypes = [
  {
    value: "formbricks_score",
    label: "Formbricks Score",
    description: "When survey score is below threshold",
    icon: Square,
    fields: [
      { name: "surveyId", label: "Survey ID", type: "text" },
      { name: "threshold", label: "Score Threshold", type: "number" }
    ]
  },
  {
    value: "schedule",
    label: "Schedule",
    description: "Run on a schedule",
    icon: Clock,
    fields: [
      { name: "cron", label: "Cron Expression", type: "text", placeholder: "0 9 * * *" }
    ]
  },
  {
    value: "webhook",
    label: "Webhook",
    description: "Triggered by webhook call",
    icon: Webhook,
    fields: [
      { name: "id", label: "Webhook ID", type: "text" },
      { name: "headers", label: "Expected Headers", type: "json", placeholder: '{"Content-Type": "application/json"}' }
    ]
  },
  {
    value: "interval",
    label: "Interval",
    description: "Run at regular intervals",
    icon: Clock,
    fields: [
      { name: "interval", label: "Interval (minutes)", type: "number" }
    ]
  }
]

const actionTypes = [
  {
    value: "zammad_create_ticket",
    label: "Create Zammad Ticket",
    description: "Create a support ticket",
    icon: Ticket,
    fields: [
      { name: "title", label: "Title", type: "text" },
      { name: "description", label: "Description", type: "textarea" },
      { name: "priority", label: "Priority", type: "select", options: ["low", "medium", "high"] }
    ]
  },
  {
    value: "matrix_send_message",
    label: "Send Matrix Message",
    description: "Send message to chat room",
    icon: MessageSquare,
    fields: [
      { name: "room", label: "Room ID", type: "text" },
      { name: "message", label: "Message", type: "textarea" }
    ]
  },
  {
    value: "planka_create_project",
    label: "Create Planka Project",
    description: "Create a new project",
    icon: FileText,
    fields: [
      { name: "name", label: "Project Name", type: "text" },
      { name: "description", label: "Description", type: "textarea" }
    ]
  },
  {
    value: "outline_create_page",
    label: "Create Outline Page",
    description: "Create a wiki page",
    icon: BookOpen,
    fields: [
      { name: "title", label: "Page Title", type: "text" },
      { name: "content", label: "Content", type: "textarea" },
      { name: "parentPath", label: "Parent Path", type: "text" }
    ]
  },
  {
    value: "joplin_create_note",
    label: "Create Joplin Note",
    description: "Create a note",
    icon: File,
    fields: [
      { name: "title", label: "Note Title", type: "text" },
      { name: "content", label: "Content", type: "textarea" },
      { name: "notebook", label: "Notebook", type: "text" }
    ]
  },
  {
    value: "http_request",
    label: "HTTP Request",
    description: "Make HTTP request",
    icon: Webhook,
    fields: [
      { name: "method", label: "Method", type: "select", options: ["GET", "POST", "PUT", "DELETE"] },
      { name: "url", label: "URL", type: "text" },
      { name: "headers", label: "Headers", type: "json", placeholder: '{"Content-Type": "application/json"}' },
      { name: "data", label: "Data", type: "json", placeholder: '{"key": "value"}' }
    ]
  }
]

interface AutomationBuilderProps {
  automation?: Automation
  onSave: (automation: Automation) => void
  onTest?: (automation: Automation) => void
}

export function AutomationBuilder({ automation, onSave, onTest }: AutomationBuilderProps) {
  const [formData, setFormData] = useState<Automation>(automation || {
    name: "",
    description: "",
    enabled: true,
    trigger: {
      type: "",
      condition: {}
    },
    actions: []
  })

  const [selectedTrigger, setSelectedTrigger] = useState<string>(automation?.trigger?.type || "")
  const [isTesting, setIsTesting] = useState(false)

  const updateTrigger = (type: string, condition: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      trigger: { type, condition }
    }))
  }

  const addAction = () => {
    setFormData(prev => ({
      ...prev,
      actions: [...prev.actions, { type: "", config: {} }]
    }))
  }

  const updateAction = (index: number, type: string, config: Record<string, any>) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.map((action, i) => 
        i === index ? { type, config } : action
      )
    }))
  }

  const removeAction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      actions: prev.actions.filter((_, i) => i !== index)
    }))
  }

  const handleSave = () => {
    if (!formData.name || !formData.trigger.type || formData.actions.length === 0) {
      alert("Please fill in all required fields")
      return
    }
    onSave(formData)
  }

  const handleTest = async () => {
    if (!formData.name || !formData.trigger.type || formData.actions.length === 0) {
      alert("Please fill in all required fields")
      return
    }

    setIsTesting(true)
    try {
      if (onTest) {
        await onTest(formData)
      }
    } catch (error) {
      console.error("Test failed:", error)
      alert("Test failed. Check console for details.")
    } finally {
      setIsTesting(false)
    }
  }

  const renderField = (field: any, value: any, onChange: (value: any) => void) => {
    switch (field.type) {
      case "text":
        return (
          <Input
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
          />
        )
      case "textarea":
        return (
          <Textarea
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            placeholder={field.placeholder}
            rows={3}
          />
        )
      case "number":
        return (
          <Input
            type="number"
            value={value || ""}
            onChange={(e) => onChange(Number(e.target.value))}
          />
        )
      case "select":
        return (
          <Select value={value || ""} onValueChange={onChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select option" />
            </SelectTrigger>
            <SelectContent>
              {field.options?.map((option: string) => (
                <SelectItem key={option} value={option}>
                  {option}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )
      case "json":
        return (
          <Textarea
            value={typeof value === "object" ? JSON.stringify(value, null, 2) : value || ""}
            onChange={(e) => {
              try {
                onChange(e.target.value ? JSON.parse(e.target.value) : {})
              } catch {
                onChange(e.target.value)
              }
            }}
            placeholder={field.placeholder}
            rows={4}
            className="font-mono text-sm"
          />
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Automation Settings
          </CardTitle>
          <CardDescription>
            Configure your automation workflow
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name *</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="My Automation"
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <div className="flex items-center space-x-2">
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, enabled: checked }))}
                />
                <span className="text-sm">{formData.enabled ? "Enabled" : "Disabled"}</span>
              </div>
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe what this automation does..."
              rows={2}
            />
          </div>
        </CardContent>
      </Card>

      {/* Trigger Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Trigger
          </CardTitle>
          <CardDescription>
            When should this automation run?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Trigger Type *</label>
            <Select value={selectedTrigger} onValueChange={(value) => {
              setSelectedTrigger(value)
              const triggerType = triggerTypes.find(t => t.value === value)
              if (triggerType) {
                const condition: Record<string, any> = {}
                triggerType.fields.forEach(field => {
                  if (field.type === "number") {
                    condition[field.name] = 0
                  } else if (field.type === "json") {
                    condition[field.name] = {}
                  } else {
                    condition[field.name] = ""
                  }
                })
                updateTrigger(value, condition)
              }
            }}>
              <SelectTrigger>
                <SelectValue placeholder="Select trigger type" />
              </SelectTrigger>
              <SelectContent>
                {triggerTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    <div className="flex items-center gap-2">
                      <type.icon className="h-4 w-4" />
                      <div>
                        <div className="font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">{type.description}</div>
                      </div>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedTrigger && (
            <div className="space-y-4">
              <div className="text-sm font-medium">Trigger Configuration</div>
              {triggerTypes.find(t => t.value === selectedTrigger)?.fields.map((field) => (
                <div key={field.name} className="space-y-2">
                  <label className="text-sm font-medium">{field.label}</label>
                  {renderField(
                    field,
                    formData.trigger.condition[field.name],
                    (value) => updateTrigger(selectedTrigger, {
                      ...formData.trigger.condition,
                      [field.name]: value
                    })
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Play className="h-5 w-5" />
            Actions
          </CardTitle>
          <CardDescription>
            What should happen when the trigger fires?
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {formData.actions.map((action, index) => (
            <Card key={index} className="border-dashed">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm">Action {index + 1}</CardTitle>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAction(index)}
                    className="text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Action Type</label>
                  <Select 
                    value={action.type} 
                    onValueChange={(value) => {
                      const actionType = actionTypes.find(a => a.value === value)
                      if (actionType) {
                        const config: Record<string, any> = {}
                        actionType.fields.forEach(field => {
                          if (field.type === "number") {
                            config[field.name] = 0
                          } else if (field.type === "json") {
                            config[field.name] = {}
                          } else {
                            config[field.name] = ""
                          }
                        })
                        updateAction(index, value, config)
                      }
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select action type" />
                    </SelectTrigger>
                    <SelectContent>
                      {actionTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            <div>
                              <div className="font-medium">{type.label}</div>
                              <div className="text-xs text-muted-foreground">{type.description}</div>
                            </div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {action.type && (
                  <div className="space-y-4">
                    <div className="text-sm font-medium">Action Configuration</div>
                    {actionTypes.find(a => a.value === action.type)?.fields.map((field) => (
                      <div key={field.name} className="space-y-2">
                        <label className="text-sm font-medium">{field.label}</label>
                        {renderField(
                          field,
                          action.config[field.name],
                          (value) => updateAction(index, action.type, {
                            ...action.config,
                            [field.name]: value
                          })
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Button
            type="button"
            variant="outline"
            onClick={addAction}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Action
          </Button>
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex justify-between">
        <div className="flex gap-2">
          {onTest && (
            <Button
              variant="outline"
              onClick={handleTest}
              disabled={isTesting}
            >
              <Play className="h-4 w-4 mr-2" />
              {isTesting ? "Testing..." : "Test Automation"}
            </Button>
          )}
        </div>
        <Button onClick={handleSave}>
          <Save className="h-4 w-4 mr-2" />
          Save Automation
        </Button>
      </div>
    </div>
  )
}