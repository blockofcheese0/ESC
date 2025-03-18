import api from './api';

/**
 * Get todos for the current user
 * @param {Object} params - Filter parameters (status, due_date, etc.)
 * @returns {Promise<Array>} - Array of todo items
 */
const getTodos = async (params = {}) => {
  const response = await api.get('todos/', { params });
  return response.data;
};

/**
 * Get todos for a specific client (for therapist use)
 * @param {string} clientId - The client ID
 * @param {Object} params - Filter parameters
 * @returns {Promise<Array>} - Array of todo items
 */
const getClientTodos = async (clientId, params = {}) => {
  const queryParams = { ...params, client_id: clientId };
  const response = await api.get('todos/', { params: queryParams });
  return response.data;
};

/**
 * Get todos for all clients of a therapist
 * @param {Object} params - Filter parameters
 * @returns {Promise<Array>} - Array of todo items
 */
const getTherapistTodos = async (params = {}) => {
  const response = await api.get('therapist/todos/', { params });
  return response.data;
};

/**
 * Create a new todo
 * @param {Object} todoData - The todo data
 * @returns {Promise<Object>} - The created todo
 */
const createTodo = async (todoData) => {
  const response = await api.post('todos/', todoData);
  return response.data;
};

/**
 * Create a todo for a specific client (for therapist use)
 * @param {Object} todoData - The todo data including client_id
 * @returns {Promise<Object>} - The created todo
 */
const createClientTodo = async (todoData) => {
  const response = await api.post('therapist/todos/', todoData);
  return response.data;
};

/**
 * Update an existing todo
 * @param {string} todoId - The todo ID
 * @param {Object} todoData - The updated todo data
 * @returns {Promise<Object>} - The updated todo
 */
const updateTodo = async (todoId, todoData) => {
  const response = await api.put(`todos/${todoId}/`, todoData);
  return response.data;
};

/**
 * Delete a todo
 * @param {string} todoId - The todo ID
 * @returns {Promise<void>}
 */
const deleteTodo = async (todoId) => {
  await api.delete(`todos/${todoId}/`);
};

/**
 * Mark a todo as completed
 * @param {string} todoId - The todo ID
 * @returns {Promise<Object>} - The updated todo
 */
const completeTodo = async (todoId) => {
  const response = await api.post(`todos/${todoId}/complete/`);
  return response.data;
};

/**
 * Get todo statistics for a client
 * @returns {Promise<Object>} - The todo statistics
 */
const getClientTodoStats = async () => {
  const response = await api.get('todos/stats/');
  return response.data;
};

/**
 * Get todo statistics for all clients of a therapist
 * @returns {Promise<Object>} - The todo statistics
 */
const getTherapistTodoStats = async () => {
  const response = await api.get('therapist/todos/stats/');
  return response.data;
};

export const todoService = {
  getTodos,
  getClientTodos,
  getTherapistTodos,
  createTodo,
  createClientTodo,
  updateTodo,
  deleteTodo,
  completeTodo,
  getClientTodoStats,
  getTherapistTodoStats,
};