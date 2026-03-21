/* global jest, beforeEach, test, expect */

import useAuthStore from "../stores/authStore";

jest.mock("../utils/api", () => ({
  post: jest.fn((url, data) => {
    if (data.username === "valid" && data.password === "valid") {
      return Promise.resolve({
        data: {
          data: {
            user: { username: "valid", role: "admin" },
            token: "token123",
          },
        },
      });
    }
    return Promise.reject({ response: { data: { message: "Login gagal" } } });
  }),
}));

beforeEach(() => {
  localStorage.clear();
  useAuthStore.setState({
    user: null,
    token: null,
    isAuthenticated: false,
    isInitialized: false,
  });
});

test("login berhasil", async () => {
  const result = await useAuthStore.getState().login("valid", "valid");
  await new Promise((resolve) => setTimeout(resolve, 0));
  const state = useAuthStore.getState();
  expect(result.success).toBe(true);
  expect(state.user).not.toBe(null);
  if (state.user) {
    expect(state.user.username).toBe("valid");
    expect(state.user.role).toBe("admin");
  }
  expect(state.token).toBe("token123");
  expect(state.isAuthenticated).toBe(true);
});

test("login gagal", async () => {
  const result = await useAuthStore.getState().login("invalid", "invalid");
  await new Promise((resolve) => setTimeout(resolve, 0));
  const state = useAuthStore.getState();
  expect(result.success).toBe(false);
  expect(result.message).toBe("Login gagal");
  expect(state.isAuthenticated).toBe(false);
  expect(state.user).toBe(null);
});

test("logout membersihkan state dan localStorage", async () => {
  useAuthStore.setState({
    user: { username: "valid", role: "admin" },
    token: "token123",
    isAuthenticated: true,
    isInitialized: true,
  });
  localStorage.setItem("token", "token123");
  localStorage.setItem(
    "user",
    JSON.stringify({ username: "valid", role: "admin" }),
  );
  await useAuthStore.getState().logout();
  await new Promise((resolve) => setTimeout(resolve, 0));
  const store = useAuthStore.getState();
  expect(store.user).toBe(null);
  expect(store.token).toBe(null);
  expect(store.isAuthenticated).toBe(false);
  expect(localStorage.getItem("token")).toBe(null);
  expect(localStorage.getItem("user")).toBe(null);
});
