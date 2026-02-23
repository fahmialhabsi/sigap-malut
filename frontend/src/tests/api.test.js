import api from "../utils/api";

jest.mock("axios", () => {
  const original = jest.requireActual("axios");
  return {
    ...original,
    create: jest.fn(() => ({
      interceptors: {
        request: { use: jest.fn() },
        response: { use: jest.fn() },
      },
      post: jest.fn(),
      get: jest.fn(),
    })),
  };
});

describe("api utils", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test("request interceptor menambah Authorization jika token ada", () => {
    localStorage.setItem("token", "token123");
    const config = { headers: {}, method: "get", url: "/test" };
    const interceptor = api.interceptors.request.use.mock.calls[0][0];
    const result = interceptor(config);
    expect(result.headers.Authorization).toBe("Bearer token123");
  });

  test("response interceptor 401 menghapus token dan redirect", () => {
    localStorage.setItem("token", "token123");
    localStorage.setItem("user", JSON.stringify({ username: "tester" }));
    const error = { response: { status: 401, data: {} } };
    const interceptor = api.interceptors.response.use.mock.calls[0][1];
    // Mock window.location
    delete window.location;
    window.location = { href: "" };
    interceptor(error);
    expect(localStorage.getItem("token")).toBe(null);
    expect(localStorage.getItem("user")).toBe(null);
    expect(window.location.href).toBe("/login");
  });
});
