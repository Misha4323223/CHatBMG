import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";

export default function Profile() {
  const [accessToken, setAccessToken] = useState("");
  const [, setLocation] = useLocation();
  const { user, updateAccessToken, logout, loading } = useAuth();

  const handleUpdateToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (accessToken.trim()) {
      await updateAccessToken(accessToken);
      setAccessToken("");
    }
  };

  const handleLogout = async () => {
    await logout();
    setLocation("/login");
  };

  if (!user) {
    setLocation("/login");
    return null;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Профиль пользователя</CardTitle>
            <CardDescription>
              Управление учетной записью и токеном доступа
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Имя пользователя</Label>
              <div className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800">
                {user.username}
              </div>
            </div>

            <div className="space-y-1">
              <Label>Токен доступа</Label>
              <div className="p-2 border rounded-md bg-gray-100 dark:bg-gray-800 break-all">
                {user.accessToken || "Не установлен"}
              </div>
            </div>

            <form onSubmit={handleUpdateToken} className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="access-token">Обновить токен доступа</Label>
                <Input
                  id="access-token"
                  placeholder="Введите новый токен доступа"
                  value={accessToken}
                  onChange={(e) => setAccessToken(e.target.value)}
                />
              </div>
              <Button type="submit" className="w-full bg-red-600 hover:bg-red-700" disabled={loading || !accessToken.trim()}>
                {loading ? "Обновление..." : "Обновить токен"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={() => setLocation("/")}>
              Назад к чату
            </Button>
            <Button variant="destructive" onClick={handleLogout} disabled={loading}>
              {loading ? "Выход..." : "Выйти"}
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}