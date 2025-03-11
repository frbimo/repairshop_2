-- Create database
CREATE DATABASE auto_repair_system;
USE auto_repair_system;

-- Users table
CREATE TABLE users (
    user_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'officer') NOT NULL DEFAULT 'officer',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Customers table
CREATE TABLE customers (
    customer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Car brands reference table
CREATE TABLE car_brands (
    brand_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_name VARCHAR(50) NOT NULL UNIQUE
);

-- Car models reference table
CREATE TABLE car_models (
    model_id INT AUTO_INCREMENT PRIMARY KEY,
    brand_id INT NOT NULL,
    model_name VARCHAR(100) NOT NULL,
    FOREIGN KEY (brand_id) REFERENCES car_brands(brand_id),
    UNIQUE KEY (brand_id, model_name)
);

-- Vehicles table
CREATE TABLE vehicles (
    vehicle_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    make VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    year INT NOT NULL,
    license_plate VARCHAR(20) NOT NULL UNIQUE,
    color VARCHAR(30) NOT NULL,
    vin VARCHAR(50) UNIQUE,
    mileage INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

-- Retailers table
CREATE TABLE retailers (
    retailer_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    contact_info VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Parts/Inventory items table
CREATE TABLE parts (
    part_id INT AUTO_INCREMENT PRIMARY KEY,
    sku VARCHAR(50) NOT NULL UNIQUE,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10, 2) NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    vendor VARCHAR(50) NOT NULL,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Purchase receipts table
CREATE TABLE purchase_receipts (
    receipt_id INT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(50) NOT NULL UNIQUE,
    retailer_id INT NOT NULL,
    total_amount DECIMAL(10, 2) NOT NULL,
    purchase_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_by INT NOT NULL,
    FOREIGN KEY (retailer_id) REFERENCES retailers(retailer_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Purchase details (line items)
CREATE TABLE purchase_details (
    detail_id INT AUTO_INCREMENT PRIMARY KEY,
    receipt_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity INT NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    FOREIGN KEY (receipt_id) REFERENCES purchase_receipts(receipt_id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id)
);

-- Part compatibility table
CREATE TABLE part_compatibility (
    compatibility_id INT AUTO_INCREMENT PRIMARY KEY,
    part_id INT NOT NULL,
    brand_id INT NOT NULL,
    model_id INT NOT NULL,
    year_from INT NOT NULL,
    year_to INT NOT NULL,
    FOREIGN KEY (part_id) REFERENCES parts(part_id),
    FOREIGN KEY (brand_id) REFERENCES car_brands(brand_id),
    FOREIGN KEY (model_id) REFERENCES car_models(model_id)
);

-- Service types reference table
CREATE TABLE service_types (
    service_type_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(50) NOT NULL UNIQUE,
    description TEXT
);

-- Services table (both estimations and work orders)
CREATE TABLE services (
    service_id INT AUTO_INCREMENT PRIMARY KEY,
    customer_id INT NOT NULL,
    vehicle_id INT NOT NULL,
    description TEXT NOT NULL,
    estimated_completion_date DATE NOT NULL,
    status ENUM('pending', 'in_progress', 'completed') NOT NULL DEFAULT 'pending',
    estimation_id VARCHAR(50) UNIQUE,
    work_order_id VARCHAR(50) UNIQUE,
    is_work_order BOOLEAN NOT NULL DEFAULT FALSE,
    created_by INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    FOREIGN KEY (vehicle_id) REFERENCES vehicles(vehicle_id),
    FOREIGN KEY (created_by) REFERENCES users(user_id)
);

-- Service-service types association table
CREATE TABLE service_service_types (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    service_type_id INT NOT NULL,
    description TEXT,
    FOREIGN KEY (service_id) REFERENCES services(service_id),
    FOREIGN KEY (service_type_id) REFERENCES service_types(service_type_id),
    UNIQUE KEY (service_id, service_type_id)
);

-- Service parts table
CREATE TABLE service_parts (
    service_part_id INT AUTO_INCREMENT PRIMARY KEY,
    service_id INT NOT NULL,
    part_id INT NOT NULL,
    quantity INT NOT NULL,
    FOREIGN KEY (service_id) REFERENCES services(service_id),
    FOREIGN KEY (part_id) REFERENCES parts(part_id)
);

-- Add indexes
CREATE INDEX idx_parts_sku ON parts(sku);
CREATE INDEX idx_vehicles_license_plate ON vehicles(license_plate);
CREATE INDEX idx_services_estimation_id ON services(estimation_id);
CREATE INDEX idx_services_work_order_id ON services(work_order_id);
CREATE INDEX idx_services_customer_id ON services(customer_id);
CREATE INDEX idx_services_status ON services(status);

-- Insert initial data - service types
INSERT INTO service_types (name, description) VALUES
('oil_change', 'Regular oil and filter change service'),
('brake_service', 'Brake pad replacement and system check'),
('tire_replacement', 'Tire replacement and balancing'),
('engine_repair', 'Engine diagnostics and repair'),
('transmission', 'Transmission service and repair'),
('electrical', 'Electrical system diagnosis and repair'),
('ac_service', 'Air conditioning service and repair'),
('diagnostic', 'General diagnostic service'),
('other', 'Other services not categorized');

-- Insert initial admin user (password: admin123)
INSERT INTO users (name, email, password_hash, role) VALUES
('Admin User', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('Officer User', 'officer@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'officer');

-- Insert initial car brands
INSERT INTO car_brands (brand_name) VALUES
('Toyota'), ('Honda'), ('Ford'), ('BMW'), ('Mercedes'), ('Audi'), ('Volkswagen'), 
('Nissan'), ('Hyundai'), ('Kia'), ('Chevrolet'), ('Mazda'), ('Subaru'), ('Lexus');

-- Insert some car models
INSERT INTO car_models (brand_id, model_name) VALUES
(1, 'Corolla'), (1, 'Camry'), (1, 'RAV4'), (1, 'Highlander'),
(2, 'Civic'), (2, 'Accord'), (2, 'CR-V'), (2, 'Pilot'),
(3, 'F-150'), (3, 'Escape'), (3, 'Explorer'), (3, 'Mustang'),
(4, '3 Series'), (4, '5 Series'), (4, 'X3'), (4, 'X5');

