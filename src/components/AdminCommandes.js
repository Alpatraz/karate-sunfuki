import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, getDocs } from "firebase/firestore";
import { CSVLink } from "react-csv";
import { useNavigate } from "react-router-dom";
import AdminLayout from "./AdminLayout";
import "./AdminCommandes.css";

const AdminCommandes = () => {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const snapshot = await getDocs(collection(db, "orders"));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setOrders(data);
      } catch (error) {
        console.error("Erreur lors du chargement des commandes :", error);
      }
    };

    fetchOrders();
  }, []);

  const filtered = orders.filter(order =>
    order.name?.toLowerCase().includes(search.toLowerCase()) ||
    new Date(order.createdAt?.seconds * 1000).toLocaleDateString("fr-CA").includes(search)
  );

  const csvData = filtered.map(order => {
    const articles = order.items?.map(i => `${i.name} x${i.quantity || 1}`).join(" | ");
    const taxes = order.taxes || {};
    return {
      "ID commande": order.orderId || order.id,
      "Nom": order.name,
      "Courriel": order.email,
      "Téléphone": order.phone,
      "Méthode de paiement": order.paymentMethod || "Inconnue",
      "Prix HT": order.subtotal?.toFixed(2),
      "TPS": taxes.tps?.toFixed(2),
      "TVQ": taxes.tvq?.toFixed(2),
      "Total TTC": order.total?.toFixed(2),
      "Date": new Date(order.createdAt?.seconds * 1000).toLocaleString(),
      "Articles": articles
    };
  });

  const handleClickOrder = (id) => {
    navigate(`/admin-commande/${id}`);
  };

  return (
    <AdminLayout>
      <div className="admin-commandes">
        <h2>📋 Commandes reçues</h2>

        <div className="commandes-actions">
          <input
            type="text"
            placeholder="🔍 Rechercher par nom ou date (aaaa-mm-jj)"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <CSVLink data={csvData} filename="commandes.csv" className="csv-btn">
            📥 Export CSV
          </CSVLink>
        </div>

        {/* 🧾 Tableau des commandes */}
        <div className="commandes-table-wrapper">
          <table className="commandes-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Commande</th>
                <th>Nom</th>
                <th>Total TTC</th>
                <th>Statut</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(order => (
                <tr key={order.id}>
                  <td>{new Date(order.createdAt?.seconds * 1000).toLocaleString()}</td>
                  <td>
                    <button
                      onClick={() => handleClickOrder(order.id)}
                      className="commande-link"
                    >
                      {order.orderId || order.id}
                    </button>
                  </td>
                  <td>{order.name}</td>
                  <td>{order.total?.toFixed(2)} $</td>
                  <td style={{ color: order.paymentStatus === "paid" ? "green" : "red" }}>
                    {order.paymentStatus === "paid" ? "Payé" : "Échec"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminCommandes;
