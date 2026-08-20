// src/Components/Header.jsx
import { useAuth } from "../context/AuthContext";

const Header = () => {
  const { user, loginWithGoogle, loginWithMicrosoft, logout } = useAuth();

  return (
    <header className="header">
      <h1>Prof Karen Carvalho</h1>
      <p>Experiências de aprendizagem & desenvolvimento web</p>

      <div style={{ marginLeft: "auto" }}>
        {user ? (
          <>
            <span style={{ marginRight: "1rem" }}>
              Olá, {user.displayName || user.email}
            </span>
            <button onClick={logout}>Sair</button>
          </>
        ) : (
          <>
            <button onClick={loginWithGoogle}>
              Entrar com Google
            </button>
            <button
              onClick={loginWithMicrosoft}
              style={{ marginLeft: "0.5rem" }}
            >
              Entrar com Microsoft
            </button>
          </>
        )}
      </div>
    </header>
  );
};

export default Header;