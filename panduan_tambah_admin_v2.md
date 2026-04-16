# Panduan Menambahkan Akses Admin pada V2 Ruang Sosmed

Dokumen ini berisi panduan untuk memberikan hak akses Admin (Admin Privileges) kepada user/student lain yang sudah terdaftar di aplikasi Ruang Sosmed V2. Sistem aplikasi V2 saat ini mengenali Admin dari kolom `role` pada tabel `v2_profiles` yang bernilai `'admin'`.

Terdapat dua cara untuk menjadikan user sebagai admin. Anda bisa menggunakan **Cara 1** untuk hal yang bersifat insidental dan cepat, atau **Cara 2** jika Anda benar-benar mau membakukan fiturnya di dalam *Codebase* Anda.

---

## Cara 1: Eksekusi Kilat via Supabase SQL Editor (Rekomendasi)
Paling praktis jika Anda hanya memiliki sedikit admin (seperti internal tim) dan proses pengangkatan admin jarang terjadi.

**Langkah-langkah:**
1. Masuk ke halaman **Supabase Dashboard** Anda.
2. Buka menu **SQL Editor**.
3. *Copy-paste* baris SQL di bawah ini, ubah variabel *username/nama* yang dituju, dan klik **Run**.

```sql
-- Mengubah user menjadi Admin berdasarkan username (Paling Akurat)
UPDATE v2_profiles
SET role = 'admin'
WHERE username = 'masukkan_username_student_disini';

-- ATAU Mengubah user menjadi Admin berdasarkan nama lengkapnya
UPDATE v2_profiles
SET role = 'admin'
WHERE full_name ILIKE '%nama_student_disini%';
```

Untuk mengembalikannya menjadi student biasa:
```sql
UPDATE v2_profiles
SET role = 'student'
WHERE username = 'masukkan_username_student_disini';
```

---

## Cara 2: Menambahkan Fitur ke UI Source Code
Cara ini digunakan jika Anda ingin fitur tombol "Jadikan Admin" terus ada secara permanen di Dashboard Admin saat ini, sehingga tidak perlu bolak-balik buka Supabase.

### Langkah 2.1: Menambahkan Fungsi Backend (Server Action)
Buka file `src/app/ruang-sosmed/actions.ts` dan tambahkan fungsi keamanan ini di bagian paling bawah. Skrip ini memastikan agar hanya admin yang aktif saja yang bisa mempromosikan user lain:

```typescript
export async function promoteUserToAdminAction(requesterUserId: string, targetUserId: string) {
  if (!supabaseAdminV2) {
     return { success: false, error: 'SUPABASE_V2_SERVICE_ROLE_KEY missing.' };
  }

  try {
    // Keamanan Lapis 1: Verifikasi bahwa yang memerintahkan (requester) adalah admin juga
    const { data: requester, error: reqError } = await supabaseAdminV2
      .from('v2_profiles')
      .select('role')
      .eq('id', requesterUserId)
      .single();

    if (reqError || requester?.role !== 'admin') {
       // Catatan: Akun Arunika dibebaskan jika Anda memperbolehkannya via hardcode, 
       // namun best practice adalah memastikan data base tabel profil Arunika juga diset 'admin'.
      return { success: false, error: 'Akses Ditolak: Anda tidak memiliki wewenang.' };
    }

    // Eksekusi: Update role target
    const { error: updateError } = await supabaseAdminV2
      .from('v2_profiles')
      .update({ role: 'admin' })
      .eq('id', targetUserId);

    if (updateError) throw updateError;
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
```

### Langkah 2.2: Buat Komponen UI "User Management"
Karena arsitektur V2 Anda menggunakan file-file UI raksasa dalam `src/app/ruang-sosmed/_core`, letak terbaik untuk hal ini adalah menambah "Modal" atau tab baru di dalam:
* `BatchListContent.tsx` (Dashboard utama admin yang melihat seluruh angkatan)

Tambahkan tombol sederhana pada barisan profil student (atau di page khusus jika Anda merancangnya) yang dihubungkan ke server action tadi:

```typescript
import { promoteUserToAdminAction } from '../actions';
import { toast } from 'react-hot-toast';

// ... di dalam Komponen Anda
const handlePromote = async (targetId: string) => {
    // currentUser.id adalah ID milik Admin yang sedang login
    const res = await promoteUserToAdminAction(currentUser?.id as string, targetId);
    
    if(res.success){
        toast.success("User berhasil dijadikan Admin!");
        // Refresh tabel / komponen untuk merefleksikan perubahan status
    } else {
        toast.error("Gagal: " + res.error);
    }
}

// Tombol Contoh Implementasi UI
<button 
   onClick={() => handlePromote(student.profile_id)}
   className="px-3 py-1 bg-amber-500 text-white rounded-md text-xs font-semibold"
>
    Jadikan Admin
</button>
```

> **INFO:** Begitu atribut `role = 'admin'` di aplikasi aktif, maka saat *student* tersebut *refresh* halamannya (`PortalContent`), Next.js akan mendeteksi permission barunya dan otomatis merendernya ke tampilan Admin / Ruang Sosmed Master (`BatchListContent`).
