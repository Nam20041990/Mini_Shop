import React from 'react';
import { INITIAL_PRODUCTS } from '@/data/products';
import ProductDetailClient from './ProductDetailClient';
import type { Metadata } from 'next';

export async function generateStaticParams() {
  return INITIAL_PRODUCTS.map((p) => ({
    id: p.id.toString(),
  }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const resolvedParams = await params;
  const numId = parseInt(resolvedParams.id, 10);
  const product = INITIAL_PRODUCTS.find((p) => p.id === numId);

  if (!product) {
    return {
      title: 'Chi tiết sản phẩm - Mini Shop',
      description: 'Xem chi tiết sản phẩm thủ công, nội thất và trang trí tinh tế tại Mini Shop.',
    };
  }

  return {
    title: `${product.name} - Mini Shop`,
    description: product.desc,
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const numId = parseInt(resolvedParams.id, 10);
  const product = INITIAL_PRODUCTS.find((p) => p.id === numId);

  return <ProductDetailClient initialProduct={product} productId={numId} />;
}
