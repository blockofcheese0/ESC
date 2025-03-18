import api from './api';

const createGoal = async (goalData) => {
  const response = await api.post('goals/', goalData);
  return response.data;
};

const getGoals = async (filters = {}) => {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) params.append(key, value);
  });
  
  const response = await api.get(`goals/?${params.toString()}`);
  return response.data;
};

const getGoalsByClient = async (clientId) => {
  const response = await api.get(`goals/?client=${clientId}`);
  return response.data;
};

const updateGoal = async (goalId, goalData) => {
  const response = await api.put(`goals/${goalId}/`, goalData);
  return response.data;
};

const deleteGoal = async (goalId) => {
  const response = await api.delete(`goals/${goalId}/`);
  return response.data;
};

export const goalService = {
  createGoal,
  getGoals,
  getGoalsByClient,
  updateGoal,
  deleteGoal,
};