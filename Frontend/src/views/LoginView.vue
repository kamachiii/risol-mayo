<script setup>
import { ref } from "vue";
import axios from "axios";

const email = ref("");
const password = ref("");

const handleLogin = async () => {
  try {
    const response = await axios.post(
      "http://localhost:3000/api/auth/login",
      {
        email: email.value,
        password: password.value,
      }
    );

    localStorage.setItem(
      "token",
      response.data.token
    );

    alert("Login berhasil");
  } catch (error) {
    alert(
      error.response?.data?.message ||
      "Login gagal"
    );
  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-6">

    <div
      class="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
    >
      <div class="mb-8 text-center">
        <p class="text-sm uppercase tracking-[0.35em] text-cyan-300">
          Risol Mayo
        </p>

        <h1 class="mt-3 text-3xl font-bold text-white">
          Login
        </h1>

        <p class="mt-2 text-slate-400">
          Masuk ke akun Anda
        </p>
      </div>

      <form
        class="space-y-4"
        @submit.prevent="handleLogin"
      >
        <div>
          <label class="mb-2 block text-sm text-slate-300">
            Email
          </label>

          <input
            v-model="email"
            type="email"
            placeholder="Masukkan email"
            class="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm text-slate-300">
            Password
          </label>

          <input
            v-model="password"
            type="password"
            placeholder="Masukkan password"
            class="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-cyan-400 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Login
        </button>
      </form>

      <p class="mt-6 text-center text-slate-400">
        Belum punya akun?

        <RouterLink
          to="/register"
          class="font-semibold text-cyan-300"
        >
          Register
        </RouterLink>
      </p>
    </div>
  </div>
</template>