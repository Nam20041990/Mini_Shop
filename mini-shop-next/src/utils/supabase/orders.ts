import { createClient } from './client';

export interface OrderItemData {
  id?: number;
  product_id?: number;
  name: string;
  price: number;
  quantity: number;
  image?: string;
  total?: number;
}

export interface CreateOrderInput {
  id?: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  shippingAddress: string;
  paymentMethod: string;
  notes?: string;
  subtotal: number;
  shippingFee: number;
  discountAmount?: number;
  total: number;
  items: OrderItemData[];
}

export interface SupabaseOrderRow {
  id: string;
  customer_name: string;
  customer_phone: string;
  customer_email?: string | null;
  shipping_address: string;
  payment_method?: string | null;
  notes?: string | null;
  subtotal: number;
  shipping_fee?: number | null;
  discount_amount?: number | null;
  total: number;
  status?: string | null;
  created_at?: string;
  items?: OrderItemData[] | null;
}

/**
 * Tạo đơn hàng mới và ghi trực tiếp vào Supabase (cả bảng orders và order_items)
 */
export async function createOrderInSupabase(input: CreateOrderInput): Promise<SupabaseOrderRow> {
  const supabase = createClient();
  const orderId = input.id || 'ORD-' + Math.floor(100000 + Math.random() * 900000);

  const orderPayload = {
    id: orderId,
    customer_name: input.customerName.trim(),
    customer_phone: input.customerPhone.trim(),
    customer_email: input.customerEmail?.trim() || null,
    shipping_address: input.shippingAddress.trim(),
    payment_method: input.paymentMethod || 'COD',
    notes: input.notes?.trim() || null,
    subtotal: Number(input.subtotal),
    shipping_fee: Number(input.shippingFee || 0),
    discount_amount: Number(input.discountAmount || 0),
    total: Number(input.total),
    status: 'Processing',
    items: input.items, // Cột jsonb chứa danh sách các món
  };

  // 1. Ghi vào bảng orders
  const { data: insertedOrder, error: orderError } = await supabase
    .from('orders')
    .insert([orderPayload])
    .select()
    .single();

  if (orderError) {
    console.error('Error inserting order into Supabase:', orderError);
    throw new Error(orderError.message || 'Không thể lưu đơn hàng vào Supabase');
  }

  // 2. Ghi chi tiết vào bảng order_items nếu có
  if (input.items && input.items.length > 0) {
    const orderItemsRows = input.items.map((item) => ({
      order_id: orderId,
      product_id: item.id || item.product_id || null,
      product_name: item.name,
      price: Number(item.price),
      quantity: Number(item.quantity),
      image: item.image || null,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItemsRows);

    if (itemsError) {
      console.warn('Warning: Could not insert detailed order_items:', itemsError);
    }
  }

  return insertedOrder || (orderPayload as SupabaseOrderRow);
}

/**
 * Lấy danh sách đơn hàng từ Supabase
 */
export async function getOrdersFromSupabase(): Promise<SupabaseOrderRow[]> {
  try {
    const supabase = createClient();
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      return [];
    }

    return (data || []) as SupabaseOrderRow[];
  } catch (err) {
    console.error('Failed to get orders from Supabase:', err);
    return [];
  }
}

/**
 * Cập nhật trạng thái đơn hàng trong kho Supabase
 * Trạng thái: 'Processing' (Mới/Đang xử lý) | 'Shipping' (Đang giao) | 'Delivered' (Đã giao)
 */
export async function updateOrderStatusInSupabase(
  orderId: string,
  newStatus: string
): Promise<SupabaseOrderRow> {
  const supabase = createClient();
  const { data, error } = await supabase
    .from('orders')
    .update({ status: newStatus })
    .eq('id', orderId)
    .select()
    .single();

  if (error) {
    console.error('Error updating order status in Supabase:', error);
    throw new Error(error.message || 'Không thể cập nhật trạng thái đơn hàng');
  }

  return data as SupabaseOrderRow;
}
