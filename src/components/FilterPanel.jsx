import { X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card } from './ui/card';

const FilterPanel = ({ filters, setFilters, tasks }) => {
  const allTags = [...new Set(tasks.flatMap(task => task.tags))];

  const handleFilterChange = (key, value) => {
    setFilters({ ...filters, [key]: value });
  };

  const clearFilters = () => {
    setFilters({
      status: '',
      priority: '',
      tag: '',
      search: ''
    });
  };

  const activeFiltersCount = Object.values(filters).filter(v => v !== '').length;

  return (
    <Card className="p-4 mb-6 bg-white border border-gray-200" data-testid="filter-panel">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-gray-900">Фильтры</h3>
        {activeFiltersCount > 0 && (
          <Button
            onClick={clearFilters}
            variant="ghost"
            size="sm"
            className="text-gray-600 hover:text-gray-900"
            data-testid="clear-filters-button"
          >
            Очистить все ({activeFiltersCount})
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="search" className="text-gray-700">Поиск</Label>
          <Input
            id="search"
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            placeholder="Поиск задач..."
            className="border-gray-300"
            data-testid="search-input"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status-filter" className="text-gray-700">Статус</Label>
          <select
            id="status-filter"
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            data-testid="status-filter"
          >
            <option value="">Все статусы</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="priority-filter" className="text-gray-700">Приоритет</Label>
          <select
            id="priority-filter"
            value={filters.priority}
            onChange={(e) => handleFilterChange('priority', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            data-testid="priority-filter"
          >
            <option value="">Все приоритеты</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="tag-filter" className="text-gray-700">Тег</Label>
          <select
            id="tag-filter"
            value={filters.tag}
            onChange={(e) => handleFilterChange('tag', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-gray-400"
            data-testid="tag-filter"
          >
            <option value="">Все теги</option>
            {allTags.map((tag, index) => (
              <option key={index} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Card>
  );
};

export default FilterPanel;