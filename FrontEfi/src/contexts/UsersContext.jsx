import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import usersService from "../service/users";

const UsersContext = createContext();

export function UsersProvider({ children }) {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Cargar usuarios al montar si hay token y el usuario es admin
  useEffect(() => {
    if (token && user?.rol === 'admin') {
      fetchUsers();
    }
  }, [token, user]);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.getAll(token);
      setUsers(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function getUserById(id) {
    try {
      return await usersService.getById(id, token);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function createUser(payload) {
    try {
      const newUser = await usersService.create(payload, token);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function updateUser(id, payload) {
    try {
      const updated = await usersService.update(id, payload, token);
      setUsers(prev =>
        prev.map(u => (u.id === id ? updated : u))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function deleteUser(id) {
    try {
      await usersService.remove(id, token);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <UsersContext.Provider
      value={{
        users,
        loading,
        error,
        fetchUsers,
        getUserById,
        createUser,
        updateUser,
        deleteUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  return useContext(UsersContext);
}