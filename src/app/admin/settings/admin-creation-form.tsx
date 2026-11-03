"use client";

import { FormEvent, useState } from "react";
import { Button, Field } from "@/components/ui";

export default function AdminCreationForm() {
  const [form, setForm] = useState({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/admin/admins", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: form.name, email: form.email, phone: form.phone, password: form.password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error ?? "Unable to create the admin account.");
        return;
      }
      setForm({ name: "", email: "", phone: "", password: "", confirmPassword: "" });
      setSuccess(`Super admin account created for ${result.created.email}.`);
    } catch {
      setError("Unable to reach the account service. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid gap-4">
      <Field label="Full name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} required autoComplete="name" />
      <Field label="Email address" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} required autoComplete="email" />
      <Field label="Phone number" type="tel" value={form.phone} onChange={(event) => setForm({ ...form, phone: event.target.value })} required autoComplete="tel" />
      <Field label="Password" type="password" minLength={8} value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} required autoComplete="new-password" />
      <Field label="Confirm password" type="password" minLength={8} value={form.confirmPassword} onChange={(event) => setForm({ ...form, confirmPassword: event.target.value })} required autoComplete="new-password" />
      {error && <p role="alert" className="rounded-xl bg-red-50 px-3 py-2 text-sm font-semibold text-red-700">{error}</p>}
      {success && <p role="status" className="rounded-xl bg-emerald-50 px-3 py-2 text-sm font-semibold text-emerald-700">{success}</p>}
      <div className="pt-2">
        <Button type="submit" loading={submitting} loadingText="Creating...">Create admin</Button>
      </div>
    </form>
  );
}
