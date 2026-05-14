# Elysia + Drizzle ORM + MySQL - REST API

API REST modern yang dibangun dengan ElysiaJS, Drizzle ORM, dan MySQL. Aplikasi ini menyediakan sistem manajemen pengguna, postingan, dan komentar dengan fitur autentikasi.

## 📋 Daftar Isi

- [Fitur](#-fitur)
- [Technology Stack](#-technology-stack)
- [Arsitektur Aplikasi](#-arsitektur-aplikasi)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints)
- [Setup Project](#-setup-project)
- [Menjalankan Aplikasi](#-menjalankan-aplikasi)
- [Testing](#-testing)
- [Scripts yang Tersedia](#-scripts-yang-tersedia)

## ✨ Fitur

- 🚀 Fast dan lightweight dengan ElysiaJS
- 🗄️ Type-safe database queries dengan Drizzle ORM
- 🔐 Sistem autentikasi dengan session token
- 📝 API documentation otomatis dengan Swagger
- ✅ Input validation dengan Zod
- 🧪 Unit testing dengan Bun test
- 🔄 CORS support
- 📊 Request logging middleware
- ⚠️ Error handling middleware
- 🔒 Password hashing dengan bcrypt

## 🛠 Technology Stack

### Runtime & Framework
- **Runtime**: Bun
- **Framework**: ElysiaJS v1.4.28
- **Adapter**: @elysiajs/node v1.4.5

### Database & ORM
- **Database**: MySQL
- **ORM**: Drizzle ORM v0.45.2
- **Database Client**: mysql2 v3.22.3
- **Migration Tool**: Drizzle Kit v0.31.10

### Validation & Security
- **Validation**: Zod v3.24.1
- **Password Hashing**: bcrypt v6.0.0
- **Session Management**: UUID v14.0.0

### Development Tools
- **Language**: TypeScript v6.0.3
- **Build Tool**: esbuild v0.28.0
- **Dev Runner**: tsx v4.21.0
- **API Documentation**: @elysiajs/swagger v1.3.1
- **Testing**: Bun test

## 🏗 Arsitektur Aplikasi

### Struktur Folder

```
belajar-vibe-coding/
├── src/
│   ├── config/              # Konfigurasi aplikasi
│   │   ├── database.ts      # Koneksi database MySQL
│   │   └── env.ts           # Environment variables
│   │
│   ├── db/                  # Database layer
│   │   ├── schema.ts        # Definisi schema database (Drizzle)
│   │   ├── index.ts         # Export database instance
│   │   └── seed.ts          # Data seeding
│   │
│   ├── middleware/          # Custom middleware
│   │   ├── auth.ts          # Authentication middleware
│   │   ├── cors.ts          # CORS configuration
│   │   ├── error.ts         # Error handling
│   │   ├── logging.ts       # Request logging
│   │   └── index.ts         # Middleware exports
│   │
│   ├── models/              # Data models (Repository pattern)
│   │   ├── user.model.ts    # User CRUD operations
│   │   ├── post.model.ts    # Post CRUD operations
│   │   ├── comment.model.ts # Comment CRUD operations
│   │   └── index.ts         # Model exports
│   │
│   ├── routes/              # API routes
│   │   ├── auth.ts          # Authentication endpoints
│   │   ├── users.ts         # User management endpoints
│   │   ├── posts.ts         # Post management endpoints
│   │   └── index.ts         # Route aggregation
│   │
│   ├── services/            # Business logic layer
│   │   ├── auth-service.ts  # Login, logout logic
│   │   └── user-service.ts  # User registration logic
│   │
│   ├── types/               # TypeScript type definitions
│   │   └── index.ts         # Shared types
│   │
│   └── server.ts            # Entry point aplikasi
│
├── tests/                   # Unit tests
│   ├── auth/                # Authentication tests
│   ├── users/               # User endpoint tests
│   ├── posts/               # Post endpoint tests
│   └── helpers/             # Test utilities
│
├── dist/                    # Build output (production)
├── .env                     # Environment variables (local)
├── .env.example             # Environment template
├── drizzle.config.ts        # Drizzle ORM configuration
├── tsconfig.json            # TypeScript configuration
└── package.json             # Dependencies & scripts
```

### Penjelasan Struktur

#### **config/**
Berisi konfigurasi aplikasi seperti koneksi database dan environment variables.

#### **db/**
Layer database yang berisi schema definition menggunakan Drizzle ORM dan fungsi seeding.

#### **middleware/**
Custom middleware untuk handling CORS, authentication, logging, dan error handling.

#### **models/**
Implementasi Repository pattern untuk operasi CRUD pada setiap entitas (User, Post, Comment).

#### **routes/**
Definisi endpoint API yang dikelompokkan berdasarkan resource (auth, users, posts).

#### **services/**
Business logic layer yang memisahkan logika bisnis dari route handlers.

#### **types/**
Type definitions untuk TypeScript yang digunakan di seluruh aplikasi.

## 🗄 Database Schema

### Tabel: `users`
Menyimpan informasi pengguna aplikasi.

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID unik pengguna |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Email pengguna |
| username | VARCHAR(100) | NOT NULL, UNIQUE | Username pengguna |
| password | VARCHAR(255) | NOT NULL | Password ter-hash |
| firstName | VARCHAR(100) | NULL | Nama depan |
| lastName | VARCHAR(100) | NULL | Nama belakang |
| role | VARCHAR(50) | DEFAULT 'user' | Role pengguna |
| isActive | INT | DEFAULT 1 | Status aktif (1=aktif, 0=nonaktif) |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pembuatan |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Waktu update terakhir |

### Tabel: `posts`
Menyimpan postingan yang dibuat oleh pengguna.

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID unik post |
| title | VARCHAR(255) | NOT NULL | Judul post |
| content | TEXT | NOT NULL | Konten post |
| authorId | INT | NOT NULL, FOREIGN KEY → users(id) | ID penulis |
| status | VARCHAR(50) | DEFAULT 'draft' | Status post (draft/published) |
| publishedAt | TIMESTAMP | NULL | Waktu publikasi |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pembuatan |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Waktu update terakhir |

### Tabel: `comments`
Menyimpan komentar pada postingan.

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID unik comment |
| content | TEXT | NOT NULL | Konten komentar |
| postId | INT | NOT NULL, FOREIGN KEY → posts(id) | ID post |
| authorId | INT | NOT NULL, FOREIGN KEY → users(id) | ID penulis komentar |
| parentId | INT | NULL, FOREIGN KEY → comments(id) | ID parent comment (untuk nested comments) |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pembuatan |
| updatedAt | TIMESTAMP | ON UPDATE CURRENT_TIMESTAMP | Waktu update terakhir |

### Tabel: `sessions`
Menyimpan session token untuk autentikasi.

| Kolom | Tipe | Constraint | Deskripsi |
|-------|------|-----------|-----------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | ID unik session |
| token | VARCHAR(255) | NOT NULL, UNIQUE | Session token (UUID) |
| userId | INT | NOT NULL, FOREIGN KEY → users(id) | ID pengguna |
| createdAt | TIMESTAMP | DEFAULT CURRENT_TIMESTAMP | Waktu pembuatan session |

### Relasi Database

```
users (1) ──< (N) posts
users (1) ──< (N) comments
posts (1) ──< (N) comments
users (1) ──< (N) sessions
comments (1) ──< (N) comments (self-referencing untuk nested comments)
```

## 📡 API Endpoints

Base URL: `http://localhost:3000/api`

### Authentication Endpoints

#### POST `/auth/register`
Registrasi pengguna baru.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (201):**
```json
{
  "data": "OK"
}
```

#### POST `/auth/login`
Login pengguna dan mendapatkan session token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "data": "uuid-token-here"
}
```

### User Endpoints

#### GET `/users`
Mendapatkan semua pengguna.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "email": "john@example.com",
      "username": "johndoe",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": 1,
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Users retrieved successfully"
}
```

#### GET `/users/:id`
Mendapatkan pengguna berdasarkan ID.

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "email": "john@example.com",
    "username": "johndoe",
    "firstName": "John",
    "lastName": "Doe"
  },
  "message": "User retrieved successfully"
}
```

#### POST `/users`
Membuat pengguna baru.

**Request Body:**
```json
{
  "email": "jane@example.com",
  "username": "janedoe",
  "password": "password123",
  "firstName": "Jane",
  "lastName": "Doe",
  "role": "user"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": { /* user object */ },
  "message": "User created successfully"
}
```

#### PUT `/users/:id`
Update pengguna berdasarkan ID.

**Request Body:**
```json
{
  "firstName": "Jane Updated",
  "lastName": "Doe Updated"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": { /* updated user object */ },
  "message": "User updated successfully"
}
```

#### DELETE `/users/:id`
Soft delete pengguna (set isActive = 0).

**Response (200):**
```json
{
  "success": true,
  "data": { /* deleted user object */ },
  "message": "User deleted successfully"
}
```

#### GET `/users/current` 🔒
Mendapatkan informasi pengguna yang sedang login (memerlukan authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "John",
    "email": "john@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

#### DELETE `/users/logout` 🔒
Logout pengguna dan menghapus session token (memerlukan authentication).

**Headers:**
```
Authorization: Bearer <token>
```

**Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "John",
    "email": "john@example.com"
  }
}
```

### Post Endpoints

#### GET `/posts`
Mendapatkan semua postingan.

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "My First Post",
      "content": "This is the content",
      "authorId": 1,
      "status": "published",
      "publishedAt": "2024-01-01T00:00:00.000Z",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    }
  ],
  "message": "Posts retrieved successfully"
}
```

#### GET `/posts/:id`
Mendapatkan postingan berdasarkan ID.

#### POST `/posts`
Membuat postingan baru.

**Request Body:**
```json
{
  "title": "New Post",
  "content": "Post content here",
  "authorId": 1,
  "status": "draft",
  "publishedAt": "2024-01-01T00:00:00.000Z"
}
```

#### PUT `/posts/:id`
Update postingan berdasarkan ID.

#### DELETE `/posts/:id`
Hapus postingan secara permanen.

## 🚀 Setup Project

### Prerequisites

Pastikan sudah terinstall:
- **Bun** (runtime JavaScript/TypeScript)
- **MySQL Server** (database)
- **Git** (version control)

### Langkah-langkah Setup

1. **Clone repository**
   ```bash
   git clone <repository-url>
   cd belajar-vibe-coding
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Setup database**
   
   Buat database MySQL baru:
   ```sql
   CREATE DATABASE elysia_drizzle;
   ```

4. **Konfigurasi environment variables**
   
   Copy file `.env.example` menjadi `.env`:
   ```bash
   cp .env.example .env
   ```
   
   Edit file `.env` sesuai konfigurasi MySQL Anda:
   ```env
   NODE_ENV=development
   PORT=3000
   HOST=localhost

   DB_HOST=localhost
   DB_PORT=3306
   DB_USER=root
   DB_PASSWORD=your_password
   DB_NAME=elysia_drizzle
   ```

5. **Push schema ke database**
   
   Jalankan perintah untuk membuat tabel di database:
   ```bash
   bun run db:push
   ```

6. **(Opsional) Seed database dengan data dummy**
   ```bash
   bun run db:seed
   ```

## ▶️ Menjalankan Aplikasi

### Development Mode

Jalankan server dalam mode development dengan auto-reload:
```bash
bun run dev
```

Server akan berjalan di `http://localhost:3000`

### Production Mode

1. **Build aplikasi:**
   ```bash
   bun run build
   ```

2. **Jalankan production server:**
   ```bash
   bun run start
   ```

### Akses API Documentation

Setelah server berjalan, buka browser dan akses:
```
http://localhost:3000/swagger
```

Anda akan melihat dokumentasi API interaktif yang dibuat otomatis oleh Swagger.

## 🧪 Testing

### Menjalankan Test

Jalankan semua unit test:
```bash
bun test
```

### Watch Mode

Jalankan test dalam watch mode (auto-rerun saat ada perubahan):
```bash
bun run test:watch
```

### Test Coverage

Test mencakup:
- ✅ Authentication (register, login)
- ✅ User management (CRUD operations)
- ✅ Post management (CRUD operations)
- ✅ Protected routes (current user, logout)
- ✅ Input validation
- ✅ Error handling

File test terletak di folder `tests/`:
```
tests/
├── auth/
│   ├── login.test.ts
│   └── register.test.ts
├── users/
│   ├── create-user.test.ts
│   ├── get-users.test.ts
│   ├── get-user-by-id.test.ts
│   ├── update-user.test.ts
│   ├── delete-user.test.ts
│   ├── get-current-user.test.ts
│   └── logout.test.ts
└── posts/
    ├── create-post.test.ts
    ├── get-posts.test.ts
    ├── get-post-by-id.test.ts
    ├── update-post.test.ts
    └── delete-post.test.ts
```

## 📜 Scripts yang Tersedia

| Script | Deskripsi |
|--------|-----------|
| `bun run dev` | Menjalankan development server dengan auto-reload |
| `bun run build` | Build aplikasi untuk production |
| `bun run start` | Menjalankan production server |
| `bun test` | Menjalankan semua unit test |
| `bun run test:watch` | Menjalankan test dalam watch mode |
| `bun run db:generate` | Generate migration files dari schema |
| `bun run db:migrate` | Menjalankan database migrations |
| `bun run db:push` | Push schema changes langsung ke database |
| `bun run db:drop` | Drop semua tabel di database |
| `bun run db:studio` | Membuka Drizzle Studio (GUI untuk database) |
| `bun run db:seed` | Seed database dengan data dummy |

## 📝 Catatan Penting

### Validasi Input
- **Username**: maksimal 100 karakter
- **Email**: maksimal 255 karakter, harus format email valid
- **Password**: minimal 6 karakter
- **firstName/lastName**: maksimal 100 karakter

### Authentication
- Menggunakan session token berbasis UUID
- Token disimpan di tabel `sessions`
- Protected routes memerlukan header: `Authorization: Bearer <token>`
- Logout akan menghapus session dari database

### Error Handling
- Duplicate email/username: HTTP 409
- Validation error: HTTP 400
- Unauthorized: HTTP 401
- Not found: HTTP 404
- Server error: HTTP 500

## 📄 License

MIT

---

**Dibuat dengan ❤️ menggunakan ElysiaJS, Drizzle ORM, dan MySQL**
