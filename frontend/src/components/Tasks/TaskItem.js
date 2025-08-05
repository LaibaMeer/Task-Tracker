import React, { useState } from 'react';
import { taskService } from '../../services/api';

const TaskItem = ({ task, onTaskUpdated, onTaskDeleted }) => {
  const [loading, setLoading] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: task.title,
    description: task.description
  });

  // Calculate days difference
  const getDaysDifference = (dueDate) => {
    const today = new Date();
    const due = new Date(dueDate);
    today.setHours(0, 0, 0, 0);
    due.setHours(0, 0, 0, 0);
    
    const diffTime = due - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    return diffDays;
  };

  const daysDiff = getDaysDifference(task.dueDate);
  const isOverdue = daysDiff < 0 && task.status !== 'completed';
  const isHighlyOverdue = isOverdue && Math.abs(daysDiff) > 5;

  const getStatusText = () => {
    if (task.status === 'completed') return 'Completed';
    if (daysDiff === 0) return 'Due today';
    if (daysDiff > 0) return `Due in ${daysDiff} day${daysDiff === 1 ? '' : 's'}`;
    return `Overdue by ${Math.abs(daysDiff)} day${Math.abs(daysDiff) === 1 ? '' : 's'}`;
  };

  const handleStatusToggle = async () => {
    if (loading) return;
    
    const newStatus = task.status === 'pending' ? 'completed' : 'pending';
    setLoading(true);

    try {
      const response = await taskService.updateTask(task._id, { status: newStatus });
      onTaskUpdated(response.data.task);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    if (loading) return;
    setLoading(true);

    try {
      const response = await taskService.updateTask(task._id, editData);
      onTaskUpdated(response.data.task);
      setEditing(false);
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to update task');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (loading) return;
    if (!window.confirm('Are you sure you want to delete this task?')) return;
    
    setLoading(true);

    try {
      await taskService.deleteTask(task._id);
      onTaskDeleted(task._id);
    } catch (error) {
      alert('Failed to delete task');
    } finally {
      setLoading(false);
    }
  };

  const canMarkCompleted = task.status === 'pending' && daysDiff <= 0;

  return (
    <div className={`task-item ${task.status} ${isHighlyOverdue ? 'highly-overdue' : isOverdue ? 'overdue' : ''}`}>
      <div className="task-content">
        <div className="task-header">
          {editing ? (
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({...editData, title: e.target.value})}
              className="edit-input"
            />
          ) : (
            <h3 className="task-title">{task.title}</h3>
          )}
          
          <div className="task-status">
            <span className={`status-badge ${task.status}`}>
              {getStatusText()}
            </span>
          </div>
        </div>

        <div className="task-description">
          {editing ? (
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({...editData, description: e.target.value})}
              className="edit-textarea"
              placeholder="Task description..."
            />
          ) : (
            <p>{task.description || 'No description'}</p>
          )}
        </div>

        <div className="task-meta">
          <span className="due-date">
            Due: {new Date(task.dueDate).toLocaleDateString()}
          </span>
        </div>
      </div>

      <div className="task-actions">
        {editing ? (
          <>
            <button onClick={handleEdit} disabled={loading} className="btn-success">
              Save
            </button>
            <button onClick={() => setEditing(false)} className="btn-secondary">
              Cancel
            </button>
          </>
        ) : (
          <>
            {task.status === 'pending' && (
              <button
                onClick={handleStatusToggle}
                disabled={loading || !canMarkCompleted}
                className="btn-success"
                title={!canMarkCompleted ? "Cannot mark future tasks as completed" : "Mark as completed"}
              >
                {loading ? '...' : '✓ Complete'}
              </button>
            )}
            
            {task.status === 'completed' && (
              <button
                onClick={handleStatusToggle}
                disabled={loading}
                className="btn-warning"
              >
                {loading ? '...' : '↻ Reopen'}
              </button>
            )}
            
            <button onClick={() => setEditing(true)} className="btn-secondary">
              Edit
            </button>
            
            <button onClick={handleDelete} disabled={loading} className="btn-danger">
              {loading ? '...' : 'Delete'}
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default TaskItem; 