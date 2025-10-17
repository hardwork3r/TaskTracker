import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from './ui/button';
import { LogOut, ArrowLeft, Edit2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from './ui/card';
import { useNavigate } from 'react-router-dom';
import { Input } from './ui/input';
import { Label } from './ui/label';

const AdminPanel = ({ user, onLogout }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editForm, setEditForm] = useState({ name: '', email: '', role: '' });
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      toast.error('Ошибка получения списка пользователей.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditUser = (userToEdit) => {
    setEditingUser(userToEdit.id);
    setEditForm({
      name: userToEdit.name,
      email: userToEdit.email,
      role: userToEdit.role
    });
  };

  const handleUpdateUser = async (userId) => {
    try {
      const response = await axios.put(`${API}/admin/users/${userId}`, editForm);
      setUsers(users.map(u => (u.id === userId ? response.data : u)));
      setEditingUser(null);
      toast.success('Профиль успешно обновлен.');
    } catch (error) {
      toast.error('Ошибка обновления профиля.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этого пользователя? Все его задачи также будут удалены.')) {
      return;
    }

    try {
      await axios.delete(`${API}/admin/users/${userId}`);
      setUsers(users.filter(u => u.id !== userId));
      toast.success('Пользователь успешно удален.');
    } catch (error) {
      toast.error(error.response?.data?.detail || 'Ошибка удаления пользователя.');
    }
  };

  const handleCancelEdit = () => {
    setEditingUser(null);
    setEditForm({ name: '', email: '', role: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="admin-panel">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">Admin Panel</h1>
              <p className="text-sm text-gray-600">Управление пользователями и разрешениями</p>
            </div>
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate('/dashboard')}
                variant="outline"
                className="border-gray-300"
                data-testid="back-to-dashboard-button"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Назад на Dashboard
              </Button>
              <Button
                onClick={onLogout}
                variant="outline"
                className="border-gray-300"
                data-testid="logout-button"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Выйти
              </Button>
            </div>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Card className="bg-white border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Пользователи</h2>
            <p className="text-sm text-gray-600 mt-1">Всего пользователей: {users.length}</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="text-gray-600">Загрузка пользователей...</div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full" data-testid="users-table">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Имя
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Роль
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Дата создания
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-700 uppercase tracking-wider">
                      Действия
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((userItem) => (
                    <tr key={userItem.id} data-testid={`user-row-${userItem.id}`}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === userItem.id ? (
                          <Input
                            value={editForm.name}
                            onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                            className="w-full border-gray-300"
                            data-testid="edit-name-input"
                          />
                        ) : (
                          <div className="text-sm font-medium text-gray-900" data-testid="user-name">
                            {userItem.name}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === userItem.id ? (
                          <Input
                            value={editForm.email}
                            onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            className="w-full border-gray-300"
                            data-testid="edit-email-input"
                          />
                        ) : (
                          <div className="text-sm text-gray-600" data-testid="user-email">
                            {userItem.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {editingUser === userItem.id ? (
                          <select
                            value={editForm.role}
                            onChange={(e) => setEditForm({ ...editForm, role: e.target.value })}
                            className="px-3 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                            data-testid="edit-role-select"
                          >
                            <option value="user">User</option>
                            <option value="admin">Admin</option>
                          </select>
                        ) : (
                          <span
                            className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              userItem.role === 'admin'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-gray-100 text-gray-800'
                            }`}
                            data-testid="user-role"
                          >
                            {userItem.role}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600" data-testid="user-created-at">
                        {new Date(userItem.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm">
                        {editingUser === userItem.id ? (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleUpdateUser(userItem.id)}
                              className="bg-gray-900 hover:bg-gray-800 text-white"
                              data-testid="save-user-button"
                            >
                              Сохранить
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={handleCancelEdit}
                              className="border-gray-300"
                              data-testid="cancel-edit-button"
                            >
                              Отмена
                            </Button>
                          </div>
                        ) : (
                          <div className="flex justify-end gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditUser(userItem)}
                              className="hover:bg-gray-100"
                              data-testid="edit-user-button"
                            >
                              <Edit2 className="w-4 h-4 text-gray-600" />
                            </Button>
                            {userItem.id !== user.id && (
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteUser(userItem.id)}
                                className="hover:bg-red-50"
                                data-testid="delete-user-button"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </main>
    </div>
  );
};

export default AdminPanel;