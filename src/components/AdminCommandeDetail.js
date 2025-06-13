import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { doc, getDoc, updateDoc, deleteDoc, arrayUnion, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";

const AdminCommandeDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("");

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const docRef = doc(db, "orders", id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = { id: docSnap.id, ...docSnap.data() };
          setOrder(data);
          setStatus(data.paymentStatus || "pending");
          setPaymentMethod(data.paymentMethod || "inconnue");
        } else {
          console.warn("Commande non trouvée");
        }
      } catch (error) {
        console.error("Erreur chargement :", error);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id]);

  const logHistory = async (type, value) => {
    try {
      const entry = {
        type,
        value,
        timestamp: new Date().toISOString(),
        admin: localStorage.getItem("auth") || "Admin inconnu"
      };
      await updateDoc(doc(db, "orders", id), {
        history: arrayUnion(entry)
      });
    } catch (error) {
      console.error("Erreur ajout historique :", error);
    }
  };

  const handleStatusChange = async (e) => {
    const newStatus = e.target.value;
    setStatus(newStatus);
    try {
      await updateDoc(doc(db, "orders", id), { paymentStatus: newStatus });
      logHistory("Statut modifié", newStatus);
    } catch (error) {
      console.error("Erreur mise à jour statut :", error);
    }
  };

  const handlePaymentMethodChange = async (e) => {
    const newMethod = e.target.value;
    setPaymentMethod(newMethod);
    try {
      await updateDoc(doc(db, "orders", id), { paymentMethod: newMethod });
      logHistory("Méthode de paiement modifiée", newMethod);
    } catch (error) {
      console.error("Erreur mise à jour paiement :", error);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Confirmer la suppression de cette commande ?")) {
      try {
        await deleteDoc(doc(db, "orders", id));
        alert("Commande supprimée");
        navigate("/admin-commandes");
      } catch (error) {
        console.error("Erreur suppression :", error);
      }
    }
  };

  if (loading) return <p style={{ padding: "2rem" }}>Chargement...</p>;
  if (!order) return <p style={{ padding: "2rem" }}>Commande introuvable</p>;

  const date = new Date(order.createdAt?.seconds * 1000).toLocaleString();

  return (
    <div style={{ padding: "2rem", maxWidth: "800px", margin: "auto" }}>
      <h2>Détail de la commande</h2>
      <button onClick={() => navigate(-1)} style={{
        marginBottom: "1rem",
        padding: "0.5rem 1rem",
        background: "#ccc",
        border: "none",
        borderRadius: "4px",
        cursor: "pointer"
      }}>⬅ Retour</button>

      <div style={{
        border: "1px solid #ddd",
        padding: "1rem",
        borderRadius: "8px",
        background: "#f9f9f9"
      }}>
        <p><strong>Commande #</strong> {order.orderId || order.id}</p>
        <p><strong>Date :</strong> {date}</p>
        <p><strong>Nom :</strong> {order.name}</p>
        <p><strong>Email :</strong> {order.email}</p>
        <p><strong>Téléphone :</strong> {order.phone}</p>

        <p>
          <strong>Statut :</strong>{" "}
          <select value={status} onChange={handleStatusChange} style={{ padding: "0.3rem" }}>
            <option value="paid">✅ Payé</option>
            <option value="failed">❌ Échec</option>
            <option value="pending">⏳ En attente</option>
          </select>
        </p>

        <p>
          <strong>Méthode de paiement :</strong>{" "}
          <select value={paymentMethod} onChange={handlePaymentMethodChange} style={{ padding: "0.3rem" }}>
            <option value="paypal">PayPal</option>
            <option value="stripe">Stripe</option>
            <option value="virement">Virement</option>
            <option value="espèces">Espèces</option>
            <option value="inconnue">Inconnue</option>
          </select>
        </p>

        <p><strong>Total TTC :</strong> {order.total?.toFixed(2)} $</p>

        <h3 style={{ marginTop: "1rem" }}>🛍️ Articles commandés</h3>
        <ul style={{ listStyle: "none", paddingLeft: 0 }}>
          {order.items?.map((item, index) => (
            <li key={index} style={{ marginBottom: "0.5rem" }}>
              {item.name} — {item.price.toFixed(2)} $ × {item.quantity || 1}
              {item.selectedSize && <> | Taille : {item.selectedSize}</>}
              {item.selectedColor && <> | Couleur : {item.selectedColor}</>}
            </li>
          ))}
        </ul>

        <button onClick={handleDelete} style={{
          marginTop: "1rem",
          background: "#e53935",
          color: "white",
          padding: "0.5rem 1rem",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer"
        }}>
          🗑️ Supprimer cette commande
        </button>

        {order.history?.length > 0 && (
          <div style={{ marginTop: "2rem" }}>
            <h3>🕓 Historique des modifications</h3>
            <ul style={{ paddingLeft: "1rem" }}>
              {[...order.history].reverse().map((h, idx) => (
                <li key={idx}>
                  <em>{new Date(h.timestamp).toLocaleString()}</em> – <strong>{h.type}</strong> ➜ <span>{h.value}</span> {h.admin ? `par ${h.admin}` : ""}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminCommandeDetail;
