import { useState, useEffect } from 'react';
import axios from 'axios';
import { API } from '../App';
import { Button } from './ui/button';
import { LogOut, Plus, Filter, Users } from 'lucide-react';
import { toast } from 'sonner';
import TaskModal from './TaskModal';
import KanbanBoard from './KanbanBoard';
import FilterPanel from './FilterPanel';
import { useNavigate } from 'react-router-dom';

const Dashboard = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [filteredTasks, setFilteredTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showTaskModal, setShowTaskModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    priority: '',
    tag: '',
    search: ''
  });
  const navigate = useNavigate();

  useEffect(() => {
    fetchTasks();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [tasks, filters]);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${API}/tasks`);
      setTasks(response.data);
    } catch (error) {
      toast.error('Failed to fetch tasks');
      if (error.response?.status === 401) {
        toast.error('Session expired. Please login again.');
        setTimeout(() => onLogout(), 2000);
      }
    } finally {
      setLoading(false);
    }
  };

  const applyFilters = () => {
    let filtered = [...tasks];

    if (filters.status) {
      filtered = filtered.filter(task => task.status === filters.status);
    }
    if (filters.priority) {
      filtered = filtered.filter(task => task.priority === filters.priority);
    }
    if (filters.tag) {
      filtered = filtered.filter(task => task.tags.includes(filters.tag));
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        task =>
          task.title.toLowerCase().includes(searchLower) ||
          task.description.toLowerCase().includes(searchLower)
      );
    }

    setFilteredTasks(filtered);
  };

  const handleCreateTask = async (taskData) => {
    try {
      const response = await axios.post(`${API}/tasks`, taskData);
      setTasks([...tasks, response.data]);
      toast.success('Task created successfully!');
      setShowTaskModal(false);
    } catch (error) {
      toast.error('Failed to create task');
    }
  };

  const handleUpdateTask = async (taskId, taskData) => {
    try {
      const response = await axios.put(`${API}/tasks/${taskId}`, taskData);
      setTasks(tasks.map(t => (t.id === taskId ? response.data : t)));
      toast.success('Task updated successfully!');
      setShowTaskModal(false);
      setEditingTask(null);
    } catch (error) {
      toast.error('Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId) => {
    try {
      await axios.delete(`${API}/tasks/${taskId}`);
      setTasks(tasks.filter(t => t.id !== taskId));
      toast.success('Task deleted successfully!');
    } catch (error) {
      toast.error('Failed to delete task');
    }
  };

  const handleStatusChange = async (taskId, newStatus) => {
    try {
      const response = await axios.put(`${API}/tasks/${taskId}`, { status: newStatus });
      setTasks(tasks.map(t => (t.id === taskId ? response.data : t)));
    } catch (error) {
      toast.error('Failed to update task status');
    }
  };

  const handleEditTask = (task) => {
    setEditingTask(task);
    setShowTaskModal(true);
  };

  const handleCloseModal = () => {
    setShowTaskModal(false);
    setEditingTask(null);
  };

  return (
    <div className="min-h-screen bg-gray-50" data-testid="dashboard">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div>
              <h1 className="text-2xl font-semibold text-gray-900">TaskTracker</h1>
              <p className="text-sm text-gray-600">Добро пожаловать, {user.name}!</p>
            </div>
            <div className="flex items-center gap-3">
              {user.role === 'admin' && (
                <Button
                  onClick={() => navigate('/admin')}
                  variant="outline"
                  className="border-gray-300"
                  data-testid="admin-panel-button"
                >
                  <Users className="w-4 h-4 mr-2" />
                  Admin Panel
                </Button>
              )}
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
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <Button
              onClick={() => setShowTaskModal(true)}
              className="bg-gray-900 hover:bg-gray-800 text-white"
              data-testid="create-task-button"
            >
              <Plus className="w-4 h-4 mr-2" />
              Новая задача
            </Button>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-gray-300"
              data-testid="toggle-filters-button"
            >
              <Filter className="w-4 h-4 mr-2" />
              Фильтры
            </Button>
          </div>
          <div className="text-sm text-gray-600">
            {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
          </div>
        </div>
        {showFilters && (
          <FilterPanel
            filters={filters}
            setFilters={setFilters}
            tasks={tasks}
          />
        )}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-gray-600">Загрузка задач...</div>
          </div>
        ) : (
          <KanbanBoard
            tasks={filteredTasks}
            onStatusChange={handleStatusChange}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            currentUser={user}
            onTaskUpdate={fetchTasks}
          />
        )}
      </main>
      {showTaskModal && (
        <TaskModal
          task={editingTask}
          onClose={handleCloseModal}
          onSave={editingTask ? handleUpdateTask : handleCreateTask}
          currentUser={user}
        />
      )}
    </div>
  );
};

export default Dashboard;