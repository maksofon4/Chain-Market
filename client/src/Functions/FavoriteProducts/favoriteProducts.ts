export const isFavorite = (productId: string, selectedProducts: string[]) => {
  if (selectedProducts) {
    return selectedProducts.includes(productId);
  }
  return false;
};

export const toggleFavorite = async (
  productId: string,
  selectedProducts: string[]
): Promise<string[] | null> => {
  if (!selectedProducts) return null;

  let updatedProducts: string[];
  let url: string;

  if (selectedProducts.includes(productId)) {
    // remove from favorites
    updatedProducts = selectedProducts.filter((id) => id !== productId);
    url = "/api/remove-product-from-favorites";
  } else {
    // add to favorites
    updatedProducts = [...selectedProducts, productId];
    url = "/api/add-product-to-favorites";
  }

  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ productIds: [productId] }),
  });

  if (!res.ok) return null;

  return updatedProducts;
};
