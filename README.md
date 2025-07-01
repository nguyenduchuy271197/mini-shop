# 🛒 MiniShop - Nền Tảng Thương Mại Điện Tử

Nền tảng thương mại điện tử kết nối người bán và người mua, xây dựng với Next.js 14, TypeScript và Supabase.

## ✨ Tính năng

- 🔐 **Authentication**: Đăng ký/đăng nhập, phân quyền Customer/Seller/Admin
- 🛍️ **Product Management**: Quản lý sản phẩm, danh mục và inventory
- 🛒 **Shopping Cart**: Giỏ hàng, wishlist và checkout process
- 💳 **Payment Integration**: Thanh toán đa dạng, quản lý đơn hàng
- 📦 **Order Management**: Theo dõi đơn hàng, vận chuyển
- ⭐ **Review System**: Đánh giá sản phẩm và người bán
- 📊 **Dashboard**: Seller analytics, Customer order tracking

## 🛠️ Tech Stack

- **Frontend**: Next.js 14, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Supabase, PostgreSQL
- **State Management**: TanStack Query, React Hook Form
- **Validation**: Zod
- **Payment**: Stripe integration

## 🚀 Quick Start

### 1. Installation

```bash
git clone https://github.com/nguyenduchuy271197/mini-shop
cd minishop
pnpm install
```

### 2. Environment Setup

Tạo `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
STRIPE_SECRET_KEY=your_stripe_secret_key
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=your_stripe_publishable_key
```

### 3. Database Setup

```bash
npx supabase db reset
```

### 4. Run Development

```bash
pnpm dev
```

Mở [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
src/
├── actions/          # Server actions
├── app/             # Next.js App Router
│   ├── (auth)/      # Auth pages
│   ├── (customer)/  # Customer dashboard
│   ├── (seller)/    # Seller dashboard
│   ├── (admin)/     # Admin panel
│   └── (shop)/      # Public shop
├── components/      # UI components
├── hooks/           # Custom hooks
├── lib/             # Utilities & config
└── types/           # TypeScript types
```

## 🔧 Scripts

```bash
pnpm dev      # Development server
pnpm build    # Build production
pnpm lint     # Run linter
```

## 👥 User Roles

### 🛍️ Customer

- Duyệt và tìm kiếm sản phẩm
- Quản lý giỏ hàng và wishlist
- Đặt hàng và thanh toán trực tuyến
- Theo dõi đơn hàng và đánh giá sản phẩm

### 🏪 Seller

- Quản lý products và inventory
- Xử lý đơn hàng và shipping
- Xem analytics và sales reports
- Quản lý customer reviews

### 👨‍💻 Admin

- Quản lý users và seller verification
- Quản lý categories và product approval
- Xem system analytics và revenue reports

## 🚀 Deployment

Deploy dễ dàng với [Vercel](https://vercel.com):

1. Connect repository
2. Set environment variables
3. Deploy
