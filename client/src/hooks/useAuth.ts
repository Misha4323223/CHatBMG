import { useState, useEffect } from "react";
import { getQueryFn } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface User {
  id: number;
  username: string;
  accessToken?: string | null;
}

interface LoginData {
  username: string;
  password: string;
}

interface RegisterData extends LoginData {
  passwordConfirm: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Создаем функцию для запросов к API
  const apiCall = async <T,>(url: string, options?: RequestInit): Promise<T> => {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw response;
    }

    return response.json();
  };

  // Проверяем текущую сессию при загрузке компонента
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setLoading(true);
        const userData = await apiCall<User>('/api/profile');
        setUser(userData);
      } catch (error) {
        // Если ошибка 401, значит пользователь не авторизован - это нормально
        if (error instanceof Response && error.status !== 401) {
          console.error('Ошибка при проверке авторизации:', error);
        }
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Функция для регистрации пользователя
  const register = async (data: RegisterData) => {
    if (data.password !== data.passwordConfirm) {
      toast({
        title: "Ошибка",
        description: "Пароли не совпадают",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const userData = await apiCall<User>('/api/register', {
        method: 'POST',
        body: JSON.stringify({
          username: data.username,
          password: data.password
        })
      });

      setUser(userData);
      toast({
        title: "Успешно",
        description: "Регистрация завершена",
      });
    } catch (error) {
      console.error('Ошибка при регистрации:', error);
      toast({
        title: "Ошибка",
        description: error instanceof Error 
          ? error.message 
          : "Не удалось зарегистрироваться. Попробуйте другое имя пользователя.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Функция для входа пользователя
  const login = async (data: LoginData) => {
    try {
      setLoading(true);
      const userData = await apiCall<User>('/api/login', {
        method: 'POST',
        body: JSON.stringify({
          username: data.username,
          password: data.password
        })
      });

      setUser(userData);
      toast({
        title: "Успешно",
        description: "Вы вошли в систему",
      });
    } catch (error) {
      console.error('Ошибка при входе:', error);
      toast({
        title: "Ошибка",
        description: "Неверное имя пользователя или пароль",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Функция для выхода пользователя
  const logout = async () => {
    try {
      setLoading(true);
      await apiCall('/api/logout', { method: 'POST' });
      setUser(null);
      toast({
        title: "Успешно",
        description: "Вы вышли из системы",
      });
    } catch (error) {
      console.error('Ошибка при выходе:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось выйти. Попробуйте еще раз.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Функция для обновления токена доступа
  const updateAccessToken = async (accessToken: string) => {
    try {
      setLoading(true);
      const userData = await apiCall<User>('/api/token', {
        method: 'POST',
        body: JSON.stringify({ accessToken })
      });

      setUser(userData);
      toast({
        title: "Успешно",
        description: "Токен доступа обновлен",
      });
    } catch (error) {
      console.error('Ошибка при обновлении токена:', error);
      toast({
        title: "Ошибка",
        description: "Не удалось обновить токен. Попробуйте еще раз.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    isAuthenticated: !!user,
    loading,
    register,
    login,
    logout,
    updateAccessToken
  };
}