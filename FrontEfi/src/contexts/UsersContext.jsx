import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import usersService from "../service/users";

const UsersContext = createContext();

export function UsersProvider({ children }) {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ✅ CORREGIDO: Solo cargar si es admin (los agentes NO necesitan ver usuarios)
  useEffect(() => {
    if (user?.id && user.rol === 'admin') {
      fetchUsers();
    }
  }, [user?.id, user?.rol]);

  async function fetchUsers() {
    setLoading(true);
    setError(null);
    try {
      const data = await usersService.getAll();
      setUsers(data);
    } catch (err) {
      console.error('Error al cargar usuarios:', err);
      setError(err.message);
      setUsers([]);
    } finally {
      setLoading(false);
    }
  }

  async function getUserById(id) {
    try {
      return await usersService.getById(id);
    } catch (err) {
      setError(err.message);
      return null;
    }
  }

  async function createUser(payload) {
    try {
      const newUser = await usersService.create(payload);
      setUsers(prev => [...prev, newUser]);
      return newUser;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function updateUser(id, payload) {
    try {
      const updated = await usersService.update(id, payload);
      setUsers(prev =>
        prev.map(u => (u.id === id ? updated : u))
      );
      return updated;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function deleteUser(id) {
    try {
      await usersService.remove(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function deleteUserPermanently(id) {
    try {
      await usersService.removePermanently(id);
      setUsers(prev => prev.filter(u => u.id !== id));
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function getInactiveUsers() {
    try {
      const inactiveUsers = await usersService.getInactive();
      return inactiveUsers;
    } catch (err) {
      setError(err.message);
      throw err;
    }
  }

  async function restoreUser(id) {
    try {
      const restored = await usersService.restore(id);
      await fetchUsers();
      return restored;
    } catch (err) {
      setError(err.message);
      throw err;
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
        deleteUserPermanently,
        getInactiveUsers,
        restoreUser,
      }}
    >
      {children}
    </UsersContext.Provider>
  );
}

export function useUsers() {
  return useContext(UsersContext);
}