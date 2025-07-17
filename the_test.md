# Programming Test Setup Guide

## Stack Overview

This is a **full-stack monorepo** with the following technologies:

### Frontend

- **Nodejs 22** - Runtime (check .nvmrc)
- **Nuxt 4** - Vue.js framework with SSR/SSG
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS** - Utility-first CSS framework
- **VueUse** - Vue composition utilities
- **nuxt-swiper** - Swiper.js integration for sliders

### Backend

- **Strapi 5** - Headless CMS with GraphQL
- **SQLite** - Database (development)
- **TypeScript** - Type-safe backend
- **Auto-generated types** - From Strapi schema

### Key Features

- **Monorepo structure** - Frontend and backend in one repository
- **Type generation** - Automatic TypeScript types from Strapi
- **GraphQL API** - Modern data fetching
- **Responsive design** - Mobile-first approach
- **SEO optimized** - Server-side rendering

## Getting Started

### 1. Extract and Setup

```bash
npm install
```

### 2. Environment Configuration

The `.env` files are included in the zip, they are already configured. Key environment variables:

**Backend (.env):**

- `DATABASE_CLIENT=sqlite`
- `DATABASE_FILENAME=.tmp/data.db`
- `JWT_SECRET=your-jwt-secret`
- `ADMIN_JWT_SECRET=your-admin-jwt-secret`

**Frontend (.env):**

- `NUXT_PUBLIC_STRAPI_URL=http://localhost:1337`
- `SITE_BASE_URL=http://localhost:3000`

### 3. Start Development Servers

```bash
npm run dev
```

- Strapi will start on `http://localhost:1337`
- Admin panel: `http://localhost:1337/admin` username: `admin@admin.com` password: `Admin123`
- Nuxt will start on `http://localhost:3000`

### 4. Generate Types

Types are already generated to get started, but if you change the backend run the regeneration.

```bash
npm run generate-types
```

## Project Structure

```
├── backend/                 # Strapi CMS
│   ├── src/
│   │   ├── api/            # Content types
│   │   ├── components/     # Reusable components
│   │   └── plugins/        # Custom plugins
│   ├── scripts/            # Type generation
│   └── package.json
├── frontend/               # Nuxt 3 app
│   ├── app/
│   │   ├── components/     # Vue components
│   │   ├── pages/          # Routes
│   │   └── composables/    # Reusable logic
│   ├── types/              # TypeScript types
│   └── package.json
└── locales/                # i18n translations
```

## Development Workflow

1. **Content Management**: Use Strapi admin panel to create content
2. **Frontend Development**: Build components in `frontend/app/components/`
3. **Type Safety**: Run `npm run generate-types` after schema changes
4. **Testing**: Both servers should run simultaneously

## Key Commands

```bash
# Backend
npm run dev              # Start Strapi
npm run generate-types   # Generate TypeScript types
npm run build           # Build for production

# Frontend
npm run dev             # Start Nuxt
npm run build          # Build for production
npm run generate       # Generate static site
```

## Programming Tasks

### Task 1: Header Dropdown Enhancement

- **Goal**: Add caret icon (Font Awesome SVG) to header menu dropdowns
- **Requirements**:
  - Icon should follow open/closed state
  - Change behavior from hover to click
  - Close on click away

### Task 2: English Site URL Fix

- **Goal**: Fix incorrect URLs in English site header
- **Issue**: All URLs wrong except "Locations"
- **Investigation needed**: Check i18n configuration, language correct link handling

### Task 3: Footer Menu Styling

- **Goal**: Fix footer menu links and styling
- **Requirements**:
  - Add proper links to menu items
  - Change layout from vertical to horizontal alignment
  - Improve visual presentation

### Task 4: Mobile Menu Implementation

- **Goal**: Create complete mobile menu system
- **Requirements**:
  - Hamburger button with open/close icon toggle
  - Drawer-style menu
  - No overlap with header
  - Lock page scroll when open
  - Close on navigation/locale change

### Task 5: Locale Change Enhancement

- **Goal**: Fix locale switching on non-homepage pages
- **Requirements**:
  - Query GraphQL for slug in target locale
  - Fallback to locale home if no translation exists
  - Consider using documentId approach (might/can be worst than the current solution)
  - Implement solution (composable/Pinia/other?)
- **Investigation**: GraphQL playground at `http://localhost:1337/graphql`

### Task 6: General Site CSS

- **Goal**: Create comprehensive responsive CSS system that handles general html elements not handled at the component level
- **Requirements**:
  - Responsive typography (h1-h6 hierarchy)
  - Consistent spacing system (margins/paddings)
  - Font choices and sizing (font-family, font-size, font-weight, line-height, letter-spacing, etc.)
  - Basically a global.css if you will

### Task 7: Hero Slider Autoplay

- **Goal**: make it work that 0 second is turned off and > 0 second is turned on with the correct delay
- **Requirements**:
  - Autoplay should work
  - Autoplay should be configurable

### Task 8: Layout Fix

- **Goal**: Fix layout max-width and width issues, make it work for all pages
- **Requirements**:
  - Container max-width handling, in the CMS the /standorte pages components are set with max-widths but the layout is not working as expected

### Task 9: Custom Margins/Paddings Fix

- **Goal**: Fix custom spacing functionality
- **Issue**: Custom margins/paddings not working in /standorte pages second component

### Task 10: Hero Slider with Text Overlay

- **Goal**: Create new hero slider variant with text content
- **Requirements**:
  - Optional title, body text, and CTAs / slide
  - Implement on both frontend and backend
  - Text overlay on slider images (optional)

### Task 11: Mobile Slider Fix

- **Goal**: Fix mobile slider image display
- **Issue**: Blank grey area on mobile, no images visible
- **Investigation**: Check responsive image handling

### Task 12: Header Scroll Behavior

- **Goal**: Implement smart header visibility
- **Requirements**:
  - Hide header on scroll down
  - Show header on scroll up (even slightly)
  - Always show header at top position

## Ready for Tasks

Once both servers are running and you can access:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:1337/admin`

You have 4 hours to complete as many tasks as possible. Keep in mind that this tasklist would be enough for more than 1 day of work, so try to prioritize and focus on the most important tasks that can be done within the time.

Please note where you finished within the time and what you would have done if you had more time.
