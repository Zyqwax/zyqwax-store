/**
 * Admin hesabı seed scripti
 * Kullanım: node scripts/seed-admin.mjs
 * 
 * .env.local dosyasında MONGODB_URI, ADMIN_EMAIL ve ADMIN_PASSWORD tanımlı olmalı
 */

import { config } from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { readFileSync } from 'fs';

// .env.local dosyasını yükle
const envPath = join(dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
try {
  const envContent = readFileSync(envPath, 'utf-8');
  envContent.split('\n').forEach(line => {
    const [key, ...vals] = line.split('=');
    if (key && !key.startsWith('#')) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  });
} catch (e) {
  console.log('⚠️  .env.local bulunamadı, environment değişkenlerini manuel set edin');
}

const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI tanımlı değil!');
  process.exit(1);
}

await mongoose.connect(MONGODB_URI);
console.log('✅ MongoDB bağlantısı kuruldu');

const UserSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true },
  password: String,
  role: String,
  isActive: Boolean,
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', UserSchema);

// Mevcut admin kontrolü
const existing = await User.findOne({ email: ADMIN_EMAIL });
if (existing) {
  console.log(`⚠️  Admin hesabı zaten mevcut: ${ADMIN_EMAIL}`);
  await mongoose.disconnect();
  process.exit(0);
}

const salt = await bcrypt.genSalt(12);
const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, salt);

await User.create({
  name: 'Admin',
  email: ADMIN_EMAIL,
  password: hashedPassword,
  role: 'admin',
  isActive: true,
});

console.log('✅ Admin hesabı oluşturuldu:');
console.log(`   E-posta: ${ADMIN_EMAIL}`);
console.log(`   Şifre:   ${ADMIN_PASSWORD}`);
console.log('\n🚀 Artık /login adresinden giriş yapabilirsiniz!');

await mongoose.disconnect();
process.exit(0);
