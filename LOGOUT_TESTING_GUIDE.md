# User Logout API - Testing Guide

## Overview
Panduan lengkap untuk testing endpoint logout user yang telah diimplementasikan di branch `feature/logout-user`.

## Prerequisites
- Server sudah running di `http://localhost:3000`
- Database sudah terkoneksi
- User sudah terdaftar di database

## Testing Tools
Anda bisa menggunakan salah satu dari:
- **Postman** - GUI tool untuk API testing
- **Thunder Client** - VS Code extension
- **curl** - Command line tool
- **REST Client** - VS Code extension

---

## Test Scenarios

### Scenario 1: Successful Logout ✅

#### Step 1: Login untuk mendapatkan token

**Method:** POST  
**URL:** `http://localhost:3000/api/auth/login`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:**
```json
{
  "email": "ade@example.com",
  "password": "password123"
}
```

**Expected Response (200):**
```json
{
  "data": "token-uuid-here"
}
```

**Save token untuk step berikutnya**

---

#### Step 2: Logout dengan token yang valid

**Method:** DELETE  
**URL:** `http://localhost:3000/api/users/logout`  
**Headers:**
```
Authorization: Bearer token-uuid-here
Content-Type: application/json
```

**Request Body:** (kosong)

**Expected Response (200):**
```json
{
  "data": {
    "id": 1,
    "name": "ade",
    "email": "ade@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  }
}
```

---

#### Step 3: Verifikasi token sudah dihapus dari database

**Method:** DELETE  
**URL:** `http://localhost:3000/api/users/logout`  
**Headers:**
```
Authorization: Bearer token-uuid-here
Content-Type: application/json
```

**Expected Response (401):**
```json
{
  "error": "Unauthorized"
}
```

**Penjelasan:** Token yang sama tidak bisa digunakan lagi karena sudah dihapus dari database.

---

### Scenario 2: Logout Tanpa Authorization Header ❌

**Method:** DELETE  
**URL:** `http://localhost:3000/api/users/logout`  
**Headers:**
```
Content-Type: application/json
```

**Request Body:** (kosong)

**Expected Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

### Scenario 3: Logout dengan Invalid Token ❌

**Method:** DELETE  
**URL:** `http://localhost:3000/api/users/logout`  
**Headers:**
```
Authorization: Bearer invalid-token-12345
Content-Type: application/json
```

**Request Body:** (kosong)

**Expected Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

### Scenario 4: Logout dengan Malformed Authorization Header ❌

**Method:** DELETE  
**URL:** `http://localhost:3000/api/users/logout`  
**Headers:**
```
Authorization: invalid-format-token
Content-Type: application/json
```

**Request Body:** (kosong)

**Expected Response (401):**
```json
{
  "error": "Unauthorized"
}
```

---

## Testing dengan curl

### Test 1: Login
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"ade@example.com","password":"password123"}'
```

### Test 2: Logout (ganti TOKEN dengan token dari login)
```bash
curl -X DELETE http://localhost:3000/api/users/logout \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"
```

### Test 3: Logout dengan token yang sama (harus gagal)
```bash
curl -X DELETE http://localhost:3000/api/users/logout \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json"
```

---

## Testing dengan Postman

### Setup Collection

1. **Create New Collection** → "Logout Testing"

2. **Create Request 1: Login**
   - Name: "Login User"
   - Method: POST
   - URL: `{{base_url}}/api/auth/login`
   - Body (raw JSON):
     ```json
     {
       "email": "ade@example.com",
       "password": "password123"
     }
     ```
   - Tests (untuk auto-save token):
     ```javascript
     if (pm.response.code === 200) {
       var jsonData = pm.response.json();
       pm.environment.set("token", jsonData.data);
     }
     ```

3. **Create Request 2: Logout**
   - Name: "Logout User"
   - Method: DELETE
   - URL: `{{base_url}}/api/users/logout`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer {{token}}`

4. **Create Request 3: Logout Again (Should Fail)**
   - Name: "Logout Again (Should Fail)"
   - Method: DELETE
   - URL: `{{base_url}}/api/users/logout`
   - Headers:
     - Key: `Authorization`
     - Value: `Bearer {{token}}`

5. **Setup Environment Variables**
   - Create new environment "Local"
   - Add variable: `base_url` = `http://localhost:3000`

### Run Tests
1. Select "Local" environment
2. Run "Login User" request
3. Run "Logout User" request → Should return 200 with user data
4. Run "Logout Again (Should Fail)" request → Should return 401

---

## Testing dengan Thunder Client (VS Code)

1. Install Thunder Client extension
2. Create new request
3. Set method to DELETE
4. Set URL to `http://localhost:3000/api/users/logout`
5. Add header: `Authorization: Bearer <token>`
6. Send request

---

## Database Verification

### Check Session Before Logout
```sql
SELECT * FROM sessions WHERE token = 'your-token-here';
```

### Check Session After Logout
```sql
SELECT * FROM sessions WHERE token = 'your-token-here';
-- Should return empty result
```

---

## Expected Behavior Summary

| Scenario | Method | Status | Response |
|----------|--------|--------|----------|
| Valid token | DELETE /logout | 200 | User data |
| No header | DELETE /logout | 401 | Unauthorized |
| Invalid token | DELETE /logout | 401 | Unauthorized |
| Malformed header | DELETE /logout | 401 | Unauthorized |
| Token used twice | DELETE /logout | 401 | Unauthorized |

---

## Troubleshooting

### Issue: "Unauthorized" pada logout pertama kali
**Solusi:**
- Pastikan token dari login response benar-benar disalin
- Pastikan format header: `Authorization: Bearer <token>`
- Cek database apakah session sudah tersimpan

### Issue: Token masih bisa digunakan setelah logout
**Solusi:**
- Cek database apakah session benar-benar terhapus
- Restart server
- Cek apakah ada caching di client

### Issue: Server error 500
**Solusi:**
- Cek console server untuk error message
- Pastikan database connection aktif
- Cek apakah ada error di auth-service.ts

---

## Performance Testing

### Load Testing (Optional)
Jika ingin test dengan multiple concurrent requests:

```bash
# Menggunakan Apache Bench
ab -n 100 -c 10 -H "Authorization: Bearer <token>" -X DELETE http://localhost:3000/api/users/logout
```

---

## Security Testing

### Test 1: SQL Injection
```bash
curl -X DELETE "http://localhost:3000/api/users/logout" \
  -H "Authorization: Bearer ' OR '1'='1"
```
**Expected:** 401 Unauthorized (tidak ada SQL injection)

### Test 2: Token Tampering
```bash
# Ubah satu karakter di token
curl -X DELETE "http://localhost:3000/api/users/logout" \
  -H "Authorization: Bearer token-uuid-here-MODIFIED"
```
**Expected:** 401 Unauthorized

---

## Checklist Testing

- [ ] Login berhasil mendapatkan token
- [ ] Logout dengan token valid mengembalikan 200
- [ ] Response logout berisi data user yang benar
- [ ] Session terhapus dari database setelah logout
- [ ] Token tidak bisa digunakan lagi setelah logout
- [ ] Logout tanpa header mengembalikan 401
- [ ] Logout dengan invalid token mengembalikan 401
- [ ] Logout dengan malformed header mengembalikan 401
- [ ] Error message konsisten ("Unauthorized")
- [ ] Response format sesuai spesifikasi

---

## Notes

- Token adalah UUID yang di-generate saat login
- Session dihapus dari database saat logout
- Setelah logout, user harus login lagi untuk mendapatkan token baru
- Endpoint ini menggunakan method DELETE (bukan POST)
- Path endpoint adalah `/api/users/logout` (bukan `/api/auth/logout`)

---

**Happy Testing! 🚀**
