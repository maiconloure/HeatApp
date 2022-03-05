import React, { createContext, useContext, useEffect, useState } from 'react';
import * as AuthSessions from 'expo-auth-session';
import { api } from '../components/services/api';
import AsyncStorage  from '@react-native-async-storage/async-storage';
import { CLIENT_ID, SCOPE, USER_STORAGE, TOKEN_STORAGE } from '@env';

type User = {
  id: string;
  avatar_url: string;
  name: string;
  login: string;
}

type AuthContextData = {
  user: User | null;
  isSignIn: boolean;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
}

type AuthProviderProps = {
  children: React.ReactNode;
}

type AuthResponse = {
  token: string;
  user: User;
}

type AuthorizationResponse = {
  params: {
    code?: string;
    error?: string;
  },
  type?: string;
}

export const AuthContext = createContext({} as AuthContextData)

function AuthProvider({ children }: AuthProviderProps) {
  const [isSignIn, setIsSignIn] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  const authUrl = `http://github.com/login/oauth/authorize?client_id=${CLIENT_ID}&scope=${SCOPE}`

  async function signIn() {
    try {
      setIsSignIn(true);
      const authSessionResponse = await AuthSessions.startAsync({ authUrl }) as AuthorizationResponse;
      
      if (authSessionResponse.type === 'success' && authSessionResponse.params.error !== 'access_denied') {
        const authResponse = await api.post('/authenticate', { code: authSessionResponse.params.code })
        const { user, token } = authResponse.data as AuthResponse

        api.defaults.headers.common['Authorization'] = `Bearer ${token}`
        await AsyncStorage.setItem(USER_STORAGE, JSON.stringify(user))
        await AsyncStorage.setItem(TOKEN_STORAGE, token)

        setUser(user);
      }
    } catch (error) {
        console.log(error)
    } finally {
      setIsSignIn(false)
    }
  }

  async function signOut() {
    setUser(null);
    await await AsyncStorage.removeItem(USER_STORAGE);
    await await AsyncStorage.removeItem(TOKEN_STORAGE);
  }

  useEffect(() => {
    async function loadUserStorageData() {
      const userStorage = await AsyncStorage.getItem(USER_STORAGE);
      const tokenStorage = await AsyncStorage.getItem(TOKEN_STORAGE);

      if (userStorage && tokenStorage) {
        api.defaults.headers.common['Authorization'] = `Bearer ${tokenStorage}`
        setUser(JSON.parse(userStorage))
      }

      setIsSignIn(false)
    }

    loadUserStorageData();
  },[])

  return (
    <AuthContext.Provider value={{ signIn, signOut, user, isSignIn}}>
      {children}
    </AuthContext.Provider>
  )
}

function useAuth() {
  const context = useContext(AuthContext);
  return context;
}

export { AuthProvider, useAuth }