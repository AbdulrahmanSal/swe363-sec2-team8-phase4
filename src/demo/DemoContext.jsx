import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { seed } from "./seed";
const Context = createContext(null),
  KEY = "mallhub-ibrahim-admin-preview-v1";
function read() {
  try {
    const db = JSON.parse(localStorage.getItem(KEY));
    if (
      db?.version === 1 &&
      Array.isArray(db.users) &&
      Array.isArray(db.vendors)
    )
      return db;
  } catch {
    /* Storage unavailable: use isolated demo seed. */
  }
  return seed();
}
export function DemoProvider({ children }) {
  const [db, setDb] = useState(read),
    dbRef = useRef(db),
    [userId, setUserId] = useState("a1"),
    [sessionError, setSessionError] = useState("");
  const user = db.users.find((u) => u.id === userId) || null;
  useEffect(() => {
    try {
      localStorage.setItem(KEY, JSON.stringify(db));
    } catch {
      /* Demo remains usable in memory. */
    }
  }, [db]);
  const data = useMemo(
    () => ({
      ...db,
      add: async (c, item) => {
        if (dbRef.current.users.find((u) => u.id === userId)?.role !== "admin")
          throw new Error("Administrator permission is required.");
        if (!Array.isArray(dbRef.current[c]))
          throw new Error("Unknown collection.");
        if (dbRef.current[c].some((x) => x.id === item.id))
          throw new Error("Duplicate record ID.");
        if (
          c === "users" &&
          dbRef.current.users.some(
            (u) => u.email.toLowerCase() === item.email.toLowerCase(),
          )
        )
          throw new Error("This email is already registered.");
        const next = { ...dbRef.current, [c]: [...dbRef.current[c], item] };
        dbRef.current = next;
        setDb(next);
        return { ok: true };
      },
      update: async (c, id, changes) => {
        if (dbRef.current.users.find((u) => u.id === userId)?.role !== "admin")
          throw new Error("Administrator permission is required.");
        if (
          !Array.isArray(dbRef.current[c]) ||
          !dbRef.current[c].some((x) => x.id === id)
        )
          throw new Error("Record not found.");
        const next = {
          ...dbRef.current,
          [c]: dbRef.current[c].map((x) =>
            x.id === id ? { ...x, ...changes } : x,
          ),
        };
        dbRef.current = next;
        setDb(next);
        return { ok: true };
      },
      remove: async (c, id) => {
        if (dbRef.current.users.find((u) => u.id === userId)?.role !== "admin")
          throw new Error("Administrator permission is required.");
        const next = {
          ...dbRef.current,
          [c]: dbRef.current[c].filter((x) => x.id !== id),
        };
        dbRef.current = next;
        setDb(next);
        return { ok: true };
      },
    }),
    [db, userId],
  );
  function switchAccount(id) {
    const target = db.users.find((u) => u.id === id);
    if (
      target?.role === "vendor" &&
      db.vendors.find((v) => v.id === target.vendorId)?.accountStatus !==
        "active"
    ) {
      setUserId(null);
      setSessionError("Unable to sign in with these credentials.");
      return;
    }
    setSessionError("");
    setUserId(id);
  }
  const resetDemo = () => {
    const next = seed();
    dbRef.current = next;
    setDb(next);
    setUserId("a1");
    setSessionError("");
  };
  return (
    <Context.Provider
      value={{
        auth: { user, logout: () => setUserId(null) },
        data,
        switchAccount,
        resetDemo,
        sessionError,
      }}
    >
      {children}
    </Context.Provider>
  );
}
export const useDemo = () => useContext(Context);
