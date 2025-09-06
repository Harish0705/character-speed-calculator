# Gaming Character Speed Calculator API

A serverless REST API built with TypeScript and Express.js that calculates gaming character speed based on terrain inclines, with JWT-based authentication using AWS Cognito.

## 🏗️ Architecture

### AWS Services Used
- **Amazon Q Developer** - Generative AI coding assitant
- **AWS Lambda** - Serverless compute for API execution
- **API Gateway** - HTTP API endpoint management
- **AWS Cognito** - User authentication and JWT token management
- **AWS Systems Manager Parameter Store** - Configuration storage
- **AWS Secrets Manager** - Secure storage of sensitive data
- **AWS CloudWatch** - Logging and monitoring
- **AWS CloudFormation** - Infrastructure as Code (via CDK)

### Technology Stack
- **Runtime**: Node.js 18.x
- **Language**: TypeScript
- **Framework**: Express.js
- **Infrastructure**: AWS CDK
- **Authentication**: AWS Cognito + JWT
- **Deployment**: Serverless (AWS Lambda)

### AWS Configuration
- **Parameter Store**: Non-sensitive configuration
- **Secrets Manager**: Cognito client secret
- **IAM Roles**: Lambda execution permissions


### 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **AWS Cognito**: Managed user authentication service
- **Secrets Management**: Sensitive data stored in AWS Secrets Manager
- **IAM Roles**: Least-privilege access for Lambda functions
- **Input Validation**: Server-side validation for all inputs

### 📊 Monitoring & Logging

- **CloudWatch Logs**: Centralized logging for debugging
- **Lambda Metrics**: Performance and error monitoring
- **API Gateway Metrics**: Request/response monitoring

## 🧮 Speed Calculation Logic

The API calculates character speed based on terrain inclines:

- **Uphill (positive incline)**: Speed decreases by incline value
- **Downhill (negative incline)**: Speed increases by absolute incline value
- **Flat terrain (0 incline)**: No speed change
- **Minimum speed**: Never goes below 0
- **Validation**: Incline angles must be < 90 degrees

**Examples:**
- Initial speed: 60
- Inclines: [0, 30, 0, -45, 0]
- Calculation: 60 → 60 → 30 → 30 → 75 → 75
- Final speed: 75

- Initial speed: 50
- Inclines: [0, 30, 0, -45, 0, 70]
- Calculation: 50 → 50 → 20 → 20 → 65 → 65 → 0
- Final speed: 0 
- When the final speed value less than or equal to 0, here final speed is -5, therefore result is 0


- Initial speed: 60
- Inclines: [0, 90, 0, -45, 0]
- Error: Invalid incline: 90. Magnitude must be less than 90 degrees.

## 📁 Project Structure

```
src/
├── auth/
│   ├── authControllers.ts    # Authentication business logic
│   ├── authRoutes.ts         # Authentication route definitions
│   ├── cognitoService.ts     # AWS Cognito integration
│   └── middleware.ts         # JWT verification middleware
├── speedCalculator.ts        # Speed calculation logic
├── validation.ts             # Input validation and JSON parsing
├── swagger.ts                # Swagger/OpenAPI documentation
├── index.ts                  # Local development server
└── lambda.ts                 # AWS Lambda handler

infrastructure/
├── gaming-api-stack.ts       # CDK infrastructure definition
└── app.ts                    # CDK app entry point

cdk.json                      # CDK configuration
package.json                  # Dependencies and scripts
.gitignore                    # Git ignore rules
```

## 🛠️ Setup & Installation

### Prerequisites
- Node.js 18.x or higher
- AWS CLI configured
- AWS CDK installed globally

### Local Development

1. **Clone and install dependencies**
   ```bash
   git clone <repository-url>
   cd character-speed-calculator
   npm install
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   # Update .env with your AWS Cognito details
   ```

3. **Run locally**
   ```bash
   npm run dev
   ```
   API will be available at `http://localhost:3000`

### AWS Deployment

1. **Bootstrap CDK (first time only)**
   ```bash
   npx cdk bootstrap --region us-east-1
   ```

2. **Deploy to AWS**
   ```bash
   npm run cdk:deploy
   ```

3. **Add Cognito User Pool ID and Client and Client Secret to Parameter Store**
   ```bash
   aws secretsmanager put-secret-value \
     --secret-id "gaming-api/cognito-client-secret" \
     --secret-string "YOUR_CLIENT_SECRET" \
     --region us-east-1

   aws ssm put-parameter \
     --name "/cdk/cognito-user-pool-id" \
     --value "us-east-1_Eh2WlYG03" \
     --type "String" \
     --region us-east-1

   aws ssm put-parameter \
      --name "/cdk/cognito-client-id" \
      --value "18p1ahbbohrqqnh4ohe9kum76e" \
      --type "String" \
      --region us-east-1
   ```

## 📚 API Endpoints

### Authentication

**Register User**
```bash
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

**Login**
```bash
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123!"
}
```

### Speed Calculator (Protected)

**Calculate Speed**
```bash
POST /calculate-speed
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json

{
  "initialSpeed": 60,
  "inclines": [0, 30, 0, -45, 0]
}
```

**Response**
```json
{
  "finalSpeed": 75
}
```

## 🔧 Configuration

### Environment Variables (Local)
```env
PORT=300
# AWS Cognito Configuration
AWS_REGION= 'Your AWS Region'
COGNITO_USER_POOL_ID='Your User Pool ID'
COGNITO_CLIENT_ID='Your Client Id'
COGNITO_CLIENT_SECRET='Your Client Secret'

AWS_ACCESS_KEY_ID='Your User Access Key ID'
AWS_SECRET_ACCESS_KEY='Your User Access Key Secret'
```

## 🚀 Deployment Commands

```bash
# Local development
npm run dev

# Build for Lambda
npm run build:lambda

# Deploy infrastructure
npm run cdk:deploy

# View infrastructure changes
npm run cdk:diff

# Destroy infrastructure
npm run cdk:destroy
```