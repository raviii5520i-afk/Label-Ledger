const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export const getToken = (): string | null => {
  if (typeof window === "undefined") return null;

  // Try cookie first
  const match = document.cookie.match(/(^|;)\s*token\s*=\s*([^;]+)/);
  if (match) return decodeURIComponent(match[2]);

  // Try localStorage
  return localStorage.getItem("token");
};

export const setToken = (token: string) => {
  if (typeof window === "undefined") return;
  localStorage.setItem("token", token);
  
  // Set cookie for 7 days
  const secure = window.location.protocol === "https:" ? "Secure;" : "";
  document.cookie = `token=${encodeURIComponent(token)}; path=/; max-age=604800; SameSite=Lax; ${secure}`;
};

export const removeToken = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("token");
  document.cookie = "token=; path=/; max-age=0; SameSite=Lax; Secure";
};

async function apiRequest<T = any>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Set up AbortController for 3-second timeout
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), 3000);

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
    
    clearTimeout(id);

    if (!response.ok) {
      let errorMessage = "An error occurred";
      try {
        const errorData = await response.json();
        if (errorData.detail) {
          if (typeof errorData.detail === "string") {
            errorMessage = errorData.detail;
          } else if (Array.isArray(errorData.detail) && errorData.detail.length > 0) {
            errorMessage = errorData.detail[0].msg || JSON.stringify(errorData.detail);
          }
        } else {
          errorMessage = errorData.message || errorMessage;
        }
      } catch (e) {
        errorMessage = response.statusText || errorMessage;
      }
      throw new Error(errorMessage);
    }

    if (response.status === 204) {
      return {} as T;
    }

    try {
      return await response.json();
    } catch (e) {
      return {} as T;
    }
  } catch (error: any) {
    clearTimeout(id);
    if (error.name === "AbortError") {
      throw new Error("Failed to fetch");
    }
    throw error;
  }
}

export const authApi = {
  async signup(name: string, email: string, password: string) {
    return apiRequest("/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
  },

  async login(email: string, password: string) {
    // Standard FastAPI OAuth2 expects form-urlencoded (username & password)
    // We will attempt this first. If it is a different custom JSON backend, we'll implement fallback support.
    const formData = new URLSearchParams();
    formData.append("username", email);
    formData.append("password", password);

    try {
      return await apiRequest("/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });
    } catch (error: any) {
      // If form-urlencoded fails, retry with JSON as a fallback for flexibility
      try {
        return await apiRequest("/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });
      } catch (jsonError) {
        // Throw the original form-urlencoded error if JSON fallback also fails
        throw error;
      }
    }
  },

  async logout() {
    return apiRequest("/auth/logout", {
      method: "POST",
    });
  },

  async getMe() {
    return apiRequest("/auth/me", {
      method: "GET",
    });
  },
};
