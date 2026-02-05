-- ═══════════════════════════════════════════════════════════════
-- MOVANA DATABASE SCHEMA - MariaDB
-- MVP: Users, Operators, Subscriptions, Routes, Route POIs
-- ═══════════════════════════════════════════════════════════════

-- USERS (all authenticated accounts)
CREATE TABLE IF NOT EXISTS users (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100),
  
  avatar_url TEXT,
  phone VARCHAR(50),
  language VARCHAR(5) DEFAULT 'en',
  
  role ENUM('admin','owner','operator_admin','operator_manager','operator_staff','guide','partner','user') NOT NULL DEFAULT 'user',
  
  email_verified_at DATETIME,
  last_login_at DATETIME,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REGIONS
CREATE TABLE IF NOT EXISTS regions (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  
  name VARCHAR(100) NOT NULL,
  name_th VARCHAR(100),
  slug VARCHAR(100) NOT NULL UNIQUE,
  
  description TEXT,
  cover_url TEXT,
  
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  
  is_active BOOLEAN DEFAULT TRUE,
  sort_order INT DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- OPERATORS
CREATE TABLE IF NOT EXISTS operators (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  owner_id CHAR(36) NOT NULL,
  
  name VARCHAR(150) NOT NULL,
  slug VARCHAR(150) NOT NULL UNIQUE,
  
  description TEXT,
  description_th TEXT,
  
  logo_url TEXT,
  cover_url TEXT,
  
  email VARCHAR(255),
  phone VARCHAR(50),
  website VARCHAR(255),
  
  region_id CHAR(36),
  address TEXT,
  city VARCHAR(100),
  lat DECIMAL(10, 7),
  lng DECIMAL(10, 7),
  
  tier ENUM('free','visibility','experience','operator') DEFAULT 'free' NOT NULL,
  
  stripe_account_id VARCHAR(100),
  stripe_onboarded BOOLEAN DEFAULT FALSE,
  
  is_verified BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  
  settings JSON,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (owner_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL,
  
  INDEX idx_operators_owner (owner_id),
  INDEX idx_operators_slug (slug),
  INDEX idx_operators_region (region_id),
  INDEX idx_operators_tier (tier)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36) NOT NULL,
  
  tier ENUM('free','visibility','experience','operator') NOT NULL,
  
  status ENUM('active','past_due','canceled','trialing') DEFAULT 'active' NOT NULL,
  
  stripe_subscription_id VARCHAR(100),
  stripe_price_id VARCHAR(100),
  
  current_period_start DATETIME,
  current_period_end DATETIME,
  canceled_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  INDEX idx_subscriptions_operator (operator_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- TEAM MEMBERS
CREATE TABLE IF NOT EXISTS team_members (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36) NOT NULL,
  user_id CHAR(36) NOT NULL,
  
  role ENUM('owner','admin','manager','staff','guide') NOT NULL,
  
  languages JSON,
  bio TEXT,
  
  is_active BOOLEAN DEFAULT TRUE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_team_member (operator_id, user_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ROUTES (T2+)
CREATE TABLE IF NOT EXISTS routes (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  operator_id CHAR(36) NOT NULL,
  
  title VARCHAR(255) NOT NULL,
  title_th VARCHAR(255),
  slug VARCHAR(255) NOT NULL,
  
  description TEXT,
  description_th TEXT,
  
  cover_url TEXT,
  gallery JSON,
  
  region_id CHAR(36),
  
  difficulty ENUM('easy','moderate','challenging','expert') DEFAULT 'easy',
  distance_km DECIMAL(6, 2),
  duration_minutes INT,
  elevation_gain INT,
  
  -- GeoJSON LineString
  geojson LONGTEXT,
  gpx_url TEXT,
  
  start_lat DECIMAL(10, 7),
  start_lng DECIMAL(10, 7),
  end_lat DECIMAL(10, 7),
  end_lng DECIMAL(10, 7),
  
  bike_type ENUM('any','road','mountain','ebike','gravel') DEFAULT 'any',
  
  tags JSON,
  
  status ENUM('draft','published','archived') DEFAULT 'draft' NOT NULL,
  published_at DATETIME,
  
  -- Stats (denormalized)
  total_views INT DEFAULT 0,
  total_rides INT DEFAULT 0,
  avg_rating DECIMAL(3, 2) DEFAULT 0,
  review_count INT DEFAULT 0,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (operator_id) REFERENCES operators(id) ON DELETE CASCADE,
  FOREIGN KEY (region_id) REFERENCES regions(id) ON DELETE SET NULL,
  
  INDEX idx_routes_operator (operator_id),
  INDEX idx_routes_slug (slug),
  INDEX idx_routes_region (region_id),
  INDEX idx_routes_status (status),
  INDEX idx_routes_difficulty (difficulty)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ROUTE THEMES (many-to-many)
CREATE TABLE IF NOT EXISTS route_themes (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  
  name VARCHAR(100) NOT NULL UNIQUE,
  name_th VARCHAR(100),
  slug VARCHAR(100) NOT NULL UNIQUE,
  icon VARCHAR(50),
  color VARCHAR(7),
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS route_theme_links (
  route_id CHAR(36) NOT NULL,
  theme_id CHAR(36) NOT NULL,
  
  PRIMARY KEY (route_id, theme_id),
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  FOREIGN KEY (theme_id) REFERENCES route_themes(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ROUTE POIS
CREATE TABLE IF NOT EXISTS route_pois (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  route_id CHAR(36) NOT NULL,
  
  name VARCHAR(200) NOT NULL,
  name_th VARCHAR(200),
  
  description TEXT,
  description_th TEXT,
  
  category ENUM('cafe','restaurant','temple','viewpoint','beach','market','museum','park','shop','hotel','other') DEFAULT 'other',
  
  lat DECIMAL(10, 7) NOT NULL,
  lng DECIMAL(10, 7) NOT NULL,
  
  photo_url TEXT,
  
  distance_from_start_km DECIMAL(6, 2),
  estimated_duration_min INT,
  
  tips TEXT,
  price_range VARCHAR(50),
  opening_hours VARCHAR(255),
  
  sort_order INT DEFAULT 0,
  is_highlight BOOLEAN DEFAULT FALSE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  INDEX idx_pois_route (route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ROUTE REVIEWS
CREATE TABLE IF NOT EXISTS route_reviews (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  route_id CHAR(36) NOT NULL,
  user_id CHAR(36),
  
  rider_name VARCHAR(100),
  rider_email VARCHAR(255),
  
  rating_overall TINYINT NOT NULL,
  rating_scenery TINYINT,
  rating_difficulty TINYINT,
  rating_navigation TINYINT,
  rating_pois TINYINT,
  
  comment TEXT,
  photos JSON,
  
  is_verified BOOLEAN DEFAULT FALSE,
  is_published BOOLEAN DEFAULT TRUE,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (route_id) REFERENCES routes(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_reviews_route (route_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- REFRESH TOKENS (for JWT auth)
CREATE TABLE IF NOT EXISTS refresh_tokens (
  id CHAR(36) NOT NULL DEFAULT (UUID()) PRIMARY KEY,
  user_id CHAR(36) NOT NULL,
  
  token VARCHAR(255) NOT NULL UNIQUE,
  
  expires_at DATETIME NOT NULL,
  revoked_at DATETIME,
  
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP NOT NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_refresh_tokens_user (user_id),
  INDEX idx_refresh_tokens_token (token)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ═══════════════════════════════════════════════════════════════
-- SEED DATA
-- ═══════════════════════════════════════════════════════════════

-- Default regions
INSERT INTO regions (id, name, name_th, slug, lat, lng) VALUES
(UUID(), 'Pattaya & Jomtien', 'พัทยา & จอมเทียน', 'pattaya-jomtien', 12.9236, 100.8825),
(UUID(), 'Bangkok', 'กรุงเทพ', 'bangkok', 13.7563, 100.5018),
(UUID(), 'Chiang Mai', 'เชียงใหม่', 'chiang-mai', 18.7883, 98.9853),
(UUID(), 'Phuket', 'ภูเก็ต', 'phuket', 7.8804, 98.3923),
(UUID(), 'Koh Samui', 'เกาะสมุย', 'koh-samui', 9.5120, 100.0136),
(UUID(), 'Chiang Rai', 'เชียงราย', 'chiang-rai', 19.9105, 99.8406),
(UUID(), 'Khao Lak', 'เขาหลัก', 'khao-lak', 8.6534, 98.2468),
(UUID(), 'Hua Hin', 'หัวหิน', 'hua-hin', 12.5684, 99.9577),
(UUID(), 'Krabi', 'กระบี่', 'krabi', 8.0863, 98.9063),
(UUID(), 'Pai', 'ปาย', 'pai', 19.3585, 98.4432),
(UUID(), 'Rayong & Koh Samet', 'ระยอง & เกาะเสม็ด', 'rayong-koh-samet', 12.6814, 101.2816),
(UUID(), 'Kanchanaburi', 'กาญจนบุรี', 'kanchanaburi', 14.0227, 99.5328);

-- Default route themes
INSERT INTO route_themes (id, name, name_th, slug, icon, color) VALUES
(UUID(), 'Beach & Coast', 'ชายหาด', 'beach-coast', 'waves', '#3B7689'),
(UUID(), 'Temples & Culture', 'วัด & วัฒนธรรม', 'temples-culture', 'landmark', '#E8B86D'),
(UUID(), 'Nature & Mountains', 'ธรรมชาติ', 'nature-mountains', 'mountain', '#68B59B'),
(UUID(), 'Food & Markets', 'อาหาร & ตลาด', 'food-markets', 'utensils', '#E07A5F'),
(UUID(), 'Local Villages', 'หมู่บ้าน', 'local-villages', 'home', '#92D99E'),
(UUID(), 'Island Hopping', 'เกาะ', 'island-hopping', 'palmtree', '#3B7689'),
(UUID(), 'Night Ride', 'ปั่นกลางคืน', 'night-ride', 'moon', '#1F2E2B'),
(UUID(), 'Family Friendly', 'สำหรับครอบครัว', 'family-friendly', 'heart', '#E07A5F');
