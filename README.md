# ComicNew

Nền tảng đọc và đăng truyện tranh/tiểu thuyết mạng với giao diện React + Vite, tập trung vào trải nghiệm khám phá, đọc truyện và quản lý hồ sơ người dùng.

## Công nghệ

- React 19 + TypeScript
- Vite 6
- React Router DOM 7
- Tailwind CSS 4
- motion (animation), lucide-react (icon), react-dropzone (upload)

## Tính năng hiện có

- Landing page giới thiệu sản phẩm
- Trang khám phá truyện (`/home`) với danh sách phổ biến và đề xuất
- Đăng nhập/đăng ký mock (`/auth`)
- Hồ sơ người dùng (`/profile`): lịch sử đọc, truyện đã đăng, cài đặt cơ bản
- Đăng truyện (`/upload`) cho 2 loại nội dung:
  - `comic`: ảnh/PDF
  - `novel`: Word/PDF
- Reader (`/story/:id`) hỗ trợ hiển thị comic hoặc novel theo chapter
- Lưu dữ liệu cục bộ bằng `localStorage` (story, user, auth)
- Đăng nhập Google qua Supabase OAuth

## Cài đặt và chạy local

```bash
npm install
npm run dev
```

Ứng dụng chạy mặc định tại `http://localhost:3000`.

## Scripts

```bash
npm run dev      # chạy môi trường phát triển
npm run build    # build production
npm run preview  # preview bản build
npm run lint     # type-check (tsc --noEmit)
```

## Tài khoản demo

Ở màn hình đăng nhập, có thể dùng email sau để vào nhanh:

- `demo@comicnew.com`

## Cấu hình Supabase

Tạo file `.env` ở thư mục gốc với các biến sau:

```bash
VITE_SUPABASE_URL=your-supabase-url
VITE_SUPABASE_ANON_KEY=your-supabase-anon-key
```

Trong Supabase Dashboard, thêm redirect URL:

```text
http://localhost:3000/auth/callback
```

Khi deploy production, thêm luôn URL callback của môi trường production vào danh sách redirect URLs.

## Cấu trúc thư mục chính

```text
src/
  components/    # UI components (layout, common)
  pages/         # các màn hình theo route
  lib/           # storage, utils
  types.ts       # định nghĩa kiểu dữ liệu
```

## Lưu ý

- Dự án hiện chưa tích hợp backend/database thực.
- Dữ liệu được lưu trên trình duyệt bằng `localStorage`; xóa cache sẽ mất dữ liệu local.
