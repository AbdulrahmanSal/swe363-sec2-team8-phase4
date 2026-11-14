import { useEffect, useState } from "react";
import { AdminModuleProvider } from "../features/admin/AdminBridge";
import { adminRoutes } from "../features/admin/AdminRoutes";
import { Icon, ConfirmDialog } from "../features/admin/components";
import { useDemo } from "./DemoContext";
import "./demo.css";
export default function App() {
  const { auth, data, switchAccount, resetDemo, sessionError } = useDemo(),
    [route, setRoute] = useState(() => location.hash.slice(1) || "/admin"),
    [menu, setMenu] = useState(false),
    [reset, setReset] = useState(false);
  useEffect(() => {
    const cb = () => {
      setRoute(location.hash.slice(1) || "/admin");
      setMenu(false);
      window.scrollTo(0, 0);
    };
    window.addEventListener("hashchange", cb);
    return () => window.removeEventListener("hashchange", cb);
  }, []);
  useEffect(() => {
    const close = (e) => {
      if (e.key === "Escape") setMenu(false);
    };
    document.addEventListener("keydown", close);
    return () => document.removeEventListener("keydown", close);
  }, []);
  const path = route.split("?")[0],
    active = adminRoutes.find((r) => r.path === path),
    Screen = active?.Component;
  function navigate(to) {
    window.location.hash = to;
  }
  return (
    <div className="mh-demo">
      <a
        className="mh-skip"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          document.getElementById("main-content")?.focus();
        }}
      >
        Skip to content
      </a>
      <header className="mh-portaltop">
        <div className="mh-portalbrand">
          <span className="mh-hubmark">MH</span>
          <div>
            <b>
              KFUPM <span>MALL HUB</span>
            </b>
            <small>King Fahd University of Petroleum & Minerals</small>
          </div>
        </div>
        <div className="mh-portaltools">
          <span className="mh-demotag">STUDENT PROJECT · DEMO</span>
          <span className="mh-topdivider" />
          <span className="mh-topavatar">{auth.user?.name[0] || "G"}</span>
          <div className="mh-topidentity">
            <b>{auth.user?.name || "Guest"}</b>
            <small>
              {auth.user?.role === "admin"
                ? "Mall administrator"
                : auth.user?.role || "Signed out"}
            </small>
          </div>
          <button
            className="mh-signout"
            onClick={auth.logout}
            aria-label="Sign out"
          >
            <Icon name="logout" size={18} />
          </button>
        </div>
      </header>
      <div className="mh-portalbody">
        {menu && (
          <button
            className="mh-menubackdrop"
            aria-label="Close navigation menu"
            onClick={() => setMenu(false)}
          />
        )}
        <aside className={`mh-portalside ${menu ? "is-open" : ""}`}>
          <div className="mh-side-user">
            <span className="mh-side-avatar">{auth.user?.name[0] || "G"}</span>
            <b>{auth.user?.name || "Guest user"}</b>
            <small>
              {auth.user?.role === "admin"
                ? "ADMINISTRATION"
                : "PREVIEW ACCOUNT"}
            </small>
          </div>
          <p className="mh-navlabel">MALL WORKSPACE</p>
          <nav aria-label="Administration pages">
            {adminRoutes.map((r) => (
              <a
                key={r.path}
                className={path === r.path ? "active" : ""}
                href={"#" + r.path}
                onClick={() => setMenu(false)}
                aria-current={path === r.path ? "page" : undefined}
              >
                <Icon name={r.icon} size={18} />
                <span>{r.label}</span>
                <Icon name="chevron" size={13} />
              </a>
            ))}
          </nav>
          <div className="mh-sidebarfoot">
            <span className="mh-side-gold" />
            <b>A connected campus community.</b>
            <p>Team 8 · SWE 363 · Phase 4</p>
            <small>Ibrahim’s admin module</small>
          </div>
        </aside>
        <div className="mh-mainwrap">
          <div className="mh-breadcrumb">
            <button
              className="mh-mobilemenu"
              onClick={() => setMenu(!menu)}
              aria-label="Open navigation menu"
              aria-expanded={menu}
            >
              <Icon name="menu" />
            </button>
            <span>KFUPM Mall Hub</span>
            <Icon name="chevron" size={11} />
            <b>{active?.label || "Preview"}</b>
            <span className="mh-demo-controls">
              <label>
                <span>Demo account</span>
                <select
                  aria-label="Demo account"
                  value={auth.user?.id || ""}
                  onChange={(e) => switchAccount(e.target.value)}
                >
                  <option value="">Signed out</option>
                  {data.users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} · {u.role}
                    </option>
                  ))}
                </select>
              </label>
              <button onClick={() => setReset(true)}>Reset demo</button>
            </span>
          </div>
          <main id="main-content" className="mh-portalmains" tabIndex={-1}>
            {sessionError && (
              <p className="mh-demoerror" role="alert">
                {sessionError}
              </p>
            )}
            <AdminModuleProvider auth={auth} data={data} navigate={navigate}>
              {Screen ? (
                <Screen key={route} />
              ) : (
                <div className="mh-empty">
                  <h1>
                    {path === "/login"
                      ? "Choose a demo account"
                      : "Page outside Ibrahim’s module"}
                  </h1>
                  <p>
                    {path === "/login"
                      ? "Use the Demo account selector to switch accounts. The team login page is owned by Mohammed."
                      : "This preview contains only S17, S18, and S20–S23."}
                  </p>
                  <button className="mh-btn" onClick={() => navigate("/admin")}>
                    Back to administration
                  </button>
                </div>
              )}
              {reset && (
                <ConfirmDialog
                  title="Reset preview data?"
                  message="This restores the fictional sample records in Ibrahim’s isolated preview. It does not touch the team’s mallhub-demo storage."
                  confirmLabel="Reset demo"
                  onClose={() => setReset(false)}
                  onConfirm={() => {
                    resetDemo();
                    setReset(false);
                  }}
                />
              )}
            </AdminModuleProvider>
            <footer className="mh-pagefooter">
              <span>
                © {new Date().getFullYear()} KFUPM Mall Hub · Student course
                project
              </span>
              <span>Fictional records · No real university services</span>
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
