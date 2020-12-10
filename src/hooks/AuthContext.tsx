import React, {
  createContext,
  useCallback,
  useState,
  useContext,
  useEffect,
} from 'react';
import AsyncStorage from '@react-native-community/async-storage';
import api from '../services/api';

interface SignInCredentials {
  email: string;
  password: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  avatar_url: string;
}

interface AuthContextData {
  user: User;
  signIn(credentials: SignInCredentials): Promise<void>;
  loading: boolean;
  signOut(): void;
}

interface AuthState {
  token: string;
  user: User;
}

const AuthContext = createContext<AuthContextData>({} as AuthContextData); // criar contexto quando as variaveis seram acessadas em diversos locais, ex: nome do usuario

export const AuthProvider: React.FC = ({ children }) => {
  const [data, setData] = useState<AuthState>({} as AuthState);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStoragedData(): Promise<void> {
      // quando o user sair e voltar pro site
      const [token, user] = await AsyncStorage.multiGet([
        '@GoBarber.token',
        '@GoBarber.user',
      ]);

      if (token[1] && user[1]) {
        api.defaults.headers.authorization = `Bearer ${token[1]}`; // automatizar o token nas rotas

        setData({ token: token[1], user: JSON.parse(user[1]) }); // [1] pois o primeiro elemento é a chave no multiget
      }

      setLoading(false); // fazendo o loading para n dar flash da tela de login se recarregar a pagina eo user tiver autenticado
    }
    loadStoragedData();
  }, []);

  const signIn = useCallback(async ({ email, password }) => {
    // metodo para login
    const response = await api.post('sessions', {
      email,
      password,
    });

    const { token, user } = response.data; // valores da api

    await AsyncStorage.setItem('@GoBarber.token', token);
    await AsyncStorage.setItem('@GoBarber.user', JSON.stringify(user)); // usar stringfy por ser um objeto
    setData({ token, user });

    api.defaults.headers.authorization = `Bearer ${token}`; // automatizar o token nas rotas

    await AsyncStorage.multiSet([
      ['@GoBarber.token', token],
      ['@GoBarber.user', JSON.stringify(user)],
    ]);
  }, []);

  const signOut = useCallback(async () => {
    // metodo para logout
    await AsyncStorage.multiRemove(['@GoBarber.token', '@GoBarber.user']); // podemos usar o multiRemove invés do removeItem

    setData({} as AuthState);
  }, []);

  return (
    <AuthContext.Provider value={{ user: data.user, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth(): AuthContextData {
  const context = useContext(AuthContext); // passando a var de contexto aqui

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider'); // disparar o erro se usar o Auth sem passar o auth provider em volta da tag
  }

  return context; // se achar retorna
}
