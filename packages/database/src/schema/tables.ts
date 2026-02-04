// ═══════════════════════════════════════════════════════════════
// MOVANA DATABASE SCHEMA - Part 2
// Continuation of schema definitions
// ═══════════════════════════════════════════════════════════════

import { 
  pgTable, 
  uuid, 
  varchar, 
  text, 
  boolean, 
  integer, 
  decimal, 
  timestamp, 
  jsonb,
  index,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { 
  users, 
  operators, 
  vehicleCategories, 
  vehicles, 
  teamMembers,
  vehicleStatusEnum,
  bookingStatusEnum,
} from './schema-part1';

// ═══════════════════════════════════════════════════════════════
// VEHICLES (continued)
// ═══════════════════════════════════════════════════════════════

// This extends the vehicles table definition
export const vehiclesExtended = pgTable('vehicles', {
  // ... previous fields
  lastMaintenanceAt: timestamp('last_maintenance_at', { withTimezone: true }),
  nextMaintenanceAt: timestamp('next_maintenance_at', { withTimezone: true }),
  totalKm: decimal('total_km', { precision: 10, scale: 2 }).default('0'),
  
  notes: text('notes'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  operatorIdx: index('vehicles_operator_idx').on(table.operatorId),
  statusIdx: index('vehicles_status_idx').on(table.status),
  categoryIdx: index('vehicles_category_idx').on(table.categoryId),
}));

// Vehicle maintenance log
export const vehicleMaintenance = pgTable('vehicle_maintenance', {
  id: uuid('id').defaultRandom().primaryKey(),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id, { onDelete: 'cascade' }),
  
  maintenanceType: varchar('maintenance_type', { length: 100 }).notNull(),
  description: text('description'),
  cost: decimal('cost', { precision: 10, scale: 2 }),
  performedAt: timestamp('performed_at', { withTimezone: true }).notNull(),
  performedBy: varchar('performed_by', { length: 100 }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// ADD-ONS (Accessories)
// ═══════════════════════════════════════════════════════════════

export const addons = pgTable('addons', {
  id: uuid('id').defaultRandom().primaryKey(),
  operatorId: uuid('operator_id').notNull().references(() => operators.id, { onDelete: 'cascade' }),
  
  name: varchar('name', { length: 100 }).notNull(),
  nameTh: varchar('name_th', { length: 100 }),
  description: text('description'),
  
  price: decimal('price', { precision: 10, scale: 2 }).notNull(),
  priceType: varchar('price_type', { length: 20 }).default('per_booking'), // per_booking, per_day, per_vehicle
  
  stockQuantity: integer('stock_quantity'), // NULL = unlimited
  
  photoUrl: text('photo_url'),
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// DELIVERY ZONES
// ═══════════════════════════════════════════════════════════════

export const deliveryZones = pgTable('delivery_zones', {
  id: uuid('id').defaultRandom().primaryKey(),
  operatorId: uuid('operator_id').notNull().references(() => operators.id, { onDelete: 'cascade' }),
  
  name: varchar('name', { length: 100 }).notNull(),
  
  priceDelivery: decimal('price_delivery', { precision: 10, scale: 2 }).default('0'),
  pricePickup: decimal('price_pickup', { precision: 10, scale: 2 }).default('0'),
  
  geojson: jsonb('geojson'), // Polygon for auto-validation
  
  isActive: boolean('is_active').default(true),
  sortOrder: integer('sort_order').default(0),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// CUSTOMERS
// ═══════════════════════════════════════════════════════════════

export const customers = pgTable('customers', {
  id: uuid('id').defaultRandom().primaryKey(),
  operatorId: uuid('operator_id').notNull().references(() => operators.id, { onDelete: 'cascade' }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  
  firstName: varchar('first_name', { length: 100 }).notNull(),
  lastName: varchar('last_name', { length: 100 }),
  email: varchar('email', { length: 255 }),
  phone: varchar('phone', { length: 50 }),
  
  nationality: varchar('nationality', { length: 100 }),
  language: varchar('language', { length: 5 }).default('en'),
  
  notes: text('notes'),
  tags: text('tags').array().default([]),
  
  // Denormalized stats
  totalBookings: integer('total_bookings').default(0),
  totalSpent: decimal('total_spent', { precision: 12, scale: 2 }).default('0'),
  lastBookingAt: timestamp('last_booking_at', { withTimezone: true }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  operatorIdx: index('customers_operator_idx').on(table.operatorId),
  emailIdx: index('customers_email_idx').on(table.email),
}));

// ═══════════════════════════════════════════════════════════════
// GUIDE AVAILABILITY
// ═══════════════════════════════════════════════════════════════

export const guideAvailability = pgTable('guide_availability', {
  id: uuid('id').defaultRandom().primaryKey(),
  guideId: uuid('guide_id').notNull().references(() => teamMembers.id, { onDelete: 'cascade' }),
  
  date: timestamp('date', { mode: 'date' }).notNull(),
  isAvailable: boolean('is_available').default(true),
  
  availableFrom: varchar('available_from', { length: 5 }), // HH:MM
  availableUntil: varchar('available_until', { length: 5 }), // HH:MM
  
  note: text('note'),
}, (table) => ({
  guideDateUnique: uniqueIndex('guide_availability_guide_date_unique').on(table.guideId, table.date),
}));

// ═══════════════════════════════════════════════════════════════
// BOOKINGS
// ═══════════════════════════════════════════════════════════════

export const bookings = pgTable('bookings', {
  id: uuid('id').defaultRandom().primaryKey(),
  operatorId: uuid('operator_id').notNull().references(() => operators.id, { onDelete: 'cascade' }),
  customerId: uuid('customer_id').notNull().references(() => customers.id),
  
  bookingNumber: varchar('booking_number', { length: 50 }).unique().notNull(),
  
  status: bookingStatusEnum('status').default('pending').notNull(),
  
  // Dates
  startAt: timestamp('start_at', { withTimezone: true }).notNull(),
  endAt: timestamp('end_at', { withTimezone: true }).notNull(),
  
  // Guide
  isGuided: boolean('is_guided').default(false),
  guideId: uuid('guide_id').references(() => teamMembers.id),
  guideFee: decimal('guide_fee', { precision: 10, scale: 2 }).default('0'),
  preferredLanguage: varchar('preferred_language', { length: 5 }),
  
  // Delivery
  deliveryZoneId: uuid('delivery_zone_id').references(() => deliveryZones.id),
  deliveryAddress: text('delivery_address'),
  deliveryNotes: text('delivery_notes'),
  pickupSameLocation: boolean('pickup_same_location').default(true),
  pickupAddress: text('pickup_address'),
  
  // Pricing
  subtotal: decimal('subtotal', { precision: 12, scale: 2 }).notNull(),
  deliveryFee: decimal('delivery_fee', { precision: 10, scale: 2 }).default('0'),
  discountAmount: decimal('discount_amount', { precision: 10, scale: 2 }).default('0'),
  discountReason: varchar('discount_reason', { length: 255 }),
  promoCodeId: uuid('promo_code_id'),
  total: decimal('total', { precision: 12, scale: 2 }).notNull(),
  
  currency: varchar('currency', { length: 3 }).default('THB'),
  
  // Payment
  depositAmount: decimal('deposit_amount', { precision: 10, scale: 2 }).default('0'),
  depositPaid: boolean('deposit_paid').default(false),
  depositPaidAt: timestamp('deposit_paid_at', { withTimezone: true }),
  
  balancePaid: boolean('balance_paid').default(false),
  balancePaidAt: timestamp('balance_paid_at', { withTimezone: true }),
  
  paymentMethod: varchar('payment_method', { length: 50 }),
  stripePaymentId: varchar('stripe_payment_id', { length: 255 }),
  
  // Assignment
  assignedTo: uuid('assigned_to').references(() => teamMembers.id),
  
  // Notes
  customerNotes: text('customer_notes'),
  internalNotes: text('internal_notes'),
  
  // Workflow timestamps
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  readyAt: timestamp('ready_at', { withTimezone: true }),
  deliveredAt: timestamp('delivered_at', { withTimezone: true }),
  returnedAt: timestamp('returned_at', { withTimezone: true }),
  cancelledAt: timestamp('cancelled_at', { withTimezone: true }),
  cancellationReason: text('cancellation_reason'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  operatorIdx: index('bookings_operator_idx').on(table.operatorId),
  customerIdx: index('bookings_customer_idx').on(table.customerId),
  statusIdx: index('bookings_status_idx').on(table.status),
  datesIdx: index('bookings_dates_idx').on(table.startAt, table.endAt),
}));

// Booking vehicles (many-to-many)
export const bookingVehicles = pgTable('booking_vehicles', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  vehicleId: uuid('vehicle_id').notNull().references(() => vehicles.id),
  
  pricePerDay: decimal('price_per_day', { precision: 10, scale: 2 }),
  quantity: integer('quantity').default(1),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  bookingIdx: index('booking_vehicles_booking_idx').on(table.bookingId),
  vehicleIdx: index('booking_vehicles_vehicle_idx').on(table.vehicleId),
}));

// Booking addons
export const bookingAddons = pgTable('booking_addons', {
  id: uuid('id').defaultRandom().primaryKey(),
  bookingId: uuid('booking_id').notNull().references(() => bookings.id, { onDelete: 'cascade' }),
  addonId: uuid('addon_id').notNull().references(() => addons.id),
  
  quantity: integer('quantity').default(1),
  unitPrice: decimal('unit_price', { precision: 10, scale: 2 }),
  subtotal: decimal('subtotal', { precision: 10, scale: 2 }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// PROMO CODES
// ═══════════════════════════════════════════════════════════════

export const promoCodes = pgTable('promo_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  operatorId: uuid('operator_id').notNull().references(() => operators.id, { onDelete: 'cascade' }),
  
  code: varchar('code', { length: 50 }).notNull(),
  
  discountType: varchar('discount_type', { length: 20 }).notNull(), // percentage, fixed, free_addon
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  
  minOrderAmount: decimal('min_order_amount', { precision: 10, scale: 2 }),
  maxDiscountAmount: decimal('max_discount_amount', { precision: 10, scale: 2 }),
  
  validFrom: timestamp('valid_from', { withTimezone: true }),
  validUntil: timestamp('valid_until', { withTimezone: true }),
  
  usageLimit: integer('usage_limit'),
  usageCount: integer('usage_count').default(0),
  oncePerCustomer: boolean('once_per_customer').default(true),
  
  appliesTo: varchar('applies_to', { length: 20 }).default('all'), // all, routes, vehicles, addons
  appliesToIds: uuid('applies_to_ids').array(),
  
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  operatorCodeUnique: uniqueIndex('promo_codes_operator_code_unique').on(table.operatorId, table.code),
}));

// Promo rules (auto-applied)
export const promoRules = pgTable('promo_rules', {
  id: uuid('id').defaultRandom().primaryKey(),
  operatorId: uuid('operator_id').notNull().references(() => operators.id, { onDelete: 'cascade' }),
  
  name: varchar('name', { length: 100 }).notNull(),
  ruleType: varchar('rule_type', { length: 50 }).notNull(), // early_bird, last_minute, repeat, group, duration
  
  conditions: jsonb('conditions').notNull(),
  
  discountType: varchar('discount_type', { length: 20 }).notNull(),
  discountValue: decimal('discount_value', { precision: 10, scale: 2 }).notNull(),
  
  isActive: boolean('is_active').default(true),
  priority: integer('priority').default(0),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// PAYMENT SETTINGS
// ═══════════════════════════════════════════════════════════════

export const operatorPaymentSettings = pgTable('operator_payment_settings', {
  operatorId: uuid('operator_id').primaryKey().references(() => operators.id, { onDelete: 'cascade' }),
  
  // Stripe Connect
  stripeEnabled: boolean('stripe_enabled').default(false),
  stripeAccountId: varchar('stripe_account_id', { length: 255 }),
  stripeAccessTokenEncrypted: text('stripe_access_token_encrypted'),
  stripeRefreshTokenEncrypted: text('stripe_refresh_token_encrypted'),
  stripeScope: varchar('stripe_scope', { length: 50 }),
  stripeAccountName: varchar('stripe_account_name', { length: 255 }),
  stripeAccountEmail: varchar('stripe_account_email', { length: 255 }),
  stripeChargesEnabled: boolean('stripe_charges_enabled').default(false),
  stripePayoutsEnabled: boolean('stripe_payouts_enabled').default(false),
  stripeRequirementsDue: text('stripe_requirements_due').array(),
  stripeConnectedAt: timestamp('stripe_connected_at', { withTimezone: true }),
  
  // PayPal
  paypalEnabled: boolean('paypal_enabled').default(false),
  paypalMerchantId: varchar('paypal_merchant_id', { length: 255 }),
  paypalEmail: varchar('paypal_email', { length: 255 }),
  paypalConnectedAt: timestamp('paypal_connected_at', { withTimezone: true }),
  
  // PromptPay
  promptpayEnabled: boolean('promptpay_enabled').default(false),
  promptpayNumber: varchar('promptpay_number', { length: 20 }),
  promptpayName: varchar('promptpay_name', { length: 255 }),
  promptpayQrUrl: text('promptpay_qr_url'),
  
  // Bank Transfer
  bankTransferEnabled: boolean('bank_transfer_enabled').default(false),
  bankName: varchar('bank_name', { length: 255 }),
  bankBranch: varchar('bank_branch', { length: 255 }),
  bankAccountName: varchar('bank_account_name', { length: 255 }),
  bankAccountNumber: varchar('bank_account_number', { length: 100 }),
  bankIban: varchar('bank_iban', { length: 50 }),
  bankSwift: varchar('bank_swift', { length: 20 }),
  bankInstructions: text('bank_instructions'),
  bankInstructionsTh: text('bank_instructions_th'),
  
  // On-site payment
  onSiteEnabled: boolean('on_site_enabled').default(true),
  onSiteMethods: text('on_site_methods').array().default(['cash']),
  onSiteInstructions: text('on_site_instructions'),
  onSiteInstructionsTh: text('on_site_instructions_th'),
  
  // General settings
  defaultCurrency: varchar('default_currency', { length: 3 }).default('THB'),
  acceptedCurrencies: text('accepted_currencies').array().default(['THB', 'EUR', 'USD']),
  
  // Deposit
  depositEnabled: boolean('deposit_enabled').default(false),
  depositPercentage: integer('deposit_percentage').default(30),
  depositMinAmount: decimal('deposit_min_amount', { precision: 10, scale: 2 }),
  
  // Pre-auth
  preauthEnabled: boolean('preauth_enabled').default(false),
  
  // Policies
  cancellationPolicy: text('cancellation_policy'),
  cancellationPolicyTh: text('cancellation_policy_th'),
  
  // Invoicing
  autoSendInvoice: boolean('auto_send_invoice').default(true),
  invoicePrefix: varchar('invoice_prefix', { length: 20 }).default('INV'),
  invoiceNotes: text('invoice_notes'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// PAYMENT TRANSACTIONS
// ═══════════════════════════════════════════════════════════════

export const paymentTransactions = pgTable('payment_transactions', {
  id: uuid('id').defaultRandom().primaryKey(),
  operatorId: uuid('operator_id').notNull().references(() => operators.id),
  bookingId: uuid('booking_id').references(() => bookings.id),
  
  transactionType: varchar('transaction_type', { length: 20 }).notNull(), // payment, refund, payout
  
  amount: decimal('amount', { precision: 12, scale: 2 }).notNull(),
  currency: varchar('currency', { length: 3 }).notNull(),
  
  paymentMethod: varchar('payment_method', { length: 30 }).notNull(),
  
  status: varchar('status', { length: 20 }).notNull(), // pending, succeeded, failed, refunded
  
  stripePaymentIntentId: varchar('stripe_payment_intent_id', { length: 255 }),
  stripeChargeId: varchar('stripe_charge_id', { length: 255 }),
  paypalTransactionId: varchar('paypal_transaction_id', { length: 255 }),
  
  description: text('description'),
  metadata: jsonb('metadata').default({}),
  
  errorCode: varchar('error_code', { length: 50 }),
  errorMessage: text('error_message'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  operatorIdx: index('payment_transactions_operator_idx').on(table.operatorId),
  bookingIdx: index('payment_transactions_booking_idx').on(table.bookingId),
  statusIdx: index('payment_transactions_status_idx').on(table.status),
}));

// ═══════════════════════════════════════════════════════════════
// OPERATOR SITE SETTINGS (Builder)
// ═══════════════════════════════════════════════════════════════

export const operatorSiteSettings = pgTable('operator_site_settings', {
  operatorId: uuid('operator_id').primaryKey().references(() => operators.id, { onDelete: 'cascade' }),
  
  // Branding
  primaryColor: varchar('primary_color', { length: 7 }).default('#3B7689'),
  secondaryColor: varchar('secondary_color', { length: 7 }).default('#68B59B'),
  accentColor: varchar('accent_color', { length: 7 }).default('#FF6B35'),
  
  fontHeading: varchar('font_heading', { length: 50 }).default('Outfit'),
  fontBody: varchar('font_body', { length: 50 }).default('Inter'),
  
  faviconUrl: text('favicon_url'),
  
  // Footer
  showPoweredBy: boolean('show_powered_by').default(true),
  footerText: text('footer_text'),
  
  // Integrations
  googleAnalyticsId: varchar('google_analytics_id', { length: 50 }),
  facebookPixelId: varchar('facebook_pixel_id', { length: 50 }),
  gtmId: varchar('gtm_id', { length: 50 }),
  
  whatsappNumber: varchar('whatsapp_number', { length: 50 }),
  lineId: varchar('line_id', { length: 100 }),
  
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// Operator custom pages
export const operatorPages = pgTable('operator_pages', {
  id: uuid('id').defaultRandom().primaryKey(),
  operatorId: uuid('operator_id').notNull().references(() => operators.id, { onDelete: 'cascade' }),
  
  slug: varchar('slug', { length: 100 }).notNull(),
  
  title: varchar('title', { length: 255 }).notNull(),
  titleTh: varchar('title_th', { length: 255 }),
  titleFr: varchar('title_fr', { length: 255 }),
  titleRu: varchar('title_ru', { length: 255 }),
  
  content: jsonb('content').default([]),
  
  metaTitle: varchar('meta_title', { length: 255 }),
  metaDescription: text('meta_description'),
  ogImage: text('og_image'),
  
  showInNav: boolean('show_in_nav').default(true),
  navOrder: integer('nav_order').default(0),
  
  isPublished: boolean('is_published').default(false),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  operatorSlugUnique: uniqueIndex('operator_pages_operator_slug_unique').on(table.operatorId, table.slug),
}));

// ═══════════════════════════════════════════════════════════════
// RIDER SESSIONS & ANALYTICS
// ═══════════════════════════════════════════════════════════════

export const riderSessions = pgTable('rider_sessions', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  anonymousId: varchar('anonymous_id', { length: 100 }),
  userId: uuid('user_id').references(() => users.id, { onDelete: 'set null' }),
  bookingId: uuid('booking_id').references(() => bookings.id, { onDelete: 'set null' }),
  routeId: uuid('route_id').references(() => routes.id, { onDelete: 'cascade' }),
  
  sourceType: varchar('source_type', { length: 20 }), // qr, booking_link, direct, explore
  sourceRef: varchar('source_ref', { length: 100 }),
  
  deviceType: varchar('device_type', { length: 20 }),
  userAgent: text('user_agent'),
  language: varchar('language', { length: 10 }),
  
  country: varchar('country', { length: 100 }),
  region: varchar('region', { length: 100 }),
  
  startedAt: timestamp('started_at', { withTimezone: true }).defaultNow(),
  
  navigationStartedAt: timestamp('navigation_started_at', { withTimezone: true }),
  navigationCompletedAt: timestamp('navigation_completed_at', { withTimezone: true }),
  
  distanceToStartKm: decimal('distance_to_start_km', { precision: 6, scale: 2 }),
  usedNavigateToStart: boolean('used_navigate_to_start').default(false),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  routeIdx: index('rider_sessions_route_idx').on(table.routeId),
  dateIdx: index('rider_sessions_date_idx').on(table.createdAt),
}));

// QR Codes tracking
export const qrCodes = pgTable('qr_codes', {
  id: uuid('id').defaultRandom().primaryKey(),
  operatorId: uuid('operator_id').notNull().references(() => operators.id, { onDelete: 'cascade' }),
  
  code: varchar('code', { length: 20 }).unique().notNull(),
  
  targetType: varchar('target_type', { length: 20 }).notNull(), // route, operator, booking
  targetId: uuid('target_id'),
  
  label: varchar('label', { length: 100 }),
  
  scanCount: integer('scan_count').default(0),
  lastScannedAt: timestamp('last_scanned_at', { withTimezone: true }),
  
  isActive: boolean('is_active').default(true),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// Route views
export const routeViews = pgTable('route_views', {
  id: uuid('id').defaultRandom().primaryKey(),
  routeId: uuid('route_id').notNull().references(() => routes.id, { onDelete: 'cascade' }),
  
  viewerIp: varchar('viewer_ip', { length: 45 }),
  viewerCountry: varchar('viewer_country', { length: 100 }),
  referrer: text('referrer'),
  userAgent: text('user_agent'),
  
  viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  routeIdx: index('route_views_route_idx').on(table.routeId),
  dateIdx: index('route_views_date_idx').on(table.viewedAt),
}));

// Operator profile views
export const operatorViews = pgTable('operator_views', {
  id: uuid('id').defaultRandom().primaryKey(),
  operatorId: uuid('operator_id').notNull().references(() => operators.id, { onDelete: 'cascade' }),
  
  viewerIp: varchar('viewer_ip', { length: 45 }),
  viewerCountry: varchar('viewer_country', { length: 100 }),
  referrer: text('referrer'),
  
  viewedAt: timestamp('viewed_at', { withTimezone: true }).defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// BADGES
// ═══════════════════════════════════════════════════════════════

export const badges = pgTable('badges', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  name: varchar('name', { length: 100 }).notNull(),
  nameTh: varchar('name_th', { length: 100 }),
  description: text('description'),
  
  icon: varchar('icon', { length: 50 }),
  color: varchar('color', { length: 7 }),
  
  autoRules: jsonb('auto_rules'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

export const operatorBadges = pgTable('operator_badges', {
  operatorId: uuid('operator_id').notNull().references(() => operators.id, { onDelete: 'cascade' }),
  badgeId: uuid('badge_id').notNull().references(() => badges.id, { onDelete: 'cascade' }),
  
  awardedAt: timestamp('awarded_at', { withTimezone: true }).defaultNow(),
  awardedBy: uuid('awarded_by').references(() => users.id),
});

// ═══════════════════════════════════════════════════════════════
// NEWSLETTER
// ═══════════════════════════════════════════════════════════════

export const newsletterSubscribers = pgTable('newsletter_subscribers', {
  id: uuid('id').defaultRandom().primaryKey(),
  email: varchar('email', { length: 255 }).unique().notNull(),
  
  subscriberType: varchar('subscriber_type', { length: 20 }).default('rider'), // rider, operator_prospect
  
  language: varchar('language', { length: 5 }).default('en'),
  regions: text('regions').array(),
  
  confirmedAt: timestamp('confirmed_at', { withTimezone: true }),
  confirmationToken: varchar('confirmation_token', { length: 100 }),
  
  unsubscribedAt: timestamp('unsubscribed_at', { withTimezone: true }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// BLOG
// ═══════════════════════════════════════════════════════════════

export const blogPosts = pgTable('blog_posts', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  slug: varchar('slug', { length: 255 }).unique().notNull(),
  
  title: varchar('title', { length: 255 }).notNull(),
  titleTh: varchar('title_th', { length: 255 }),
  titleFr: varchar('title_fr', { length: 255 }),
  titleRu: varchar('title_ru', { length: 255 }),
  
  excerpt: text('excerpt'),
  content: text('content'),
  contentTh: text('content_th'),
  contentFr: text('content_fr'),
  contentRu: text('content_ru'),
  
  coverUrl: text('cover_url'),
  
  authorId: uuid('author_id').references(() => users.id),
  
  status: varchar('status', { length: 20 }).default('draft'),
  publishedAt: timestamp('published_at', { withTimezone: true }),
  
  tags: text('tags').array().default([]),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
});

// ═══════════════════════════════════════════════════════════════
// NOTIFICATIONS
// ═══════════════════════════════════════════════════════════════

export const notifications = pgTable('notifications', {
  id: uuid('id').defaultRandom().primaryKey(),
  userId: uuid('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  
  type: varchar('type', { length: 50 }).notNull(),
  title: varchar('title', { length: 255 }).notNull(),
  body: text('body'),
  
  data: jsonb('data'),
  
  readAt: timestamp('read_at', { withTimezone: true }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  userIdx: index('notifications_user_idx').on(table.userId),
  unreadIdx: index('notifications_unread_idx').on(table.userId).where(table.readAt),
}));

// ═══════════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════════

export const auditLogs = pgTable('audit_logs', {
  id: uuid('id').defaultRandom().primaryKey(),
  
  userId: uuid('user_id').references(() => users.id),
  operatorId: uuid('operator_id').references(() => operators.id),
  
  action: varchar('action', { length: 100 }).notNull(),
  entityType: varchar('entity_type', { length: 50 }),
  entityId: uuid('entity_id'),
  
  oldValues: jsonb('old_values'),
  newValues: jsonb('new_values'),
  
  ipAddress: varchar('ip_address', { length: 45 }),
  userAgent: text('user_agent'),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => ({
  operatorIdx: index('audit_logs_operator_idx').on(table.operatorId),
  dateIdx: index('audit_logs_date_idx').on(table.createdAt),
}));

// ═══════════════════════════════════════════════════════════════
// PARTNER ACCESS TOKENS (for local partner dashboard)
// ═══════════════════════════════════════════════════════════════

export const partnerAccessTokens = pgTable('partner_access_tokens', {
  id: uuid('id').defaultRandom().primaryKey(),
  localPartnerId: uuid('local_partner_id').notNull().references(() => localPartners.id, { onDelete: 'cascade' }),
  
  token: varchar('token', { length: 100 }).unique().notNull(),
  email: varchar('email', { length: 255 }),
  
  lastAccessedAt: timestamp('last_accessed_at', { withTimezone: true }),
  expiresAt: timestamp('expires_at', { withTimezone: true }),
  
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
});
