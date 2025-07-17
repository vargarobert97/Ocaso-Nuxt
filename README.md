# Strapi + Nuxt Monorepo

A full-stack monorepo with Strapi backend and Nuxt frontend.

## Structure

```
├── frontend/          # Nuxt 3 application
├── backend/           # Strapi 4 application
├── package.json       # Root workspace configuration
└── README.md
```

## Prerequisites

- Node.js >= 24.0.0
- npm >= 10.0.0
- SQLite (for local development)

## Quick Start

1. **Install dependencies:**
   ```bash
   npm run install:all
   ```

2. **Setup environment files:**
   ```bash
   cp frontend/env.example frontend/.env
   cp backend/env.example backend/.env
   ```

3. **Start development servers:**
   ```bash
   npm run dev
   ```

   This will start:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:1337

4. **Access Strapi Admin:**
   - Go to http://localhost:1337/admin
   - Create your first admin user

## Available Scripts

### Root Level
- `npm run dev` - Start both frontend and backend in development mode
- `npm run build` - Build both applications
- `npm run start` - Start both applications in production mode
- `npm run clean` - Clean build artifacts
- `npm run generate-types` - Generate TypeScript types from Strapi schema
- `npm run test` - Run all tests
- `npm run test:coverage` - Run tests with coverage

### Frontend (Nuxt)
- `npm run dev:frontend` - Start Nuxt development server
- `npm run build:frontend` - Build Nuxt application
- `npm run start:frontend` - Start Nuxt production server
- `npm run test:frontend` - Run frontend tests

### Backend (Strapi 5)
- `npm run dev:backend` - Start Strapi development server
- `npm run build:backend` - Build Strapi application
- `npm run start:backend` - Start Strapi production server
- `npm run generate-types` - Generate TypeScript types from schema
- `npm run test:backend` - Run backend tests

## Development

### Frontend (Nuxt 3)
- Located in `frontend/`
- Uses Nuxt 3 with latest features
- Configured for Vercel deployment
- Includes Vitest testing setup

### Backend (Strapi 5)
- Located in `backend/`
- Uses Strapi 5 with SQLite for local development
- Configured for Strapi Cloud deployment
- Auto-generates TypeScript types from content schema
- Includes Jest testing setup

## Deployment

### Frontend (Vercel)
The frontend is configured for Vercel deployment. The build process will automatically handle the Nuxt build.

### Backend (Strapi Cloud)
Due to Strapi Cloud limitations with monorepos, we use a `backend-prod` branch approach:

1. Create a `backend-prod` branch containing only the backend code
2. Deploy this branch to Strapi Cloud
3. Use GitHub Actions to automatically rebuild when needed

## Environment Variables

### Frontend
Create `frontend/.env`:
```env
NUXT_PUBLIC_STRAPI_URL=http://localhost:1337
NUXT_PUBLIC_STRAPI_TOKEN=your-strapi-token
```

### Backend
Create `backend/.env`:
```env
HOST=0.0.0.0
PORT=1337
APP_KEYS=your-app-keys
API_TOKEN_SALT=your-api-token-salt
ADMIN_JWT_SECRET=your-admin-jwt-secret
JWT_SECRET=your-jwt-secret
```

## Database

- **Development**: SQLite (file-based, no setup required)
- **Production**: Configure in Strapi Cloud dashboard

## TypeScript Integration

The monorepo includes automatic TypeScript type generation from your Strapi content schema:

1. **Create content types** in Strapi admin panel
2. **Generate types** by running: `npm run generate-types`
3. **Import types** in your frontend components:
   ```typescript
   import type { Article, User } from '~/types/strapi'
   
   const { get } = useStrapi()
   const { data: articles } = await get<Article[]>('/articles')
   ```

## Strapi Integration

The project uses the official `@nuxtjs/strapi` module with generated TypeScript types:

### Official Module (`@nuxtjs/strapi`)
- Provides: `useStrapiClient()`, `useStrapiUser()`, `useStrapiAuth()`
- Full CRUD operations: `find()`, `findOne()`, `create()`, `update()`, `delete()`
- Authentication and user management
- Built-in caching and error handling

### Usage Examples:
```typescript
// Import generated types
import type { Article } from '~/types/strapi'

// Use official module
const { find } = useStrapiClient()
const { data: articles } = await find<Article[]>('articles', { 
  populate: '*' 
})
```

## Contributing

1. Make changes in the monorepo
2. Test locally with `npm run dev`
3. Generate types if you modified Strapi schema: `npm run generate-types`
4. Run tests: `npm run test`
5. Commit changes (pre-commit hook will auto-generate types if needed)
6. Push changes (pre-push hook will run all tests)
7. For backend changes, the GitHub Action will handle the `backend-prod` branch update

## Git Hooks

The project includes automated git hooks:

- **Pre-commit**: Automatically generates TypeScript types when Strapi schema changes
- **Pre-push**: Runs all tests before pushing to ensure code quality 