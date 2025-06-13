import React, { useEffect, useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import "./ProductModal.css";

const ProductEditModal = ({ product, onClose, onSave }) => {
  const [form, setForm] = useState({ ...product });
  const [imageFile, setImageFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  useEffect(() => {
    if (product) {
      setForm({ ...product });
    }
  }, [product]);

  const handleChange = (e) => {
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
    if (!imageFile) {
      alert("Aucun fichier sélectionné.");
      return;
    }

    try {
      setUploading(true);
      const storageRef = ref(storage, `products/${Date.now()}_${imageFile.name}`);
      await uploadBytes(storageRef, imageFile);
      const url = await getDownloadURL(storageRef);
      setForm((prev) => ({ ...prev, imageUrl: url }));
    } catch (error) {
      console.error("Erreur de téléversement :", error);
      alert("Erreur : " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = () => {
    const updatedProduct = {
      ...form,
      sizes: typeof form.sizes === "string" ? form.sizes.split(",").map(s => s.trim()) : form.sizes,
      colors: typeof form.colors === "string" ? form.colors.split(",").map(c => c.trim()) : form.colors,
    };
    onSave(updatedProduct);
    setSuccessMessage("✅ Modifications enregistrées !");
    setTimeout(() => {
      setSuccessMessage("");
      onClose();
    }, 1500);
  };

  if (!product) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>✖</button>
        <h2>Modifier le produit</h2>

        <div className="option-group">
          <label>Nom</label>
          <input name="name" value={form.name} onChange={handleChange} />
        </div>

        <div className="option-group">
          <label>Prix ($)</label>
          <input name="price" type="number" value={form.price} onChange={handleChange} />
        </div>

        <div className="option-group">
          <label>Tailles</label>
          <input name="sizes" value={Array.isArray(form.sizes) ? form.sizes.join(", ") : form.sizes} onChange={handleChange} />
        </div>

        <div className="option-group">
          <label>Couleurs</label>
          <input name="colors" value={Array.isArray(form.colors) ? form.colors.join(", ") : form.colors} onChange={handleChange} />
        </div>

        <div className="option-group">
          <label>Description courte</label>
          <input name="description" value={form.description} onChange={handleChange} />
        </div>

        <div className="option-group">
          <label>Description longue</label>
          <textarea name="descriptionLong" value={form.descriptionLong} onChange={handleChange} />
        </div>

        <div className="option-row">
          <div className="option-group">
            <label>Catégorie</label>
            <select name="category" value={form.category} onChange={handleChange}>
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
            <label>Ceinture requise</label>
            <select name="requiredBelt" value={form.requiredBelt} onChange={handleChange}>
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
            <label>
              <input type="checkbox" name="inStock" checked={form.inStock} onChange={handleChange} /> En stock
            </label>
          </div>
        </div>

        <div className="option-group">
          <label>Image (URL ou chargement)</label>
          <input name="imageUrl" value={form.imageUrl} onChange={handleChange} />
          {form.imageUrl && <img src={form.imageUrl} alt="aperçu" className="modal-image" />}

          <div
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            Glisser-déposer une image ici ou choisir un fichier :
            <input
              type="file"
              onChange={(e) => {
                setImageFile(e.target.files[0]);
              }}
              style={{ marginTop: "0.5rem" }}
            />
          </div>

          <button
            onClick={handleImageUpload}
            disabled={uploading}
            style={{
              marginTop: "0.5rem",
              backgroundColor: "#444",
              color: "white",
              padding: "0.4rem 0.8rem",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            {uploading ? "Téléversement..." : "📤 Charger vers Firebase"}
          </button>
        </div>

        <button className="modal-submit-btn" onClick={handleSubmit}>💾 Sauvegarder</button>
        {successMessage && <div className="success-message">{successMessage}</div>}
      </div>
    </div>
  );
};

export default ProductEditModal;
