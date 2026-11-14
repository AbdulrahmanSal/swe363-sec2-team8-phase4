import {
  createContext,
  useContext,
  useState,
  useRef,
  useCallback,
} from "react";
import { uid } from "./rules";
import "./admin.css";
const Context = createContext(null);
const collections = [
  "users",
  "vendors",
  "categories",
  "requests",
  "offers",
  "announcements",
  "matches",
  "events",
  "activity",
];
export function AdminModuleProvider({ auth, data, navigate, children }) {
  const [toast, setToast] = useState("");
  const timer = useRef();
  const notify = useCallback((message) => {
    clearTimeout(timer.current);
    setToast(message);
    timer.current = setTimeout(() => setToast(""), 4500);
  }, []);
  const mutate = async (action, collection, ...args) => {
    if (auth?.user?.role !== "admin")
      throw new Error("Administrator permission is required.");
    if (typeof data[action] !== "function")
      throw new Error(`DataContext.${action} is unavailable.`);
    const result = await data[action](collection, ...args);
    if (result?.ok === false)
      throw new Error(
        Object.values(result.errors || {}).join(" ") ||
          "The data action failed.",
      );
    return result;
  };
  const audit = async (text) => {
    try {
      await mutate("add", "activity", {
        id: uid("ACT"),
        at: new Date().toISOString(),
        actor: auth.user.name,
        text,
      });
    } catch {
      notify("Change saved, but the activity log could not be updated.");
    }
  };
  const normalized = Object.fromEntries(
    collections.map((k) => [k, Array.isArray(data?.[k]) ? data[k] : []]),
  );
  return (
    <Context.Provider
      value={{
        ...normalized,
        user: auth?.user,
        navigate:
          navigate ||
          ((to) => {
            window.location.hash = to;
          }),
        add: (c, i) => mutate("add", c, i),
        update: (c, id, v) => mutate("update", c, id, v),
        remove: (c, id) => mutate("remove", c, id),
        audit,
        notify,
      }}
    >
      <div className="mh-admin">
        {children}
        <div className="mh-toast" role="status" aria-live="polite">
          {toast}
        </div>
      </div>
    </Context.Provider>
  );
}
export function useAdmin() {
  const c = useContext(Context);
  if (!c)
    throw new Error(
      "Wrap these pages in AdminModuleProvider using the team useAuth() and useData() hooks.",
    );
  return c;
}
export function AdminGuard({ children }) {
  const a = useAdmin();
  return a.user?.role === "admin" ? (
    children
  ) : (
    <section className="mh-empty">
      <h1>Access restricted</h1>
      <p>Only administrators can open this workspace.</p>
      <button className="mh-btn" onClick={() => a.navigate("/login")}>
        Go to login
      </button>
    </section>
  );
}
