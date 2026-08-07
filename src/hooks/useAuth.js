import { useState, useEffect } from 'react';
import authService from '../services/authService';
import readerProgressService from '../services/readerProgressService';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState({ likes: [], comments: [], works: [] });
  const [isCurator, setIsCurator] = useState(false);

  useEffect(() => {
    authService.getSession().then((session) => {
      const u = session?.user ?? null;
      setUser(u);
      setIsCurator(authService.isCurator(u));
      readerProgressService.setUserScope(u?.id ?? null);
      if (u) {
        authService.fetchUserData(u.id).then(setUserData);
      }
    });

    const subscription = authService.onAuthStateChange((_event, session) => {
      const u = session?.user ?? null;
      setUser(u);
      setIsCurator(authService.isCurator(u));
      readerProgressService.setUserScope(u?.id ?? null);
      if (u) {
        authService.fetchUserData(u.id).then(setUserData);
      } else {
        setUserData({ likes: [], comments: [], works: [] });
      }
    });

    return () => subscription?.unsubscribe?.();
  }, []);

  return {
    user,
    userData,
    isCurator,
    login: authService.signInWithGoogle,
    logout: authService.signOut
  };
};

export default useAuth;
