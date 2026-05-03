import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";
import { AuthProvider } from "./context/AuthContext";

beforeEach(() => {
  localStorage.clear();
});

test("renders login when not authenticated", () => {
  render(
    <MemoryRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </MemoryRouter>,
  );
  expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
});
