// src/utils/utils.js
export const applyPromotion = (product, promotions) => {
  if (!Array.isArray(promotions)) return product;

  const now = new Date();

  // Filtrage des promotions actives dans le temps
  const activePromos = promotions.filter(p => {
    const start = p.start?.toDate?.() ?? p.start;
    const end = p.end?.toDate?.() ?? p.end;
    return (!start || now >= start) && (!end || now < end);
  });

  // Cherche une promo applicable à la catégorie OU promo globale
  const promo = activePromos.find(p => {
    if (p.categories?.length > 0) {
      return p.categories.includes(product.category);
    }
    return true; // promo globale
  });

  if (promo && promo.discount && product.price) {
    const discountedPrice = product.price * (1 - promo.discount / 100);
    return {
      ...product,
      promotionPrice: Number(discountedPrice.toFixed(2)),
      promotionLabel: promo.tagText || promo.name || "Promotion",
    };
  }

  return product;
};
