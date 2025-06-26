# Inventory Management System - Backend

## Overview
Spring Boot backend for a comprehensive inventory management system designed for small and medium enterprises (SMEs) in fashion and home decoration industries. The system supports multi-country and multi-channel sales operations.

## Technology Stack
- **Framework**: Spring Boot 3.2.0
- **Java Version**: 17
- **Database**: H2 (development), MySQL (production)
- **Security**: Spring Security with JWT
- **ORM**: Spring Data JPA with Hibernate
- **Build Tool**: Maven
- **Documentation**: Built-in API documentation

## Architecture
The project follows a clean MVC architecture with clear separation of concerns:

```
src/main/java/com/inventorypro/
├── config/              # Configuration classes
├── controller/          # REST API controllers
├── dto/                 # Data Transfer Objects
│   ├── request/         # Request DTOs
│   └── response/        # Response DTOs
├── exception/           # Custom exceptions and handlers
├── model/               # JPA entities
├── repository/          # Data access layer
├── security/            # Security configuration and JWT
├── service/             # Business logic layer
│   └── impl/            # Service implementations
└── util/                # Utility classes
```

## Key Features

### 1. User Management & Authentication
- JWT-based authentication
- Role-based access control (Admin, Manager, Employee)
- User registration and login

### 2. Product Management
- Complete product catalog management
- Product variants with attributes
- Category management
- SKU-based tracking
- Multi-currency support

### 3. Inventory Management
- Real-time stock tracking
- Low stock alerts
- Stock adjustments and auditing
- Warehouse and location management
- Reserved stock handling

### 4. Customer Management
- Customer profiles (Retail/Wholesale)
- Multi-country support
- Customer statistics tracking
- Search and filtering capabilities

### 5. Order Management
- Multi-channel order processing (Online, Retail, Wholesale)
- Order status tracking
- Automatic inventory updates
- Revenue tracking

### 6. Dashboard & Analytics
- Real-time business statistics
- Sales data and trends
- Top-selling products
- Customer analytics

## Database Schema

### Core Entities
- **User**: System users with role-based access
- **Product**: Product catalog with variants
- **InventoryItem**: Stock tracking per product
- **Customer**: Customer information and statistics
- **Order**: Sales orders with items
- **Role**: User roles and permissions

### Key Relationships
- Products have multiple variants and inventory items
- Orders belong to customers and contain multiple items
- Users have roles for access control
- Inventory items track stock per product/warehouse

## API Endpoints

### Authentication
- `POST /auth/signin` - User login
- `POST /auth/signup` - User registration

### Products
- `GET /products` - List all products
- `POST /products` - Create product
- `PUT /products/{id}` - Update product
- `DELETE /products/{id}` - Delete product
- `GET /products/search` - Search products

### Inventory
- `GET /inventory` - List inventory items
- `GET /inventory/low-stock` - Get low stock items
- `PUT /inventory/{id}/stock` - Update stock
- `PUT /inventory/{id}/adjust` - Adjust stock

### Customers
- `GET /customers` - List customers
- `POST /customers` - Create customer
- `PUT /customers/{id}` - Update customer
- `GET /customers/search` - Search customers

### Orders
- `GET /orders` - List orders
- `POST /orders` - Create order
- `PUT /orders/{id}/status` - Update order status
- `GET /orders/search` - Search orders

### Dashboard
- `GET /dashboard/stats` - Get dashboard statistics
- `GET /dashboard/sales-data` - Get sales data
- `GET /dashboard/top-products` - Get top selling products

## Security
- JWT token-based authentication
- Role-based authorization using Spring Security
- Password encryption with BCrypt
- CORS configuration for frontend integration

## Configuration

### Database Configuration
**Development (H2):**
```yaml
spring:
  datasource:
    url: jdbc:h2:mem:inventorydb
    username: sa
    password: password
```

**Production (MySQL):**
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/inventory_management
    username: ${DB_USERNAME}
    password: ${DB_PASSWORD}
```

### JWT Configuration
```yaml
jwt:
  secret: mySecretKey123456789012345678901234567890
  expiration: 86400000 # 24 hours
```

## Getting Started

### Prerequisites
- Java 17 or higher
- Maven 3.6 or higher
- MySQL 8.0 (for production)

### Running the Application

1. **Clone the repository**
```bash
git clone <repository-url>
cd inventory-management/backend
```

2. **Build the project**
```bash
mvn clean install
```

3. **Run with H2 (Development)**
```bash
mvn spring-boot:run
```

4. **Run with MySQL (Production)**
```bash
mvn spring-boot:run -Dspring.profiles.active=prod
```

### Default Credentials
- **Username**: admin
- **Password**: admin123
- **Role**: ADMIN

### H2 Console
Access H2 database console at: `http://localhost:8080/api/h2-console`
- **JDBC URL**: jdbc:h2:mem:inventorydb
- **Username**: sa
- **Password**: password

## Testing
Run tests with:
```bash
mvn test
```

## API Documentation
The API is self-documenting through the controller endpoints. You can test the APIs using tools like Postman or curl.

## Production Deployment

### Database Setup
1. Create MySQL database:
```sql
CREATE DATABASE inventory_management;
CREATE USER 'inventory_user'@'localhost' IDENTIFIED BY 'inventory_password';
GRANT ALL PRIVILEGES ON inventory_management.* TO 'inventory_user'@'localhost';
```

2. Set environment variables:
```bash
export DB_USERNAME=inventory_user
export DB_PASSWORD=inventory_password
```

3. Run with production profile:
```bash
java -jar target/inventory-management-1.0.0.jar --spring.profiles.active=prod
```

## Contributing
1. Follow the existing code structure and naming conventions
2. Add proper validation and error handling
3. Include unit tests for new features
4. Update documentation for API changes

## License
This project is licensed under the MIT License.