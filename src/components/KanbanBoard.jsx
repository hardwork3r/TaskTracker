import { Card } from './ui/card';
import axios from 'axios';
import { API } from '../App';
import React, { useState } from 'react';
import { Edit2, Trash2, Calendar, Tag, AlertCircle, Users, Clock, Paperclip, Download, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { toast } from 'sonner';

const KanbanBoard = ({ tasks, onEditTask, onDeleteTask, onStatusChange, currentUser, onTaskUpdate }) => {
  const [selectedAttachments, setSelectedAttachments] = useState([]);
  const [isAttachmentModalOpen, setIsAttachmentModalOpen] = useState(false);
  const [currentTaskId, setCurrentTaskId] = useState(null);
  const [uploading, setUploading] = useState(false);

  const openAttachmentsModal = (task) => {
    setSelectedAttachments(task.attachments || []);
    setCurrentTaskId(task.id);
    setIsAttachmentModalOpen(true);
  };

  const closeAttachmentsModal = () => {
    setSelectedAttachments([]);
    setIsAttachmentModalOpen(false);
  };

  const handleDownloadFile = async (taskId, attachmentId, fileName) => {
    try {
      const response = await axios.get(
        `${API}/tasks/${taskId}/attachments/${attachmentId}`,
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
      toast.error('Failed to download file');
    }
  };

  const handleFileUpload = async (event, taskId) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.size > 100 * 1024 * 1024) {
      toast.error('File size exceeds 100MB limit');
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API}/tasks/${taskId}/attachments`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      toast.success('File uploaded successfully!');

      if (onTaskUpdate) {
        onTaskUpdate(taskId);
      }
      
      event.target.value = '';
    } catch (error) {
      console.error('Upload error:', error);
      toast.error(error.response?.data?.detail || 'Failed to upload file');
    } finally {
      setUploading(false);
    }
  };

  const canEditTask = (task) => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || task.userId === currentUser.id;
  };

  const canDeleteTask = (task) => {
    if (!currentUser) return false;
    return currentUser.role === 'admin' || task.userId === currentUser.id;
  };

  const canUploadFile = (task) => {
    if (!currentUser) return false;
    const isAssigned = task.assignedUsers?.some(user => 
      typeof user === 'string' ? user === currentUser.id : user.id === currentUser.id
    );
    return currentUser.role === 'admin' || task.userId === currentUser.id || isAssigned;
  };

  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-gray-300' },
    { id: 'in_progress', title: 'In Progress', color: 'border-blue-300' },
    { id: 'done', title: 'Done', color: 'border-green-300' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'text-red-600 bg-red-50';
      case 'medium':
        return 'text-yellow-600 bg-yellow-50';
      case 'low':
        return 'text-green-600 bg-green-50';
      default:
        return 'text-gray-600 bg-gray-50';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const isOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6" data-testid="kanban-board">
        {columns.map((column) => {
          const columnTasks = tasks.filter(task => task.status === column.id);

          return (
            <div key={column.id} className="flex flex-col bg-white rounded-lg shadow-sm" data-testid={`column-${column.id}`}>

              <div className={`border-t-4 ${column.color} bg-white rounded-t-lg px-4 py-3`}>
                <h3 className="font-semibold text-gray-900">{column.title}</h3>
                <p className="text-sm text-gray-600 mt-1">{columnTasks.length} tasks</p>
              </div>

              <div
                className="flex-1 bg-gray-100 rounded-b-lg p-4 space-y-3 overflow-y-auto"
                style={{
                  maxHeight: '470px',
                  minHeight: '470px',
                  scrollbarWidth: 'thin',
                  scrollbarColor: '#cbd5e1 transparent'
                }}
              >
                {columnTasks.length === 0 ? (
                  <div className="text-center text-gray-400 mt-8">No tasks</div>
                ) : (
                  columnTasks.map((task) => {
                    const attachments = task.attachments || task.Attachments || [];

                    return (
                      <Card
                        key={task.id}
                        className="p-4 bg-white border border-gray-200 hover:shadow-md transition-shadow"
                      >
                        <div className="flex justify-between items-start mb-2">
                          <h4 className="font-medium text-gray-900 flex-1 pr-2">{task.title}</h4>
                          <div className="flex gap-1">
                            {canUploadFile(task) && (
                              <label className="cursor-pointer">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 w-8 p-0 hover:bg-blue-50"
                                  disabled={uploading}
                                  type="button"
                                  asChild
                                >
                                  <div>
                                    <Upload className="w-4 h-4 text-blue-600" />
                                  </div>
                                </Button>
                                <input
                                  type="file"
                                  onChange={(e) => handleFileUpload(e, task.id)}
                                  disabled={uploading}
                                  className="hidden"
                                />
                              </label>
                            )}
                            
                            {canEditTask(task) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onEditTask(task)}
                                className="h-8 w-8 p-0 hover:bg-gray-100"
                              >
                                <Edit2 className="w-4 h-4 text-gray-600" />
                              </Button>
                            )}
                            
                            {canDeleteTask(task) && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onDeleteTask(task.id)}
                                className="h-8 w-8 p-0 hover:bg-red-50"
                              >
                                <Trash2 className="w-4 h-4 text-red-600" />
                              </Button>
                            )}
                          </div>
                        </div>

                        {task.description && <p className="text-sm text-gray-600 mb-3">{task.description}</p>}

                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-gray-400" />
                            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(task.priority)}`}>
                              {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                            </span>
                          </div>

                          {task.assignedUsers && task.assignedUsers.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Users className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div className="flex flex-wrap gap-1">
                                {task.assignedUsers.map((user, index) => (
                                  <span
                                    key={typeof user === 'string' ? user : user.id || index}
                                    className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded"
                                  >
                                    {typeof user === 'string' ? user : user.name || 'Unknown'}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {task.tags && task.tags.length > 0 && (
                            <div className="flex items-start gap-2">
                              <Tag className="w-4 h-4 text-gray-400 mt-0.5" />
                              <div className="flex flex-wrap gap-1">
                                {task.tags.map((tag, index) => (
                                  <span key={index} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-700 rounded">
                                    {tag}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {attachments.length > 0 && (
                            <div
                              className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-1 rounded"
                              onClick={() => openAttachmentsModal(task)}
                            >
                              <Paperclip className="w-4 h-4 text-blue-600" />
                              <span className="text-xs text-blue-600 underline">
                                {attachments.length} {attachments.length === 1 ? 'file' : 'files'}
                              </span>
                            </div>
                          )}

                          {task.dueDate && (
                            <div className="flex items-center gap-2">
                              <Calendar className="w-4 h-4 text-gray-400" />
                              <span className={`text-xs ${isOverdue(task.dueDate) ? 'text-red-600 font-medium' : 'text-gray-600'}`}>
                                Дедлайн {formatDate(task.dueDate)} {isOverdue(task.dueDate) && ' (Overdue)'}
                              </span>
                            </div>
                          )}

                          {task.createdAt && (
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-gray-400" />
                              <span className="text-xs text-gray-600">Создано {formatDate(task.createdAt)}</span>
                            </div>
                          )}

                          <div className="mt-3 pt-3 border-t border-gray-200 flex gap-2">
                            {column.id !== 'todo' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  onStatusChange(task.id, column.id === 'in_progress' ? 'todo' : 'in_progress')
                                }
                                className="text-xs flex-1 border-gray-300"
                                data-testid="move-left-button"
                              >
                                ←
                              </Button>
                            )}
                            {column.id !== 'done' && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() =>
                                  onStatusChange(task.id, column.id === 'todo' ? 'in_progress' : 'done')
                                }
                                className="text-xs flex-1 border-gray-300"
                                data-testid="move-right-button"
                              >
                                →
                              </Button>
                            )}
                          </div>
                        </div>
                      </Card>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>

      <Dialog open={isAttachmentModalOpen} onOpenChange={setIsAttachmentModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Вложения</DialogTitle>
          </DialogHeader>

          {selectedAttachments.length === 0 ? (
            <p className="text-gray-500 text-sm">Нет вложений</p>
          ) : (
            <div className="space-y-2">
              {selectedAttachments.map((file, idx) => (
                <div
                  key={idx}
                  className="flex justify-between items-center p-2 border rounded-lg bg-gray-50 hover:bg-gray-100"
                >
                  <div className="flex items-center gap-2 flex-1 min-w-0">
                    <Paperclip className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    <span className="text-sm text-gray-700 truncate" title={file.fileName || file.name}>
                      {file.fileName || file.name || `Attachment ${idx + 1}`}
                    </span>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-xs ml-2"
                    onClick={() => handleDownloadFile(currentTaskId, file.id, file.fileName || file.name)}
                  >
                    <Download className="w-4 h-4 mr-1" /> Скачать
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default KanbanBoard;