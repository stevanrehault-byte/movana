-- ═══════════════════════════════════════════════════════════════
-- MOVANA DATABASE MIGRATION 002 - Fleet, Bookings, Notifications
-- Run AFTER 001_init.sql
-- ═══════════════════════════════════════════════════════════════

-- VEHICLES (Fleet management - T3 Operator)
CREATE TABLE IF NOT EXISTS vehicles (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36) NOT NULL,

  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  
  sku VARCHAR(50),
  brand VARCHAR(100),
  model VARCHAR(100),
  year INT,
  color VARCHAR(50),
  
  vehicle_type ENUM('ebike','road','mountain','gravel','city','scooter','tandem','cargo','kids','other') DEFAULT 'ebike',
  
  description TEXT,
  short_description TEXT,
  
  -- Inventory
  stock INT DEFAULT 1,
  status ENUM('available','rented','maintenance','retired') DEFAULT 'available',
  vehicle_condition ENUM('excellent','good','fair','needs_repair') DEFAULT 'excellent',
  
  -- Pricing (in operator's currency)
  price_half_day DECIMAL(10,2),
  price_full_day DECIMAL(10,2),
  price_week DECIMAL(10,2),
  price_month DECIMAL(10,2),
  price_deposit DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'THB',
  
  -- Specs
  battery_wh INT,
  range_km INT,
  max_weight_kg INT DEFAULT 120,
  wheel_size VARCHAR(20),
  frame_size VARCHAR(20),
  
  -- Images
  cover_url TEXT,
  gallery JSON,
  
  -- Maintenance
  maintenance_last DATE,
  maintenance_next DATE,
  maintenance_notes TEXT,
  total_km DECIMAL(10,1) DEFAULT 0,
  total_bookings INT DEFAULT 0,
  
  -- Display
  sort_order INT DEFAULT 0,
  is_featured BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_vehicles_operator (operator_id),
  INDEX idx_vehicles_type (vehicle_type),
  INDEX idx_vehicles_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ADDONS (accessories, insurance, etc.)
CREATE TABLE IF NOT EXISTS addons (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36) NOT NULL,
  
  name VARCHAR(150) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  
  addon_type ENUM('accessory','insurance','service','guide','other') DEFAULT 'accessory',
  
  price DECIMAL(10,2) NOT NULL,
  price_type ENUM('per_day','per_booking','per_person') DEFAULT 'per_booking',
  currency VARCHAR(3) DEFAULT 'THB',
  
  stock INT DEFAULT 999,
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_addons_operator (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- CUSTOMERS (riders/renters)
CREATE TABLE IF NOT EXISTS customers (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36) NOT NULL,
  user_id CHAR(36),
  
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(50),
  
  nationality VARCHAR(50),
  passport_number VARCHAR(50),
  
  address TEXT,
  city VARCHAR(100),
  
  notes TEXT,
  
  total_bookings INT DEFAULT 0,
  total_spent DECIMAL(10,2) DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_customers_operator (operator_id),
  INDEX idx_customers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- DELIVERY ZONES
CREATE TABLE IF NOT EXISTS delivery_zones (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36) NOT NULL,
  
  name VARCHAR(100) NOT NULL,
  description TEXT,
  
  price DECIMAL(10,2) DEFAULT 0,
  free_above DECIMAL(10,2),
  currency VARCHAR(3) DEFAULT 'THB',
  
  -- GeoJSON polygon for the zone
  geojson LONGTEXT,
  
  radius_km DECIMAL(6,2),
  center_lat DECIMAL(10,7),
  center_lng DECIMAL(10,7),
  
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_delivery_zones_operator (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- BOOKINGS
CREATE TABLE IF NOT EXISTS bookings (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36) NOT NULL,
  
  reference VARCHAR(20) NOT NULL UNIQUE,
  
  -- Customer
  customer_id CHAR(36),
  customer_name VARCHAR(200) NOT NULL,
  customer_email VARCHAR(255) NOT NULL,
  customer_phone VARCHAR(50),
  customer_notes TEXT,
  
  -- Vehicle
  vehicle_id CHAR(36) NOT NULL,
  vehicle_name VARCHAR(200),
  quantity INT DEFAULT 1,
  
  -- Experience (optional - linked route)
  route_id CHAR(36),
  guide_id CHAR(36),
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  pickup_time TIME,
  return_time TIME,
  
  -- Delivery
  delivery_zone_id CHAR(36),
  delivery_address TEXT,
  delivery_lat DECIMAL(10,7),
  delivery_lng DECIMAL(10,7),
  
  -- Status
  status ENUM('pending','confirmed','ready','delivered','active','completed','cancelled','no_show') DEFAULT 'pending',
  
  -- Pricing
  subtotal DECIMAL(10,2) DEFAULT 0,
  addons_total DECIMAL(10,2) DEFAULT 0,
  delivery_fee DECIMAL(10,2) DEFAULT 0,
  discount DECIMAL(10,2) DEFAULT 0,
  deposit DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  currency VARCHAR(3) DEFAULT 'THB',
  
  -- Payment
  payment_status ENUM('pending','partial','paid','refunded') DEFAULT 'pending',
  payment_method VARCHAR(50),
  amount_paid DECIMAL(10,2) DEFAULT 0,
  stripe_payment_id VARCHAR(100),
  
  -- Addons (JSON array of {addon_id, name, price, quantity})
  addons_data JSON,
  
  -- Admin
  admin_notes TEXT,
  
  -- Cancellation
  cancelled_at DATETIME,
  cancellation_reason TEXT,
  refund_amount DECIMAL(10,2),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id) ON DELETE CASCADE,
  FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
  FOREIGN KEY (delivery_zone_id) REFERENCES delivery_zones(id) ON DELETE SET NULL,
  
  INDEX idx_bookings_operator (operator_id),
  INDEX idx_bookings_reference (reference),
  INDEX idx_bookings_status (status),
  INDEX idx_bookings_dates (start_date, end_date),
  INDEX idx_bookings_vehicle (vehicle_id),
  INDEX idx_bookings_customer_email (customer_email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  
  user_id CHAR(36),
  operator_id CHAR(36),
  
  type ENUM('booking_new','booking_confirmed','booking_cancelled','booking_reminder','review_new','route_published','system','payment','fleet_alert','team_invite') NOT NULL,
  
  title VARCHAR(255) NOT NULL,
  body TEXT,
  
  -- Link to related entity
  entity_type VARCHAR(50),
  entity_id CHAR(36),
  
  -- Delivery
  channel ENUM('in_app','email','push','sms') DEFAULT 'in_app',
  
  is_read BOOLEAN DEFAULT FALSE,
  read_at DATETIME,
  
  -- Push notification data
  push_data JSON,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  INDEX idx_notifications_user (user_id),
  INDEX idx_notifications_operator (operator_id),
  INDEX idx_notifications_type (type),
  INDEX idx_notifications_unread (user_id, is_read)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PARTNERS (local businesses linked to operators)
CREATE TABLE IF NOT EXISTS partners (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36) NOT NULL,
  
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(200) NOT NULL,
  
  description TEXT,
  category ENUM('hotel','restaurant','cafe','shop','tour','transport','spa','activity','other') DEFAULT 'other',
  
  logo_url TEXT,
  cover_url TEXT,
  website VARCHAR(255),
  email VARCHAR(255),
  phone VARCHAR(50),
  
  address TEXT,
  lat DECIMAL(10,7),
  lng DECIMAL(10,7),
  
  discount_description TEXT,
  discount_percent INT,
  
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_partners_operator (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OPERATOR PAGES (vitrine custom sections)
CREATE TABLE IF NOT EXISTS operator_pages (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36) NOT NULL,
  
  page_type ENUM('about','gallery','faq','terms','contact','custom') DEFAULT 'custom',
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) NOT NULL,
  content LONGTEXT,
  
  cover_url TEXT,
  
  is_published BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_op_pages_operator (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- RIDER SESSIONS (GPS recordings from PWA)
CREATE TABLE IF NOT EXISTS rider_sessions (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  
  user_id CHAR(36),
  route_id CHAR(36),
  operator_id CHAR(36),
  
  -- Recording data
  geojson LONGTEXT,
  distance_km DECIMAL(8,2),
  duration_seconds INT,
  elevation_gain INT,
  avg_speed_kmh DECIMAL(5,2),
  max_speed_kmh DECIMAL(5,2),
  
  start_lat DECIMAL(10,7),
  start_lng DECIMAL(10,7),
  end_lat DECIMAL(10,7),
  end_lng DECIMAL(10,7),
  
  started_at DATETIME,
  ended_at DATETIME,
  
  -- Status
  status ENUM('recording','completed','abandoned') DEFAULT 'recording',
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE SET NULL,
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE SET NULL,
  INDEX idx_rider_sessions_user (user_id),
  INDEX idx_rider_sessions_route (route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- AUDIT LOG
CREATE TABLE IF NOT EXISTS audit_log (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  
  user_id CHAR(36),
  operator_id CHAR(36),
  
  action VARCHAR(100) NOT NULL,
  entity_type VARCHAR(50),
  entity_id CHAR(36),
  
  details JSON,
  ip_address VARCHAR(45),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  INDEX idx_audit_user (user_id),
  INDEX idx_audit_operator (operator_id),
  INDEX idx_audit_action (action)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- PUSH SUBSCRIPTIONS (for PWA push notifications)
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  
  endpoint TEXT NOT NULL,
  p256dh VARCHAR(255),
  auth VARCHAR(255),
  
  user_agent TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_push_user (user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
