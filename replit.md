# Enhanced Order Management System

## Overview

This is a comprehensive order management system built with React, TypeScript, and Tailwind CSS. The application provides role-based order management with authentication, customer search, automatic promotion application, and workflow-based order processing designed for Vietnamese market requirements.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Styling**: Tailwind CSS with PostCSS for utility-first styling
- **Routing**: React Router DOM for client-side navigation
- **Authentication**: Custom authentication context with role-based permissions
- **State Management**: Custom React hooks with local state management
- **Internationalization**: Vietnamese language support throughout the interface
- **Build Tool**: Vite for fast development and optimized builds

### Authentication & Role System
- **Role-Based Access Control**: Three distinct user roles (Manager, Salesperson, Warehouse)
- **Permission System**: Action-based permissions for different operations
- **Session Management**: Local storage with secure token handling
- **Protected Routes**: Route-level access control based on user permissions

## Key Features Implemented

### 1. Authentication & Role-Based Access Control
- **User Roles**: Manager, Salesperson, Warehouse staff
- **Permission System**: Action-based authorization (create_order, confirm_order, manage_inventory, etc.)
- **Session Management**: Secure login/logout with token-based authentication
- **Role-Specific Navigation**: Dynamic menu filtering based on user permissions

### 2. Enhanced Order Creation Process
- **Customer Search**: Phone number-based customer lookup
- **Auto Customer Creation**: Creates new customer if not found in system
- **Automatic Promotion Application**: Real-time promotion calculation based on order value
- **Product Management**: Dynamic item addition with pricing and quantity controls
- **Vietnamese Localization**: Full Vietnamese language interface and currency formatting

### 3. Role-Based Order Workflow
- **Draft → Confirmed**: Manager approval required for order confirmation
- **Confirmed → Preparing**: Warehouse staff can move orders to preparation
- **Preparing → Shipped**: Warehouse staff updates shipping status
- **Shipped → Delivered**: Final delivery confirmation
- **Cancellation Rights**: Manager can cancel orders at appropriate stages

### 4. Workflow Permissions
- **Salesperson**: Create orders, view own orders only, search customers
- **Manager**: Full order oversight, confirm/cancel orders, view all reports
- **Warehouse**: Inventory management, order fulfillment, shipping updates

### 5. Dashboard & Analytics
- **Role-Specific Stats**: Different metrics based on user role
- **Order Status Tracking**: Real-time status distribution
- **Revenue Analytics**: Financial performance indicators
- **Recent Activity**: Latest order updates and actions required

## Data Flow

### Service Layer Architecture
- **API Abstraction**: Centralized API service for HTTP requests
- **Domain Services**: Specialized services for each business domain
- **Mock Data**: Development-ready mock services simulating backend APIs
- **Error Handling**: Consistent error handling across all services

### State Management Pattern
- **Custom Hooks**: Domain-specific hooks for state management
- **Async Operations**: Promise-based async operations with loading states
- **Local State**: Component-level state for UI interactions
- **Data Persistence**: LocalStorage for user preferences and settings

## External Dependencies

### Core Dependencies
- **React Ecosystem**: React, ReactDOM, React Router DOM
- **TypeScript**: Full type safety with strict configuration
- **Styling**: Tailwind CSS with autoprefixer
- **Internationalization**: i18next with React integration
- **Charts**: Recharts for data visualization
- **Icons**: Lucide React for consistent iconography
- **Date Handling**: date-fns for date manipulation
- **Performance**: Memoizee for function memoization

### Development Dependencies
- **Build Tools**: Vite with React plugin
- **Code Quality**: ESLint with TypeScript support
- **Type Checking**: TypeScript with strict configuration
- **PostCSS**: CSS processing with Tailwind integration

## Deployment Strategy

### Database Integration
- **Supabase**: PostgreSQL database with row-level security
- **Migration System**: SQL migrations for schema management
- **Real-time Support**: Prepared for real-time data synchronization

### Architecture Decisions (ADR)
1. **UTF8MB4 Support**: Full Unicode support for multilingual content
2. **JSONB Attributes**: Flexible product attributes and search optimization
3. **Product Type Separation**: Clear distinction between structure and categorization
4. **Rule-based Promotions**: Flexible promotion engine with condition/action rules

### Production Considerations
- **Backend Integration**: Ready for Spring Boot API integration
- **Authentication**: OpenID Connect integration prepared
- **Performance**: Optimized bundle splitting and lazy loading
- **Monitoring**: Error tracking and performance monitoring ready

## Implementation Status

### ✅ Completed Features
1. **Authentication System**
   - Role-based login with Manager, Salesperson, Warehouse roles
   - Permission-based action authorization
   - Secure session management with logout functionality

2. **Enhanced Order Creation**
   - Customer search by phone number with auto-creation
   - Automatic promotion application based on order value
   - Dynamic product item management with real-time calculations
   - Vietnamese currency formatting and validation

3. **Role-Based Workflow**
   - Manager: Order confirmation, cancellation, full system oversight
   - Salesperson: Order creation, view own orders only, customer management
   - Warehouse: Order fulfillment, inventory updates, shipping management

4. **User Interface Enhancements**
   - Role-specific navigation menu filtering
   - Vietnamese language interface throughout
   - Order status workflow with visual indicators
   - Comprehensive order details modal with all information

### 🔄 Current Implementation
- All core authentication and order management features are functional
- Role-based permissions are enforced at both UI and service levels
- Order workflow follows proper business logic with status transitions
- Customer and promotion management integrated into order creation

### Demo Accounts Available
- **Admin**: username `admin`, password `password123`
- **Manager**: username `manager`, password `password123`
- **Employee**: username `employee`, password `password123`

## Recent Changes

June 26, 2025:
- **Updated Role System**: Changed from previous roles to admin, manager, and employee
- **Enhanced Authentication**: Updated user accounts and permissions for new role structure
- **New Service Layer**: Created enhanced order service with role-based filtering and access control
- **Mock Data Update**: Built new mock data with proper role assignments and Vietnamese content
- **Permission System**: Implemented proper access control for each role level
- **Order Workflow**: Enhanced status transitions with role-specific permissions
- **Vietnamese Interface**: Maintained full Vietnamese localization with proper currency formatting
- **Demo Accounts**: Updated with admin, manager, and employee test accounts

## User Preferences

Preferred communication style: Simple, everyday language.