import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { X, UserPlus, Upload, FileText, Download, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

const TaskModal = ({ task, onClose, onSave, currentUser }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    status: 'todo',
    priority: 'medium',
    dueDate: '',
    tags: [],
    assignedUsers: []
  });
  const [tagInput, setTagInput] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (task) {
      setFormData({
        title: task.title || '',
        description: task.description || '',
        status: task.status || 'todo',
        priority: task.priority || 'medium',
        dueDate: task.dueDate || '',
        tags: task.tags || [],
        assignedUsers: task.assignedUsers || []
      });
      setAttachments(task.attachments || task.Attachments || []);
    }
    
    if (currentUser?.role === 'admin') {
      fetchUsers();
    }
  }, [task, currentUser]);

  const fetchUsers = async () => {
    try {
      const response = await axios.get(`${API}/admin/users`);
      setUsers(response.data);
    } catch (error) {
      console.error('Не удалось получить пользователей:', error);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleAddTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData({ ...formData, tags: [...formData.tags, tagInput.trim()] });
      setTagInput('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    setFormData({
      ...formData,
      tags: formData.tags.filter((tag) => tag !== tagToRemove)
    });
  };

  const handleToggleUser = (userId) => {
    const isAssigned = formData.assignedUsers.some(user => 
      typeof user === 'string' ? user === userId : user.id === userId
    );
    
    if (isAssigned) {
      setFormData({
        ...formData,
        assignedUsers: formData.assignedUsers.filter(user => 
          typeof user === 'string' ? user !== userId : user.id !== userId
        )
      });
    } else {
      setFormData({
        ...formData,
        assignedUsers: [...formData.assignedUsers, userId]
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        title: formData.title,
        description: formData.description,
        status: formData.status,
        priority: formData.priority,
        dueDate: formData.dueDate || null,
        tags: formData.tags,
        assignedUsers: formData.assignedUsers.map(user => 
          typeof user === 'string' ? user : user.id
        )
      };
      if (task) {
        await onSave(task.id, dataToSend);
      } else {
        await onSave(dataToSend);
      }
    } catch (error) {
      console.error('Ошибка отправки:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error('Размер файла превышает лимит в 100 МБ.');
      return;
    }

    if (!task) {
      toast.error('Пожалуйста, сначала сохраните задачу перед загрузкой файлов.');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/tasks/${task.id}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setAttachments([...attachments, response.data]);
      toast.success('Файл успешно загружен.');
      event.target.value = '';
    } catch (error) {
      console.error('Ошибка загрузки:', error);
      toast.error(error.response?.data?.detail || 'Не удалось загрузить файл.');
    } finally {
      setUploading(false);
    }
  };

  const handleDownloadFile = async (attachmentId, fileName) => {
    try {
      const response = await axios.get(
        `${API}/tasks/${task.id}/attachments/${attachmentId}`,
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      toast.error('Не удалось загрузить файл.');
    }
  };

  const handleDeleteFile = async (attachmentId) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот файл?')) return;

    try {
      await axios.delete(`${API}/tasks/${task.id}/attachments/${attachmentId}`);
      setAttachments(attachments.filter(a => a.id !== attachmentId));
      toast.success('Файл успешно удален.');
    } catch (error) {
      toast.error('Не удалось удалить файл.');
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] flex flex-col">

        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-semibold text-gray-900">
            {task ? 'Редактирование' : 'Создание новой задачи'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          <form onSubmit={handleSubmit} id="task-form" className="space-y-4">
            <div>
              <Label htmlFor="title">Название *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="description">Описание</Label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
              />
            </div>

            {/* Status & Priority */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">Статус</Label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="todo">To Do</option>
                  <option value="in_progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div>
                <Label htmlFor="priority">Приоритет</Label>
                <select
                  id="priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  className="w-full mt-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div>
              <Label htmlFor="dueDate">Дедлайн</Label>
              <Input
                id="dueDate"
                name="dueDate"
                type="date"
                value={formData.dueDate}
                onChange={handleChange}
                className="mt-1"
              />
            </div>

            <div>
              <Label>Теги</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                  placeholder="Добавить тег..."
                />
                <Button type="button" onClick={handleAddTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map((tag) => (
                  <span
                    key={tag}
                    className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm flex items-center gap-1"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="text-gray-500 hover:text-gray-700"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {currentUser?.role === 'admin' && (
              <div>
                <Label className="flex items-center gap-2">
                  <UserPlus className="w-4 h-4" />
                  Assigned Users
                </Label>
                <div className="mt-2 border border-gray-300 rounded-md p-3 max-h-48 overflow-y-auto">
                  {users.length === 0 ? (
                    <p className="text-sm text-gray-500">Загрузка пользователей...</p>
                  ) : (
                    <div className="space-y-2">
                      {users.map((user) => (
                        <label
                          key={user.id}
                          className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={formData.assignedUsers.some(u =>
                              typeof u === 'string' ? u === user.id : u.id === user.id
                            )}
                            onChange={() => handleToggleUser(user.id)}
                            className="w-4 h-4 text-gray-900 rounded focus:ring-gray-400"
                          />
                          <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">{user.name}</div>
                            <div className="text-xs text-gray-500">{user.email}</div>
                          </div>
                        </label>
                      ))}
                    </div>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  {formData.assignedUsers.length} назначен(ы) пользователю(ям)
                </div>
              </div>
            )}

            {currentUser?.role !== 'admin' && formData.assignedUsers.length > 0 && (
              <div>
                <Label>Assigned To</Label>
                <div className="mt-2 text-sm text-gray-600">
                  Вам поручено эта задача
                </div>
              </div>
            )}

            <div>
              <Label className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Вложения
              </Label>

              {task ? (
                <div className="mt-2">
                  <label className="cursor-pointer">
                    <div className="flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-md hover:border-gray-400 transition-colors">
                      <Upload className="w-4 h-4 text-gray-600" />
                      <span className="text-sm text-gray-600">
                        {uploading ? 'Загрузка...' : 'Нажмите, чтобы загрузить файл (до 100 МБ).'}
                      </span>
                    </div>
                    <input
                      type="file"
                      onChange={handleFileUpload}
                      disabled={uploading}
                      className="hidden"
                    />
                  </label>
                </div>
              ) : (
                <p className="mt-2 text-sm text-gray-500">
                  Сначала сохраните задачу, чтобы загрузить вложения.
                </p>
              )}

              {attachments.length > 0 && (
                <div className="mt-3 space-y-2">
                  {attachments.map((attachment) => (
                    <div
                      key={attachment.id}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-md border border-gray-200"
                    >
                      <div className="flex items-center gap-3 flex-1 min-w-0">
                        <FileText className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {attachment.fileName}
                          </p>
                          <p className="text-xs text-gray-500">
                            {formatFileSize(attachment.fileSize)}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-1 ml-2">
                        <button
                          type="button"
                          onClick={() => handleDownloadFile(attachment.id, attachment.fileName)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                          title="Download"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteFile(attachment.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded"
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </form>
        </div>

        <div className="flex justify-end gap-3 p-4 border-t border-gray-200 flex-shrink-0 bg-white">
          <Button type="button" onClick={onClose} variant="outline">
            Отмена
          </Button>
          <Button
            type="submit"
            form="task-form"
            disabled={loading}
            className="bg-gray-900 hover:bg-gray-800 text-white"
          >
            {loading ? 'Сохранение...' : task ? 'Обновить' : 'Создать'}
          </Button>
        </div>

      </div>
    </div>
  );
};

export default TaskModal;