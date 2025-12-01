import { useContext } from 'react';
import { Redirect, Route } from 'react-router-dom';
import { AuthContext } from '../hooks/Context/AuthContext/AuthContext';

function isTokenValid(token?: string | null) {
  if (!token) return false;
  try {
    // Try to decode JWT and check exp
    const parts = token.split('.');
    if (parts.length !== 3) return true; // not a JWT, assume valid if present
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    if (payload && payload.exp) {
      const now = Math.floor(Date.now() / 1000);
      return payload.exp > now;
    }
    return true;
  } catch (e) {
    return false;
  }
}

function PrivateRoute({ children, ...rest }: { children: React.ReactNode; [key: string]: any }) {
  const { user } = useContext(AuthContext);
  const token = localStorage.getItem('accessToken');
  const valid = isTokenValid(token);
  const authenticated = Boolean(user) && valid;
  return (
    <Route {...rest}>
      {authenticated ? children : <Redirect to="/login" />}
    </Route>
  );
}

export default PrivateRoute;