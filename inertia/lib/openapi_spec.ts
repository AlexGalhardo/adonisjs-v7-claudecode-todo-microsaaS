/**
 * Hand-written OpenAPI 3.0 document for the JSON API under /api — mirrors
 * docs/api.md. Kept inline (not a separate file the Scalar viewer fetches
 * over the network) so /profile/api never depends on that request
 * succeeding.
 */
export function buildOpenApiSpec(baseUrl: string) {
  const todoSchema = {
    type: 'object',
    properties: {
      id: { type: 'integer', example: 1 },
      title: { type: 'string', example: 'Buy milk' },
      description: { type: 'string', nullable: true, example: 'Whole milk, 2 liters' },
      completed: { type: 'boolean', example: false },
      createdAt: { type: 'string', format: 'date-time' },
      updatedAt: { type: 'string', format: 'date-time' },
    },
  }

  return {
    openapi: '3.0.3',
    info: {
      title: 'Todo API',
      version: '1.0.0',
      description:
        'REST API for managing todos. Authenticate once via /api/login, then send the returned token as a Bearer token on every other request.',
    },
    servers: [{ url: baseUrl }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer' },
      },
      schemas: {
        Todo: todoSchema,
      },
    },
    paths: {
      '/api/login': {
        post: {
          summary: 'Log in and obtain an API token',
          tags: ['Authentication'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                  },
                },
                example: { email: 'admin@gmail.com', password: 'adminBR@123' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Token issued',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      type: { type: 'string', example: 'bearer' },
                      token: { type: 'string', example: 'oat_1.abc123...' },
                      abilities: { type: 'array', items: { type: 'string' } },
                      expiresAt: { type: 'string', format: 'date-time', nullable: true },
                    },
                  },
                },
              },
            },
            '400': { description: 'Invalid credentials' },
          },
        },
      },
      '/api/logout': {
        post: {
          summary: 'Invalidate the current token',
          tags: ['Authentication'],
          security: [{ bearerAuth: [] }],
          responses: { '204': { description: 'Token invalidated' } },
        },
      },
      '/api/todos': {
        get: {
          summary: "List the authenticated user's todos",
          tags: ['Todos'],
          security: [{ bearerAuth: [] }],
          responses: {
            '200': {
              description: 'A list of todos',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: { data: { type: 'array', items: todoSchema } },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Create a todo',
          tags: ['Todos'],
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['title'],
                  properties: {
                    title: { type: 'string', minLength: 1, maxLength: 255 },
                    description: { type: 'string', nullable: true },
                    completed: { type: 'boolean' },
                  },
                },
                example: { title: 'Buy milk', description: 'Whole milk, 2 liters' },
              },
            },
          },
          responses: {
            '201': {
              description: 'Todo created',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { data: todoSchema } },
                },
              },
            },
            '422': { description: 'Validation error' },
          },
        },
      },
      '/api/todos/{id}': {
        get: {
          summary: 'Get a single todo',
          tags: ['Todos'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            '200': {
              description: 'A todo',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { data: todoSchema } },
                },
              },
            },
            '403': { description: "Not this user's todo" },
            '404': { description: 'Not found' },
          },
        },
        put: {
          summary: 'Update a todo',
          tags: ['Todos'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    title: { type: 'string', minLength: 1, maxLength: 255 },
                    description: { type: 'string', nullable: true },
                    completed: { type: 'boolean' },
                  },
                },
                example: { completed: true },
              },
            },
          },
          responses: {
            '200': {
              description: 'Todo updated',
              content: {
                'application/json': {
                  schema: { type: 'object', properties: { data: todoSchema } },
                },
              },
            },
            '403': { description: "Not this user's todo" },
            '422': { description: 'Validation error' },
          },
        },
        delete: {
          summary: 'Delete a todo',
          tags: ['Todos'],
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'integer' } }],
          responses: {
            '204': { description: 'Todo deleted' },
            '403': { description: "Not this user's todo" },
          },
        },
      },
    },
  }
}
