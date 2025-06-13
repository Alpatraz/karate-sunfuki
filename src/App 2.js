import React, { useState } from "react";
import ProductList from "./components/ProductList";
import OrderForm from "./components/OrderForm";

function App() {
  const [language, setLanguage] = useState("fr");

  return (
    <div style={{ padding: "2rem" }}>
      <button onClick={() => setLanguage(lang => (lang === "fr" ? "en" : "fr"))}>
        {language === "fr" ? "English" : "Français"}
      </button>
      <h1>{language === "fr" ? "Boutique Sunfuki" : "Sunfuki Shop"}</h1>
      <ProductList language={language} />
      <OrderForm language={language} />
    </div>
  );
}

export default App;
