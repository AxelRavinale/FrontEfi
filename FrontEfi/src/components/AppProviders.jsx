import React from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./contexts/AuthContext";
import { UsersProvider } from "./contexts/UsersContext";
import { PropertiesProvider } from "./contexts/PropertiesContext";
import { ClientsProvider } from "./contexts/ClientsContext";
import { RentalsProvider } from "./contexts/RentalsContext";
import { SalesProvider } from "./contexts/SalesContext";

/**
 * AppProviders: Envuelve toda la app con los contextos necesarios
 * El orden importa: AuthProvider debe ser el primero porque los demás dependen del token
 */
export function AppProviders({ children }) {
  return (
    <BrowserRouter>
      <AuthProvider>
        <UsersProvider>
          <PropertiesProvider>
            <ClientsProvider>
              <RentalsProvider>
                <SalesProvider>
                  {children}
                </SalesProvider>
              </RentalsProvider>
            </ClientsProvider>
          </PropertiesProvider>
        </UsersProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}