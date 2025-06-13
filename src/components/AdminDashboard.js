import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where
} from "firebase/firestore";
import ProductEditModal from "./ProductEditModal";
import ProductFormModal from "./ProductFormModal";
import AdminLayout from "./AdminLayout";
import Papa from "papaparse";

const AdminDashboard = () => {
  const [products, setProducts] = useState([]);
  const [editingProduct, setEditingProduct] = useState(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterBelt, setFilterBelt] = useState("");
  const [importMessage, setImportMessage] = useState("");

  const fetchProducts = async () => {
    const snapshot = await getDocs(collection(db, "products"));
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProducts(list);
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleAdd = async (newProduct) => {
    await addDoc(collection(db, "products"), newProduct);
    fetchProducts();
  };

  const handleSaveUpdate = async (updatedProduct) => {
    const { id, ...data } = updatedProduct;
    await updateDoc(doc(db, "products", id), data);
    fetchProducts();
    setEditingProduct(null);
  };

  const handleDelete = async (id) => {
    await deleteDoc(doc(db, "products", id));
    fetchProducts();
  };

  const handleCSVUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async (results) => {
        let successCount = 0;
        let failureCount = 0;
        let duplicateCount = 0;

        for (const row of results.data) {
          if (!row.name || !row.price || !row.reference) {
            failureCount++;
            continue;
          }

          const q = query(collection(db, "products"), where("reference", "==", row.reference));
          const existing = await getDocs(q);

          if (!existing.empty) {
            duplicateCount++;
            continue;
          }

          try {
            await addDoc(collection(db, "products"), {
              name: row.name,
              price: parseFloat(row.price),
              category: row.category || "",
              requiredBelt: row.requiredBelt || "",
              sizes: row.sizes ? row.sizes.split(",").map(s => s.trim()) : [],
              colors: row.colors ? row.colors.split(",").map(c => c.trim()) : [],
              description: row.description || "",
              reference: row.reference,
              inStock: row.inStock?.toLowerCase?.() === "true"
            });
            successCount++;
          } catch (err) {
            console.error("Erreur import:", err);
            failureCount++;
          }
        }

        fetchProducts();
        setImportMessage(`✅ Importation terminée : ${successCount} ajoutés, ${duplicateCount} doublons ignorés, ${failureCount} erreurs.`);
        setTimeout(() => setImportMessage(""), 8000);
      },
      error: (err) => {
        setImportMessage(`❌ Erreur lors de l'import : ${err.message}`);
      }
    });
  };

  const downloadTemplate = () => {
    const csvContent = `name,price,category,requiredBelt,sizes,colors,description,reference,inStock\nKimono Enfant,49.99,Kimono,Blanche,S,M,L,Blanc,Basique pour débutant,KIM001,true`;
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "modele_produits.csv";
    link.click();
  };

  const filteredProducts = products.filter(p =>
    (searchTerm === "" || p.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (filterCategory === "" || p.category === filterCategory) &&
    (filterBelt === "" || p.requiredBelt === filterBelt)
  );

  return (
    <AdminLayout>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <h2>Interface Admin – Produits</h2>
        <div>
          <button onClick={() => setShowAddModal(true)} style={{ backgroundColor: "#007bff", color: "#fff", border: "none", padding: "0.5rem 1rem", borderRadius: "6px", cursor: "pointer", fontWeight: "bold" }}>
            ➕ Ajouter un produit
          </button>
          <button onClick={downloadTemplate} style={{ marginLeft: "1rem", backgroundColor: "#28a745", color: "#fff", padding: "0.5rem 1rem", borderRadius: "6px", border: "none", cursor: "pointer", fontWeight: "bold" }}>
            ⬇️ Télécharger modèle CSV
          </button>
          <label style={{ marginLeft: "1rem", cursor: "pointer" }}>
            📁 Importer CSV
            <input type="file" accept=".csv" onChange={handleCSVUpload} style={{ display: "none" }} />
          </label>
        </div>
      </div>

      {importMessage && <p style={{ color: "green", marginBottom: "1rem" }}>{importMessage}</p>}

      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem", flexWrap: "wrap" }}>
        <input
          type="text"
          placeholder="Rechercher un produit..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ flex: "1 1 200px", padding: "0.5rem" }}
        />

        <select value={filterCategory} onChange={e => setFilterCategory(e.target.value)} style={{ padding: "0.5rem" }}>
          <option value="">Toutes les catégories</option>
          <option value="Kimono">Kimono</option>
          <option value="Vêtements">Vêtements</option>
          <option value="Équipement combat">Équipement combat</option>
          <option value="Armes">Armes</option>
          <option value="Sacs">Sacs</option>
          <option value="Autre">Autre</option>
        </select>

        <select value={filterBelt} onChange={e => setFilterBelt(e.target.value)} style={{ padding: "0.5rem" }}>
          <option value="">Toutes les ceintures</option>
          <option value="Blanche">Blanche</option>
          <option value="Jaune">Jaune</option>
          <option value="Orange">Orange</option>
          <option value="Mauve">Mauve</option>
          <option value="Verte">Verte</option>
          <option value="Bleue">Bleue</option>
          <option value="Brune">Brune</option>
          <option value="Noire">Noire</option>
        </select>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
        {filteredProducts.map(p => (
          <div key={p.id} style={{
            border: "1px solid #ccc",
            borderRadius: "8px",
            padding: "1rem",
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            background: "#fff",
            boxShadow: "0 1px 4px rgba(0,0,0,0.05)"
          }}>
            {p.imageUrl && <img src={p.imageUrl} alt={p.name} style={{ height: "60px", borderRadius: "4px" }} />}
            <div style={{ flexGrow: 1 }}>
              <strong>{p.name}</strong><br />
              <small>{p.price} $ – {p.category || "-"} – {p.inStock ? "✅" : "❌"}</small><br />
              <small>Tailles: {p.sizes?.join(", ")} | Couleurs: {p.colors?.join(", ")} | Ceinture: {p.requiredBelt || "-"}</small><br />
              <small>Description: {p.description || "-"}</small>
            </div>
            <div>
              <button onClick={() => setEditingProduct(p)}>✏️</button>
              <button onClick={() => handleDelete(p.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>

      {/* Modales */}
      {editingProduct && (
        <ProductEditModal
          product={editingProduct}
          onClose={() => setEditingProduct(null)}
          onSave={handleSaveUpdate}
        />
      )}

      {showAddModal && (
        <ProductFormModal
          show={showAddModal}
          onClose={() => setShowAddModal(false)}
          onSave={handleAdd}
        />
      )}
    </AdminLayout>
  );
};

export default AdminDashboard;
