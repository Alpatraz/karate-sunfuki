import React, { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./ProductModal.css";

const ProductFormModal = ({ onClose, onSave }) => {
  const [form, setForm] = useState({
    name: "",
    price: "",
    sizes: "",
    colors: "",
    requiredBelt: "",
    category: "",
    inStock: true,
    imageUrl: "",
    description: "",
    descriptionLong: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleDrop = (e) => {
    e.preventDefault();
    if (e.dataTransfer.files.length > 0) {
      setImageFile(e.dataTransfer.files[0]);
    }
  };

  const handleImageUpload = async () => {
    console.log("Image à uploader :", imageFile);
    if (!imageFile) {
      alert("Aucun fichier sélectionné !");
      return;
    }
    try {
      setUploading(true);
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const url = await getDownloadURL(storageRef);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error("Erreur upload image :", error);
      alert("Erreur lors de l’upload. Voir console.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    const newProduct = {
      ...form,
      price: parseFloat(form.price),
      sizes: form.sizes.split(",").map(s => s.trim()),
      colors: form.colors.split(",").map(c => c.trim())
    };
    onSave(newProduct);
    setSuccessMessage("✅ Produit ajouté !");
    setTimeout(() => {
      setSuccessMessage("");
      onClose();
    }, 1500);
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✖</button>
        <h2>Ajouter un nouveau produit</h2>

        <div className="option-group">
          <label className="option-label">Nom</label>
          <input name="name" value={form.name} onChange={handleInputChange} />
        </div>

        <div className="option-group">
          <label className="option-label">Prix ($)</label>
          <input name="price" value={form.price} onChange={handleInputChange} type="number" />
        </div>

        <div className="option-group">
          <label className="option-label">Tailles</label>
          <input name="sizes" value={form.sizes} onChange={handleInputChange} placeholder="Ex: S, M, L" />
        </div>

        <div className="option-group">
          <label className="option-label">Couleurs</label>
          <input name="colors" value={form.colors} onChange={handleInputChange} placeholder="Ex: rouge, noir" />
        </div>

        <div className="option-group">
          <label className="option-label">Description courte</label>
          <input name="description" value={form.description} onChange={handleInputChange} />
        </div>

        <div className="option-group">
          <label className="option-label">Description longue</label>
          <textarea name="descriptionLong" value={form.descriptionLong} onChange={handleInputChange} />
        </div>

        <div className="option-row">
          <div className="option-group">
            <label className="option-label">Catégorie</label>
            <select name="category" value={form.category} onChange={handleInputChange} className="option-select">
              <option value="">-- Choisir --</option>
              <option value="Kimono">Kimono</option>
              <option value="Vêtements">Vêtements</option>
              <option value="Équipement combat">Équipement combat</option>
              <option value="Armes">Armes</option>
              <option value="Sacs">Sacs</option>
              <option value="Autre">Autre</option>
            </select>
          </div>

          <div className="option-group">
            <label className="option-label">Ceinture requise</label>
            <select name="requiredBelt" value={form.requiredBelt} onChange={handleInputChange} className="option-select">
              <option value="">-- Ceinture --</option>
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

          <div className="option-group" style={{ marginTop: "1.75rem" }}>
            <label className="option-label">Stock</label>
            <label>
              <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleInputChange} /> En stock
            </label>
          </div>
        </div>

        <div className="option-group">
          <label className="option-label">Image (URL ou chargement)</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleInputChange} placeholder="https://..." />
          {form.imageUrl && <img src={form.imageUrl} alt="Aperçu" className="modal-image" />}

          <div
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            Glisser-déposer une image ici ou sélectionner un fichier :
            <input
              type="file"
              onChange={(e) => setImageFile(e.target.files[0])}
              style={{ marginTop: "0.5rem" }}
            />
          </div>

          <button onClick={handleImageUpload} disabled={uploading} style={{
            marginTop: "0.5rem",
            backgroundColor: "#444",
            color: "white",
            padding: "0.4rem 0.8rem",
            border: "none",
            borderRadius: "6px",
            cursor: "pointer"
          }}>
            {uploading ? "Téléversement..." : "📤 Charger vers Firebase"}
          </button>
        </div>

        <button className="modal-submit-btn" onClick={handleSubmit}>💾 Ajouter le produit</button>
        {successMessage && <div className="success-message">{successMessage}</div>}
      </div>
    </div>
  );
};

export default ProductFormModal;
