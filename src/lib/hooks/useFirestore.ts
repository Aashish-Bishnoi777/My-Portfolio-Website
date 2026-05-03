import { useState, useEffect } from 'react';
import { collection, onSnapshot, query, orderBy, doc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { Project, Achievement, Profile } from '../../types';
import { handleFirestoreError, OperationType } from '../errorHandlers';

export function useProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = 'projects';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setProjects(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Project)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { projects, loading };
}

export function useAchievements() {
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = 'achievements';
    const q = query(collection(db, path), orderBy('date', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setAchievements(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Achievement)));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { achievements, loading };
}

export function useProfile() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = 'profile';
    const unsubscribe = onSnapshot(collection(db, path), (snapshot) => {
      if (!snapshot.empty) {
        setProfile({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Profile);
      }
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { profile, loading };
}

export function useIsAdmin() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubscribeDoc: () => void = () => {};
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        const path = `admins/${user.uid}`;
        unsubscribeDoc = onSnapshot(doc(db, 'admins', user.uid), (snap) => {
          setIsAdmin(snap.exists());
          setLoading(false);
        }, (error) => {
          handleFirestoreError(error, OperationType.GET, path);
          setIsAdmin(false);
          setLoading(false);
        });
      } else {
        setIsAdmin(false);
        setLoading(false);
      }
    });
    return () => {
      unsubscribeAuth();
      unsubscribeDoc();
    };
  }, []);

  return { isAdmin, loading };
}

export function useMessages() {
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = 'messages';
    const q = query(collection(db, path), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, path);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  return { messages, loading };
}
