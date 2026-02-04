// ═══════════════════════════════════════════════════════════════
// MOVANA DATABASE SEED
// Run with: pnpm db:seed
// ═══════════════════════════════════════════════════════════════

import { db, closeConnection } from './client';
import { 
  regions, 
  routeThemes, 
  badges,
} from './schema';

async function seed() {
  console.log('🌱 Seeding database...\n');

  // ═══════════════════════════════════════════════════════════════
  // REGIONS
  // ═══════════════════════════════════════════════════════════════
  console.log('📍 Seeding regions...');
  
  const regionsData = [
    { 
      name: 'Pattaya & Jomtien', 
      nameTh: 'พัทยาและจอมเทียน',
      slug: 'pattaya-jomtien',
      centerLatitude: '12.9236',
      centerLongitude: '100.8825',
      sortOrder: 1,
    },
    { 
      name: 'Chiang Mai', 
      nameTh: 'เชียงใหม่',
      slug: 'chiang-mai',
      centerLatitude: '18.7883',
      centerLongitude: '98.9853',
      sortOrder: 2,
    },
    { 
      name: 'Phuket', 
      nameTh: 'ภูเก็ต',
      slug: 'phuket',
      centerLatitude: '7.8804',
      centerLongitude: '98.3923',
      sortOrder: 3,
    },
    { 
      name: 'Bangkok', 
      nameTh: 'กรุงเทพ',
      slug: 'bangkok',
      centerLatitude: '13.7563',
      centerLongitude: '100.5018',
      sortOrder: 4,
    },
    { 
      name: 'Krabi', 
      nameTh: 'กระบี่',
      slug: 'krabi',
      centerLatitude: '8.0863',
      centerLongitude: '98.9063',
      sortOrder: 5,
    },
    { 
      name: 'Koh Samui', 
      nameTh: 'เกาะสมุย',
      slug: 'koh-samui',
      centerLatitude: '9.5120',
      centerLongitude: '100.0136',
      sortOrder: 6,
    },
    { 
      name: 'Chiang Rai', 
      nameTh: 'เชียงราย',
      slug: 'chiang-rai',
      centerLatitude: '19.9105',
      centerLongitude: '99.8406',
      sortOrder: 7,
    },
    { 
      name: 'Hua Hin', 
      nameTh: 'หัวหิน',
      slug: 'hua-hin',
      centerLatitude: '12.5684',
      centerLongitude: '99.9577',
      sortOrder: 8,
    },
    { 
      name: 'Rayong', 
      nameTh: 'ระยอง',
      slug: 'rayong',
      centerLatitude: '12.6814',
      centerLongitude: '101.2816',
      sortOrder: 9,
    },
    { 
      name: 'Koh Samet', 
      nameTh: 'เกาะเสม็ด',
      slug: 'koh-samet',
      centerLatitude: '12.5708',
      centerLongitude: '101.4553',
      sortOrder: 10,
    },
  ];

  await db.insert(regions).values(regionsData).onConflictDoNothing();
  console.log(`  ✅ ${regionsData.length} regions inserted\n`);

  // ═══════════════════════════════════════════════════════════════
  // ROUTE THEMES
  // ═══════════════════════════════════════════════════════════════
  console.log('🎨 Seeding route themes...');
  
  const themesData = [
    { 
      slug: 'scenic', 
      name: 'Scenic', 
      nameTh: 'วิวสวย',
      nameFr: 'Paysages',
      nameRu: 'Живописный',
      icon: 'mountain',
      color: '#3B7689',
      sortOrder: 1,
    },
    { 
      slug: 'cultural', 
      name: 'Cultural', 
      nameTh: 'วัฒนธรรม',
      nameFr: 'Culturel',
      nameRu: 'Культурный',
      icon: 'landmark',
      color: '#E8B86D',
      sortOrder: 2,
    },
    { 
      slug: 'beach', 
      name: 'Beach', 
      nameTh: 'ชายหาด',
      nameFr: 'Plage',
      nameRu: 'Пляж',
      icon: 'waves',
      color: '#68B59B',
      sortOrder: 3,
    },
    { 
      slug: 'mountain', 
      name: 'Mountain', 
      nameTh: 'ภูเขา',
      nameFr: 'Montagne',
      nameRu: 'Горы',
      icon: 'triangle',
      color: '#8B5CF6',
      sortOrder: 4,
    },
    { 
      slug: 'urban', 
      name: 'Urban', 
      nameTh: 'ในเมือง',
      nameFr: 'Urbain',
      nameRu: 'Городской',
      icon: 'building',
      color: '#6B7280',
      sortOrder: 5,
    },
    { 
      slug: 'food', 
      name: 'Food & Drink', 
      nameTh: 'อาหารและเครื่องดื่ม',
      nameFr: 'Gastronomie',
      nameRu: 'Еда и напитки',
      icon: 'utensils',
      color: '#E07A5F',
      sortOrder: 6,
    },
    { 
      slug: 'wildlife', 
      name: 'Wildlife & Nature', 
      nameTh: 'ธรรมชาติ',
      nameFr: 'Nature',
      nameRu: 'Природа',
      icon: 'leaf',
      color: '#22C55E',
      sortOrder: 7,
    },
    { 
      slug: 'family', 
      name: 'Family', 
      nameTh: 'ครอบครัว',
      nameFr: 'Famille',
      nameRu: 'Семейный',
      icon: 'users',
      color: '#68B59B',
      sortOrder: 8,
    },
    { 
      slug: 'romantic', 
      name: 'Romantic', 
      nameTh: 'โรแมนติก',
      nameFr: 'Romantique',
      nameRu: 'Романтический',
      icon: 'heart',
      color: '#EC4899',
      sortOrder: 9,
    },
    { 
      slug: 'adventure', 
      name: 'Adventure', 
      nameTh: 'ผจญภัย',
      nameFr: 'Aventure',
      nameRu: 'Приключение',
      icon: 'zap',
      color: '#F59E0B',
      sortOrder: 10,
    },
  ];

  await db.insert(routeThemes).values(themesData).onConflictDoNothing();
  console.log(`  ✅ ${themesData.length} themes inserted\n`);

  // ═══════════════════════════════════════════════════════════════
  // BADGES
  // ═══════════════════════════════════════════════════════════════
  console.log('🏅 Seeding badges...');
  
  const badgesData = [
    {
      name: 'Verified',
      nameTh: 'ยืนยันแล้ว',
      description: 'Verified operator by Movana team',
      icon: 'check-circle',
      color: '#3B7689',
    },
    {
      name: 'Eco-Friendly',
      nameTh: 'รักษ์โลก',
      description: 'Committed to sustainable tourism practices',
      icon: 'leaf',
      color: '#22C55E',
    },
    {
      name: 'Top Rated',
      nameTh: 'ยอดนิยม',
      description: 'Consistently high ratings from customers',
      icon: 'star',
      color: '#E8B86D',
    },
    {
      name: 'Local Expert',
      nameTh: 'ผู้เชี่ยวชาญท้องถิ่น',
      description: 'Deep knowledge of local culture and routes',
      icon: 'map-pin',
      color: '#8B5CF6',
    },
    {
      name: 'Family Friendly',
      nameTh: 'เหมาะสำหรับครอบครัว',
      description: 'Great options for families with children',
      icon: 'users',
      color: '#EC4899',
    },
    {
      name: 'Premium Fleet',
      nameTh: 'ยานพาหนะพรีเมียม',
      description: 'High-quality, well-maintained bikes',
      icon: 'bike',
      color: '#3B7689',
    },
  ];

  await db.insert(badges).values(badgesData).onConflictDoNothing();
  console.log(`  ✅ ${badgesData.length} badges inserted\n`);

  // ═══════════════════════════════════════════════════════════════
  // DONE
  // ═══════════════════════════════════════════════════════════════
  console.log('✨ Database seeded successfully!\n');
}

// Run seed
seed()
  .catch((err) => {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  })
  .finally(async () => {
    await closeConnection();
  });
