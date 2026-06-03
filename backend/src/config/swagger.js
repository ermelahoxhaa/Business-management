const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Business Management API',
    version: '1.0.0',
    description:
      'REST API for the Business Management project. Login with POST /auth/login, copy the access token, click Authorize and enter: Bearer <token>'
  },
  servers: [{ url: 'http://localhost:5000/api' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
    },
    parameters: {
      page: { name: 'page', in: 'query', schema: { type: 'integer', example: 1 } },
      limit: { name: 'limit', in: 'query', schema: { type: 'integer', example: 50 } },
      search: { name: 'search', in: 'query', schema: { type: 'string' } },
      sort: { name: 'sort', in: 'query', schema: { type: 'string' } },
      order: { name: 'order', in: 'query', schema: { type: 'string', enum: ['asc', 'desc'] } }
    }
  },
  security: [{ bearerAuth: [] }],
  paths: {
    '/auth/login': {
      post: {
        tags: ['Auth'],
        summary: 'Login',
        security: [],
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['email', 'password'],
                properties: {
                  email: { type: 'string', example: 'team-leader@example.com' },
                  password: { type: 'string', example: 'teamleader123' }
                }
              }
            }
          }
        },
        responses: { 200: { description: 'Returns accessToken, refreshToken and user' } }
      }
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        security: [],
        requestBody: {
          content: {
            'application/json': {
              schema: {
                type: 'object',
                properties: { refreshToken: { type: 'string' } }
              }
            }
          }
        }
      }
    },
    '/auth/logout': {
      post: { tags: ['Auth'], summary: 'Logout (revoke refresh token)' }
    },
    '/auth/signup': {
      post: { tags: ['Auth'], summary: 'Register employee account', security: [] }
    },
    '/auth/users': {
      get: { tags: ['Auth'], summary: 'List users (admin / team leader)' }
    },

    '/tasks': {
      get: {
        tags: ['Tasks'],
        summary: 'Search tasks (admin / team leader)',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
          { $ref: '#/components/parameters/search' },
          { $ref: '#/components/parameters/sort' },
          { $ref: '#/components/parameters/order' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['todo', 'in_progress', 'done'] } },
          { name: 'priority', in: 'query', schema: { type: 'string', enum: ['low', 'medium', 'high'] } }
        ]
      },
      post: { tags: ['Tasks'], summary: 'Create task (admin / team leader)' }
    },
    '/tasks/my-tasks': {
      get: { tags: ['Tasks'], summary: 'My assigned tasks (employee)' }
    },
    '/tasks/project/{projectId}': {
      get: { tags: ['Tasks'], summary: 'Tasks by project id' }
    },
    '/tasks/user/{userId}': {
      get: { tags: ['Tasks'], summary: 'Tasks by assigned user id' }
    },
    '/tasks/{id}': {
      get: { tags: ['Tasks'], summary: 'Get task by id' },
      put: { tags: ['Tasks'], summary: 'Update task' },
      delete: { tags: ['Tasks'], summary: 'Delete task' }
    },
    '/tasks/{id}/status': {
      patch: { tags: ['Tasks'], summary: 'Update task status (employee)' }
    },

    '/projects': {
      get: {
        tags: ['Projects'],
        summary: 'List / search projects',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
          { $ref: '#/components/parameters/search' }
        ]
      },
      post: { tags: ['Projects'], summary: 'Create project (team leader)' }
    },
    '/projects/my-projects': {
      get: { tags: ['Projects'], summary: 'My projects (employee)' }
    },
    '/projects/{id}': {
      get: { tags: ['Projects'], summary: 'Get project by id' },
      put: { tags: ['Projects'], summary: 'Update project' },
      delete: { tags: ['Projects'], summary: 'Delete project (admin)' }
    },

    '/employees': {
      get: {
        tags: ['Employees'],
        summary: 'Search employees',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
          { $ref: '#/components/parameters/search' }
        ]
      },
      post: { tags: ['Employees'], summary: 'Create employee (admin)' }
    },
    '/employees/me': {
      get: { tags: ['Employees'], summary: 'My employee profile (employee)' }
    },
    '/employees/{id}': {
      put: { tags: ['Employees'], summary: 'Update employee (admin)' }
    },
    '/employees/{id}/status': {
      patch: { tags: ['Employees'], summary: 'Update employment status (admin)' }
    },

    '/departments': {
      get: {
        tags: ['Departments'],
        summary: 'Search departments',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
          { $ref: '#/components/parameters/search' }
        ]
      },
      post: { tags: ['Departments'], summary: 'Create department (admin)' }
    },

    '/clients': {
      get: {
        tags: ['Clients'],
        summary: 'Search clients',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
          { $ref: '#/components/parameters/search' },
          { name: 'status', in: 'query', schema: { type: 'string', enum: ['active', 'inactive'] } }
        ]
      },
      post: { tags: ['Clients'], summary: 'Create client' }
    },
    '/clients/{id}': {
      get: { tags: ['Clients'], summary: 'Get client by id' },
      put: { tags: ['Clients'], summary: 'Update client' },
      delete: { tags: ['Clients'], summary: 'Delete client' }
    },

    '/invoices': {
      get: {
        tags: ['Invoices'],
        summary: 'Search invoices',
        parameters: [
          { $ref: '#/components/parameters/page' },
          { $ref: '#/components/parameters/limit' },
          { $ref: '#/components/parameters/search' },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['draft', 'sent', 'paid', 'overdue', 'cancelled'] }
          }
        ]
      },
      post: { tags: ['Invoices'], summary: 'Create invoice' }
    },
    '/invoices/{id}': {
      get: { tags: ['Invoices'], summary: 'Get invoice by id' },
      put: { tags: ['Invoices'], summary: 'Update invoice' },
      delete: { tags: ['Invoices'], summary: 'Delete invoice (admin)' }
    },

    '/comments': {
      post: { tags: ['Comments'], summary: 'Create comment on task' }
    },
    '/comments/task/{taskId}': {
      get: { tags: ['Comments'], summary: 'Get comments for task' }
    },
    '/comments/{id}': {
      put: { tags: ['Comments'], summary: 'Update comment' },
      delete: { tags: ['Comments'], summary: 'Delete comment' }
    },

    '/data-transfer/{entity}/export': {
      get: {
        tags: ['Data transfer'],
        summary: 'Export entity data',
        parameters: [
          {
            name: 'entity',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['tasks', 'projects', 'employees', 'departments', 'clients', 'invoices']
            }
          },
          { name: 'format', in: 'query', required: true, schema: { type: 'string', enum: ['csv', 'json', 'xlsx'] } }
        ]
      }
    },
    '/data-transfer/{entity}/import': {
      post: {
        tags: ['Data transfer'],
        summary: 'Import entity from file (multipart form, field: file)',
        parameters: [
          {
            name: 'entity',
            in: 'path',
            required: true,
            schema: {
              type: 'string',
              enum: ['tasks', 'projects', 'employees', 'departments', 'clients', 'invoices']
            }
          }
        ]
      }
    },

    '/reports/types': {
      get: { tags: ['Reports'], summary: 'List available report types' }
    },
    '/reports/{type}/preview': {
      get: { tags: ['Reports'], summary: 'Preview report (query filters)' }
    },
    '/reports/{type}/export': {
      get: {
        tags: ['Reports'],
        summary: 'Export report',
        parameters: [
          { name: 'format', in: 'query', schema: { type: 'string', enum: ['xlsx', 'csv', 'json', 'pdf'] } }
        ]
      }
    },

    '/notifications': {
      get: { tags: ['Notifications'], summary: 'List my notifications' }
    },
    '/notifications/read-all': {
      patch: { tags: ['Notifications'], summary: 'Mark all notifications as read' }
    },
    '/notifications/{id}/read': {
      patch: { tags: ['Notifications'], summary: 'Mark one notification as read' }
    },

    '/activity': {
      get: { tags: ['Activity'], summary: 'Recent activity feed (MongoDB)' }
    }
  }
}

export default swaggerSpec
