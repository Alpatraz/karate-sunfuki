import { useState, useEffect } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase";

const usePromotions = () => {
  const [promotions, setPromotions] = useState([]);

  useEffect(() => {
    const fetchPromotions = async () => {
      try {
        const snapshot = await getDocs(collection(db, "promotions"));
        const list = snapshot.docs.map(doc => {
          console.log("📦 Promo Firestore brute :", doc.data());
          return { id: doc.id, ...doc.data() };
        });

        setPromotions(list);
      } catch (error) {
        console.error("❌ Erreur lors du chargement des promotions :", error);
      }
    };

    fetchPromotions();
  }, []);

  return promotions;
};

export default usePromotions;