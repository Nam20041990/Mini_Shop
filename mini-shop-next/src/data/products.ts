import { Product } from '@/types/product';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: 1,
    name: "Sofa 2 chỗ Nordic - Phong cách Bắc Âu",
    price: 2990000,
    oldPrice: 3500000,
    discount: "-15%",
    category: "noi-that",
    categoryName: "Nội thất",
    categoryEn: "Furniture",
    desc: "Thiết kế tối giản phong cách Bắc Âu, chất liệu vải nỉ đệm mút cao cấp êm ái, khung gỗ tự nhiên chịu lực tốt.",
    badge: "Mới",
    badgeType: "new",
    inStock: true,
    rating: 4.9,
    reviewsCount: 32,
    image: "/assets/images/products/San_pham/sofa-phong-khach-original.webp",
    gallery: [
      "/assets/images/products/San_pham/sofa-phong-khach-original.webp",
      "/assets/images/products/noi-that-gia-dung/sofa-phong-khach.webp",
      "/assets/images/products/San_pham/bo-ban-an-go-original.webp",
      "/assets/images/products/San_pham/ke-go-trang-tri-original.webp",
      "/assets/images/products/San_pham/binh-gom-trang-tri-original.webp"
    ],
    details: {
      material: "Vải nỉ cao cấp & Gỗ tự nhiên",
      color: "Xám ghi, Kem, Xanh navy",
      dimensions: "160cm x 80cm x 75cm",
      weight: "28 kg",
      madeIn: "Việt Nam"
    }
  },
  {
    id: 2,
    name: "Bàn ăn gỗ Sồi tự nhiên",
    price: 3490000,
    oldPrice: 4200000,
    discount: "-17%",
    category: "noi-that",
    categoryName: "Nội thất",
    categoryEn: "Furniture",
    desc: "Gỗ sồi tự nhiên nguyên khối nhập khẩu, sơn phủ PU bóng mờ chống ẩm mốc và trầy xước.",
    badge: "Hot",
    badgeType: "hot",
    inStock: true,
    rating: 4.8,
    reviewsCount: 54,
    image: "/assets/images/products/San_pham/bo-ban-an-go-original.webp",
    gallery: [
      "/assets/images/products/San_pham/bo-ban-an-go-original.webp",
      "/assets/images/products/noi-that-gia-dung/bo-ban-an-go.webp",
      "/assets/images/products/San_pham/khay-go-trang-tri-original.webp",
      "/assets/images/products/San_pham/sofa-phong-khach-original.webp",
      "/assets/images/products/San_pham/ke-go-trang-tri-original.webp"
    ],
    details: {
      material: "Gỗ Sồi Nga tự nhiên",
      color: "Vàng gỗ tự nhiên, Nâu gụ",
      dimensions: "140cm x 80cm x 75cm",
      weight: "22 kg",
      madeIn: "Việt Nam"
    }
  },
  {
    id: 3,
    name: "Đèn thả trần Minimalist",
    price: 599000,
    oldPrice: 750000,
    discount: "-20%",
    category: "den",
    categoryName: "Đèn",
    categoryEn: "Lighting",
    desc: "Chao đèn gỗ nghệ thuật kết hợp kim loại sơn tĩnh điện, mang ánh sáng ấm áp sang trọng cho không gian.",
    badge: "-20%",
    badgeType: "sale",
    inStock: true,
    rating: 4.7,
    reviewsCount: 29,
    image: "/assets/images/products/San_pham/den-tre-thu-cong-original.webp",
    gallery: [
      "/assets/images/products/San_pham/den-tre-thu-cong-original.webp",
      "/assets/images/products/do-my-nghe/den-tre-thu-cong.webp",
      "/assets/images/products/San_pham/den-long-tre-original.webp",
      "/assets/images/products/do-my-nghe/den-long-tre.webp",
      "/assets/images/products/San_pham/bo-binh-gom-minimal-original.webp"
    ],
    details: {
      material: "Tre tự nhiên & Kim loại",
      color: "Vàng tre mộc, Đen nhám",
      dimensions: "Đường kính 35cm, Cao 25cm",
      weight: "1.5 kg",
      madeIn: "Việt Nam"
    }
  },
  {
    id: 4,
    name: "Bình gốm Decor trang nhã",
    price: 290000,
    oldPrice: 350000,
    discount: "-17%",
    category: "trang-tri",
    categoryName: "Trang trí",
    categoryEn: "Home Decor",
    desc: "Gốm sứ thủ công tráng men mờ độc đáo, kiểu dáng mộc mạc tinh tế tôn lên vẻ đẹp hoa tươi.",
    badge: null,
    badgeType: null,
    inStock: true,
    rating: 4.9,
    reviewsCount: 41,
    image: "/assets/images/products/San_pham/binh-gom-trang-tri-original.webp",
    gallery: [
      "/assets/images/products/San_pham/binh-gom-trang-tri-original.webp",
      "/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp",
      "/assets/images/products/San_pham/bo-binh-gom-minimal-original.webp",
      "/assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp",
      "/assets/images/products/San_pham/chau-cay-de-ban-original.webp"
    ],
    details: {
      material: "Gốm sứ Bát Tràng",
      color: "Trắng ngà, Xám nhạt, Xanh olive",
      dimensions: "Đường kính 12cm, Cao 22cm",
      weight: "0.8 kg",
      madeIn: "Việt Nam"
    }
  },
  {
    id: 5,
    name: "Kệ gỗ đa năng 3 tầng",
    price: 1293000,
    oldPrice: 1500000,
    discount: "-14%",
    category: "noi-that",
    categoryName: "Nội thất",
    categoryEn: "Furniture",
    desc: "Khung gỗ thông tự nhiên sấy khô chống mối mọt, thiết kế xếp gọn tiết kiệm không gian căn hộ.",
    badge: "-14%",
    badgeType: "sale",
    inStock: true,
    rating: 4.6,
    reviewsCount: 18,
    image: "/assets/images/products/San_pham/ke-go-trang-tri-original.webp",
    gallery: [
      "/assets/images/products/San_pham/ke-go-trang-tri-original.webp",
      "/assets/images/products/noi-that-gia-dung/ke-go-trang-tri.webp",
      "/assets/images/products/San_pham/bo-ban-an-go-original.webp",
      "/assets/images/products/San_pham/gio-may-dan-original.webp",
      "/assets/images/products/San_pham/khay-go-trang-tri-original.webp"
    ],
    details: {
      material: "Gỗ Thông tự nhiên",
      color: "Màu gỗ tự nhiên",
      dimensions: "60cm x 30cm x 90cm",
      weight: "5.5 kg",
      madeIn: "Việt Nam"
    }
  },
  {
    id: 6,
    name: "Giỏ mây lưu trữ đan tay",
    price: 199000,
    oldPrice: 250000,
    discount: "-20%",
    category: "luu-tru",
    categoryName: "Lưu trữ",
    categoryEn: "Storage",
    desc: "Mây tự nhiên chọn lọc đan thủ công tỉ mỉ bởi nghệ nhân, chất liệu thân thiện với môi trường.",
    badge: "Mới",
    badgeType: "new",
    inStock: true,
    rating: 4.8,
    reviewsCount: 22,
    image: "/assets/images/products/San_pham/gio-may-dan-original.webp",
    gallery: [
      "/assets/images/products/San_pham/gio-may-dan-original.webp",
      "/assets/images/products/do-thu-cong/gio-may-dan.webp",
      "/assets/images/products/San_pham/khay-go-trang-tri-original.webp",
      "/assets/images/products/San_pham/khay-go-hoa-van-original.webp",
      "/assets/images/products/San_pham/tranh-treo-macrame-original.webp"
    ],
    details: {
      material: "Mây tự nhiên đan tay",
      color: "Vàng mây mộc",
      dimensions: "30cm x 30cm x 25cm",
      weight: "0.6 kg",
      madeIn: "Việt Nam"
    }
  },
  {
    id: 7,
    name: "Ceramic Vase Set - Minimal Style",
    nameVi: "Bộ bình gốm Minimalist",
    price: 499000,
    oldPrice: 699000,
    discount: "-29%",
    category: "trang-tri",
    categoryName: "Home Decor",
    categoryEn: "Home Decor",
    desc: "Elegant ceramic vase set perfect for modern home decoration.",
    badge: "-29%",
    badgeType: "sale",
    inStock: true,
    rating: 5.0,
    reviewsCount: 48,
    image: "/assets/images/products/San_pham/bo-binh-gom-minimal-original.webp",
    gallery: [
      "/assets/images/products/San_pham/bo-binh-gom-minimal-original.webp",
      "/assets/images/products/do-my-nghe/bo-binh-gom-minimal.webp",
      "/assets/images/products/San_pham/binh-gom-trang-tri-original.webp",
      "/assets/images/products/do-my-nghe/binh-gom-trang-tri.webp",
      "/assets/images/products/San_pham/chau-cay-de-ban-original.webp"
    ],
    details: {
      material: "Ceramic",
      color: "Beige, Green, White",
      dimensions: "Tall: 20cm, Medium: 15cm, Small: 10cm",
      weight: "1.2 kg (set)",
      madeIn: "Vietnam"
    }
  },
  {
    id: 8,
    name: "Chậu cây mọng nước để bàn",
    nameEn: "Indoor Plant Pot",
    price: 180000,
    oldPrice: 249000,
    discount: "-28%",
    category: "trang-tri",
    categoryName: "Trang trí",
    categoryEn: "Home Decor",
    desc: "Chậu gốm mộc mạc tráng men kèm cây mọng nước xanh mát, tạo không khí trong lành bàn làm việc.",
    badge: "Bán chạy",
    badgeType: "hot",
    inStock: true,
    rating: 4.9,
    reviewsCount: 31,
    image: "/assets/images/products/San_pham/chau-cay-de-ban-original.webp",
    gallery: [
      "/assets/images/products/San_pham/chau-cay-de-ban-original.webp",
      "/assets/images/products/noi-that-gia-dung/chau-cay-de-ban.webp",
      "/assets/images/products/San_pham/binh-gom-trang-tri-original.webp",
      "/assets/images/products/San_pham/bo-binh-gom-minimal-original.webp",
      "/assets/images/products/San_pham/khay-go-trang-tri-original.webp"
    ],
    details: {
      material: "Gốm sứ & Đất nướng",
      color: "Trắng sứ, Xám đá",
      dimensions: "Đường kính 14cm, Cao 16cm",
      weight: "0.9 kg",
      madeIn: "Việt Nam"
    }
  },
  {
    id: 9,
    name: "Đèn lồng tre thủ công",
    nameEn: "Handcrafted Bamboo Lantern",
    price: 320000,
    oldPrice: 380000,
    discount: "-15%",
    category: "den",
    categoryName: "Đèn",
    categoryEn: "Lighting",
    desc: "Nan tre vót tay tỉ mỉ đan mây tre truyền thống, mang nét đẹp hoài niệm cho không gian quán cafe & trà.",
    badge: "-15%",
    badgeType: "sale",
    inStock: true,
    rating: 4.7,
    reviewsCount: 26,
    image: "/assets/images/products/San_pham/den-long-tre-original.webp",
    gallery: [
      "/assets/images/products/San_pham/den-long-tre-original.webp",
      "/assets/images/products/do-my-nghe/den-long-tre.webp",
      "/assets/images/products/San_pham/den-tre-thu-cong-original.webp",
      "/assets/images/products/do-my-nghe/den-tre-thu-cong.webp",
      "/assets/images/products/San_pham/gio-may-dan-original.webp"
    ],
    details: {
      material: "Tre tự nhiên vót tay",
      color: "Vàng tre tự nhiên",
      dimensions: "Đường kính 28cm, Cao 32cm",
      weight: "0.7 kg",
      madeIn: "Việt Nam"
    }
  },
  {
    id: 10,
    name: "Khay gỗ trang trí chữ nhật",
    nameEn: "Wooden Serving Tray",
    price: 220000,
    oldPrice: 280000,
    discount: "-21%",
    category: "nha-bep",
    categoryName: "Nhà bếp",
    categoryEn: "Kitchen & Dining",
    desc: "Gỗ tần皮 lau dầu thực vật an toàn tuyệt đối cho thực phẩm, dùng đựng trà, bánh và trang trí.",
    badge: null,
    badgeType: null,
    inStock: true,
    rating: 4.8,
    reviewsCount: 19,
    image: "/assets/images/products/San_pham/khay-go-trang-tri-original.webp",
    gallery: [
      "/assets/images/products/San_pham/khay-go-trang-tri-original.webp",
      "/assets/images/products/do-thu-cong/khay-go-trang-tri.webp",
      "/assets/images/products/San_pham/khay-go-hoa-van-original.webp",
      "/assets/images/products/do-thu-cong/khay-go-hoa-van.webp",
      "/assets/images/products/San_pham/bo-ban-an-go-original.webp"
    ],
    details: {
      material: "Gỗ Tần Bì (Ash wood)",
      color: "Nâu sáng tự nhiên",
      dimensions: "35cm x 22cm x 3cm",
      weight: "0.5 kg",
      madeIn: "Việt Nam"
    }
  },
  {
    id: 11,
    name: "Khay gỗ hoa văn chạm khắc",
    nameEn: "Carved Wooden Tray",
    price: 280000,
    oldPrice: 330000,
    discount: "-15%",
    category: "nha-bep",
    categoryName: "Nhà bếp",
    categoryEn: "Kitchen & Dining",
    desc: "Họa tiết chạm khắc thủ công tinh xảo bởi nghệ nhân làng nghề, hoa văn cổ điển độc đáo.",
    badge: "-15%",
    badgeType: "sale",
    inStock: true,
    rating: 4.9,
    reviewsCount: 37,
    image: "/assets/images/products/San_pham/khay-go-hoa-van-original.webp",
    gallery: [
      "/assets/images/products/San_pham/khay-go-hoa-van-original.webp",
      "/assets/images/products/do-thu-cong/khay-go-hoa-van.webp",
      "/assets/images/products/San_pham/khay-go-trang-tri-original.webp",
      "/assets/images/products/do-thu-cong/khay-go-trang-tri.webp",
      "/assets/images/products/San_pham/bo-ban-an-go-original.webp"
    ],
    details: {
      material: "Gỗ Muồng Đen chạm khắc",
      color: "Nâu gụ hoa văn",
      dimensions: "32cm x 20cm x 3.5cm",
      weight: "0.65 kg",
      madeIn: "Việt Nam"
    }
  },
  {
    id: 12,
    name: "Tranh treo tường Macrame",
    nameEn: "Macrame Wall Hanging",
    price: 350000,
    oldPrice: 420000,
    discount: "-16%",
    category: "trang-tri",
    categoryName: "Trang trí",
    categoryEn: "Home Decor",
    desc: "Sợi cotton 100% tự nhiên đan tay thủ công phong cách Bohemian, mang vẻ đẹp ấm cúng quyến rũ.",
    badge: "Mới",
    badgeType: "new",
    inStock: true,
    rating: 4.8,
    reviewsCount: 25,
    image: "/assets/images/products/San_pham/tranh-treo-macrame-original.webp",
    gallery: [
      "/assets/images/products/San_pham/tranh-treo-macrame-original.webp",
      "/assets/images/products/do-thu-cong/tranh-treo-macrame.webp",
      "/assets/images/products/San_pham/gio-may-dan-original.webp",
      "/assets/images/products/San_pham/den-long-tre-original.webp",
      "/assets/images/products/San_pham/binh-gom-trang-tri-original.webp"
    ],
    details: {
      material: "Sợi Cotton 100% & Thanh gỗ sồi",
      color: "Trắng kem mộc",
      dimensions: "Rộng 40cm, Dài 75cm",
      weight: "0.45 kg",
      madeIn: "Việt Nam"
    }
  }
];

export function getCategoryName(catId: string): string {
  const map: Record<string, string> = {
    'noi-that': 'Nội thất',
    'trang-tri': 'Trang trí',
    'nha-bep': 'Nhà bếp',
    'den': 'Đèn trang trí',
    'van-phong': 'Văn phòng',
    'luu-tru': 'Lưu trữ'
  };
  return map[catId] || catId || 'Đồ thủ công';
}

export function formatPrice(amount?: number, useVndFormat = true): string {
  if (amount === undefined || amount === null) return "";
  if (useVndFormat) {
    return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",") + " VND";
  }
  return amount.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + "đ";
}
