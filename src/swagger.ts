import swaggerJsdoc from 'swagger-jsdoc';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Gaming Character Speed Calculator API',
      version: '1.0.0',
      description: 'A serverless REST API that calculates gaming character speed based on terrain inclines with JWT authentication',
    },
    servers: [
      {
        url: process.env.NODE_ENV === 'production' 
          ? 'https://a75qrd80jh.execute-api.us-east-1.amazonaws.com/prod'
          : 'http://localhost:3000',
        description: process.env.NODE_ENV === 'production' ? 'Production server' : 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
      schemas: {
        RegisterRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'gamer@example.com',
            },
            password: {
              type: 'string',
              minLength: 8,
              example: 'Password123!',
            },
          },
        },
        LoginRequest: {
          type: 'object',
          required: ['email', 'password'],
          properties: {
            email: {
              type: 'string',
              format: 'email',
              example: 'gamer@example.com',
            },
            password: {
              type: 'string',
              example: 'Password123!',
            },
          },
        },
        SpeedCalculationRequest: {
          type: 'object',
          required: ['initialSpeed', 'inclines'],
          properties: {
            initialSpeed: {
              type: 'number',
              minimum: 0,
              example: 60,
            },
            inclines: {
              type: 'array',
              items: {
                type: 'number',
                minimum: -89,
                maximum: 89,
              },
              example: [0, 30, 0, -45, 0],
            },
          },
        },
        SpeedCalculationResponse: {
          type: 'object',
          properties: {
            finalSpeed: {
              type: 'number',
              example: 75,
            },
          },
        },
        AuthResponse: {
          type: 'object',
          properties: {
            message: {
              type: 'string',
              example: 'Login successful',
            },
            accessToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            refreshToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            idToken: {
              type: 'string',
              example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              example: 'Invalid input',
            },
          },
        },
      },
    },
    paths: {
      '/auth/register': {
        post: {
          tags: ['Authentication'],
          summary: 'Register a new user',
          description: 'Create a new user account with email and password',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/RegisterRequest',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Server Response',
            },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Authentication'],
          summary: 'Login user',
          description: 'Authenticate user and return JWT tokens',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/LoginRequest',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Server Response',
            },
          },
        },
      },
      '/calculate-speed': {
        post: {
          tags: ['Speed Calculator'],
          summary: 'Calculate character speed',
          description: 'Calculate final character speed based on initial speed and terrain inclines',
          security: [
            {
              bearerAuth: [],
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  $ref: '#/components/schemas/SpeedCalculationRequest',
                },
              },
            },
          },
          responses: {
            200: {
              description: 'Server Response',
            },
          },
        },
      },
    },
  },
  apis: [], // No file-based documentation needed since we define everything above
};

export const specs = swaggerJsdoc(options);