import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

function ProductList({ language }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const querySnapshot = await getDocs(collection(db, "products"));
      setProducts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchData();
  }, []);

  return (
    <div style={{ padding: "1rem" }}>
      {products.map(product => (
        <div key={product.id} style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
          <h2>{product.name}</h2>
          <p>{product.description}</p>
          <p><strong>{language === "fr" ? "Prix" : "Price"} :</strong> {product.price}$</p>
          <p><strong>{language === "fr" ? "Tailles" : "Sizes"} :</strong> {product.sizes.join(", ")}</p>
          <p><strong>{language === "fr" ? "Stock" : "Availability"} :</strong> {product.inStock ? "✅" : "❌"}</p>
        </div>
      ))}
    </div>
  );
}

export default ProductList;
