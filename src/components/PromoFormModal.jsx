import React, { useEffect, useState } from "react";
import "./PromoFormModal.css";

const categoriesDisponibles = [
  "Kimono",
  "Vêtements",
  "Équipement combat",
  "Armes",
  "Sacs",
  "Autre"
];

const PromoFormModal = ({ show, onClose, onSave, promo }) => {
  const [form, setForm] = useState({
    name: "",
    discount: 0,
    categories: [],
    start: new Date(),
    end: new Date(Date.now() + 3600000),
    tagText: "",
  });

  useEffect(() => {
    if (promo) {
      setForm({
        name: promo.name || "",
        discount: promo.discount || 0,
        categories: promo.categories || [],
        start: promo.start?.toDate() || new Date(),
        end: promo.end?.toDate() || new Date(Date.now() + 3600000),
        tagText: promo.tagText || "",
      });
    }
  }, [promo]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryChange = (category) => {
    setForm((prev) => {
      const exists = prev.categories.includes(category);
      return {
        ...prev,
        categories: exists
          ? prev.categories.filter((c) => c !== category)
          : [...prev.categories, category],
      };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.discount || !form.tagText) {
      alert("Champs obligatoires manquants");
      return;
    }
    const payload = {
      ...form,
      discount: Number(form.discount),
      start: new Date(form.start),
      end: new Date(form.end),
    };
    onSave(payload);
  };

  if (!show) return null;

  return (
    <div className="promo-modal">
      <div className="promo-modal-content">
        <h2>{promo ? "Modifier" : "Créer"} une promotion</h2>
        <form onSubmit={handleSubmit}>
          <label>Nom de la promotion *</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ex: Promo été"
            required
          />

          <label>Texte du tag (ex : -20% ou PROMO) *</label>
          <input
            name="tagText"
            value={form.tagText}
            onChange={handleChange}
            placeholder="Ex: -20%"
            required
          />

          <label>Pourcentage de réduction *</label>
          <input
            type="number"
            name="discount"
            value={form.discount}
            onChange={handleChange}
            min="1"
            max="100"
            required
          />

          <label>Catégories concernées</label>
          <div className="checkbox-group">
            {categoriesDisponibles.map((cat) => (
              <label key={cat}>
                <input
                  type="checkbox"
                  checked={form.categories.includes(cat)}
                  onChange={() => handleCategoryChange(cat)}
                />
                {cat}
              </label>
            ))}
          </div>

          <label>Date et heure de début *</label>
          <input
            type="datetime-local"
            name="start"
            value={form.start ? new Date(form.start).toISOString().slice(0, 16) : ""}
            onChange={handleChange}
            required
          />

          <label>Date et heure de fin *</label>
          <input
            type="datetime-local"
            name="end"
            value={form.end ? new Date(form.end).toISOString().slice(0, 16) : ""}
            onChange={handleChange}
            required
          />

          <div className="button-row">
            <button type="submit" className="save">💾 Sauvegarder</button>
            <button type="button" onClick={onClose} className="cancel">
              Annuler
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PromoFormModal;
