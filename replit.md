# OrderFlow - Order Management System

## Overview

OrderFlow is a full-stack order management web application built with React (frontend) and Node.js/Express (backend). The application provides a comprehensive dashboard for managing customer orders, including creation, editing, deletion, and tracking of order statuses. It features a modern UI built with shadcn/ui components and uses PostgreSQL for data persistence.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **State Management**: TanStack Query (React Query) for server state management
- **UI Framework**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with CSS variables for theming
- **Form Handling**: React Hook Form with Zod validation
- **Build Tool**: Vite for development and production builds

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Validation**: Zod schemas for request/response validation
- **Development**: tsx for TypeScript execution in development

### Database Design
The application uses two main tables:
- **orders**: Core order information (customer details, status, total, timestamps)
- **order_items**: Individual line items for each order (product name, quantity, price)

The schema supports order statuses: pending, processing, completed, cancelled.

## Key Components

### Backend Components
1. **Storage Layer** (`server/storage.ts`): Abstracted data access layer with in-memory implementation for development
2. **Routes** (`server/routes.ts`): RESTful API endpoints for order management
3. **Schema** (`shared/schema.ts`): Shared database schema and validation types
4. **Server Setup** (`server/index.ts`): Express server configuration with middleware

### Frontend Components
1. **Dashboard** (`client/src/pages/dashboard.tsx`): Main application interface
2. **Order Management**: 
   - OrderModal for creating/editing orders
   - OrdersTable for displaying and managing order lists
   - StatsCards for displaying key metrics
3. **UI Components**: Comprehensive set of shadcn/ui components for consistent design
4. **Sidebar Navigation**: Fixed navigation with order management features

## Data Flow

1. **Order Creation**: User fills form → validation → API request → database insert → UI update
2. **Order Retrieval**: Dashboard loads → API request → database query → UI render
3. **Order Updates**: User edits → validation → API request → database update → UI refresh
4. **Search/Filter**: User input → API request with query parameters → filtered results

The application uses React Query for caching and synchronization, ensuring efficient data fetching and optimistic updates.

## External Dependencies

### Core Dependencies
- **Database**: Neon PostgreSQL serverless database
- **UI Framework**: Radix UI primitives for accessible components
- **Validation**: Zod for runtime type checking and validation
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation
- **HTTP Client**: Native fetch API with React Query wrapper

### Development Dependencies
- **TypeScript**: Full TypeScript support across frontend and backend
- **Vite**: Fast development server and build tool
- **Tailwind CSS**: Utility-first CSS framework
- **PostCSS**: CSS processing and autoprefixing

## Deployment Strategy

### Development Environment
- **Hot Reload**: Vite development server with HMR
- **Database**: Local PostgreSQL or Neon development database
- **Scripts**: `npm run dev` for concurrent frontend/backend development

### Production Deployment
- **Build Process**: 
  1. Frontend: Vite builds optimized React bundle
  2. Backend: esbuild bundles Node.js application
- **Runtime**: Node.js server serving both API and static files
- **Database**: Neon PostgreSQL production instance
- **Platform**: Configured for Replit deployment with autoscaling

### Configuration
- **Environment Variables**: DATABASE_URL for database connection
- **Port Configuration**: Server runs on port 5000, exposed as port 80
- **Static Files**: Frontend build output served from `/dist/public`

## Changelog

```
Changelog:
- June 26, 2025. Initial setup
```

## User Preferences

```
Preferred communication style: Simple, everyday language.
```