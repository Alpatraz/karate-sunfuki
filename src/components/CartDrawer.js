import React, { useState, useEffect, useRef } from "react";
import { useCart } from "./CartContext";
import { db } from "../firebase";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import usePromotions from "../hooks/usePromotions";
import { applyPromotion } from "../utils/utils";
import "./CartDrawer.css";

const CartDrawer = ({ isOpen, onClose }) => {
  const { cart, clearCart, updateQuantity, removeFromCart } = useCart();
  const promotions = usePromotions();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [sending, setSending] = useState(false);
  const paypalRef = useRef(null);

  // Appliquer les promotions
  const promoCart = cart.map(item => applyPromotion(item, promotions));

  console.log("Cart:", cart);
  console.log("PromoCart:", promoCart);

  const subtotal = promoCart.reduce(
    (acc, item) => acc + (item.promotionPrice || item.price) * (item.quantity || 1),
    0
  );
  const tps = subtotal * 0.05;
  const tvq = subtotal * 0.09975;
  const total = subtotal + tps + tvq;

  const isFormValid = name && email && phone;

  const orderData = {
    name,
    email,
    phone,
    createdAt: Timestamp.now(),
    subtotal,
    tps,
    tvq,
    total,
    items: promoCart.map((item) => ({
      id: item.id,
      name: item.name,
      price: item.promotionPrice || item.price,
      quantity: item.quantity || 1,
      selectedSize: item.selectedSize || null,
      selectedColor: item.selectedColor || null,
    })),
  };

  useEffect(() => {
    if (!isOpen) return;

    // Fonction déplacée ici
    const handlePaymentSuccess = async () => {
      try {
        setSending(true);
        await addDoc(collection(db, "orders"), orderData);
        alert("Commande payée et enregistrée ! Un courriel vous sera envoyé.");
        clearCart();
        setName("");
        setEmail("");
        setPhone("");
        onClose();
      } catch (error) {
        console.error("Erreur lors de l'enregistrement de la commande", error);
        alert("Une erreur est survenue. Veuillez réessayer plus tard.");
      } finally {
        setSending(false);
      }
    };

    if (isFormValid && window.paypal && paypalRef.current) {
      paypalRef.current.innerHTML = "";

      window.paypal.Buttons({
        createOrder: (data, actions) => {
          return actions.order.create({
            purchase_units: [
              {
                amount: {
                  value: total.toFixed(2),
                  currency_code: "CAD",
                },
              },
            ],
          });
        },
        onApprove: async (data, actions) => {
          await actions.order.capture();
          handlePaymentSuccess();
        },
        onError: (err) => {
          console.error("Erreur PayPal:", err);
          alert("Erreur de paiement. Veuillez réessayer.");
        },
      }).render(paypalRef.current);
    }
  }, [isOpen, isFormValid, total, orderData, clearCart, onClose]);

  return (
    <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={onClose}>×</button>
      <h2>Votre commande</h2>

      {cart.length === 0 ? (
        <p>Votre panier est vide.</p>
      ) : (
        <>
          <ul className="cart-items">
            {promoCart.map((item, index) => (
              <li key={index} className="cart-line">
                <div>
                  <strong>{item.name}</strong>{" "}
                  {item.promotionPrice ? (
                    <>
                      – <span className="promo-price">{item.promotionPrice.toFixed(2)} $</span>
                      <span className="original-price"> {item.price.toFixed(2)} $</span>
                    </>
                  ) : (
                    <>– {item.price.toFixed(2)} $</>
                  )}
                  {item.selectedSize && <div>Taille : {item.selectedSize}</div>}
                  {item.selectedColor && <div>Couleur : {item.selectedColor}</div>}
                </div>
                <div className="cart-actions">
                  <input
                    type="number"
                    min="1"
                    value={item.quantity || 1}
                    onChange={(e) => updateQuantity(index, parseInt(e.target.value))}
                  />
                  <button className="remove-btn" onClick={() => removeFromCart(index)}>🗑️</button>
                </div>
              </li>
            ))}
          </ul>

          <div className="totals">
            <p>Articles : {subtotal.toFixed(2)} $</p>
            <p>TPS (5%) : {tps.toFixed(2)} $</p>
            <p>TVQ (9.975%) : {tvq.toFixed(2)} $</p>
            <p><strong>Montant total : {total.toFixed(2)} $</strong></p>
          </div>

          <div className="cart-form">
            <input type="text" placeholder="Nom et prénom" value={name} onChange={(e) => setName(e.target.value)} />
            <input type="email" placeholder="Adresse courriel" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="tel" placeholder="Téléphone" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          {isFormValid ? (
            <div ref={paypalRef} style={{ marginTop: "1.5rem" }} />
          ) : (
            <button className="submit-btn" disabled style={{ marginTop: "1rem", opacity: 0.5 }}>
              Remplissez les champs pour continuer
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CartDrawer;
