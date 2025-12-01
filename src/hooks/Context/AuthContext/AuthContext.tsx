// AuthContext.tsx
import { createContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { api_endpoint } from '../../../config/api';


export const AuthContext = createContext<any>(null);

export function AuthProvider({ children }: { children: React.ReactNode   }) {
  const [user, setUser] = useState(null);
  const [pets, setPets] = useState<any[] | null>(null);
  const [selectedPet, setSelectedPet] = useState<any | null>(null);
  const [selectedConversation, setSelectedConversation] = useState<any | null>(null);
  const [loadingPets, setLoadingPets] = useState(false);
  const [petsError, setPetsError] = useState<string | null>(null);
  
  const history = useHistory();

  useEffect(() => {
    const storedUser = localStorage.getItem('data_user');
    if (storedUser) setUser(JSON.parse(storedUser));
    // restore selected conversation from session if available
    try {
      const storedConv = sessionStorage.getItem('selected_conversation');
      if (storedConv) {
        setSelectedConversation(JSON.parse(storedConv));
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  const logout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('data_user');
    sessionStorage.removeItem('selected_conversation');
    setUser(null);
    history.push('/login');
  };

  // persist selectedConversation to sessionStorage whenever it changes
  useEffect(() => {
    try {
      if (selectedConversation) sessionStorage.setItem('selected_conversation', JSON.stringify(selectedConversation));
      else sessionStorage.removeItem('selected_conversation');
    } catch (e) {
      // ignore
    }
  }, [selectedConversation]);

  const fetchPets = async () => {
    setLoadingPets(true);
    setPetsError(null);
    try {
      const token = localStorage.getItem('accessToken');
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${api_endpoint}/pets`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const petsArr = Array.isArray(json.pets) ? json.pets : [];
      setPets(petsArr);
      return json;
    } catch (err: any) {
      setPetsError(err?.message || String(err));
      setPets([]);
      return null;
    } finally {
      setLoadingPets(false);
    }
  };

  const updateUser = async (payload: any, refreshPets = true) => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const res = await fetch(`${api_endpoint}/auth/users/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const txt = await res.text().catch(() => '');
        throw new Error(txt || `HTTP ${res.status}`);
      }
      // Try to parse response; backend may return updated user or a message
      const data = await res.json().catch(() => null);
      // Merge updated fields into current user object
      const stored = localStorage.getItem('data_user') || null;
      const current = stored ? JSON.parse(stored) : user || {};
      const updatedUser = data && data.user ? { ...current, ...data.user } : { ...current, ...(data || payload) };
      localStorage.setItem('data_user', JSON.stringify(updatedUser));
      setUser(updatedUser);
      if (refreshPets) await fetchPets?.();
      return data;
    } catch (err) {
      throw err;
    }
  };

  const fetchConversationsByPet = async (petId: number) => {
    try {
      const token = localStorage.getItem('accessToken') || '';
      const headers: Record<string, string> = {};
      if (token) headers['Authorization'] = `Bearer ${token}`;
      const res = await fetch(`${api_endpoint}/direct-messages/conversation/personal/${encodeURIComponent(String(petId))}`, { headers });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json().catch(() => null);

      return json;
    } catch (err: any) {
      console.warn('fetchConversationsByPet error', err);
      return null;
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser, logout, pets, setPets, selectedPet, 
    setSelectedPet, selectedConversation, setSelectedConversation, fetchPets, fetchConversationsByPet, loadingPets, petsError, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
