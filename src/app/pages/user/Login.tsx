"use client";

import { useState, useTransition } from "react";
import {
  startAuthentication,
  startRegistration,
} from "@simplewebauthn/browser";
import {
  finishPasskeyLogin,
  finishPasskeyRegistration,
  startPasskeyLogin,
  startPasskeyRegistration,
} from "./functions";
import { useTurnstile } from "@redwoodjs/sdk/turnstile";
import { Layout } from "../Layout";
import { Button } from "@/app/components/ui/button";
import { RouteOptions } from "@/worker";

// >>> Replace this with your own Cloudflare Turnstile site key
const TURNSTILE_SITE_KEY = "1x00000000000000000000AA";

export function LoginPage({ appContext }: RouteOptions) {
  const [username, setUsername] = useState("");
  const [result, setResult] = useState("");
  const [isPending, startTransition] = useTransition();
  const turnstile = useTurnstile(TURNSTILE_SITE_KEY);

  const passkeyLogin = async () => {
    // 1. Get a challenge from the worker
    const options = await startPasskeyLogin();

    // 2. Ask the browser to sign the challenge
    const login = await startAuthentication({ optionsJSON: options });

    // 3. Give the signed challenge to the worker to finish the login process
    const success = await finishPasskeyLogin(login);

    if (!success) {
      setResult("Login failed");
    } else {
      setResult("Login successful!");
    }
  };

  const passkeyRegister = async () => {
    // 1. Get a challenge from the worker
    const options = await startPasskeyRegistration(username);

    // 2. Ask the browser to sign the challenge
    const registration = await startRegistration({ optionsJSON: options });

    const turnstileToken = await turnstile.challenge();

    // 3. Give the signed challenge to the worker to finish the registration process
    const success = await finishPasskeyRegistration(
      username,
      registration,
      turnstileToken,
    );

    if (!success) {
      setResult("Registration failed");
    } else {
      setResult("Registration successful!");
    }
  };

  const handlePerformPasskeyLogin = () => {
    startTransition(() => void passkeyLogin());
  };

  const handlePerformPasskeyRegister = () => {
    startTransition(() => void passkeyRegister());
  };

  return (
    <Layout appContext={appContext}>
      <div ref={turnstile.ref} />
      <input
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        placeholder="Username"
      />
      <Button onClick={handlePerformPasskeyLogin} disabled={isPending}>
        {isPending ? <>...</> : "Login"}
      </Button>
      <Button onClick={handlePerformPasskeyRegister} disabled={isPending}>
        {isPending ? <>...</> : "Register"}
      </Button>
      {result && <div>{result}</div>}
    </Layout>
  );
}
