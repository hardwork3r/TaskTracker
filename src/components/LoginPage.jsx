import { useState } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';
import { CheckCircle2 } from 'lucide-react';

const LoginPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    role: 'user'
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const endpoint = isLogin ? '/auth/login' : '/auth/register';
      const payload = isLogin
        ? { email: formData.email, password: formData.password }
        : formData;
      const response = await axios.post(`${API}${endpoint}`, payload);

      const token = response.data.accessToken || response.data.access_token;
      if (!token) {
        toast.error('Ошибка аутентификации.');
        return;
      }

      onLogin(response.data.user, token);
      toast.success(isLogin ? 'Успешная авторизация.' : 'Аккаунт успешно создан.');
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.response?.data?.title || 'An error occurred';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ background: 'linear-gradient(135deg, #e3f2fd 0%, #fce4ec 100%)' }}
    >
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-2xl shadow-lg mb-4">
            <CheckCircle2 className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {'TaskTracker'}
          </h1>
          <p className="text-gray-600">
            {isLogin
              ? 'Введите учетные данные для доступа к вашим задачам'
              : 'Заполните свои данные, чтобы начать'}
          </p>
        </div>

        <Card className="border-0 shadow-xl">
          <div className="flex bg-gray-100 rounded-md overflow-hidden mb-4">
            <button
              className={`flex-1 py-2 font-medium ${
                isLogin ? 'bg-white text-gray-900 shadow-inner' : 'text-gray-500'
              }`}
              onClick={() => setIsLogin(true)}
            >
              Вход
            </button>
            <button
              className={`flex-1 py-2 font-medium ${
                !isLogin ? 'bg-white text-gray-900 shadow-inner' : 'text-gray-500'
              }`}
              onClick={() => setIsLogin(false)}
            >
              Регистрация
            </button>
          </div>

          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="name">Имя</Label>
                  <Input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="Ваше имя"
                    value={formData.name}
                    onChange={handleChange}
                    required={!isLogin}
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Пароль</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formData.password}
                  onChange={handleChange}
                  required
                />
              </div>

              {!isLogin && (
                <div className="space-y-2">
                  <Label htmlFor="role">Роль</Label>
                  <select
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                  >
                    <option value="user">Пользователь</option>
                    <option value="admin">Администратор</option>
                  </select>
                </div>
              )}

              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-gray-900 hover:bg-gray-800 text-white"
              >
                {loading ? (isLogin ? 'Вход в систему...' : 'Создание учетной записи...') : isLogin ? 'Вход' : 'Регистрация'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default LoginPage;
