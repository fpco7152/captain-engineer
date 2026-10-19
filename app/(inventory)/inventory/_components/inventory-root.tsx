"use client"

import { useCallback, useEffect, useState } from "react"
import { Loader2, Lock, Syringe } from "lucide-react"
import { Toaster } from "sonner"
import type { Session } from "@supabase/supabase-js"
import { supabase } from "@/lib/supabase"
import { type Staff, friendlyError } from "./types"
import { ChangePasswordForm, PasswordInput, btn } from "./dialogs"
import { FieldLabel } from "./fields"
import { InventoryApp } from "./inventory-app"

type State =
  | { kind: "loading" }
  | { kind: "signedOut" }
  | { kind: "noAccess"; email: string }
  | { kind: "error"; message: string }
  | { kind: "ready"; session: Session; me: Staff }

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-gradient-to-br from-teal-50 via-slate-50 to-amber-50 px-4 py-10 text-slate-900">
      <div className="w-full max-w-sm">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-700 text-white shadow-lg shadow-teal-700/20">
            <Syringe className="h-6 w-6" />
          </div>
          <h1 className="mt-3 text-xl font-bold">Med Spa Inventory</h1>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-900/5">{children}</div>
      </div>
    </div>
  )
}

function LoginForm() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState("")

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    if (!email.trim() || !password) return setError("Enter your email and password.")
    setBusy(true)
    const { error: err } = await supabase.auth.signInWithPassword({ email: email.trim(), password })
    setBusy(false)
    if (err) {
      setError(/rate|too many/i.test(err.message) ? "Too many attempts. Wait a few minutes and try again." : friendlyError(err))
    }
  }

  return (
    <Shell>
      <form onSubmit={submit} className="space-y-4">
        <div>
          <FieldLabel htmlFor="email">Email</FieldLabel>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            autoCapitalize="none"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 w-full rounded-lg border border-slate-300 px-3 shadow-sm outline-none focus:border-teal-600 focus:ring-2 focus:ring-teal-600/20"
          />
        </div>
        <div>
          <FieldLabel htmlFor="password">Password</FieldLabel>
          <PasswordInput id="password" value={password} onChange={setPassword} autoComplete="current-password" />
        </div>
        {error && (
          <p role="alert" className="rounded-lg bg-rose-50 px-3 py-2 text-sm text-rose-700">
            {error}
          </p>
        )}
        <button type="submit" className={`${btn.primary} w-full`} disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Lock className="h-4 w-4" />}
          Sign in
        </button>
        <p className="text-center text-xs text-slate-500">Forgot your password? Ask the owner to reset it from Team logins.</p>
      </form>
    </Shell>
  )
}

export function InventoryRoot() {
  const [state, setState] = useState<State>({ kind: "loading" })

  const resolve = useCallback(async (session: Session | null) => {
    if (!session) return setState({ kind: "signedOut" })
    const { data, error } = await supabase.from("staff").select("*").eq("user_id", session.user.id).maybeSingle()
    if (error) return setState({ kind: "error", message: friendlyError(error) })
    if (!data || !(data as Staff).active) return setState({ kind: "noAccess", email: session.user.email ?? "" })
    setState({ kind: "ready", session, me: data as Staff })
  }, [])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => resolve(data.session))
    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT") {
        // Defer: supabase-js warns against awaiting its own calls inside this callback.
        setTimeout(() => resolve(session), 0)
      }
    })
    return () => sub.subscription.unsubscribe()
  }, [resolve])

  let body: React.ReactNode
  if (state.kind === "loading") {
    body = (
      <div className="flex min-h-dvh items-center justify-center bg-slate-50">
        <Loader2 className="h-7 w-7 animate-spin text-teal-700" aria-label="Loading" />
      </div>
    )
  } else if (state.kind === "signedOut") {
    body = <LoginForm />
  } else if (state.kind === "error") {
    body = (
      <Shell>
        <p className="text-slate-700">{state.message}</p>
        <button className={`${btn.primary} mt-4 w-full`} onClick={() => window.location.reload()}>
          Try again
        </button>
      </Shell>
    )
  } else if (state.kind === "noAccess") {
    body = (
      <Shell>
        <p className="font-semibold">This login doesn&apos;t have access</p>
        <p className="mt-1 text-sm text-slate-600">
          {state.email} isn&apos;t on the team list. Ask the owner to add you from Team logins.
        </p>
        <button className={`${btn.secondary} mt-4 w-full`} onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </Shell>
    )
  } else if (state.me.must_change_password) {
    body = (
      <Shell>
        <p className="font-semibold">Welcome, {state.me.display_name}</p>
        <p className="mb-4 mt-1 text-sm text-slate-600">Choose your own password to finish setting up your login.</p>
        <ChangePasswordForm submitLabel="Save and continue" onDone={() => setState({ ...state, me: { ...state.me, must_change_password: false } })} />
        <button className="mt-3 w-full text-center text-sm text-slate-500 underline" onClick={() => supabase.auth.signOut()}>
          Sign out
        </button>
      </Shell>
    )
  } else {
    body = (
      <InventoryApp
        me={state.me}
        email={state.session.user.email ?? ""}
        onStaffChanged={() => resolve(state.session)}
      />
    )
  }

  return (
    <>
      {body}
      <Toaster position="top-center" richColors closeButton toastOptions={{ duration: 5000 }} />
    </>
  )
}
