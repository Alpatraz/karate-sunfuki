import React, { useState } from "react";
import { useCart } from "./CartContext";
import usePromotions from "../hooks/usePromotions";
import { applyPromotion } from "../utils/utils";
import "./ProductModal.css";

const ProductModal = ({ product, onClose, language }) => {
  const { addToCart } = useCart();
  const promotions = usePromotions();
  const promoProduct = applyPromotion(product, promotions);

  const [selectedSize, setSelectedSize] = useState(promoProduct.sizes?.[0] || "");
  const [selectedColor, setSelectedColor] = useState(promoProduct.colors?.[0] || "");
  const [quantity, setQuantity] = useState(1);

  const handleAdd = () => {
    addToCart({
      ...promoProduct,
      selectedSize,
      selectedColor,
      quantity,
    });
    onClose();
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content">
        <button className="modal-close" onClick={onClose}>×</button>

        <div className="modal-header">
          <img src={promoProduct.imageUrl} alt={promoProduct.name} className="modal-image" />
          {promoProduct.promotionPrice && (
            <div className="promo-badge">
              {promoProduct.promotionLabel || "-%"}
            </div>
          )}
        </div>

        <h2>{promoProduct.name}</h2>

        <p className="price">
          {promoProduct.promotionPrice ? (
            <>
              <span className="promo-price">{promoProduct.promotionPrice.toFixed(2)} $</span>
              <span className="original-price">{promoProduct.price.toFixed(2)} $</span>
            </>
          ) : (
            `${promoProduct.price.toFixed(2)} $`
          )}
        </p>

        {promoProduct.descriptionLong && (
          <p className="description-long">{promoProduct.descriptionLong}</p>
        )}

        <div className="option-row">
          {promoProduct.sizes?.length > 0 && (
            <div className="option-group">
              <label className="option-label">
                {language === "fr" ? "Taille" : "Size"}
              </label>
              <select
                className="option-select"
                value={selectedSize}
                onChange={(e) => setSelectedSize(e.target.value)}
              >
                {promoProduct.sizes.map((size, idx) => (
                  <option key={idx} value={size}>{size}</option>
                ))}
              </select>
            </div>
          )}

          {promoProduct.colors?.length > 0 && (
            <div className="option-group">
              <label className="option-label">
                {language === "fr" ? "Couleur" : "Color"}
              </label>
              <select
                className="option-select"
                value={selectedColor}
                onChange={(e) => setSelectedColor(e.target.value)}
              >
                {promoProduct.colors.map((color, idx) => (
                  <option key={idx} value={color}>{color}</option>
                ))}
              </select>
            </div>
          )}

          <div className="option-group">
            <label className="option-label">
              {language === "fr" ? "Quantité" : "Quantity"}
            </label>
            <input
              className="option-select"
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
            />
          </div>
        </div>

        <button className="modal-submit-btn" onClick={handleAdd}>
          {language === "fr" ? "Ajouter au panier" : "Add to cart"}
        </button>
      </div>
    </div>
  );
};

export default ProductModal;
