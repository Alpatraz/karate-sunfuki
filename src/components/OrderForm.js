import React, { useState } from "react";
import { collection, addDoc, Timestamp } from "firebase/firestore";
import { db } from "../firebase";

function OrderForm({ language }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    belt: "",
    comment: ""
  });

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, "orders"), {
        ...formData,
        timestamp: Timestamp.now()
      });
      alert(language === "fr" ? "Commande enregistrée !" : "Order submitted!");
      setFormData({ name: "", email: "", belt: "", comment: "" });
    } catch (err) {
      alert("Erreur lors de l'enregistrement !");
      console.error(err);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "2rem", padding: "1rem", border: "1px solid #ccc" }}>
      <h2>{language === "fr" ? "Formulaire de commande" : "Order Form"}</h2>
      <input
        type="text"
        name="name"
        placeholder={language === "fr" ? "Nom" : "Name"}
        value={formData.name}
        onChange={handleChange}
        required
        style={{ display: "block", marginBottom: "1rem", width: "100%" }}
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        required
        style={{ display: "block", marginBottom: "1rem", width: "100%" }}
      />
      <input
        type="text"
        name="belt"
        placeholder={language === "fr" ? "Ceinture" : "Belt"}
        value={formData.belt}
        onChange={handleChange}
        style={{ display: "block", marginBottom: "1rem", width: "100%" }}
      />
      <textarea
        name="comment"
        placeholder={language === "fr" ? "Commentaire" : "Comment"}
        value={formData.comment}
        onChange={handleChange}
        rows="4"
        style={{ display: "block", width: "100%" }}
      />
      <button type="submit" style={{ marginTop: "1rem" }}>
        {language === "fr" ? "Envoyer" : "Submit"}
      </button>
    </form>
  );
}

export default OrderForm;
