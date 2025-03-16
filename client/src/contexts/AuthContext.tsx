import { createContext, useContext, useState, useCallback, ReactNode } from 'react';
import { apiRequest } from '@/lib/queryClient';
import { User, LoginCredentials } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  signup: (userData: any) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async () => false,
  signup: async () => false,
  logout: async () => {},
  checkAuth: async () => {},
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  const checkAuth = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await apiRequest('GET', '/api/user');
      const userData = await response.json();
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      setUser(null);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const login = async (credentials: LoginCredentials): Promise<boolean> => {
    try {
      const response = await apiRequest('POST', '/api/login', credentials);
      const data = await response.json();
      setUser(data.user);
      setIsAuthenticated(true);
      toast({
        title: 'Login successful',
        description: `Welcome back, ${data.user.username}!`,
      });
      return true;
    } catch (error: any) {
      let errorMessage = 'Login failed';
      if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const signup = async (userData: any): Promise<boolean> => {
    try {
      const response = await apiRequest('POST', '/api/register', userData);
      const data = await response.json();
      toast({
        title: 'Registration successful',
        description: 'You can now log in with your credentials',
      });
      return true;
    } catch (error: any) {
      let errorMessage = 'Registration failed';
      if (error.message) {
        errorMessage = error.message;
      }
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      });
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    try {
      await apiRequest('POST', '/api/logout');
      setUser(null);
      setIsAuthenticated(false);
      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      });
    } catch (error) {
      toast({
        title: 'Logout failed',
        description: 'There was an error logging out',
        variant: 'destructive',
      });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isLoading,
        login,
        signup,
        logout,
        checkAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
