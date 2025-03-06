'use client';

import React, { useState } from 'react';

interface TodoItem {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed';
  priority: 'low' | 'medium' | 'high';
}

const initialTodos: TodoItem[] = [
  {
    id: '1',
    title: 'Map Interface Improvements',
    description: 'Add clustering for markers when zoomed out, improve marker visibility, and add custom marker icons',
    status: 'pending',
    priority: 'high'
  },
  {
    id: '2',
    title: 'Rating System Enhancements',
    description: 'Add photo upload capability, implement rating filters, and add sorting options for ratings',
    status: 'pending',
    priority: 'high'
  },
  {
    id: '3',
    title: 'User Experience',
    description: 'Add loading states, improve error handling, and implement better mobile responsiveness',
    status: 'pending',
    priority: 'medium'
  },
  {
    id: '4',
    title: 'Data Management',
    description: 'Implement data export/import, add backup functionality, and improve data validation',
    status: 'pending',
    priority: 'medium'
  },
  {
    id: '5',
    title: 'Social Features',
    description: 'Add sharing capabilities, implement user profiles, and add social interactions between users',
    status: 'pending',
    priority: 'low'
  }
];

export default function TodoList() {
  const [todos, setTodos] = useState<TodoItem[]>(initialTodos);
  const [filter, setFilter] = useState<'all' | 'pending' | 'in-progress' | 'completed'>('all');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'low' | 'medium' | 'high'>('all');

  const filteredTodos = todos.filter(todo => {
    const statusMatch = filter === 'all' || todo.status === filter;
    const priorityMatch = priorityFilter === 'all' || todo.priority === priorityFilter;
    return statusMatch && priorityMatch;
  });

  const getStatusColor = (status: TodoItem['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  const getPriorityColor = (priority: TodoItem['priority']) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <h2 className="text-2xl font-bold mb-6 text-gray-900">Feature Roadmap</h2>
      
      <div className="flex flex-col sm:flex-row gap-4 mb-6">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value as TodoItem['status'] | 'all')}
          className="w-full sm:w-auto px-3 py-2 rounded-md border border-gray-300 text-sm text-black"
        >
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="in-progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>

        <select
          value={priorityFilter}
          onChange={(e) => setPriorityFilter(e.target.value as TodoItem['priority'] | 'all')}
          className="w-full sm:w-auto px-3 py-2 rounded-md border border-gray-300 text-sm text-black"
        >
          <option value="all">All Priorities</option>
          <option value="high">High Priority</option>
          <option value="medium">Medium Priority</option>
          <option value="low">Low Priority</option>
        </select>
      </div>

      <div className="space-y-4">
        {filteredTodos.map((todo) => (
          <div
            key={todo.id}
            className="bg-white p-4 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">{todo.title}</h3>
                <p className="text-gray-600 mt-1">{todo.description}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(todo.status)}`}>
                  {todo.status.charAt(0).toUpperCase() + todo.status.slice(1)}
                </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(todo.priority)}`}>
                  {todo.priority.charAt(0).toUpperCase() + todo.priority.slice(1)}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
} 