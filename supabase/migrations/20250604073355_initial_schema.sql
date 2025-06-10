-- =====================================================
-- Mini Ecommerce Initial Schema Migration
-- Purpose: Create complete ecommerce schema with RBAC, RLS and storage
-- Date: 2025-06-04
-- =====================================================

-- Enable required extensions
create extension if not exists "uuid-ossp";

-- =====================================================
-- RBAC SETUP: Custom Types, Roles and Permissions
-- =====================================================

-- custom types for role-based access control
create type public.app_permission as enum (
  'products.read',
  'products.create', 
  'products.update',
  'products.delete',
  'categories.read',
  'categories.create',
  'categories.update', 
  'categories.delete',
  'orders.read',
  'orders.create',
  'orders.update',
  'orders.delete',
  'users.read',
  'users.update',
  'cart.read',
  'cart.create',
  'cart.update',
  'cart.delete',
  'reviews.read',
  'reviews.create',
  'reviews.update',
  'reviews.delete',
  'payments.read',
  'payments.create',
  'payments.update',
  'reports.read',
  'coupons.read',
  'coupons.create',
  'coupons.update',
  'coupons.delete'
);

create type public.app_role as enum ('customer', 'admin');

-- gender enum type
create type public.gender_type as enum ('male', 'female', 'other');

-- user roles table - tracks which role each user has
create table public.user_roles (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  role app_role not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique (user_id, role)
);
comment on table public.user_roles is 'Application roles for each user - customer or admin';

-- role permissions table - defines what each role can do
create table public.role_permissions (
  id bigint generated always as identity primary key,
  role app_role not null,
  permission app_permission not null,
  unique (role, permission)
);
comment on table public.role_permissions is 'Application permissions for each role';

-- =====================================================
-- CORE BUSINESS TABLES
-- =====================================================

-- user profiles table - extended user information
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  phone text,
  avatar_url text,
  date_of_birth date,
  gender public.gender_type,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
comment on table public.profiles is 'Extended user profile information for customers and admins';

-- categories table - product categories
create table public.categories (
  id bigint generated always as identity primary key,
  name text not null unique,
  slug text not null unique,
  description text,
  image_url text,
  is_active boolean default true not null,
  sort_order integer default 0 not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
comment on table public.categories is 'Product categories';

-- products table - main products
create table public.products (
  id bigint generated always as identity primary key,
  name text not null,
  slug text not null unique,
  description text,
  short_description text,
  sku text unique,
  price decimal(10,2) not null check (price >= 0),
  compare_price decimal(10,2) check (compare_price >= 0),
  cost_price decimal(10,2) check (cost_price >= 0),
  stock_quantity integer default 0 not null check (stock_quantity >= 0),
  low_stock_threshold integer default 10 not null,
  category_id bigint references public.categories(id) on delete set null,
  brand text,
  weight decimal(8,2),
  dimensions jsonb,
  images text[] default '{}',
  tags text[] default '{}',
  is_active boolean default true not null,
  is_featured boolean default false not null,
  meta_title text,
  meta_description text,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
comment on table public.products is 'Main products catalog with inventory and metadata';

-- addresses table - shipping and billing addresses
create table public.addresses (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  type text not null check (type in ('shipping', 'billing')),
  first_name text not null,
  last_name text not null,
  company text,
  address_line_1 text not null,
  address_line_2 text,
  city text not null,
  state text not null,
  postal_code text not null,
  country text not null default 'VN',
  phone text,
  is_default boolean default false not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
comment on table public.addresses is 'User shipping and billing addresses';

-- cart_items table - shopping cart
create table public.cart_items (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id bigint references public.products(id) on delete cascade not null,
  quantity integer not null check (quantity > 0),
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique (user_id, product_id)
);
comment on table public.cart_items is 'Shopping cart items for authenticated users';

-- coupons table - discount coupons
create table public.coupons (
  id bigint generated always as identity primary key,
  code text not null unique,
  name text not null,
  type text not null check (type in ('percentage', 'fixed_amount')),
  value decimal(10,2) not null check (value > 0),
  minimum_amount decimal(10,2) default 0,
  maximum_discount decimal(10,2),
  usage_limit integer,
  used_count integer default 0 not null,
  is_active boolean default true not null,
  starts_at timestamp with time zone default now() not null,
  expires_at timestamp with time zone,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
comment on table public.coupons is 'Discount coupons and promotional codes';

-- orders table - customer orders
create table public.orders (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete set null,
  order_number text not null unique,
  status text not null default 'pending' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed', 'refunded')),
  
  -- pricing
  subtotal decimal(10,2) not null check (subtotal >= 0),
  tax_amount decimal(10,2) default 0 check (tax_amount >= 0),
  shipping_amount decimal(10,2) default 0 check (shipping_amount >= 0),
  discount_amount decimal(10,2) default 0 check (discount_amount >= 0),
  total_amount decimal(10,2) not null check (total_amount >= 0),
  
  -- shipping
  shipping_method text,
  shipping_address jsonb not null,
  billing_address jsonb not null,
  
  -- coupon
  coupon_id bigint references public.coupons(id) on delete set null,
  coupon_code text,
  
  -- tracking
  tracking_number text,
  shipped_at timestamp with time zone,
  delivered_at timestamp with time zone,
  
  -- notes
  notes text,
  admin_notes text,
  
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
comment on table public.orders is 'Customer orders with complete order lifecycle';

-- order_items table - items in each order
create table public.order_items (
  id bigint generated always as identity primary key,
  order_id bigint references public.orders(id) on delete cascade not null,
  product_id bigint references public.products(id) on delete restrict not null,
  product_name text not null, -- snapshot of product name at time of order
  product_sku text, -- snapshot of sku
  quantity integer not null check (quantity > 0),
  unit_price decimal(10,2) not null check (unit_price >= 0),
  total_price decimal(10,2) not null check (total_price >= 0),
  created_at timestamp with time zone default now() not null
);
comment on table public.order_items is 'Individual items within orders with price snapshots';

-- payments table - payment transactions
create table public.payments (
  id bigint generated always as identity primary key,
  order_id bigint references public.orders(id) on delete cascade not null,
  payment_method text not null check (payment_method in ('vnpay', 'cod', 'stripe')),
  payment_provider text,
  transaction_id text,
  amount decimal(10,2) not null check (amount > 0),
  currency text not null default 'VND',
  status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'failed', 'cancelled', 'refunded')),
  gateway_response jsonb,
  processed_at timestamp with time zone,
  stripe_session_id text, -- Stripe checkout session ID
  stripe_payment_intent_id text, -- Stripe payment intent ID
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null
);
comment on table public.payments is 'Payment transactions for orders';

-- reviews table - product reviews
create table public.reviews (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id bigint references public.products(id) on delete cascade not null,
  order_id bigint references public.orders(id) on delete set null,
  rating integer not null check (rating between 1 and 5),
  title text,
  comment text,
  is_verified boolean default false not null, -- verified purchase
  is_approved boolean default false not null, -- admin approved
  helpful_count integer default 0 not null,
  created_at timestamp with time zone default now() not null,
  updated_at timestamp with time zone default now() not null,
  unique (user_id, product_id) -- one review per user per product
);
comment on table public.reviews is 'Product reviews and ratings from customers';

-- wishlists table - user favorite products
create table public.wishlists (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users on delete cascade not null,
  product_id bigint references public.products(id) on delete cascade not null,
  created_at timestamp with time zone default now() not null,
  unique (user_id, product_id)
);
comment on table public.wishlists is 'User favorite products wishlist';

-- =====================================================
-- RBAC AUTHORIZATION FUNCTION
-- =====================================================

-- authorization function to check user permissions
create or replace function public.authorize(
  requested_permission app_permission
)
returns boolean as $$
declare
  bind_permissions int;
  user_role public.app_role;
begin
  -- fetch user role from jwt claim
  select (auth.jwt() ->> 'user_role')::public.app_role into user_role;
  
  -- if no role in jwt, check user_roles table
  if user_role is null then
    select ur.role into user_role
    from public.user_roles ur
    where ur.user_id = auth.uid()
    limit 1;
  end if;
  
  -- if still no role, return false
  if user_role is null then
    return false;
  end if;

  select count(*)
  into bind_permissions
  from public.role_permissions
  where role_permissions.permission = requested_permission
  and role_permissions.role = user_role;

  return bind_permissions > 0;
end;
$$ language plpgsql stable security definer set search_path = '';

-- custom access token hook - inject user role into jwt claims
create or replace function public.custom_access_token_hook(event jsonb)
returns jsonb
language plpgsql
security definer set search_path = ''
as $$
declare
  claims jsonb;
  user_role public.app_role;
begin
  -- get claims from event
  claims := event -> 'claims';
  
  -- get user role from user_roles table
  select ur.role into user_role
  from public.user_roles ur
  where ur.user_id = (event ->> 'user_id')::uuid;
  
  -- add user_role to claims if found
  if user_role is not null then
    claims := jsonb_set(claims, '{user_role}', to_jsonb(user_role::text));
  end if;
  
  -- return modified event with updated claims
  return jsonb_set(event, '{claims}', claims);
end;
$$;

-- grant necessary permissions for the hook to work
grant usage on schema public to supabase_auth_admin;
grant execute on function public.custom_access_token_hook to supabase_auth_admin;
grant select on public.user_roles to supabase_auth_admin;

-- =====================================================
-- STORAGE BUCKETS
-- =====================================================

-- create storage buckets for file uploads
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values 
  ('product-images', 'product-images', true, 5242880, '{"image/jpeg","image/png","image/webp","image/gif"}'),
  ('category-images', 'category-images', true, 2097152, '{"image/jpeg","image/png","image/webp","image/gif"}'),
  ('avatars', 'avatars', true, 1048576, '{"image/jpeg","image/png","image/webp"}')
on conflict (id) do nothing;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- enable rls on all tables
alter table public.user_roles enable row level security;
alter table public.role_permissions enable row level security;
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.products enable row level security;
alter table public.addresses enable row level security;
alter table public.cart_items enable row level security;
alter table public.coupons enable row level security;
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.payments enable row level security;
alter table public.reviews enable row level security;
alter table public.wishlists enable row level security;

-- user_roles policies
create policy "Users can view their own roles" on public.user_roles
for select to authenticated
using (user_id = auth.uid());

create policy "Admins can view all user roles" on public.user_roles
for select to authenticated
using ((select authorize('users.read')));

create policy "Admins can manage user roles" on public.user_roles
for all to authenticated
using ((select authorize('users.update')));

-- role_permissions policies (admin only)
create policy "Admins can read role permissions" on public.role_permissions
for select to authenticated
using ((select authorize('users.read')));

-- profiles policies
create policy "Users can view their own profile" on public.profiles
for select to authenticated
using (id = auth.uid());

create policy "Users can update their own profile" on public.profiles
for update to authenticated
using (id = auth.uid());

create policy "Users can insert their own profile" on public.profiles
for insert to authenticated
with check (id = auth.uid());

create policy "Admins can view all profiles" on public.profiles
for select to authenticated
using ((select authorize('users.read')));

-- categories policies
create policy "Anyone can view active categories" on public.categories
for select to anon, authenticated
using (is_active = true);

create policy "Admins can manage categories" on public.categories
for all to authenticated
using ((select authorize('categories.create')));

-- products policies
create policy "Anyone can view active products" on public.products
for select to anon, authenticated
using (is_active = true);

create policy "Admins can manage products" on public.products
for all to authenticated
using ((select authorize('products.create')));

-- addresses policies
create policy "Users can view their own addresses" on public.addresses
for select to authenticated
using (user_id = auth.uid());

create policy "Users can manage their own addresses" on public.addresses
for insert to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own addresses" on public.addresses
for update to authenticated
using (user_id = auth.uid());

create policy "Users can delete their own addresses" on public.addresses
for delete to authenticated
using (user_id = auth.uid());

-- cart_items policies
create policy "Users can view their own cart" on public.cart_items
for select to authenticated
using (user_id = auth.uid());

create policy "Users can manage their own cart" on public.cart_items
for insert to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own cart" on public.cart_items
for update to authenticated
using (user_id = auth.uid());

create policy "Users can delete from their own cart" on public.cart_items
for delete to authenticated
using (user_id = auth.uid());

-- coupons policies
create policy "Anyone can view active coupons" on public.coupons
for select to anon, authenticated
using (is_active = true and (expires_at is null or expires_at > now()));

create policy "Admins can manage coupons" on public.coupons
for all to authenticated
using ((select authorize('coupons.create')));

-- orders policies
create policy "Users can view their own orders" on public.orders
for select to authenticated
using (user_id = auth.uid());

create policy "Users can create their own orders" on public.orders
for insert to authenticated
with check (user_id = auth.uid());

create policy "Users can update their own pending orders" on public.orders
for update to authenticated
using (user_id = auth.uid() and status = 'pending');

create policy "Admins can view all orders" on public.orders
for select to authenticated
using ((select authorize('orders.read')));

create policy "Admins can manage orders" on public.orders
for update to authenticated
using ((select authorize('orders.update')));

-- order_items policies
create policy "Users can view items in their own orders" on public.order_items
for select to authenticated
using (exists (
  select 1 from public.orders
  where orders.id = order_items.order_id
  and orders.user_id = auth.uid()
));

create policy "Users can add items to their own orders" on public.order_items
for insert to authenticated
with check (exists (
  select 1 from public.orders
  where orders.id = order_items.order_id
  and orders.user_id = auth.uid()
));

create policy "Admins can view all order items" on public.order_items
for select to authenticated
using ((select authorize('orders.read')));

-- payments policies
create policy "Users can view payments for their own orders" on public.payments
for select to authenticated
using (exists (
  select 1 from public.orders
  where orders.id = payments.order_id
  and orders.user_id = auth.uid()
));

create policy "Payment system can create payments" on public.payments
for insert to authenticated
with check (exists (
  select 1 from public.orders
  where orders.id = payments.order_id
  and orders.user_id = auth.uid()
));

create policy "Admins can view all payments" on public.payments
for select to authenticated
using ((select authorize('payments.read')));

create policy "Admins can update payments" on public.payments
for update to authenticated
using ((select authorize('payments.update')));

-- reviews policies
create policy "Anyone can view approved reviews" on public.reviews
for select to anon, authenticated
using (is_approved = true);

create policy "Users can view their own reviews" on public.reviews
for select to authenticated
using (user_id = auth.uid());

create policy "Users can create reviews for their own purchases" on public.reviews
for insert to authenticated
with check (
  user_id = auth.uid() and
  exists (
    select 1 from public.order_items oi
    join public.orders o on o.id = oi.order_id
    where o.user_id = auth.uid()
    and oi.product_id = reviews.product_id
    and o.status = 'delivered'
  )
);

create policy "Users can update their own reviews" on public.reviews
for update to authenticated
using (user_id = auth.uid());

create policy "Users can delete their own reviews" on public.reviews
for delete to authenticated
using (user_id = auth.uid());

create policy "Admins can manage all reviews" on public.reviews
for all to authenticated
using ((select authorize('reviews.update')));

-- wishlists policies
create policy "Users can view their own wishlist" on public.wishlists
for select to authenticated
using (user_id = auth.uid());

create policy "Users can manage their own wishlist" on public.wishlists
for insert to authenticated
with check (user_id = auth.uid());

create policy "Users can remove from their own wishlist" on public.wishlists
for delete to authenticated
using (user_id = auth.uid());

-- =====================================================
-- STORAGE POLICIES
-- =====================================================

-- product images policies
create policy "Anyone can view product images" on storage.objects
for select to anon, authenticated
using (bucket_id = 'product-images');

create policy "Admins can upload product images" on storage.objects
for insert to authenticated
with check (bucket_id = 'product-images' and (select authorize('products.create')));

create policy "Admins can update product images" on storage.objects
for update to authenticated
using (bucket_id = 'product-images' and (select authorize('products.update')));

create policy "Admins can delete product images" on storage.objects
for delete to authenticated
using (bucket_id = 'product-images' and (select authorize('products.delete')));

-- category images policies
create policy "Anyone can view category images" on storage.objects
for select to anon, authenticated
using (bucket_id = 'category-images');

create policy "Admins can manage category images" on storage.objects
for insert to authenticated
with check (bucket_id = 'category-images' and (select authorize('categories.create')));

create policy "Admins can update category images" on storage.objects
for update to authenticated
using (bucket_id = 'category-images' and (select authorize('categories.update')));

create policy "Admins can delete category images" on storage.objects
for delete to authenticated
using (bucket_id = 'category-images' and (select authorize('categories.delete')));

-- avatar policies
create policy "Anyone can view avatars" on storage.objects
for select to anon, authenticated
using (bucket_id = 'avatars');

create policy "Users can upload their own avatar" on storage.objects
for insert to authenticated
with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can update their own avatar" on storage.objects
for update to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "Users can delete their own avatar" on storage.objects
for delete to authenticated
using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- frequently queried columns
create index idx_profiles_user_id on public.profiles (id);
create index idx_user_roles_user_id on public.user_roles (user_id);

create index idx_categories_slug on public.categories (slug);
create index idx_products_category_id on public.products (category_id);
create index idx_products_slug on public.products (slug);
create index idx_products_is_active on public.products (is_active);
create index idx_products_is_featured on public.products (is_featured);
create index idx_cart_items_user_id on public.cart_items (user_id);
create index idx_addresses_user_id on public.addresses (user_id);
create index idx_orders_user_id on public.orders (user_id);
create index idx_orders_status on public.orders (status);
create index idx_orders_payment_status on public.orders (payment_status);
create index idx_order_items_order_id on public.order_items (order_id);
create index idx_order_items_product_id on public.order_items (product_id);
create index idx_payments_order_id on public.payments (order_id);
create index idx_payments_stripe_session_id on public.payments (stripe_session_id);
create index idx_reviews_product_id on public.reviews (product_id);
create index idx_reviews_user_id on public.reviews (user_id);
create index idx_wishlists_user_id on public.wishlists (user_id);

-- text search indexes
create index idx_products_name_gin on public.products using gin (to_tsvector('english', name));
create index idx_products_description_gin on public.products using gin (to_tsvector('english', description));

-- =====================================================
-- INITIAL DATA: ROLES AND PERMISSIONS
-- =====================================================

-- insert role permissions
insert into public.role_permissions (role, permission)
values
  -- customer permissions
  ('customer', 'products.read'),
  ('customer', 'categories.read'),
  ('customer', 'cart.read'),
  ('customer', 'cart.create'),
  ('customer', 'cart.update'),
  ('customer', 'cart.delete'),
  ('customer', 'orders.read'),
  ('customer', 'orders.create'),
  ('customer', 'orders.update'),
  ('customer', 'reviews.read'),
  ('customer', 'reviews.create'),
  ('customer', 'reviews.update'),
  ('customer', 'reviews.delete'),
  ('customer', 'coupons.read'),
  
  -- admin permissions (all permissions)
  ('admin', 'products.read'),
  ('admin', 'products.create'),
  ('admin', 'products.update'),
  ('admin', 'products.delete'),
  ('admin', 'categories.read'),
  ('admin', 'categories.create'),
  ('admin', 'categories.update'),
  ('admin', 'categories.delete'),
  ('admin', 'orders.read'),
  ('admin', 'orders.create'),
  ('admin', 'orders.update'),
  ('admin', 'orders.delete'),
  ('admin', 'users.read'),
  ('admin', 'users.update'),
  ('admin', 'cart.read'),
  ('admin', 'cart.create'),
  ('admin', 'cart.update'),
  ('admin', 'cart.delete'),
  ('admin', 'reviews.read'),
  ('admin', 'reviews.create'),
  ('admin', 'reviews.update'),
  ('admin', 'reviews.delete'),
  ('admin', 'payments.read'),
  ('admin', 'payments.create'),
  ('admin', 'payments.update'),
  ('admin', 'reports.read'),
  ('admin', 'coupons.read'),
  ('admin', 'coupons.create'),
  ('admin', 'coupons.update'),
  ('admin', 'coupons.delete');

-- =====================================================
-- TRIGGERS FOR UPDATED_AT TIMESTAMPS
-- =====================================================

-- function to update updated_at timestamp
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql security invoker set search_path = '';

-- triggers for updated_at columns
create trigger handle_updated_at before update on public.user_roles
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.profiles
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.categories
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.products
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.addresses
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.cart_items
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.coupons
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.orders
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.payments
  for each row execute function public.handle_updated_at();

create trigger handle_updated_at before update on public.reviews
  for each row execute function public.handle_updated_at();

-- =====================================================
-- HELPER FUNCTIONS
-- =====================================================

-- function to generate order number
create or replace function public.generate_order_number()
returns text as $$
begin
  return 'ORD-' || to_char(now(), 'YYYYMMDD') || '-' || 
         lpad(nextval('order_number_seq')::text, 6, '0');
end;
$$ language plpgsql security invoker set search_path = '';

-- sequence for order numbers
create sequence if not exists order_number_seq;

-- function to create user profile after signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, new.raw_user_meta_data->>'full_name');
  
  -- assign customer role by default
  insert into public.user_roles (user_id, role)
  values (new.id, 'customer');
  
  return new;
end;
$$ language plpgsql security definer set search_path = '';

-- trigger to create profile on user signup
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================
-- CONFIGURATION NOTE FOR CUSTOM ACCESS TOKEN HOOK
-- =====================================================
-- After running this migration, add the following to your supabase/config.toml:
-- 
-- [auth.hook.custom_access_token]
-- enabled = true
-- uri = "pg-functions://postgres/public/custom_access_token_hook"
-- 
-- This will automatically inject user_role into JWT claims on every login/token refresh
-- =====================================================
