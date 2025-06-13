import React, { useEffect, useState } from "react";
import { useCart } from "./CartContext";
import { db } from "../firebase";
import { collection, addDoc, getDocs, serverTimestamp } from "firebase/firestore";
import { applyPromotions } from "../utils/promotions";
import "./CartPage.css";

const CartPage = ({ language = "fr" }) => {
  const { cart, clearCart } = useCart();
  const [promotions, setPromotions] = useState([]);
  const [cartWithPromos, setCartWithPromos] = useState([]);

  // 🔄 Charger les promos une fois
  useEffect(() => {
    const fetchPromotions = async () => {
      const snapshot = await getDocs(collection(db, "promotions"));
      const now = new Date();
      const activePromos = snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(p => p.start.toDate() <= now && p.end.toDate() >= now);
      setPromotions(activePromos);
    };

    fetchPromotions();
  }, []);

  // 🔄 Met à jour les produits avec rabais
  useEffect(() => {
    setCartWithPromos(applyPromotions(cart, promotions));
  }, [cart, promotions]);

  // 🧮 Recalcul avec rabais
  const total = cartWithPromos.reduce((sum, item) => {
    const price = item.priceAfterPromo || item.price;
    return sum + price * (item.quantity || 1);
  }, 0);
  const TPS = total * 0.05;
  const TVQ = total * 0.09975;
  const grandTotal = total + TPS + TVQ;

  // ✅ Paiement PayPal
  useEffect(() => {
    if (window.paypal && cartWithPromos.length > 0) {
      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: grandTotal.toFixed(2),
                currency_code: "CAD"
              }
            }]
          });
        },
        onApprove: async (data, actions) => {
          const details = await actions.order.capture();

          const docRef = await addDoc(collection(db, "orders"), {
            items: cartWithPromos,
            total: grandTotal.toFixed(2),
            tps: TPS.toFixed(2),
            tvq: TVQ.toFixed(2),
            createdAt: serverTimestamp(),
            paypalName: details.payer.name.given_name,
            paypalEmail: details.payer.email_address,
            paypalOrderId: details.id,
            status: "paid"
          });

          alert(
            language === "fr"
              ? `Merci ${details.payer.name.given_name} ! Votre commande (#${docRef.id}) a été enregistrée avec succès.`
              : `Thank you ${details.payer.name.given_name}! Your order (#${docRef.id}) has been successfully recorded.`
          );

          clearCart();
        }
      }).render("#paypal-button-container");
    }
  }, [cartWithPromos, grandTotal, TPS, TVQ, clearCart, language]);

  return (
    <div className="cart-page">
      <h2>{language === "fr" ? "Votre commande" : "Your Order"}</h2>

      {cartWithPromos.length === 0 ? (
        <p>{language === "fr" ? "Votre panier est vide." : "Your cart is empty."}</p>
      ) : (
        <>
          <ul className="cart-list">
            {cartWithPromos.map((item, index) => (
              <li key={index} className="cart-item">
                <strong>{item.name}</strong>
                {item.promo ? (
                  <>
                    <span style={{ textDecoration: "line-through", marginLeft: "0.5rem", color: "#888" }}>
                      {item.price.toFixed(2)}$
                    </span>
                    <span style={{ color: "#c62828", fontWeight: "bold", marginLeft: "0.5rem" }}>
                      {item.priceAfterPromo.toFixed(2)}$
                    </span>
                  </>
                ) : (
                  <> – {item.price.toFixed(2)}$</>
                )}
                {item.selectedSize && (
                  <span> | {language === "fr" ? "Taille" : "Size"} : {item.selectedSize}</span>
                )}
                {item.selectedColor && (
                  <span> | {language === "fr" ? "Couleur" : "Color"} : {item.selectedColor}</span>
                )}
                {item.quantity && <span> | {language === "fr" ? "Quantité" : "Qty"} : {item.quantity}</span>}
              </li>
            ))}
          </ul>

          <hr />
          <p><strong>Sous-total :</strong> {total.toFixed(2)} $</p>
          <p><strong>TPS (5%) :</strong> {TPS.toFixed(2)} $</p>
          <p><strong>TVQ (9.975%) :</strong> {TVQ.toFixed(2)} $</p>
          <p><strong>Total :</strong> {grandTotal.toFixed(2)} $</p>

          <div id="paypal-button-container" style={{ marginTop: "1rem" }}></div>
        </>
      )}
    </div>
  );
};

export default CartPage;
