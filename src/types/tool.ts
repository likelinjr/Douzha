interface JSONSchemaProperty {
  type: "string" | "number" | "integer" | "object" | "array" | "boolean"
  description?: string
  enum?: string[]
  properties?: Record<string, JSONSchemaProperty>
  required?: string[]
  items?: JSONSchemaProperty
}

export interface ToolDefinition {
  type: "function"
  function: {
    name: string
    description: string
    parameters: {
      type: "object"
      properties: Record<string, JSONSchemaProperty>
      required?: readonly string[] | string[]
    }
  }
}

export interface planStepType {
  task: string
  status: 'todo' | 'doing' | 'done'
  result: string
}

