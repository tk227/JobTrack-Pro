
import { useState } from "react";
import { motion } from "framer-motion";
import {
  BriefcaseBusiness,
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  User,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import { loginUser, registerUser } from "./api";

export default function Login({ onLogin }) {
  const [isRegister, setIsRegister] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isRegister) {
        await registerUser(
          form.username,
          form.email,
          form.password
        );

        setSuccess("Account created! You can now sign in.");
        setIsRegister(false);
        setForm((previous) => ({
          ...previous,
          password: "",
        }));
      } else {
        await loginUser(form.username, form.password);
        onLogin();
      }
    } catch (err) {
      const data = err.response?.data;

      if (data?.detail) {
        setError(data.detail);
      } else if (data) {
        const messages = Object.entries(data)
          .map(([field, value]) => {
            const message = Array.isArray(value)
              ? value.join(" ")
              : String(value);

            return `${field}: ${message}`;
          })
          .join(" | ");

        setError(messages || "Something went wrong.");
      } else {
        setError("Cannot connect to the server. Check your Django backend.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-[#09090f] px-4 py-10">
      <div className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full bg-purple-600/20 blur-[120px]" />
      <div className="pointer-events-none absolute -bottom-40 -right-40 h-96 w-96 rounded-full bg-blue-600/20 blur-[120px]" />

      <div className="relative z-10 grid w-full max-w-5xl overflow-hidden rounded-3xl border border-white/10 bg-[#11111b] shadow-2xl shadow-purple-950/20 md:grid-cols-2">
        {/* Left branding panel */}
        <div className="relative hidden flex-col justify-between overflow-hidden bg-gradient-to-br from-purple-700/30 via-[#17152b] to-blue-700/20 p-12 md:flex">
          <div className="absolute -right-24 top-20 h-64 w-64 rounded-full border border-purple-400/20" />
          <div className="absolute -right-12 top-32 h-40 w-40 rounded-full border border-blue-400/20" />

          <div className="relative">
            <div className="mb-12 flex items-center gap-3">
              <div className="rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-3">
                <BriefcaseBusiness size={23} />
              </div>
              <h1 className="text-xl font-bold">
                JobTrack <span className="text-purple-300">Pro</span>
              </h1>
            </div>

            <Sparkles className="mb-6 text-purple-300" size={30} />

            <h2 className="text-4xl font-bold leading-tight">
              Your career journey,
              <span className="block text-purple-300">
                all in one place.
              </span>
            </h2>

            <p className="mt-5 max-w-sm text-sm leading-7 text-gray-400">
              Organize your applications, prepare for interviews,
              and keep track of every opportunity.
            </p>
          </div>

          <div className="relative rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-xl">
            <p className="text-sm leading-6 text-gray-300">
              "Every application is a step closer to your next opportunity."
            </p>
            <p className="mt-4 text-xs text-purple-300">
              YOUR CAREER. YOUR PROGRESS.
            </p>
          </div>
        </div>

        {/* Form panel */}
        <div className="flex items-center justify-center p-7 sm:p-12">
          <motion.div
            key={isRegister ? "register" : "login"}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-sm"
          >
            <div className="mb-8 md:hidden">
              <div className="mb-5 inline-flex rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 p-3">
                <BriefcaseBusiness size={23} />
              </div>
              <h1 className="text-xl font-bold">
                JobTrack <span className="text-purple-300">Pro</span>
              </h1>
            </div>

            <p className="mb-2 text-sm text-purple-400">
              {isRegister ? "START YOUR JOURNEY" : "WELCOME BACK"}
            </p>

            <h2 className="text-3xl font-bold">
              {isRegister ? "Create account" : "Sign in"}
            </h2>

            <p className="mt-2 text-sm text-gray-500">
              {isRegister
                ? "Create your account to manage your career."
                : "Sign in to continue to your dashboard."}
            </p>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Username
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#09090f] px-4 focus-within:border-purple-500">
                  <User size={17} className="text-gray-500" />
                  <input
                    required
                    name="username"
                    value={form.username}
                    onChange={handleChange}
                    placeholder="Enter your username"
                    className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-600"
                  />
                </div>
              </div>

              {isRegister && (
                <div>
                  <label className="mb-2 block text-xs text-gray-400">
                    Email address
                  </label>
                  <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#09090f] px-4 focus-within:border-purple-500">
                    <Mail size={17} className="text-gray-500" />
                    <input
                      required
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="you@example.com"
                      className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-600"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="mb-2 block text-xs text-gray-400">
                  Password
                </label>
                <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-[#09090f] px-4 focus-within:border-purple-500">
                  <LockKeyhole size={17} className="text-gray-500" />
                  <input
                    required
                    minLength={8}
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Enter your password"
                    className="w-full bg-transparent py-3.5 text-sm outline-none placeholder:text-gray-600"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-500 hover:text-white"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="rounded-lg border border-red-500/20 bg-red-500/10 p-3 text-xs text-red-300">
                  {error}
                </p>
              )}

              {success && (
                <p className="rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-xs text-emerald-300">
                  {success}
                </p>
              )}

              <button
                disabled={loading}
                type="submit"
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-purple-600 to-blue-600 py-3.5 text-sm font-semibold shadow-lg shadow-purple-500/20 transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {loading
                  ? "Please wait..."
                  : isRegister
                  ? "Create account"
                  : "Sign in"}
                {!loading && <ArrowRight size={17} />}
              </button>
            </form>

            <p className="mt-7 text-center text-sm text-gray-500">
              {isRegister
                ? "Already have an account?"
                : "Don't have an account?"}{" "}
              <button
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError("");
                  setSuccess("");
                }}
                className="font-semibold text-purple-300 hover:text-purple-200"
              >
                {isRegister ? "Sign in" : "Create account"}
              </button>
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
