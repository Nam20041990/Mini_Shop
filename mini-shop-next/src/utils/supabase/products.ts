import { createClient } from './client';
import { Product } from '@/types/product';

export function mapSupabaseProduct(row: any): Product {
  return {
    id: Number(row.id),
    name: row.name,
    nameVi: row.name_vi || undefined,
    nameEn: row.name_en || undefined,
    price: Number(row.price),
    oldPrice: row.old_price != null ? Number(row.old_price) : undefined,
    discount: row.discount || undefined,
    category: row.category_slug || 'noi-that',
    categoryName: row.category_name || undefined,
    categoryEn: row.category_en || undefined,
    desc: row.desc || '',
    badge: row.badge ?? null,
    badgeType: row.badge_type ?? null,
    inStock: row.in_stock ?? true,
    rating: row.rating != null ? Number(row.rating) : 5.0,
    reviewsCount: row.reviews_count != null ? Number(row.reviews_count) : 0,
    image: row.image,
    gallery: Array.isArray(row.gallery) && row.gallery.length > 0 ? row.gallery : [row.image],
    details: row.details || undefined,
    status: row.status || 'Active',
    showOnHome: row.show_on_home ?? true,
  };
}

/**
 * Lấy danh sách sản phẩm từ Supabase.
 * @param includeAll - Nếu true, lấy cả sản phẩm Inactive (dành cho Admin). Mặc định false (chỉ lấy Active cho Khách).
 */
export async function getProductsFromSupabase(includeAll: boolean = false): Promise<Product[]> {
  try {
    const supabase = createClient();
    let query = supabase
      .from('products')
      .select('*')
      .order('id', { ascending: false });

    if (!includeAll) {
      query = query.eq('status', 'Active');
    }

    const { data, error } = await query;

    if (error) {
      console.error('Lỗi khi lấy sản phẩm từ Supabase:', error);
      return [];
    }

    return (data || []).map(mapSupabaseProduct);
  } catch (err) {
    console.error('Failed to get products from Supabase:', err);
    return [];
  }
}

/**
 * Lấy 1 sản phẩm theo ID từ Supabase
 */
export async function getProductByIdFromSupabase(id: number): Promise<Product | null> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error || !data) {
      if (error) console.error('Lỗi khi tìm sản phẩm ID', id, error);
      return null;
    }

    return mapSupabaseProduct(data);
  } catch (err) {
    console.error('Failed to get product by id from Supabase:', err);
    return null;
  }
}

/**
 * Thêm sản phẩm mới trực tiếp vào bảng products của Supabase
 */
export async function createProductInSupabase(input: {
  name: string;
  category: string;
  price: number;
  oldPrice?: number;
  image: string;
  desc?: string;
  badge?: string;
  badgeType?: string;
  status?: 'Active' | 'Inactive';
  showOnHome?: boolean;
}): Promise<Product> {
  const supabase = createClient();

  const payload: any = {
    name: input.name.trim(),
    name_vi: input.name.trim(),
    price: Number(input.price),
    old_price: input.oldPrice ? Number(input.oldPrice) : null,
    category_slug: input.category || 'noi-that',
    desc: input.desc?.trim() || 'Sản phẩm cao cấp tại Mini Shop',
    image: input.image.trim(),
    badge: input.badge || 'Mới',
    badge_type: input.badgeType || 'new',
    status: input.status || 'Active',
    show_on_home: input.showOnHome !== false,
    in_stock: true,
    rating: 5.0,
    reviews_count: 0,
    gallery: [input.image.trim()],
  };

  const { data, error } = await supabase
    .from('products')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('Lỗi khi thêm sản phẩm vào Supabase:', error);
    throw new Error(error.message || 'Không thể tạo sản phẩm trên Supabase');
  }

  return mapSupabaseProduct(data);
}

/**
 * Sửa sản phẩm trực tiếp trong bảng products của Supabase
 */
export async function updateProductInSupabase(
  id: number,
  input: {
    name?: string;
    category?: string;
    price?: number;
    oldPrice?: number;
    image?: string;
    desc?: string;
    status?: 'Active' | 'Inactive';
    showOnHome?: boolean;
  }
): Promise<Product> {
  const supabase = createClient();

  const updatePayload: any = {};
  if (input.name !== undefined) {
    updatePayload.name = input.name.trim();
    updatePayload.name_vi = input.name.trim();
  }
  if (input.category !== undefined) {
    updatePayload.category_slug = input.category;
  }
  if (input.price !== undefined) {
    updatePayload.price = Number(input.price);
  }
  if (input.oldPrice !== undefined) {
    updatePayload.old_price = input.oldPrice ? Number(input.oldPrice) : null;
  }
  if (input.image !== undefined) {
    updatePayload.image = input.image.trim();
    updatePayload.gallery = [input.image.trim()];
  }
  if (input.desc !== undefined) {
    updatePayload.desc = input.desc.trim();
  }
  if (input.status !== undefined) {
    updatePayload.status = input.status;
  }
  if (input.showOnHome !== undefined) {
    updatePayload.show_on_home = input.showOnHome;
  }

  const { data, error } = await supabase
    .from('products')
    .update(updatePayload)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Lỗi khi cập nhật sản phẩm trên Supabase:', error);
    throw new Error(error.message || 'Không thể cập nhật sản phẩm trên Supabase');
  }

  return mapSupabaseProduct(data);
}

/**
 * Xóa sản phẩm khỏi bảng products của Supabase
 */
export async function deleteProductInSupabase(id: number): Promise<boolean> {
  const supabase = createClient();
  const { error } = await supabase
    .from('products')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Lỗi khi xóa sản phẩm trên Supabase:', error);
    throw new Error(error.message || 'Không thể xóa sản phẩm khỏi Supabase');
  }

  return true;
}
