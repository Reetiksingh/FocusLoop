import { useEffect } from "react";
import { AuthPage } from "./components/auth/AuthPage";
import { DashboardPage } from "./components/dashboard/DashboardPage";
import { useAuthStore } from "./store/useAuthStore";

export function App() {
  const status = useAuthStore(state => state.status);
  const user = useAuthStore(state => state.user);
  const hydrate = useAuthStore(state => state.hydrate);

  useEffect(() => {
    hydrate().catch(error => {
      console.error("Auth hydration failed", error);
    });
  }, [hydrate]);

  if (status === "loading" && !user) {
    return <div className="screen-center">Loading Life Pro...</div>;
  }

  return user ? <DashboardPage /> : <AuthPage />;
}
