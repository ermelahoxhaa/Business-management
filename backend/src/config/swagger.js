const swaggerSpec = {
  openapi: '3.0.0',
  info: {
    title: 'Business Management API',
    version: '1.0.0',
    description: 'REST API for business management with JWT, permissions, search, export/import, and reports.'
  },
  servers: [{ url: 'http://localhost:5000/api' }],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT'
      }
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
                properties: {
                  email: { type: 'string' },
                  password: { type: 'string' }
                }
              }
            }
          }
        }
      }
    },
    '/auth/refresh': {
      post: {
        tags: ['Auth'],
        summary: 'Refresh access token',
        security: [],
        requestBody: {
          required: true,
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
      post: {
        tags: ['Auth'],
        summary: 'Logout and revoke refresh token'
      }
    },
    '/auth/signup': {
      post: {
        tags: ['Auth'],
        summary: 'Register employee account',
        security: []
      }
    },
    '/tasks': {
      get: { tags: ['Tasks'], summary: 'Search tasks' },
      post: { tags: ['Tasks'], summary: 'Create task' }
    },
    '/tasks/my-tasks': {
      get: { tags: ['Tasks'], summary: 'Employee assigned tasks' }
    },
    '/projects': {
      get: { tags: ['Projects'], summary: 'Search projects' },
      post: { tags: ['Projects'], summary: 'Create project' }
    },
    '/employees': {
      get: { tags: ['Employees'], summary: 'Search employees' },
      post: { tags: ['Employees'], summary: 'Create employee' }
    },
    '/departments': {
      get: { tags: ['Departments'], summary: 'Search departments' },
      post: { tags: ['Departments'], summary: 'Create department' }
    },
    '/clients': {
      get: { tags: ['Clients'], summary: 'Search clients' },
      post: { tags: ['Clients'], summary: 'Create client' }
    },
    '/data-transfer/{entity}/export': {
      get: { tags: ['Data transfer'], summary: 'Export entity data (csv, json, xlsx)' }
    },
    '/data-transfer/{entity}/import': {
      post: { tags: ['Data transfer'], summary: 'Import entity data from file' }
    },
    '/reports/types': {
      get: { tags: ['Reports'], summary: 'List report types' }
    },
    '/reports/{type}/preview': {
      get: { tags: ['Reports'], summary: 'Preview report' }
    },
    '/reports/{type}/export': {
      get: { tags: ['Reports'], summary: 'Export report (xlsx, csv, json, pdf)' }
    },
    '/notifications': {
      get: { tags: ['Notifications'], summary: 'List user notifications' }
    },
    '/notifications/{id}/read': {
      patch: { tags: ['Notifications'], summary: 'Mark notification as read' }
    },
    '/activity': {
      get: { tags: ['Activity'], summary: 'Recent activity feed (MongoDB)' }
    }
  }
}

export default swaggerSpec
