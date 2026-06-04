<script setup>
import { ref } from "vue";
import axios from "axios";

const nama = ref("");
const email = ref("");
const phone = ref("");
const password = ref("");

const handleRegister = async () => {
  try {

    await axios.post(
      "http://localhost:3000/api/auth/register",
      {
        nama: nama.value,
        email: email.value,
        phone: phone.value,
        password: password.value,
      }
    );

    alert("Register berhasil");

  } catch (error) {

    alert(
      error.response?.data?.message ||
      "Register gagal"
    );

  }
};
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-6 py-10">

    <div
      class="w-full max-w-lg rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur"
    >
      <div class="mb-8 text-center">
        <p class="text-sm uppercase tracking-[0.35em] text-cyan-300">
          Risol Mayo
        </p>

        <h1 class="mt-3 text-3xl font-bold text-white">
          Register
        </h1>

        <p class="mt-2 text-slate-400">
          Buat akun baru
        </p>
      </div>

      <form
        class="space-y-4"
        @submit.prevent="handleRegister"
      >
        <div>
          <label class="mb-2 block text-sm text-slate-300">
            Nama Lengkap
          </label>

          <input
            v-model="nama"
            type="text"
            placeholder="Nama lengkap"
            class="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm text-slate-300">
            Email
          </label>

          <input
            v-model="email"
            type="email"
            placeholder="Email"
            class="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
          />
        </div>

        <div>
          <label class="mb-2 block text-sm text-slate-300">
            Nomor HP
          </label>

          <input
            v-model="phone"
            type="text"
            placeholder="08xxxxxxxxxx"
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
            placeholder="Password"
            class="w-full rounded-xl border border-white/10 bg-slate-900 px-4 py-3 text-white outline-none focus:border-cyan-300"
          />
        </div>

        <button
          type="submit"
          class="w-full rounded-xl bg-cyan-400 py-3 font-semibold text-slate-950 transition hover:bg-cyan-300"
        >
          Register
        </button>
      </form>

      <p class="mt-6 text-center text-slate-400">
        Sudah punya akun?

        <RouterLink
          to="/login"
          class="font-semibold text-cyan-300"
        >
          Login
        </RouterLink>
      </p>
    </div>

  </div>
</template>