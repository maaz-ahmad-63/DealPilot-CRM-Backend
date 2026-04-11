import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Check, Clock, Calendar, User, X, AlertTriangle, Bot, Filter } from 'lucide-react';
import { PageTransition } from '../utils/animations';
import { useNotification } from '../context/NotificationContext';
import { useCRM } from '../context/CRMContext';

const emptyTask = {
  title: '',
  status: 'pending',
  dueDate: '',
  assignee: '',
  priority: 'medium',
};

const PRIORITY_LEVELS = [
  { value: 'critical', label: 'Critical', color: 'bg-red-500' },
  { value: 'high', label: 'High', color: 'bg-orange-500' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
  { value: 'low', label: 'Low', color: 'bg-green-500' },
];

export function Tasks() {
  const { addNotification } = useNotification();
  const { enrichedTasks, addTask, updateTask, deleteTask } = useCRM();
  const [showModal, setShowModal] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [form, setForm] = useState(emptyTask);
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('priority'); // priority, dueDate, assignee

  const pendingTasks = enrichedTasks.filter((task) => task.status === 'pending');
  const completedTasks = enrichedTasks.filter((task) => task.status === 'completed');
  const overdueTasks = pendingTasks.filter((task) => task.isOverdue);

  // Apply filters and sorting
  const filteredPendingTasks = pendingTasks
    .filter((task) => priorityFilter === 'all' || task.priority === priorityFilter)
    .sort((a, b) => {
      if (sortBy === 'priority') {
        const priorityOrder = { critical: 0, high: 1, medium: 2, low: 3 };
        return (priorityOrder[a.priority] || 999) - (priorityOrder[b.priority] || 999);
      } else if (sortBy === 'dueDate') {
        return new Date(a.dueDate) - new Date(b.dueDate);
      }
      return 0;
    });

  const openModal = (task = null) => {
    setEditingTask(task);
    setForm(task ? { ...task } : emptyTask);
    setShowModal(true);
  };

  const closeModal = () => {
    setEditingTask(null);
    setForm(emptyTask);
    setShowModal(false);
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (editingTask) {
      updateTask(editingTask.id, form);
      addNotification('Task updated successfully', 'success');
    } else {
      addTask(form);
      addNotification('Task added successfully', 'success');
    }
    closeModal();
  };

  const toggleTask = (task) => {
    updateTask(task.id, { status: task.status === 'completed' ? 'pending' : 'completed' });
    addNotification('Task updated successfully', 'success');
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'critical':
        return { bg: 'bg-red-100', text: 'text-red-800', badge: 'bg-red-500', dot: 'bg-red-500' };
      case 'high':
        return { bg: 'bg-orange-100', text: 'text-orange-800', badge: 'bg-orange-500', dot: 'bg-orange-500' };
      case 'medium':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800', badge: 'bg-yellow-500', dot: 'bg-yellow-500' };
      case 'low':
        return { bg: 'bg-green-100', text: 'text-green-800', badge: 'bg-green-500', dot: 'bg-green-500' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800', badge: 'bg-gray-500', dot: 'bg-gray-500' };
    }
  };

  const renderTaskCard = (task, index, completed = false) => {
    const priorityStyles = getPriorityStyles(task.priority);
    return (
      <motion.div
        key={task.id}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: index * 0.05 }}
        whileHover={{ x: 4 }}
        className={`bg-white rounded-lg shadow-sm p-4 border-l-4 ${completed ? 'border-green-500 opacity-80' : task.isOverdue ? 'border-red-500' : priorityStyles.badge}`} style={{ borderLeftColor: completed ? '#10b981' : task.isOverdue ? '#ef4444' : 'currentColor' }}>
        <div className="flex items-start gap-4">
          <button
            onClick={() => toggleTask(task)}
            className={`flex-shrink-0 p-2 rounded-lg transition-all ${completed ? 'text-green-600 bg-green-50 hover:bg-green-100' : 'text-gray-400 hover:text-blue-600'}`}
          >
            {completed ? <Check size={20} /> : <Clock size={20} />}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <h3 className={`font-semibold text-gray-900 ${completed ? 'line-through' : ''}`}>
                  {task.title}
                </h3>
                <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                  <span className="flex items-center gap-1">
                    <Calendar size={14} />
                    {task.dueDate}
                  </span>
                  <span className="flex items-center gap-1">
                    <User size={14} />
                    {task.assignee}
                  </span>
                  {!completed && task.isOverdue && (
                    <span className="flex items-center gap-1 text-red-600 font-medium">
                      <AlertTriangle size={14} />
                      Overdue
                    </span>
                  )}
                  {!completed && task.autoCreated && (
                    <span className="flex items-center gap-1 text-blue-600">
                      <Bot size={14} />
                      AI task
                    </span>
                  )}
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${priorityStyles.bg} ${priorityStyles.text}`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </span>
            </div>
          </div>

          <div className="flex gap-2 flex-shrink-0">
            <button
              onClick={() => openModal(task)}
              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
            >
              <Edit2 size={16} />
            </button>
            <button
              onClick={() => {
                deleteTask(task.id);
                addNotification('Task deleted', 'success');
              }}
              className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    );
  };

  return (
    <PageTransition>
      <div className="p-8 max-w-7xl mx-auto">
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Tasks Management</h1>
          <p className="text-gray-600 mt-2">Track execution with priority-based workflow and smart reminders.</p>
        </motion.div>

        {/* Action Bar */}
        <div className="flex flex-wrap gap-4 mb-6 items-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => openModal()}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            <Plus size={18} />
            Add Task
          </motion.button>

          {/* Filters */}
          <div className="flex flex-wrap gap-2 items-center ml-auto">
            <Filter size={18} className="text-gray-600" />
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="all">All Priorities</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            >
              <option value="priority">Sort by Priority</option>
              <option value="dueDate">Sort by Due Date</option>
              <option value="assignee">Sort by Assignee</option>
            </select>
          </div>
        </div>

        {/* Priority Breakdown Badges */}
        <div className="flex flex-wrap gap-3 mb-6">
          {PRIORITY_LEVELS.map((level) => {
            const count = pendingTasks.filter((t) => t.priority === level.value).length;
            return (
              <motion.div
                key={level.value}
                whileHover={{ scale: 1.05 }}
                className="px-3 py-2 bg-gray-50 rounded-lg border border-gray-200 flex items-center gap-2 cursor-pointer hover:bg-gray-100"
                onClick={() => setPriorityFilter(level.value === priorityFilter ? 'all' : level.value)}
              >
                <div className={`w-3 h-3 rounded-full ${level.color}`} />
                <span className="text-sm font-medium text-gray-700">{level.label}</span>
                <span className="text-xs text-gray-500">({count})</span>
              </motion.div>
            );
          })}
        </div>

        {/* Smart Reminders */}
        {overdueTasks.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4"
          >
            <p className="font-semibold text-red-700 flex items-center gap-2">
              <AlertTriangle size={16} />
              Smart Reminder: {overdueTasks.length} overdue task(s)
            </p>
            <p className="text-sm text-red-600 mt-1">
              Reassign or complete these tasks to improve lead response SLA.
            </p>
          </motion.div>
        )}

        {/* Pending Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Pending Tasks ({filteredPendingTasks.length})
          </h2>
          {filteredPendingTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock size={32} className="mx-auto mb-2 opacity-50" />
              <p>No tasks to show</p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPendingTasks.map((task, index) => renderTaskCard(task, index, false))}
            </div>
          )}
        </motion.div>

        {/* Completed Tasks */}
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h2 className="text-lg font-bold text-gray-900 mb-4">
            Completed Tasks ({completedTasks.length})
          </h2>
          {completedTasks.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Check size={32} className="mx-auto mb-2 opacity-50" />
              <p>No completed tasks yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {completedTasks.map((task, index) => renderTaskCard(task, index, true))}
            </div>
          )}
        </motion.div>

        {/* Task Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-slate-950/45 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full max-w-xl bg-white rounded-2xl shadow-2xl"
            >
              <div className="flex items-center justify-between px-6 py-5 border-b border-gray-200">
                <h2 className="text-xl font-bold text-gray-900">
                  {editingTask ? 'Edit Task' : 'Add Task'}
                </h2>
                <button
                  onClick={closeModal}
                  className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg"
                >
                  <X size={18} />
                </button>
              </div>
              <form onSubmit={handleSubmit} className="p-6 grid gap-4">
                <input
                  value={form.title}
                  onChange={(e) => setForm((current) => ({ ...current, title: e.target.value }))}
                  placeholder="Task title"
                  className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                <div className="grid md:grid-cols-2 gap-4">
                  <input
                    type="date"
                    value={form.dueDate}
                    onChange={(e) => setForm((current) => ({ ...current, dueDate: e.target.value }))}
                    className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <input
                    value={form.assignee}
                    onChange={(e) => setForm((current) => ({ ...current, assignee: e.target.value }))}
                    placeholder="Assignee"
                    className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                </div>
                <select
                  value={form.priority}
                  onChange={(e) => setForm((current) => ({ ...current, priority: e.target.value }))}
                  className="px-4 py-3 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                  <option value="critical">Critical Priority</option>
                </select>
                <div className="flex justify-end gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
                  >
                    {editingTask ? 'Save Task' : 'Create Task'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </PageTransition>
  );
}
