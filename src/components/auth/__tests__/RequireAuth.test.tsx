import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { RequireAuth } from "@/components/auth/RequireAuth";

// Mock do AuthContext usado pelo RequireAuth
const authState = {
  user: null as null | { id: string },
  isLoading: false,
  masterSession: null as string | null,
};

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => authState,
}));

const DashboardStub = () => <div>DASHBOARD_SECRETO</div>;
const MasterStub = () => (
  <div>
    <h1>Painel Master</h1>
    <button>Ação Master</button>
    <a href="/master/danger">Zona Perigosa</a>
  </div>
);
const HomeStub = () => <div>HOME_PUBLICA</div>;

function renderAt(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="/" element={<HomeStub />} />
        <Route
          path="/dashboard"
          element={
            <RequireAuth mode="redirect" redirectTo="/">
              <DashboardStub />
            </RequireAuth>
          }
        />
        <Route
          path="/master"
          element={
            <RequireAuth mode="block">
              <MasterStub />
            </RequireAuth>
          }
        />
      </Routes>
    </MemoryRouter>,
  );
}

describe("RequireAuth — guards de rota", () => {
  it("visitante não autenticado NÃO renderiza /dashboard e é redirecionado", () => {
    authState.user = null;
    authState.isLoading = false;
    authState.masterSession = null;

    renderAt("/dashboard");

    expect(screen.queryByText("DASHBOARD_SECRETO")).not.toBeInTheDocument();
    expect(screen.getByText("HOME_PUBLICA")).toBeInTheDocument();
  });

  it("visitante não autenticado NÃO renderiza /master e vê mensagem de Área Restrita", () => {
    authState.user = null;
    authState.isLoading = false;
    authState.masterSession = null;

    renderAt("/master");

    expect(screen.queryByText("Painel Master")).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Ação Master/i })).not.toBeInTheDocument();
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.getByText(/Área Restrita/i)).toBeInTheDocument();
  });

  it("usuário autenticado acessa /dashboard normalmente", () => {
    authState.user = { id: "u1" };
    authState.isLoading = false;
    authState.masterSession = null;

    renderAt("/dashboard");

    expect(screen.getByText("DASHBOARD_SECRETO")).toBeInTheDocument();
  });

  it("usuário autenticado acessa /master normalmente", () => {
    authState.user = { id: "u1" };
    authState.isLoading = false;
    authState.masterSession = null;

    renderAt("/master");

    expect(screen.getByText("Painel Master")).toBeInTheDocument();
  });

  it("durante carregamento inicial não expõe conteúdo protegido nem redireciona", () => {
    authState.user = null;
    authState.isLoading = true;
    authState.masterSession = null;

    renderAt("/dashboard");

    expect(screen.queryByText("DASHBOARD_SECRETO")).not.toBeInTheDocument();
    expect(screen.queryByText("HOME_PUBLICA")).not.toBeInTheDocument();
    expect(screen.getByRole("status")).toBeInTheDocument();
  });
});
