// 简易 mock 登录态：仅前端原型使用
const STORAGE_KEY = "sentinel_auth_user";

export const MOCK_ACCOUNT = {
  username: "admin",
  password: "admin123",
  displayName: "管理员",
  email: "admin@platform",
};

export interface AuthUser {
  username: string;
  displayName: string;
  email: string;
}

export function login(username: string, password: string): AuthUser | null {
  if (username === MOCK_ACCOUNT.username && password === MOCK_ACCOUNT.password) {
    const user: AuthUser = {
      username: MOCK_ACCOUNT.username,
      displayName: MOCK_ACCOUNT.displayName,
      email: MOCK_ACCOUNT.email,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return user;
  }
  return null;
}

export function logout() {
  localStorage.removeItem(STORAGE_KEY);
}

export function getCurrentUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function isAuthenticated(): boolean {
  return getCurrentUser() !== null;
}
