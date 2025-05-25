
import { useState, useEffect } from 'react';
import { Content, Model } from '../types';

export const useContent = () => {
  const [contents, setContents] = useState<Content[]>([]);
  const [models, setModels] = useState<Model[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      const storedContents = JSON.parse(localStorage.getItem('hotelite_contents') || '[]');
      const storedUsers = JSON.parse(localStorage.getItem('hotelite_users') || '[]');
      
      setContents(storedContents);
      
      // Filtrar apenas modelos
      const modelUsers = storedUsers
        .filter((user: any) => user.userType === 'model')
        .map((model: any) => ({
          ...model,
          monthlyPrice: model.monthlyPrice || 30,
          totalContent: storedContents.filter((c: Content) => c.modelId === model.id).length,
          totalEarnings: 0,
        }));
      
      setModels(modelUsers);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

  const addContent = (content: Omit<Content, 'id' | 'createdAt'>) => {
    const newContent: Content = {
      ...content,
      id: Date.now().toString(),
      createdAt: new Date(),
    };

    const updatedContents = [...contents, newContent];
    setContents(updatedContents);
    localStorage.setItem('hotelite_contents', JSON.stringify(updatedContents));
    
    // Atualizar contagem de conteúdos do modelo
    loadData();
  };

  const updateContent = (contentId: string, updates: Partial<Content>) => {
    const updatedContents = contents.map(content =>
      content.id === contentId ? { ...content, ...updates } : content
    );
    setContents(updatedContents);
    localStorage.setItem('hotelite_contents', JSON.stringify(updatedContents));
  };

  const deleteContent = (contentId: string) => {
    const updatedContents = contents.filter(content => content.id !== contentId);
    setContents(updatedContents);
    localStorage.setItem('hotelite_contents', JSON.stringify(updatedContents));
    loadData();
  };

  const getContentsByModel = (modelId: string) => {
    return contents.filter(content => content.modelId === modelId && content.isActive);
  };

  const getModelById = (modelId: string) => {
    return models.find(model => model.id === modelId);
  };

  return {
    contents,
    models,
    loading,
    addContent,
    updateContent,
    deleteContent,
    getContentsByModel,
    getModelById,
    refreshData: loadData,
  };
};
