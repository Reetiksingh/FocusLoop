import { useState } from "react";
import { useAuthStore } from "../../store/useAuthStore";

const initialForm = {
  name: "",
  email: "",
  password: "",
  timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"
};

export function AuthPage() {
  const authMode = useAuthStore(state => state.authMode);
  const setAuthMode = useAuthStore(state => state.setAuthMode);
  const register = useAuthStore(state => state.register);
  const login = useAuthStore(state => state.login);
  const error = useAuthStore(state => state.error);

  const [form, setForm] = useState(initialForm);

  async function handleSubmit(event) {
    event.preventDefault();

    if (authMode === "register") {
      await register(form);
      return;
    }

    await login({
      email: form.email,
      password: form.password
    });
  }

  return (
    <div className="auth-shell">
      <section className="auth-hero">
        <p className="eyebrow">Plan -> Focus -> Reflect</p>
        <h1>Life Pro</h1>
        <p>
          A workflow-driven productivity system that turns daily intention, execution, and reflection
          into one connected loop.
        </p>
        <ul className="auth-points">
          <li>Plan meaningful tasks and set a daily intention.</li>
          <li>Run focus sessions or close instant tasks without a timer.</li>
          <li>Reflect daily and stay consistent with a compact activity map.</li>
        </ul>
      </section>

      <section className="auth-card">
        <div className="auth-switch">
          <button
            type="button"
            className={authMode === "login" ? "active" : ""}
            onClick={() => setAuthMode("login")}
          >
            Login
          </button>
          <button
            type="button"
            className={authMode === "register" ? "active" : ""}
            onClick={() => setAuthMode("register")}
          >
            Register
          </button>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          {authMode === "register" ? (
            <label>
              <span>Name</span>
              <input
                type="text"
                value={form.name}
                onChange={event => setForm(current => ({ ...current, name: event.target.value }))}
                required
              />
            </label>
          ) : null}

          <label>
            <span>Email</span>
            <input
              type="email"
              value={form.email}
              onChange={event => setForm(current => ({ ...current, email: event.target.value }))}
              required
            />
          </label>

          <label>
            <span>Password</span>
            <input
              type="password"
              value={form.password}
              onChange={event => setForm(current => ({ ...current, password: event.target.value }))}
              required
            />
          </label>

          {authMode === "register" ? (
            <label>
              <span>Timezone</span>
              <input
                type="text"
                value={form.timezone}
                onChange={event => setForm(current => ({ ...current, timezone: event.target.value }))}
              />
            </label>
          ) : null}

          {error ? <p className="form-error">{error}</p> : null}

          <button type="submit">{authMode === "register" ? "Create account" : "Continue"}</button>
        </form>
      </section>
    </div>
  );
}
