
import { useState, useEffect } from 'react';
import { Purchase } from '../types';

export const usePurchases = () => {
  const [purchases, setPurchases] = useState<Purchase[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPurchases();
  }, []);

  const loadPurchases = () => {
    try {
      const storedPurchases = JSON.parse(localStorage.getItem('hotelite_purchases') || '[]');
      setPurchases(storedPurchases);
    } catch (error) {
      console.error('Erro ao carregar compras:', error);
    } finally {
      setLoading(false);
    }
  };

  const createPurchase = (purchase: Omit<Purchase, 'id' | 'createdAt'>) => {
    const newPurchase: Purchase = {
      ...purchase,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const updatedPurchases = [...purchases, newPurchase];
    setPurchases(updatedPurchases);
    localStorage.setItem('hotelite_purchases', JSON.stringify(updatedPurchases));
    
    return newPurchase;
  };

  const updatePurchase = (purchaseId: string, updates: Partial<Purchase>) => {
    const updatedPurchases = purchases.map(purchase =>
      purchase.id === purchaseId ? { ...purchase, ...updates } : purchase
    );
    setPurchases(updatedPurchases);
    localStorage.setItem('hotelite_purchases', JSON.stringify(updatedPurchases));
  };

  const getUserPurchases = (userId: string) => {
    return purchases.filter(purchase => purchase.userId === userId);
  };

  const getModelPurchases = (modelId: string) => {
    return purchases.filter(purchase => purchase.modelId === modelId);
  };

  const hasAccess = (userId: string, modelId: string) => {
    const userPurchases = purchases.filter(
      purchase => purchase.userId === userId && 
                 purchase.modelId === modelId && 
                 purchase.status === 'approved'
    );

    if (userPurchases.length === 0) return false;

    // Verificar se ainda está dentro do período de 30 dias
    const latestPurchase = userPurchases.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    )[0];

    if (latestPurchase.expiresAt) {
      return new Date() < new Date(latestPurchase.expiresAt);
    }

    // Se não tem data de expiração, considerar 30 dias a partir da criação
    const expirationDate = new Date(latestPurchase.createdAt);
    expirationDate.setDate(expirationDate.getDate() + 30);
    
    return new Date() < expirationDate;
  };

  const approvePurchase = (purchaseId: string) => {
    const purchase = purchases.find(p => p.id === purchaseId);
    if (purchase) {
      const expirationDate = new Date();
      expirationDate.setDate(expirationDate.getDate() + 30);
      
      updatePurchase(purchaseId, {
        status: 'approved',
        expiresAt: expirationDate
      });
    }
  };

  const rejectPurchase = (purchaseId: string) => {
    updatePurchase(purchaseId, { status: 'rejected' });
  };

  return {
    purchases,
    loading,
    createPurchase,
    updatePurchase,
    getUserPurchases,
    getModelPurchases,
    hasAccess,
    approvePurchase,
    rejectPurchase,
    refreshPurchases: loadPurchases,
  };
};
