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

export interface ToolCall {
    id: string
    type: 'function'
    function: {
        name: string
        arguments: string
    }
}

export interface TextContent {
  type: "text"
  text: string
  annotations?: Annotations
}

export interface ImageContent {
  type: "image"
  data: string
  mimeType: string
  annotations?: Annotations
}

export interface AudioContent {
  type: "audio"
  data: string
  mimeType: string
  annotations?: Annotations
}

export interface ResourceLinkContent {
  type: "resource_link"
  uri: string
  name: string
  description?: string
  mimeType?: string
  annotations?: Annotations
}

export interface EmbeddedResourceContent {
  type: "resource"
  resource: {
    uri: string
    mimeType: string
    text?: string
    blob?: string
    annotations?: Annotations
  }
}

export interface Annotations {
  audience?: ("user" | "assistant")[]
  priority?: number
  lastModified?: string
}

export type ToolContentItem =
  | TextContent
  | ImageContent
  | AudioContent
  | ResourceLinkContent
  | EmbeddedResourceContent

export interface ToolResult {
  content: ToolContentItem[]
  isError?: boolean
}


export type ToolHandler = (args: any) => Promise<ToolResult>
export type ToolHandlers = Record<string, ToolHandler>
