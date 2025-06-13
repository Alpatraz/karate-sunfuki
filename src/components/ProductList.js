import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import ProductModal from "./ProductModal";
import usePromotions from "../hooks/usePromotions";
import { applyPromotion } from "../utils/utils";
import "./ProductList.css";

const beltOrder = ["Blanche", "Jaune", "Orange", "Mauve", "Verte", "Bleue", "Brune", "Noire"];

const ProductList = ({ language }) => {
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedBelt, setSelectedBelt] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const promotions = usePromotions();
  console.log("PROMOTIONS CHARGÉES", promotions);

  useEffect(() => {
    const fetchData = async () => {
      const snapshot = await getDocs(collection(db, "products"));
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(list);
    };
    fetchData();
  }, []);

  const filterByBelt = (product) => {
    if (!selectedBelt) return true;
    if (!product.requiredBelt) return false;
    const requiredIndex = beltOrder.indexOf(product.requiredBelt);
    const selectedIndex = beltOrder.indexOf(selectedBelt);
    return requiredIndex <= selectedIndex;
  };

  const filterByCategory = (product) => {
    if (!selectedCategory) return true;
    return product.category === selectedCategory;
  };

  const filterBySearch = (product) => {
    const query = searchQuery.toLowerCase();
    return (
      product.name?.toLowerCase().includes(query) ||
      product.description?.toLowerCase().includes(query) ||
      product.reference?.toLowerCase().includes(query)
    );
  };

  const filteredProducts = products
    .filter((p) => filterByBelt(p) && filterByCategory(p) && filterBySearch(p))
    .map((product) => applyPromotion(product, promotions));

  const getBeltClass = (belt) => {
    switch (belt) {
      case "Jaune": return "badge-yellow";
      case "Orange": return "badge-orange";
      case "Mauve": return "badge-purple";
      case "Verte": return "badge-green";
      case "Bleue": return "badge-blue";
      case "Brune": return "badge-brown";
      case "Noire": return "badge-black";
      default: return "badge-white";
    }
  };

  return (
    <div className="product-page">
      <div className="filters filters-top">
        <select value={selectedBelt} onChange={(e) => setSelectedBelt(e.target.value)}>
          <option value="">{language === "fr" ? "Toutes les ceintures" : "All belts"}</option>
          {beltOrder.map((belt) => (
            <option key={belt} value={belt}>{belt}</option>
          ))}
        </select>

        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">{language === "fr" ? "Toutes les catégories" : "All categories"}</option>
          {"Kimono,Vêtements,Équipement combat,Armes,Sacs,Autre".split(",").map(cat => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>

        <input
          type="text"
          placeholder={language === "fr" ? "Recherche" : "Search"}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            padding: "0.5rem",
            fontSize: "0.9rem",
            borderRadius: "8px",
            border: "1px solid #ccc",
            marginLeft: "1rem",
            minWidth: "180px"
          }}
        />
      </div>

      <p className="legend">
        🎓 {language === 'fr'
          ? "Un tag de couleur indique que cet équipement est obligatoire à partir de la ceinture indiquée."
          : "A color tag indicates that this item is required from the specified belt level."}
      </p>

      <div className="product-grid">
        {filteredProducts.map(product => (
          <div key={product.id} className="card" onClick={() => setSelectedProduct(product)}>
            {product.requiredBelt && (
              <div className={`badge ${getBeltClass(product.requiredBelt)}`}>
                {product.requiredBelt}
              </div>
            )}
            {product.promotionPrice && (
              <div className="promo-badge">
                {product.promotionLabel || "-%"}
              </div>
            )}
            <img src={product.imageUrl} alt={product.name} />
            <h2>{product.name}</h2>
            <p className="price">
              {product.promotionPrice ? (
                <>
                  <span className="promo-price">{product.promotionPrice.toFixed(2)} $</span>
                  <span className="original-price">{product.price.toFixed(2)} $</span>
                </>
              ) : (
                `${product.price.toFixed(2)} $`
              )}
            </p>
            {product.requiredBelt && (
              <p className="belt">{language === 'fr' ? 'Ceinture :' : 'Belt:'} {product.requiredBelt}</p>
            )}
          </div>
        ))}
      </div>

      {selectedProduct && (
        <ProductModal
          product={selectedProduct}
          onClose={() => setSelectedProduct(null)}
          language={language}
        />
      )}
    </div>
  );
};

export default ProductList;
