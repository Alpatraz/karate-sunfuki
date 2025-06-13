import React, { useEffect, useState } from "react";
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase";
import AdminLayout from "./AdminLayout";
import PromoFormModal from "./PromoFormModal";
import "./AdminPromotions.css";

const AdminPromotions = () => {
  const [promos, setPromos] = useState([]);
  const [selectedPromo, setSelectedPromo] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, "promotions"), (snapshot) => {
      const list = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setPromos(list);
    });
    return () => unsub();
  }, []);

  const savePromo = async (data) => {
    try {
      if (selectedPromo) {
        await updateDoc(doc(db, "promotions", selectedPromo.id), data);
      } else {
        await addDoc(collection(db, "promotions"), {
          ...data,
          createdAt: serverTimestamp(),
        });
      }
      setShowModal(false);
      setSelectedPromo(null);
    } catch (error) {
      console.error("Erreur enregistrement promo:", error);
    }
  };

  const deletePromo = async (id) => {
    if (window.confirm("Supprimer cette promotion ?")) {
      try {
        await deleteDoc(doc(db, "promotions", id));
      } catch (err) {
        console.error("Erreur suppression:", err);
      }
    }
  };

  const duplicatePromo = (promo) => {
    const { id, createdAt, ...copy } = promo;
    setSelectedPromo(null);
    savePromo({ ...copy, name: copy.name + " (copie)" });
  };

  const now = Date.now();
  const sortedPromos = [
    ...promos.filter((p) => p.start?.toDate?.() > new Date(now)),
    ...promos.filter(
      (p) =>
        p.start?.toDate?.() <= new Date(now) &&
        p.end?.toDate?.() > new Date(now)
    ),
    ...promos.filter((p) => p.end?.toDate?.() <= new Date(now)),
  ];

  return (
    <AdminLayout>
      <div className="admin-promotions-container">
        <div className="header">
          <h2>Promotions</h2>
          <button
            onClick={() => {
              setSelectedPromo(null);
              setShowModal(true);
            }}
          >
            + Nouvelle promotion
          </button>
        </div>

        <div className="promo-list">
          {sortedPromos.map((promo) => {
            const startDate = promo.start?.toDate?.();
            const endDate = promo.end?.toDate?.();
            const nowDate = new Date();

            const isActive = startDate <= nowDate && endDate > nowDate;
            const isUpcoming = startDate > nowDate;
            // isExpired supprimé

            return (
              <div
                key={promo.id}
                className={`promo-card ${
                  isActive ? "active" : isUpcoming ? "upcoming" : "expired"
                }`}
              >
                <div>
                  <h4>{promo.name}</h4>
                  <p className="status-tag">
                    {isActive
                      ? "🟢 En cours"
                      : isUpcoming
                      ? "🟡 À venir"
                      : "🔴 Terminée"}
                  </p>
                  <p>Réduction : -{promo.discount}%</p>
                  <p>
                    Catégories : {promo.categories?.join(", ") || "Toutes"}
                  </p>
                  <p>
                    Du {startDate?.toLocaleString()} au{" "}
                    {endDate?.toLocaleString()}
                  </p>
                  <p>
                    Tag affiché : <strong>{promo.tagText}</strong>
                  </p>
                </div>
                <div className="actions">
                  <button
                    onClick={() => {
                      setSelectedPromo(promo);
                      setShowModal(true);
                    }}
                  >
                    ✏️
                  </button>
                  <button onClick={() => duplicatePromo(promo)}>📄</button>
                  <button onClick={() => deletePromo(promo.id)}>🗑️</button>
                </div>
              </div>
            );
          })}
        </div>

        <PromoFormModal
          show={showModal}
          onClose={() => setShowModal(false)}
          onSave={savePromo}
          promo={selectedPromo}
        />
      </div>
    </AdminLayout>
  );
};

export default AdminPromotions;
