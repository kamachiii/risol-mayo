<script setup>
import { RouterLink, RouterView } from 'vue-router'
import { storeToRefs } from 'pinia'

import { useCounterStore } from './stores/counter'

const counterStore = useCounterStore()
const { count, doubleCount } = storeToRefs(counterStore)
</script>

<template>
  <div class="min-h-screen bg-slate-950 text-slate-100">
    <div class="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8 lg:px-10">
      <header class="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-6">
        <div>
          <p class="text-sm uppercase tracking-[0.4em] text-cyan-300/80">Vue Starter</p>
          <h1 class="mt-2 text-2xl font-semibold text-white">Router + Pinia + Tailwind</h1>
        </div>

        <nav class="flex items-center gap-3 text-sm">
          <RouterLink class="rounded-full border border-white/10 px-4 py-2 transition hover:border-cyan-300/50 hover:text-cyan-200" to="/">
            Home
          </RouterLink>
        </nav>
      </header>

      <main class="grid flex-1 gap-8 py-8 lg:grid-cols-[1.2fr_0.8fr] lg:items-start">
        <section class="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20 backdrop-blur">
          <p class="text-sm font-medium uppercase tracking-[0.35em] text-cyan-300">Dashboard</p>
          <h2 class="mt-4 max-w-xl text-4xl font-semibold leading-tight text-white">
            Setup awal Vue sudah aktif dan siap dipakai untuk fitur berikutnya.
          </h2>
          <p class="mt-4 max-w-2xl text-base leading-7 text-slate-300">
            Router, Pinia, dan Tailwind sudah terhubung. Silakan lanjut bikin halaman dan state sesuai kebutuhan aplikasimu.
          </p>

          <div class="mt-8 flex flex-wrap gap-4">
            <RouterLink class="rounded-full bg-cyan-400 px-5 py-3 font-medium text-slate-950 transition hover:bg-cyan-300" to="/">
              Lihat Home
            </RouterLink>
            <a class="rounded-full border border-white/15 px-5 py-3 font-medium text-white transition hover:border-white/30 hover:bg-white/5" href="https://vuejs.org/" target="_blank" rel="noreferrer">
              Dokumentasi Vue
            </a>
          </div>
        </section>

        <aside class="grid gap-4">
          <div class="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
            <p class="text-sm uppercase tracking-[0.3em] text-slate-400">Pinia</p>
            <p class="mt-3 text-3xl font-semibold text-white">{{ count }}</p>
            <p class="mt-1 text-sm text-slate-400">Double count: {{ doubleCount }}</p>
            <button
              class="mt-5 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-950 transition hover:bg-cyan-200"
              type="button"
              @click="counterStore.increment"
            >
              Increment
            </button>
          </div>

          <div class="rounded-3xl border border-white/10 bg-white/5 p-6 text-sm leading-6 text-slate-300">
            <p class="font-medium text-white">Status setup</p>
            <ul class="mt-3 space-y-2">
              <li>Vue 3 sudah terpasang.</li>
              <li>Vue Router aktif dengan route awal.</li>
              <li>Pinia siap dipakai sebagai store.</li>
              <li>Tailwind v4 sudah tersambung ke Vite.</li>
            </ul>
          </div>
        </aside>
      </main>

      <RouterView />
    </div>
  </div>
</template>

<style scoped></style>
