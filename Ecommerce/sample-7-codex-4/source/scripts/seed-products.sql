begin;

insert into categories (
  id,
  name,
  slug,
  description,
  image_url,
  parent_id,
  is_active,
  created_at,
  updated_at
)
select
  (
    substr(md5('category-' || slug), 1, 8) || '-' ||
    substr(md5('category-' || slug), 9, 4) || '-' ||
    substr(md5('category-' || slug), 13, 4) || '-' ||
    substr(md5('category-' || slug), 17, 4) || '-' ||
    substr(md5('category-' || slug), 21, 12)
  )::uuid,
  name,
  slug,
  description,
  image_url,
  null,
  true,
  now(),
  now()
from (
  values
    ('Thời trang nữ', 'thoi-trang-nu', 'Tuyển chọn trang phục nữ theo phong cách biên tập hiện đại.', 'https://picsum.photos/seed/category-fashion-women/1200/900'),
    ('Thời trang nam', 'thoi-trang-nam', 'Các thiết kế nam tối giản, dễ phối và giàu chất liệu.', 'https://picsum.photos/seed/category-fashion-men/1200/900'),
    ('Giày & Phụ kiện', 'giay-phu-kien', 'Giày, túi và phụ kiện hoàn thiện tổng thể.', 'https://picsum.photos/seed/category-shoes-accessories/1200/900'),
    ('Nhà cửa & Sống', 'nha-cua-song', 'Đồ gia dụng và sản phẩm nâng cấp không gian sống.', 'https://picsum.photos/seed/category-home-living/1200/900'),
    ('Công nghệ', 'cong-nghe', 'Thiết bị công nghệ, audio và phụ kiện số.', 'https://picsum.photos/seed/category-tech/1200/900'),
    ('Làm đẹp', 'lam-dep', 'Skincare, makeup và phụ kiện chăm sóc cá nhân.', 'https://picsum.photos/seed/category-beauty/1200/900'),
    ('Thể thao', 'the-thao', 'Trang phục và phụ kiện cho nhịp sống vận động.', 'https://picsum.photos/seed/category-sport/1200/900'),
    ('Sách & Văn phòng phẩm', 'sach-van-phong-pham', 'Ấn phẩm, sổ tay và vật dụng làm việc sáng tạo.', 'https://picsum.photos/seed/category-books-stationery/1200/900'),
    ('Mẹ & Bé', 'me-be', 'Sản phẩm thiết yếu cho gia đình trẻ.', 'https://picsum.photos/seed/category-mom-baby/1200/900'),
    ('Thực phẩm chọn lọc', 'thuc-pham-chon-loc', 'Đồ uống và thực phẩm đóng gói theo hướng premium.', 'https://picsum.photos/seed/category-food/1200/900')
) as seed(name, slug, description, image_url)
where not exists (
  select 1
  from categories c
  where c.slug = seed.slug
);

with
  existing_count as (
    select count(*)::int as current_count
    from products
  ),
  category_pool as (
    select
      id,
      row_number() over (order by slug) - 1 as idx
    from categories
    where is_active = true
  ),
  category_stats as (
    select count(*)::int as total_categories
    from category_pool
  ),
  source_rows as (
    select
      gs,
      (
        select cp.id
        from category_pool cp
        where cp.idx = (gs % (select total_categories from category_stats))
        limit 1
      ) as category_id,
      ('The Editorial Selection #' || gs) as name,
      ('the-editorial-selection-' || gs) as slug,
      (array[
        'Thiết kế nổi bật, tập trung vào chất liệu và trải nghiệm sử dụng hằng ngày.',
        'Món hàng được tuyển chọn cho người dùng ưu tiên tính hoàn thiện và thẩm mỹ.',
        'Sản phẩm có độ ứng dụng cao, phù hợp nhịp sống thành thị hiện đại.',
        'Phiên bản cân bằng giữa giá trị sử dụng, độ bền và hình ảnh thương hiệu.'
      ])[1 + (gs % 4)] as short_description,
      (
        'Bản mô tả chi tiết cho sản phẩm #' || gs ||
        '. Dữ liệu này được seed trực tiếp vào PostgreSQL để storefront, tìm kiếm, phân trang, admin và checkout có thể kiểm thử trên tập dữ liệu lớn.'
      ) as description,
      (array[
        'Toiec Atelier',
        'Nook Studio',
        'Forma Haus',
        'Morrow Labs',
        'Nami Daily',
        'Aster Goods',
        'Kiro Collective',
        'Lumen Works'
      ])[1 + (gs % 8)] as brand,
      price.base_price,
      case
        when random() > 0.48 then round((price.base_price * (1.08 + random() * 0.25))::numeric, 2)
        else null
      end as compare_at_price,
      ('https://picsum.photos/seed/editorial-product-' || gs || '/1200/1500') as thumbnail_url,
      (gs % 17 = 0) as is_featured,
      greatest(5, floor(random() * 120)::int) as stock_quantity
    from generate_series(
      (select current_count + 1 from existing_count),
      10000
    ) gs
    cross join lateral (
      select round((79000 + random() * 2921000)::numeric, 2) as base_price
    ) price
  ),
  inserted_products as (
    insert into products (
      category_id,
      name,
      slug,
      short_description,
      description,
      brand,
      status,
      base_price,
      compare_at_price,
      currency,
      thumbnail_url,
      is_featured,
      created_at,
      updated_at
    )
    select
      category_id,
      name,
      slug,
      short_description,
      description,
      brand,
      'active',
      base_price,
      compare_at_price,
      'VND',
      thumbnail_url,
      is_featured,
      now(),
      now()
    from source_rows
    returning
      id,
      name,
      slug,
      thumbnail_url,
      base_price,
      compare_at_price
  ),
  inserted_images as (
    insert into product_images (
      product_id,
      image_url,
      alt_text,
      sort_order
    )
    select
      id,
      thumbnail_url,
      name,
      0
    from inserted_products
    returning product_id
  )
insert into product_variants (
  product_id,
  sku,
  name,
  attributes,
  price,
  compare_at_price,
  stock_quantity,
  is_default,
  is_active
)
select
  ip.id,
  upper(replace(ip.slug, '-', '')) || '-DEFAULT',
  'Mặc định',
  jsonb_build_object('size', 'default', 'finish', 'standard'),
  ip.base_price,
  ip.compare_at_price,
  greatest(5, floor(random() * 120)::int),
  true,
  true
from inserted_products ip;

commit;

select
  (select count(*) from categories) as total_categories,
  (select count(*) from products) as total_products,
  (select count(*) from product_images) as total_product_images,
  (select count(*) from product_variants) as total_product_variants;
