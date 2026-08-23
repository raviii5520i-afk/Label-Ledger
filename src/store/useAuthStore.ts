import { create } from "zustand";
import { persist } from "zustand/middleware";
import { authApi, setToken, removeToken, getToken } from "@/services/api";

export interface User {
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  authError: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      loading: false,
      authError: null,

      clearError: () => set({ authError: null }),

      login: async (email, password) => {
        set({ loading: true, authError: null });
        try {
          const response = await authApi.login(email, password);
          const token = response.access_token || response.token;
          
          if (!token) {
            throw new Error("No token received from backend");
          }

          setToken(token);

          // Retrieve user profile
          const profile = await authApi.getMe();
          set({
            user: {
              name: profile.name || profile.username || email.split("@")[0],
              email: profile.email || email,
            },
            isAuthenticated: true,
            loading: false,
            authError: null,
          });
        } catch (error: any) {
          // Unreachable/offline API fallback to Demo Mode
          if (error.message === "Failed to fetch") {
            console.warn("Backend API is unreachable. Falling back to Demo Mode.");
            const mockName = email.split("@")[0];
            const capitalizedName = mockName.charAt(0).toUpperCase() + mockName.slice(1);
            setToken("demo-token-12345");
            set({
              user: { name: capitalizedName, email },
              isAuthenticated: true,
              loading: false,
              authError: null,
            });
            return;
          }
          set({
            loading: false,
            authError: error.message || "Failed to log in",
          });
          throw error;
        }
      },

      signup: async (name, email, password) => {
        set({ loading: true, authError: null });
        try {
          const response = await authApi.signup(name, email, password);
          
          // Check if response contains a token for auto-login
          const token = response.access_token || response.token;
          
          if (token) {
            setToken(token);
            set({
              user: { name, email },
              isAuthenticated: true,
              loading: false,
              authError: null,
            });
          } else {
            // Auto login by calling login function
            set({ loading: false });
            await get().login(email, password);
          }
        } catch (error: any) {
          // Unreachable/offline API fallback to Demo Mode
          if (error.message === "Failed to fetch") {
            console.warn("Backend API is unreachable. Falling back to Demo Mode.");
            setToken("demo-token-12345");
            set({
              user: { name, email },
              isAuthenticated: true,
              loading: false,
              authError: null,
            });
            return;
          }
          set({
            loading: false,
            authError: error.message || "Failed to sign up",
          });
          throw error;
        }
      },

      logout: async () => {
        set({ loading: true });
        try {
          await authApi.logout();
        } catch (e) {
          // Ignore API error on logout (e.g. if token already expired)
        } finally {
          removeToken();
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
            authError: null,
          });
        }
      },

      checkAuth: async () => {
        const token = getToken();
        if (!token) {
          set({ user: null, isAuthenticated: false, loading: false });
          return;
        }

        set({ loading: true });
        try {
          if (token === "demo-token-12345") {
            set({
              loading: false,
              isAuthenticated: true,
            });
            return;
          }
          const profile = await authApi.getMe();
          set({
            user: {
              name: profile.name || profile.username || profile.email.split("@")[0],
              email: profile.email,
            },
            isAuthenticated: true,
            loading: false,
            authError: null,
          });
        } catch (error: any) {
          if (error.message === "Failed to fetch") {
            set({
              loading: false,
              isAuthenticated: true,
            });
            return;
          }
          removeToken();
          set({
            user: null,
            isAuthenticated: false,
            loading: false,
          });
        }
      },
    }),
    {
      name: "globetrotter-auth",
      // Only persist the non-loading states
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
