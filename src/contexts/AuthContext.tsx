
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User as SupabaseUser, Session } from '@supabase/supabase-js';
import { supabase } from '../integrations/supabase/client';
import { User, AuthState } from '../types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (userData: Omit<User, 'id' | 'createdAt'>) => Promise<boolean>;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
  });

  useEffect(() => {
    // Setup auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          // Get user profile from localStorage or create default
          const userData = localStorage.getItem(`hotelite_user_${session.user.id}`);
          let user: User;
          
          if (userData) {
            user = JSON.parse(userData);
          } else {
            // Create user from auth data
            user = {
              id: session.user.id,
              name: session.user.user_metadata?.name || session.user.email || '',
              email: session.user.email || '',
              phone: session.user.user_metadata?.phone || '',
              userType: session.user.user_metadata?.userType || 'user',
              profileImage: session.user.user_metadata?.profileImage || '',
              description: session.user.user_metadata?.description || '',
              pixKey: session.user.user_metadata?.pixKey || '',
              mercadoPagoEmail: session.user.user_metadata?.mercadoPagoEmail || '',
              contactNumber: session.user.user_metadata?.contactNumber || '',
              monthlyPrice: session.user.user_metadata?.monthlyPrice || 30,
              createdAt: new Date(session.user.created_at),
            };
            localStorage.setItem(`hotelite_user_${session.user.id}`, JSON.stringify(user));
          }

          setAuthState({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } else {
          setAuthState({
            user: null,
            isAuthenticated: false,
            isLoading: false,
          });
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('Erro no login:', error);
        return false;
      }

      return !!data.user;
    } catch (error) {
      console.error('Erro no login:', error);
      return false;
    }
  };

  const register = async (userData: Omit<User, 'id' | 'createdAt'>): Promise<boolean> => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password as string,
        options: {
          data: {
            name: userData.name,
            phone: userData.phone,
            userType: userData.userType,
            profileImage: userData.profileImage,
            description: userData.description,
            pixKey: userData.pixKey,
            mercadoPagoEmail: userData.mercadoPagoEmail,
            contactNumber: userData.contactNumber,
            monthlyPrice: userData.monthlyPrice,
          }
        }
      });

      if (error) {
        console.error('Erro no registro:', error);
        return false;
      }

      if (data.user) {
        // Store user data in localStorage with user ID
        const newUser: User = {
          ...userData,
          id: data.user.id,
          createdAt: new Date(),
        };
        localStorage.setItem(`hotelite_user_${data.user.id}`, JSON.stringify(newUser));
        
        // Also add to users list for backward compatibility
        const users = JSON.parse(localStorage.getItem('hotelite_users') || '[]');
        users.push(newUser);
        localStorage.setItem('hotelite_users', JSON.stringify(users));
      }

      return !!data.user;
    } catch (error) {
      console.error('Erro no registro:', error);
      return false;
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Erro no logout:', error);
    }
  };

  const updateUser = (userData: Partial<User>) => {
    if (authState.user) {
      const updatedUser = { ...authState.user, ...userData };
      setAuthState(prev => ({
        ...prev,
        user: updatedUser,
      }));
      localStorage.setItem(`hotelite_user_${authState.user.id}`, JSON.stringify(updatedUser));
      
      // Update in users list for backward compatibility
      const users = JSON.parse(localStorage.getItem('hotelite_users') || '[]');
      const userIndex = users.findIndex((u: User) => u.id === authState.user?.id);
      if (userIndex !== -1) {
        users[userIndex] = updatedUser;
        localStorage.setItem('hotelite_users', JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...authState,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
