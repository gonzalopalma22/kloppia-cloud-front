import { createContext, useContext } from 'react';
import { useMsal, useAccount } from '@azure/msal-react';
import { loginRequest } from './msalConfig';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const { instance, accounts } = useMsal();
  const account = useAccount(accounts[0] || {});

  const user = account
    ? {
        nombre: account.name,
        email: account.username,
        rol: account.idTokenClaims?.roles?.[0] || 'ROLE_USER',
      }
    : null;

  const login = () => {
    instance.loginRedirect(loginRequest);
  };

  const logout = () => {
    instance.logoutRedirect({
      postLogoutRedirectUri: 'http://localhost:5173',
    });
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);