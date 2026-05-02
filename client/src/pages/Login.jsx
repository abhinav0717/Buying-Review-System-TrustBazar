import { LockKeyhole, UserPlus } from "lucide-react";
import { useState } from "react";
import { useDispatch } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { api, attachToken } from "../services/api.js";
import { setCredentials } from "../store/authSlice.js";

export default function Login() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [mode, setMode] = useState("login");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "buyer@trustbazaar.dev",
    password: "Password@123",
    role: "buyer",
    location: "Delhi"
  });

  async function submit(event) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload = mode === "login" ? { email: form.email, password: form.password } : form;
      const { data } = await api.post(endpoint, payload);
      attachToken(data.token);
      dispatch(setCredentials(data));
      navigate(location.state?.from || "/");
    } catch (err) {
      setError(err.response?.data?.message || "Authentication failed");
    } finally {
      setLoading(false);
    }
  }

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  return (
    <section className="mx-auto grid min-h-[calc(100vh-73px)] max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8">
      <div className="flex flex-col justify-center">
        <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-md bg-ink text-white">
          <LockKeyhole size={23} />
        </div>
        <h1 className="text-3xl font-black text-ink">Secure marketplace access</h1>
        <p className="mt-3 text-slate-600">
          JWT authentication protects purchases, reviews, and chat. Try the seeded buyer account or register a fresh buyer or seller profile.
        </p>
        <div className="mt-6 rounded-lg border border-slate-200 bg-white p-4 text-sm text-slate-700">
          <p className="font-bold text-ink">Demo login</p>
          <p className="mt-1">buyer@trustbazaar.dev</p>
          <p>Password@123</p>
        </div>
      </div>

      <div className="self-center rounded-lg border border-slate-200 bg-white p-5 shadow-soft sm:p-7">
        <div className="mb-6 grid grid-cols-2 rounded-md bg-slate-100 p-1">
          <button onClick={() => setMode("login")} className={`focus-ring rounded-md px-3 py-2 text-sm font-bold ${mode === "login" ? "bg-white text-ink shadow-sm" : "text-slate-600"}`}>
            Login
          </button>
          <button onClick={() => setMode("register")} className={`focus-ring rounded-md px-3 py-2 text-sm font-bold ${mode === "register" ? "bg-white text-ink shadow-sm" : "text-slate-600"}`}>
            Register
          </button>
        </div>

        <form onSubmit={submit} className="space-y-4">
          {mode === "register" && (
            <>
              <Field label="Name" value={form.name} onChange={(value) => update("name", value)} required />
              <Field label="Location" value={form.location} onChange={(value) => update("location", value)} />
              <label className="block">
                <span className="mb-1 block text-sm font-bold text-slate-700">Role</span>
                <select value={form.role} onChange={(event) => update("role", event.target.value)} className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2">
                  <option value="buyer">Buyer</option>
                  <option value="seller">Seller</option>
                </select>
              </label>
            </>
          )}
          <Field label="Email" type="email" value={form.email} onChange={(value) => update("email", value)} required />
          <Field label="Password" type="password" value={form.password} onChange={(value) => update("password", value)} required />

          {error && <p className="rounded-md bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}

          <button disabled={loading} className="focus-ring inline-flex w-full items-center justify-center gap-2 rounded-md bg-ink px-4 py-3 font-bold text-white hover:bg-slate-800 disabled:opacity-60">
            <UserPlus size={18} /> {loading ? "Please wait..." : mode === "login" ? "Login" : "Create account"}
          </button>
        </form>
      </div>
    </section>
  );
}

function Field({ label, value, onChange, type = "text", required = false }) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-bold text-slate-700">{label}</span>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        required={required}
        className="focus-ring w-full rounded-md border border-slate-300 px-3 py-2"
      />
    </label>
  );
}

