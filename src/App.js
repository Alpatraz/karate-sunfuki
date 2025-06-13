import React, { useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import ProductList from "./components/ProductList";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./components/AdminDashboard";
import AdminCommandes from "./components/AdminCommandes";
import AdminCommandeDetail from "./components/AdminCommandeDetail";
import AdminPromotions from "./components/AdminPromotions"; // ✅ nouvel import
import CartDrawer from "./components/CartDrawer";
import CartPage from "./components/CartPage";
import { CartProvider } from "./components/CartContext";
import CartButton from "./components/CartButton";
import logo from "./assets/logo.jpg";
import "./App.css";

function App() {
  const [language, setLanguage] = useState("fr");
  const [drawerOpen, setDrawerOpen] = useState(false);

  return (
    <CartProvider>
      <Router>
        <div className="app">
          <header className="header">
            <img src={logo} alt="Logo Karaté Sunfuki" className="logo" />
            <button
              className="lang-btn"
              onClick={() => setLanguage((lang) => (lang === "fr" ? "en" : "fr"))}
            >
              {language === "fr" ? "English" : "Français"}
            </button>
          </header>

          <main className="main">
            <Routes>
              <Route path="/" element={<ProductList language={language} />} />
              <Route path="/panier" element={<CartPage language={language} />} />
              <Route path="/admin" element={<AdminLogin />} />
              <Route path="/admin/dashboard" element={<AdminDashboard />} />
              <Route path="/admin-commandes" element={<AdminCommandes />} />
              <Route path="/admin-commande/:id" element={<AdminCommandeDetail />} />
              <Route path="/admin-promotions" element={<AdminPromotions />} /> {/* ✅ nouvelle route */}
            </Routes>
          </main>

          <CartDrawer isOpen={drawerOpen} onClose={() => setDrawerOpen(false)} />
          <CartButton toggleDrawer={() => setDrawerOpen(!drawerOpen)} />
        </div>
      </Router>
    </CartProvider>
  );
}

export default App;
