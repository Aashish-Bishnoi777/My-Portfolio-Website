import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Profile } from '../../types';

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // We use a fixed doc ID for profile or listen to global settings
    const unsub = onSnapshot(doc(db, 'settings', 'profile'), (snapshot) => {
      if (snapshot.exists()) {
        setProfile(snapshot.data() as Profile);
      }
      setLoading(false);
    }, (error) => {
      console.error("Profile error:", error);
      setLoading(false);
    });

    return unsub;
  }, []);

  return { profile, loading };
}

export function useProjects() {
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProjects(docs);
      setLoading(false);
    }, (error) => {
      console.error("Projects error:", error);
      setLoading(false);
    });

    return unsub;
  }, []);

  return { projects, loading };
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'achievements'), orderBy('date', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAchievements(docs);
      setLoading(false);
    }, (error) => {
      console.error("Achievements error:", error);
      setLoading(false);
    });

    return unsub;
  }, []);

  return { achievements, loading };
}

export function useMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'messages'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setMessages(docs);
      setLoading(false);
    }, (error) => {
      console.warn("Messages list error (likely normal if not admin):", error.message);
      setLoading(false);
    });

    return unsub;
  }, []);

  return { messages, loading };
}

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsub = auth.onAuthStateChanged((user) => {
      if (user) {
        const adminDoc = doc(db, 'admins', user.uid);
        onSnapshot(adminDoc, (snapshot) => {
          setIsAdmin(snapshot.exists());
          setLoading(false);
        });
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });

    return unsub;
  }, []);

  return { isAdmin, loading };
}
