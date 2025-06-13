export const applyPromotions = (products, promotions) => {
    const now = new Date();
  
    return products.map((prod) => {
      const match = promotions.find(p =>
        (p.type === "product" && p.target === prod.id) ||
        (p.type === "category" && p.target === prod.category) ||
        (p.type === "global" && p.target === "*")
      );
  
      if (match && match.start.toDate() <= now && match.end.toDate() >= now) {
        const discount = parseFloat(match.discount);
        const discountAmount = prod.price * (discount / 100);
        return {
          ...prod,
          promo: match,
          priceAfterPromo: parseFloat((prod.price - discountAmount).toFixed(2))
        };
      }
  
      return prod;
    });
  };
  