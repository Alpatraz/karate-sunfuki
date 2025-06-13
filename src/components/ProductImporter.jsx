import React from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase";
import Papa from "papaparse";

const ProductImporter = () => {
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: async function (results) {
        const data = results.data;
        try {
          const batchAdd = data.map(async (product) => {
            await addDoc(collection(db, "products"), {
              ...product,
              price: parseFloat(product.price),
              createdAt: serverTimestamp(),
            });
          });

          await Promise.all(batchAdd);
          alert("Importation CSV réussie !");
        } catch (error) {
          console.error("Erreur pendant l'importation :", error);
          alert("Erreur lors de l'importation.");
        }
      },
      error: function (error) {
        console.error("Erreur de parsing CSV :", error);
        alert("Erreur lors de la lecture du fichier.");
      }
    });
  };

  return (
    <div style={{ marginTop: "2rem" }}>
      <label style={{ fontWeight: "bold" }}>
        Importer des produits (.csv) :
        <input type="file" accept=".csv" onChange={handleFileChange} style={{ marginLeft: "1rem" }} />
      </label>
    </div>
  );
};

export default ProductImporter;
