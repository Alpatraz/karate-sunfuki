import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const useAdminAuth = () => {
  const navigate = useNavigate();
  const [authenticated, setAuthenticated] = useState(null); // null = en attente

  useEffect(() => {
    const isAuth = localStorage.getItem("auth");
    if (isAuth) {
      setAuthenticated(true);
    } else {
      setAuthenticated(false);
      navigate("/admin");
    }
  }, [navigate]);

  return { authenticated };
};

export default useAdminAuth;
