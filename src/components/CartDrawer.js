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

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
  });

  const [formErrors, setFormErrors] = useState({});
  const [sending, setSending] = useState(false);
  const paypalRef = useRef(null);

  const promoCart = cart.map((item) => applyPromotion(item, promotions));

  const subtotal = promoCart.reduce(
    (acc, item) => acc + (item.promotionPrice || item.price) * (item.quantity || 1),
    0
  );
  const tps = subtotal * 0.05;
  const tvq = subtotal * 0.09975;
  const total = subtotal + tps + tvq;

  // Validation simple du formulaire
  const validate = () => {
    const errors = {};
    if (!formData.name.trim()) errors.name = "Le nom est requis";
    if (!formData.email.trim()) {
      errors.email = "L'email est requis";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email invalide";
    }
    if (!formData.phone.trim()) {
      errors.phone = "Le téléphone est requis";
    } else if (!/^\+?[0-9\s\-()]{6,}$/.test(formData.phone)) {
      errors.phone = "Téléphone invalide";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Vérifie si le formulaire est valide pour activer PayPal
  const isFormValid = validate();

  // Gère les changements dans les champs du formulaire
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!isOpen) return;

    // Mettre à jour la validation à chaque ouverture ou changement de formulaire
    validate();

    const orderData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
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

    const handlePaymentSuccess = async () => {
      try {
        setSending(true);
        await addDoc(collection(db, "orders"), orderData);
        alert("Commande payée et enregistrée ! Un courriel vous sera envoyé.");
        clearCart();
        setFormData({ name: "", email: "", phone: "" });
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
  }, [isOpen, isFormValid, total, promoCart, clearCart, onClose, formData]);

  return (
    <div className={`cart-drawer ${isOpen ? "open" : ""}`}>
      <button className="close-btn" onClick={onClose}>
        ×
      </button>
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
                  <button className="remove-btn" onClick={() => removeFromCart(index)}>
                    🗑️
                  </button>
                </div>
              </li>
            ))}
          </ul>

          <div className="totals">
            <p>Articles : {subtotal.toFixed(2)} $</p>
            <p>TPS (5%) : {tps.toFixed(2)} $</p>
            <p>TVQ (9.975%) : {tvq.toFixed(2)} $</p>
            <p>
              <strong>Montant total : {total.toFixed(2)} $</strong>
            </p>
          </div>

          <div className="cart-form">
            <input
              name="name"
              type="text"
              placeholder="Nom et prénom"
              value={formData.name}
              onChange={handleInputChange}
              aria-invalid={!!formErrors.name}
            />
            {formErrors.name && <p className="error">{formErrors.name}</p>}

            <input
              name="email"
              type="email"
              placeholder="Adresse courriel"
              value={formData.email}
              onChange={handleInputChange}
              aria-invalid={!!formErrors.email}
            />
            {formErrors.email && <p className="error">{formErrors.email}</p>}

            <input
              name="phone"
              type="tel"
              placeholder="Téléphone"
              value={formData.phone}
              onChange={handleInputChange}
              aria-invalid={!!formErrors.phone}
            />
            {formErrors.phone && <p className="error">{formErrors.phone}</p>}
          </div>

          {isFormValid ? (
            <div ref={paypalRef} style={{ marginTop: "1.5rem" }} />
          ) : (
            <button
              className="submit-btn"
              disabled
              style={{ marginTop: "1rem", opacity: 0.5, cursor: "not-allowed" }}
            >
              Remplissez les champs correctement pour continuer
            </button>
          )}
        </>
      )}
    </div>
  );
};

export default CartDrawer;
