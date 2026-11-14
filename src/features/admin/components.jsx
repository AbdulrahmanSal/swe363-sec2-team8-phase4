import { useState, useRef, useEffect, useId } from "react";
import { label } from "./rules";
export function useNow() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);
  return now;
}
export function Icon({ name, size = 20, ...props }) {
  const paths = {
    grid: "M3 3h7v7H3z M14 3h7v7h-7z M3 14h7v7H3z M14 14h7v7h-7z",
    store:
      "M3 10l2-6h14l2 6 M4 10v10h16V10 M9 20v-7h6v7 M2 10c0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0 0 4 5 4 5 0",
    news: "M4 3h13v18H4z M17 8h4v11c0 3-4 3-4 0 M7 7h7 M7 11h7 M7 15h7",
    users:
      "M16 21v-2a4 4 0 00-4-4H6a4 4 0 00-4 4v2 M9 3a4 4 0 110 8 4 4 0 010-8 M17 3a4 4 0 010 8 M22 21v-2a4 4 0 00-3-3.9",
    calendar: "M4 5h16v16H4z M8 2v6 M16 2v6 M4 11h16 M8 15l3 3 5-5",
    tag: "M3 3h8l10 10-8 8L3 11z M7 7h.01",
    search: "M21 21l-5-5 M10 3a7 7 0 110 14 7 7 0 010-14",
    plus: "M12 5v14 M5 12h14",
    chevron: "M9 5l7 7-7 7",
    menu: "M3 6h18 M3 12h18 M3 18h18",
    close: "M6 6l12 12 M6 18L18 6",
    check: "M5 12l4 4L19 6",
    arrow: "M7 17L17 7 M7 7h10v10",
    clock: "M12 3a9 9 0 110 18 9 9 0 010-18 M12 7v5l3 2",
    logout: "M9 5H4v14h5 M13 8l4 4-4 4 M8 12h13",
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d={paths[name] || paths.grid} />
    </svg>
  );
}
export function PageHeader({ id, title, description, actions }) {
  return (
    <header className="mh-pagehead">
      <div>
        <div className="mh-eyebrow">
          {id} <span /> Mall administration
        </div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {actions && <div className="mh-actions">{actions}</div>}
    </header>
  );
}
export function Badge({ status, display }) {
  return (
    <span
      className={`mh-badge mh-state-${String(status).toLowerCase().replace(/\s/g, "-")}`}
    >
      <i />
      {display || label(status)}
    </span>
  );
}
export function Empty({ title = "Nothing here yet", children }) {
  return (
    <div className="mh-empty">
      <Icon name="grid" size={28} />
      <h3>{title}</h3>
      <p>{children || "There are no records to display."}</p>
    </div>
  );
}
export function Field({
  label: caption,
  name,
  value,
  onChange,
  error,
  type = "text",
  options,
  readOnly = false,
  required = false,
  children,
  ...props
}) {
  const uid = useId(),
    id = `field-${uid}`,
    help = `${id}-error`;
  return (
    <label className="mh-field" htmlFor={id}>
      <span>
        {caption}
        {required && <b aria-hidden="true"> *</b>}
      </span>
      {children ||
        (options ? (
          <select
            id={id}
            name={name}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? help : undefined}
            disabled={readOnly}
            {...props}
          >
            {options.map((o) => (
              <option
                key={typeof o === "string" ? o : o.value}
                value={typeof o === "string" ? o : o.value}
              >
                {typeof o === "string" ? o : o.label}
              </option>
            ))}
          </select>
        ) : type === "textarea" ? (
          <textarea
            id={id}
            name={name}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? help : undefined}
            readOnly={readOnly}
            {...props}
          />
        ) : (
          <input
            id={id}
            type={type}
            name={name}
            value={value ?? ""}
            onChange={(e) => onChange(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? help : undefined}
            readOnly={readOnly}
            {...props}
          />
        ))}
      {error && (
        <small id={help} className="mh-field-error">
          {error}
        </small>
      )}
    </label>
  );
}
export function ErrorSummary({ errors }) {
  return (
    Object.keys(errors).length > 0 && (
      <div className="mh-error" role="alert">
        <strong>Please check your entries.</strong>
        <ul>
          {Object.values(errors).map((x, i) => (
            <li key={i}>{x}</li>
          ))}
        </ul>
      </div>
    )
  );
}
export function Notice({ children }) {
  return <div className="mh-notice">{children}</div>;
}
export function Search({
  value,
  onChange,
  placeholder = "Search records",
  label: caption = "Search",
}) {
  return (
    <label className="mh-search">
      <span className="mh-sr">{caption}</span>
      <Icon name="search" size={18} />
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    </label>
  );
}
export function Table({ columns, rows, rowKey, empty }) {
  return rows.length ? (
    <div className="mh-tablewrap">
      <table className="mh-table">
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.label} scope="col">
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={rowKey ? rowKey(r) : r.id || i}>
              {columns.map((c) => (
                <td key={c.label} data-label={c.label}>
                  {c.render(r)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ) : (
    <Empty title={empty || "No matching records"}>
      Try clearing the filters or add a new record.
    </Empty>
  );
}
export function Modal({ title, onClose, children, wide = false }) {
  const ref = useRef(null),
    close = useRef(onClose),
    id = useId();
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const previous = document.activeElement,
      bodyOverflow = document.body.style.overflow,
      box = ref.current;
    document.body.style.overflow = "hidden";
    box.querySelector("input:not([readonly]),select,textarea,button")?.focus();
    const handle = (e) => {
      if (e.key === "Escape") {
        e.preventDefault();
        close.current();
      }
      if (e.key === "Tab") {
        const items = [
          ...box.querySelectorAll(
            "button:not([disabled]),input:not([disabled]),textarea:not([disabled]),select:not([disabled]),a[href]",
          ),
        ].filter((el) => el.getAttribute("tabindex") !== "-1");
        if (!items.length) {
          e.preventDefault();
          box.focus();
          return;
        }
        const first = items[0],
          last = items.at(-1);
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener("keydown", handle);
    return () => {
      document.removeEventListener("keydown", handle);
      document.body.style.overflow = bodyOverflow;
      previous?.focus();
    };
  }, []);
  return (
    <div
      className="mh-backdrop"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <section
        ref={ref}
        className={`mh-modal ${wide ? "mh-modal-wide" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={id}
        tabIndex={-1}
      >
        <header>
          <h2 id={id}>{title}</h2>
          <button
            type="button"
            className="mh-iconbtn"
            onClick={onClose}
            aria-label="Close dialog"
          >
            <Icon name="close" />
          </button>
        </header>
        {children}
      </section>
    </div>
  );
}
export function useSaving() {
  const [busy, setBusy] = useState(false),
    lock = useRef(false);
  async function run(task, onError) {
    if (lock.current) return;
    lock.current = true;
    setBusy(true);
    try {
      await task();
    } catch (e) {
      onError?.(e.message || "Unable to save. Please try again.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }
  return { busy, run };
}
export function ConfirmDialog({
  title,
  message,
  reason = false,
  confirmLabel = "Confirm",
  onConfirm,
  onClose,
}) {
  const [text, setText] = useState(""),
    [errors, setErrors] = useState({}),
    { busy, run } = useSaving();
  return (
    <Modal
      title={title}
      onClose={() => {
        if (!busy) onClose();
      }}
    >
      <form
        noValidate
        onSubmit={(e) => {
          e.preventDefault();
          if (reason && !text.trim()) {
            setErrors({ reason: "A reason is required." });
            return;
          }
          run(
            () => onConfirm(text.trim()),
            (message) => setErrors({ save: message }),
          );
        }}
      >
        <div className="mh-modalbody">
          <p>{message}</p>
          <ErrorSummary errors={errors} />
          {reason && (
            <Field
              label="Reason"
              value={text}
              onChange={setText}
              error={errors.reason}
              type="textarea"
              required
            />
          )}
        </div>
        <footer className="mh-modalfoot">
          <button
            className="mh-btn mh-btn-secondary"
            type="button"
            disabled={busy}
            onClick={onClose}
          >
            Cancel
          </button>
          <button className="mh-btn mh-btn-danger" disabled={busy}>
            {busy ? "Saving…" : confirmLabel}
          </button>
        </footer>
      </form>
    </Modal>
  );
}
