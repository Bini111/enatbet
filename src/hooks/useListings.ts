// hooks/useListings.ts
import {
  collection,
  DocumentData,
  getDocs,
  limit,
  orderBy,
  query,
  QueryDocumentSnapshot,
  startAfter,
  where,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../lib/firebase';

export interface Listing {
  id: string;
  title: string;
  description: string;
  price: number;
  location: string;
  imageUrl: string;
  status: 'active' | 'inactive';
  createdAt: any;
}

const PAGE_SIZE = 10;

export default function useListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] = useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);

  // 🔄 Refresh (reset state + reload first page)
  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const q = query(
        collection(db, 'listings'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        limit(PAGE_SIZE),
      );
      const snap = await getDocs(q);
      const data: Listing[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Listing);
      setListings(data);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err: any) {
      console.error('Error refreshing listings:', err);
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, []);

  // 📥 Load more (pagination)
  const loadMore = useCallback(async () => {
    if (!lastDoc || !hasMore) return;
    setLoading(true);
    try {
      const q = query(
        collection(db, 'listings'),
        where('status', '==', 'active'),
        orderBy('createdAt', 'desc'),
        startAfter(lastDoc),
        limit(PAGE_SIZE),
      );
      const snap = await getDocs(q);
      const data: Listing[] = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }) as Listing);
      setListings(prev => [...prev, ...data]);
      setLastDoc(snap.docs[snap.docs.length - 1] || null);
      setHasMore(snap.docs.length === PAGE_SIZE);
    } catch (err: any) {
      console.error('Error loading more listings:', err);
      setError(err.message || 'Failed to load listings');
    } finally {
      setLoading(false);
    }
  }, [lastDoc, hasMore]);

  // 🔄 Initial load
  useEffect(() => {
    refresh();
  }, [refresh]);

  return {
    listings,
    loading,
    error,
    refresh,
    loadMore,
    hasMore,
  };
}
