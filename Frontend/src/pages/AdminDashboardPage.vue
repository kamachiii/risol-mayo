1|<script setup>
2|import { ref, computed, onMounted, shallowRef } from 'vue'
3|import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js'
4|import { Doughnut, Bar } from 'vue-chartjs'
5|
6|ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)
7|import { useAuthStore } from '@/stores/auth'
8|import { useToast } from '@/composables/useToast'
9|import api from '@/services/api'
10|
11|const auth = useAuthStore()
12|const toast = useToast()
13|const orders = ref([])
14|const loading = ref(true)
15|const proofModal = ref(null)
16|
17|const openProof = (url) => {
18|  proofModal.value = url
19|}
20|const error = ref('')
21|const updatingId = ref(null)
22|const activeFilter = ref('all')
23|const expandedId = ref(null)
24|
25|const allStatusOptions = [
26|  { value: 'pending', label: 'Menunggu', color: 'warning' },
27|  { value: 'paid', label: 'Dibayar', color: 'warning' },
28|  { value: 'confirmed', label: 'Dikonfirmasi', color: 'info' },
29|  { value: 'processing', label: 'Diproses', color: 'primary' },
30|  { value: 'shipped', label: 'Dikirim', color: 'primary' },
31|  { value: 'delivered', label: 'Diterima', color: 'success' },
32|  { value: 'completed', label: 'Selesai', color: 'success' },
33|  { value: 'cancelled', label: 'Dibatalkan', color: 'error' }
34|]
35|
36|const statusFlow = {
37|  pending:  ['confirmed', 'paid', 'cancelled'],
38|  paid:     ['confirmed', 'processing', 'cancelled'],
39|  confirmed:['processing', 'cancelled'],
40|  processing:['shipped', 'cancelled'],
41|  shipped:  ['delivered', 'cancelled'],
42|  delivered: ['completed'],
43|  completed: [],
44|  cancelled: []
45|}
46|
47|const getNextOptions = (currentStatus) => {
48|  const next = statusFlow[currentStatus] || []
49|  return allStatusOptions.filter(s => next.includes(s.value))
50|}
51|
52|const isTerminal = (s) => s === 'completed' || s === 'cancelled'
53|
54|const filterOptions = computed(() => [
55|  { value: 'all', label: 'Semua' },
56|  ...allStatusOptions
57|])
58|
59|const statusSteps = ['pending', 'paid', 'confirmed', 'processing', 'shipped', 'delivered', 'completed']
60|
61|// Group flat rows into orders with items
62|// Backend already returns grouped data with nested items[]
63|const groupedOrders = computed(() => orders.value)
64|
65|// Filtered orders
66|const filteredOrders = computed(() => {
67|  if (activeFilter.value === 'all') return groupedOrders.value
68|  return groupedOrders.value.filter(o => o.status === activeFilter.value)
69|})
70|
71|// Stats
72|const stats = computed(() => {
73|  const total = groupedOrders.value.length
74|  const pending = groupedOrders.value.filter(o => o.status === 'pending').length
75|  const processing = groupedOrders.value.filter(o => ['confirmed', 'processing', 'shipped'].includes(o.status)).length
76|  const completed = groupedOrders.value.filter(o => ['completed', 'delivered'].includes(o.status)).length
77|  // #7: Only count completed/delivered as actual revenue (paid = waiting fulfillment)
78|  const totalRevenue = groupedOrders.value
79|    .filter(o => ['completed', 'delivered'].includes(o.status))
80|    .reduce((sum, o) => sum + Number(o.total_amount), 0)
81|  return { total, pending, processing, completed, totalRevenue }
82|})
83|
84|// Chart: Status distribution (doughnut)
85|const statusChartData = computed(() => {
86|  const counts = {}
87|  for (const o of groupedOrders.value) {
88|    counts[o.status] = (counts[o.status] || 0) + 1
89|  }
90|  const labels = allStatusOptions.map(s => s.label)
91|  const data = allStatusOptions.map(s => counts[s.value] || 0)
92|  const colors = ['#f59e0b', '#3b82f6', '#0ea5e9', '#0284c7', '#10b981', '#059669', '#ef4444', '#f59e0b']
93|  return {
94|    labels,
95|    datasets: [{ data, backgroundColor: colors, borderWidth: 0, hoverOffset: 4 }]
96|  }
97|})
98|const statusChartOptions = { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'bottom', labels: { padding: 12, usePointStyle: true, pointStyle: 'circle', font: { size: 11 } } } } }
99|
100|// Chart: Revenue by day (bar)
101|const revenueChartData = computed(() => {
102|  const daily = {}
103|  for (const o of groupedOrders.value) {
104|    if (['completed', 'delivered'].includes(o.status)) {
105|      const day = new Date(o.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })
106|      daily[day] = (daily[day] || 0) + Number(o.total_amount)
107|    }
108|  }
109|  const entries = Object.entries(daily).slice(-7).reverse()
110|  return {
111|    labels: entries.map(e => e[0]),
112|    datasets: [{
113|      label: 'Pendapatan',
114|      data: entries.map(e => e[1]),
115|      backgroundColor: '#63A8B3',
116|      borderRadius: 6,
117|      barThickness: 28
118|    }]
119|  }
120|})
121|const revenueChartOptions = {
122|  responsive: true, maintainAspectRatio: false,
123|  plugins: { legend: { display: false } },
124|  scales: { y: { beginAtZero: true, ticks: { callback: v => 'Rp' + (v/1000).toFixed(0) + 'k', font: { size: 11 } }, grid: { color: '#f3f4f6' } }, x: { grid: { display: false }, ticks: { font: { size: 11 } } } }
125|}
126|
127|const fetchOrders = async () => {
128|  loading.value = true
129|  error.value = ''
130|  try {
131|    const { data } = await api.get('/orders')
132|    orders.value = data.data || []
133|  } catch (e) {
134|    error.value = e.response?.data?.message || 'Gagal memuat pesanan'
135|  } finally {
136|    loading.value = false
137|  }
138|}
139|
140|const updateStatus = async (orderId, newStatus) => {
141|  updatingId.value = orderId
142|  try {
143|    await api.put(`/orders/${orderId}/status`, { status: newStatus })
144|    await fetchOrders()
145|  } catch (e) {
146|    toast.error(e.response?.data?.message || 'Gagal update status')
147|  } finally {
148|    updatingId.value = null
149|  }
150|}
151|
152|const toggleExpand = (id) => {
153|  expandedId.value = expandedId.value === id ? null : id
154|}
155|
156|const formatDate = (d) => new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })
157|const formatCurrency = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')
158|
159|const getStatusLabel = (val) => allStatusOptions.find(s => s.value === val)?.label || val
160|const getStatusColor = (val) => allStatusOptions.find(s => s.value === val)?.color || 'muted'
161|
162|const getStepIndex = (status) => statusSteps.indexOf(status)
163|
164|onMounted(fetchOrders)
165|</script>
166|
167|<template>
168|  <div class="admin-page">
169|170|    <div class="admin-top">
171|      <div class="admin-tabs">
172|        <router-link to="/admin" class="admin-tab active">Pesanan</router-link>
173|        <router-link to="/admin/products" class="admin-tab">Produk</router-link>
174|        <router-link to="/admin/users" class="admin-tab">User</router-link>
175|        <router-link to="/admin/categories" class="admin-tab">Kategori</router-link>
176|      </div>
177|    </div>
178|180|    <div class="admin-header">
181|      <div>
182|        <h1 class="page-title">
183|          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
184|            <rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/>
185|            <rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/>
186|          </svg>
187|          Admin Dashboard
188|        </h1>
189|        <p class="header-sub">Kelola pesanan dan aktivitas toko</p>
190|      </div>
191|    </div>
192|
193|    <!-- Stats -->
194|    <div class="stats-grid">
195|      <div class="glass-card stat-card" @click="activeFilter = 'all'" :class="{ active: activeFilter === 'all' }">
196|        <span class="stat-icon stat-icon-total">
197|          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
198|            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
199|          </svg>
200|        </span>
201|        <div class="stat-info">
202|          <span class="stat-value">{{ stats.total }}</span>
203|          <span class="stat-label">Total Pesanan</span>
204|        </div>
205|      </div>
206|      <div class="glass-card stat-card" @click="activeFilter = 'pending'" :class="{ active: activeFilter === 'pending' }">
207|        <span class="stat-icon stat-icon-warning">
208|          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
209|            <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
210|          </svg>
211|        </span>
212|        <div class="stat-info">
213|          <span class="stat-value">{{ stats.pending }}</span>
214|          <span class="stat-label">Menunggu</span>
215|        </div>
216|      </div>
217|      <div class="glass-card stat-card" @click="activeFilter = 'processing'" :class="{ active: activeFilter === 'processing' }">
218|        <span class="stat-icon stat-icon-info">
219|          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
220|            <polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 102.13-9.36L1 10"/>
221|          </svg>
222|        </span>
223|        <div class="stat-info">
224|          <span class="stat-value">{{ stats.processing }}</span>
225|          <span class="stat-label">Aktif</span>
226|        </div>
227|      </div>
228|      <div class="glass-card stat-card" @click="activeFilter = 'completed'" :class="{ active: activeFilter === 'completed' }">
229|        <span class="stat-icon stat-icon-success">
230|          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
231|            <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
232|          </svg>
233|        </span>
234|        <div class="stat-info">
235|          <span class="stat-value">{{ stats.completed }}</span>
236|          <span class="stat-label">Selesai</span>
237|        </div>
238|      </div>
239|    </div>
240|
241|    <!-- Revenue banner -->
242|    <div class="revenue-banner glass-card">
243|      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
244|        <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
245|      </svg>
246|      <span>Pendapatan: <strong>{{ formatCurrency(stats.totalRevenue) }}</strong></span>
247|    </div>
248|
249|    <!-- Charts -->
250|    <div class="charts-grid" v-if="!loading && !error">
251|      <div class="glass-card chart-card">
252|        <h3 class="chart-title">Status Pesanan</h3>
253|        <div class="chart-wrap">
254|          <Doughnut :data="statusChartData" :options="statusChartOptions" />
255|        </div>
256|      </div>
257|      <div class="glass-card chart-card">
258|        <h3 class="chart-title">Pendapatan Harian</h3>
259|        <div class="chart-wrap">
260|          <Bar :data="revenueChartData" :options="revenueChartOptions" />
261|        </div>
262|      </div>
263|    </div>
264|
265|    <!-- Filter tabs -->
266|    <div class="filter-tabs">
267|      <button
268|        v-for="opt in filterOptions"
269|        :key="opt.value"
270|        class="filter-tab"
271|        :class="{ active: activeFilter === opt.value }"
272|        @click="activeFilter = opt.value"
273|      >
274|        {{ opt.label }}
275|        <span v-if="opt.value !== 'all'" class="filter-count">
276|          {{ groupedOrders.filter(o => o.status === opt.value).length }}
277|        </span>
278|      </button>
279|    </div>
280|
281|    <!-- Loading -->
282|    <div v-if="loading" class="loading-grid">
283|      <div v-for="i in 3" :key="i" class="glass-card" style="padding: 20px;">
284|        <div class="skeleton" style="height: 14px; width: 50%; margin-bottom: 8px;"></div>
285|        <div class="skeleton" style="height: 12px; width: 30%;"></div>
286|      </div>
287|    </div>
288|
289|    <!-- Error -->
290|    <div v-else-if="error" class="glass-card error-card">
291|      <p>{{ error }}</p>
292|      <button class="btn btn-primary btn-sm" @click="fetchOrders">Coba Lagi</button>
293|    </div>
294|
295|    <!-- Orders List -->
296|    <div v-else class="orders-list">
297|      <div v-if="filteredOrders.length === 0" class="glass-card empty-card">
298|        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
299|          <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
300|        </svg>
301|        <p>Tidak ada pesanan</p>
302|      </div>
303|
304|      <div
305|        v-for="order in filteredOrders"
306|        :key="order.id"
307|        class="order-card glass-card"
308|        :class="{ expanded: expandedId === order.id }"
309|      >
310|        <!-- Order Header -->
311|        <div class="order-header" @click="toggleExpand(order.id)">
312|          <div class="order-main">
313|            <span class="order-id">#{{ order.id }}</span>
314|            <span class="order-user">{{ order.user_name }}</span>
315|            <span class="order-date">{{ formatDate(order.created_at) }}</span>
316|          </div>
317|          <div class="order-right">
318|            <span class="order-total">{{ formatCurrency(order.total_amount) }}</span>
319|            <span class="badge" :class="`badge-${getStatusColor(order.status)}`">
320|              {{ getStatusLabel(order.status) }}
321|            </span>
322|            <span class="expand-icon" :class="{ rotated: expandedId === order.id }">
323|              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
324|                <polyline points="6 9 12 15 18 9"/>
325|              </svg>
326|            </span>
327|          </div>
328|        </div>
329|
330|        <!-- Status Stepper -->
331|        <div v-if="expandedId === order.id" class="order-detail">
332|          <div class="status-stepper">
333|            <div
334|              v-for="(step, idx) in statusSteps"
335|              :key="step"
336|              class="step"
337|              :class="{
338|                active: getStepIndex(order.status) >= idx,
339|                current: order.status === step
340|              }"
341|            >
342|              <div class="step-dot">
343|                <svg v-if="getStepIndex(order.status) > idx" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
344|                  <polyline points="20 6 9 17 4 12"/>
345|                </svg>
346|                <span v-else>{{ idx + 1 }}</span>
347|              </div>
348|              <span class="step-label">{{ getStatusLabel(step) }}</span>
349|              <div v-if="idx < statusSteps.length - 1" class="step-line" :class="{ filled: getStepIndex(order.status) > idx }"></div>
350|            </div>
351|          </div>
352|
353|          <!-- Customer -->
354|          <div class="order-address">
355|            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
356|            {{ order.user_name || 'Pelanggan' }} <span style="color:#9ca3af">{{ order.user_email ? `(${order.user_email})` : '' }}</span>
357|          </div>
358|
359|          <!-- Order Items -->
360|          <div class="order-items">
361|            <h4>Item Pesanan</h4>
362|            <div v-for="item in order.items" :key="item.id" class="order-item">
363|              <img
364|                v-if="item.image_url"
365|                :src="`${item.image_url}`"
366|                :alt="item.product_name"
367|                class="item-thumb"
368|              />
369|              <div class="item-info">
370|                <span class="item-name">{{ item.product_name }}</span>
371|                <span class="item-qty">{{ item.quantity }}x {{ formatCurrency(item.price_at_purchase) }}</span>
372|              </div>
373|              <span class="item-subtotal">{{ formatCurrency(item.quantity * item.price_at_purchase) }}</span>
374|            </div>
375|          </div>
376|
377|          <!-- Payment info -->
378|          <div v-if="order.payment_method" class="order-address">
379|            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="22" height="16" rx="2" ry="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
380|            {{ order.payment_method }}<span v-if="order.bank_name"> - {{ order.bank_name }}</span>
381|          </div>
382|          <!-- Delivery Type -->
383|          <div class="order-address" style="display:flex;align-items:center;gap:6px;">
384|            <svg v-if="order.shipping_address === 'Ambil di toko'" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#059669" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
385|              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
386|            </svg>
387|            <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
388|              <rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
389|            </svg>
390|            <span :style="{ color: order.shipping_address === 'Ambil di toko' ? '#059669' : '#2563eb', fontWeight: 600, fontSize: '12px' }">
391|              {{ order.shipping_address === 'Ambil di toko' ? 'Ambil di Toko' : 'Diantar ke Alamat' }}
392|            </span>
393|          </div>
394|
395|          <!-- Address -->
396|          <div v-if="order.shipping_address" class="order-address">
397|            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
398|              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z"/><circle cx="12" cy="10" r="3"/>
399|            </svg>
400|            {{ order.shipping_address }}
401|          </div>
402|
403|          <!-- Bukti Transfer -->
404|          <div v-if="order.payment_proof" class="proof-section">
405|            <div class="proof-header">
406|              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
407|              Bukti Transfer
408|            </div>
409|            <div class="proof-image-wrap" @click="openProof(order.payment_proof)">
410|              <img :src="order.payment_proof" class="proof-thumb" alt="Bukti transfer" />
411|              <div class="proof-overlay">
412|                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>
413|              </div>
414|            </div>
415|          </div>
416|
417|          <!-- Proof Modal -->
418|          <div v-if="proofModal" class="modal-backdrop" @click.self="proofModal = null">
419|            <div class="proof-modal">
420|              <button class="proof-close" @click="proofModal = null">✕</button>
421|              <img :src="proofModal" class="proof-full" alt="Bukti transfer" />
422|            </div>
423|          </div>
424|
425|          <!-- Action -->
426|          <div class="order-actions">
427|            <template v-if="isTerminal(order.status)">
428|              <span class="terminal-badge" :class="`badge-${getStatusColor(order.status)}`">
429|                {{ order.status === 'completed' ? '✓ Selesai' : '✕ Dibatalkan' }}
430|              </span>
431|            </template>
432|            <template v-else>
433|              <label class="action-label">Ubah ke:</label>
434|              <div class="next-status-btns">
435|                <button
436|                  v-for="opt in getNextOptions(order.status)"
437|                  :key="opt.value"
438|                  class="status-btn"
439|                  :class="`status-btn-${opt.color}`"
440|                  :disabled="updatingId === order.id"
441|                  @click="updateStatus(order.id, opt.value)"
442|                >
443|                  <span v-if="updatingId === order.id" class="spinner-sm"></span>
444|                  {{ opt.label }}
445|                </button>
446|              </div>
447|            </template>
448|          </div>
449|        </div>
450|      </div>
451|    </div>
452|  </div>
453|</template>
454|
455|<style scoped>
456|.admin-page { display: flex; flex-direction: column; gap: 16px; padding: 24px; max-width: 1100px; margin: 0 auto; }
457|458|.admin-top { display: flex; align-items: center; margin-bottom: 16px; }
459|461|.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
462|.admin-header h1 { font-size: 22px; font-weight: 700; }
463|.header-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
464|.page-title { display: flex; align-items: center; gap: 8px; font-size: 22px; font-weight: 700; color: var(--text-primary); margin: 0; }
465|
466|/* Tabs */
467|468|.admin-tabs { display: flex; gap: 4px; background: var(--border-light); padding: 4px; border-radius: 10px; }
469|.admin-tab { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none; color: var(--text-muted); transition: all 0.15s; }
470|.admin-tab.active, .admin-tab.router-link-exact-active { background: #fff; color: var(--brand); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
471|.admin-tab:hover { color: var(--text-secondary); }
472|474|
475|/* Stats */
476|.stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 12px; }
477|.stat-card { display: flex; align-items: center; gap: 12px; padding: 16px; cursor: pointer; transition: all 0.15s; border: 2px solid transparent; }
478|.stat-card:hover { transform: translateY(-1px); }
479|.stat-card.active { border-color: #63A8B3; background: #f0fdfa; }
480|.stat-icon { width: 44px; height: 44px; border-radius: 12px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
481|.stat-icon-total { background: #ede9fe; color: #7c3aed; }
482|.stat-icon-warning { background: #fef3c7; color: #d97706; }
483|.stat-icon-info { background: #dbeafe; color: #2563eb; }
484|.stat-icon-success { background: #d1fae5; color: #059669; }
485|.stat-info { display: flex; flex-direction: column; }
486|.stat-value { font-size: 20px; font-weight: 700; color: var(--text-primary); }
487|.stat-label { font-size: 12px; color: var(--text-muted); }
488|
489|/* Revenue */
490|.revenue-banner { display: flex; align-items: center; gap: 8px; padding: 12px 16px; font-size: 14px; color: var(--text-secondary); }
491|.revenue-banner strong { color: #059669; }
492|
493|/* Charts */
494|.charts-grid { display: grid; grid-template-columns: 1fr 2fr; gap: 12px; }
495|.chart-card { padding: 16px; }
496|.chart-title { font-size: 14px; font-weight: 600; color: var(--text-secondary); margin: 0 0 12px; }
497|.chart-wrap { height: 200px; position: relative; }
498|
499|/* Proof */
500|.proof-section { margin-top: 8px; }
501|.proof-header { display: flex; align-items: center; gap: 6px; font-size: 12px; font-weight: 600; color: var(--text-secondary); margin-bottom: 8px; }
502|.proof-image-wrap { position: relative; width: 120px; height: 120px; border-radius: 10px; overflow: hidden; cursor: pointer; border: 2px solid var(--border-light); }
503|.proof-thumb { width: 100%; height: 100%; object-fit: cover; }
504|.proof-overlay { position: absolute; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; opacity: 0; transition: opacity 0.2s; color: white; }
505|.proof-image-wrap:hover .proof-overlay { opacity: 1; }
506|.modal-backdrop { position: fixed; inset: 0; background: rgba(0,0,0,0.6); z-index: 1000; display: flex; align-items: center; justify-content: center; backdrop-filter: blur(4px); }
507|.proof-modal { position: relative; max-width: 90vw; max-height: 90vh; border-radius: 12px; overflow: hidden; background: white; }
508|.proof-close { position: absolute; top: 8px; right: 8px; width: 32px; height: 32px; border-radius: 50%; border: none; background: rgba(0,0,0,0.5); color: white; font-size: 14px; cursor: pointer; z-index: 1; display: flex; align-items: center; justify-content: center; }
509|.proof-full { max-width: 80vw; max-height: 85vh; object-fit: contain; }
510|
511|/* Custom Select */
512|.custom-select-wrap { position: relative; display: inline-block; }
513|.custom-select-wrap .status-select { appearance: none; padding-right: 28px; padding-left: 12px; padding-top: 6px; padding-bottom: 6px; border-radius: 8px; border: 1.5px solid var(--border-medium); background: white; font-size: 13px; font-weight: 500; cursor: pointer; min-width: 160px; }
514|.next-status-btns { display: flex; flex-wrap: wrap; gap: 6px; }
515|
516|.status-btn {
517|  padding: 6px 14px;
518|  border-radius: 8px;
519|  border: 1.5px solid var(--border-medium);
520|  background: white;
521|  font-size: 12px;
522|  font-weight: 600;
523|  cursor: pointer;
524|  transition: all 0.15s;
525|  display: flex;
526|  align-items: center;
527|  gap: 6px;
528|}
529|
530|.status-btn:hover:not(:disabled) { transform: translateY(-1px); box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
531|.status-btn:disabled { opacity: 0.5; cursor: not-allowed; }
532|
533|.status-btn-warning { border-color: #f59e0b; color: #b45309; }
534|.status-btn-warning:hover:not(:disabled) { background: #fffbeb; border-color: #f59e0b; }
535|
536|.status-btn-info { border-color: #3b82f6; color: #1d4ed8; }
537|.status-btn-info:hover:not(:disabled) { background: #eff6ff; border-color: #3b82f6; }
538|
539|.status-btn-primary { border-color: #0ea5e9; color: #0369a1; }
540|.status-btn-primary:hover:not(:disabled) { background: #f0f9ff; border-color: #0ea5e9; }
541|
542|.status-btn-success { border-color: #10b981; color: #047857; }
543|.status-btn-success:hover:not(:disabled) { background: #ecfdf5; border-color: #10b981; }
544|
545|.status-btn-error { border-color: #ef4444; color: #dc2626; }
546|.status-btn-error:hover:not(:disabled) { background: #fef2f2; border-color: #ef4444; }
547|
548|.terminal-badge {
549|  padding: 6px 14px;
550|  border-radius: 8px;
551|  font-size: 12px;
552|  font-weight: 600;
553|}
554|
555|.terminal-badge.badge-success { background: #ecfdf5; color: #047857; }
556|.terminal-badge.badge-error { background: #fef2f2; color: #dc2626; }
557|
558|.spinner-sm {
559|  width: 12px; height: 12px;
560|  border: 2px solid currentColor;
561|  border-top-color: transparent;
562|  border-radius: 50%;
563|  animation: spin 0.6s linear infinite;
564|}
565|.select-arrow { position: absolute; right: 10px; top: 50%; transform: translateY(-50%); pointer-events: none; color: var(--text-muted); }
566|
567|/* Filter Tabs */
568|.filter-tabs { display: flex; gap: 6px; flex-wrap: wrap; }
569|.filter-tab {
570|  display: flex; align-items: center; gap: 4px; padding: 6px 12px; border: 1px solid #e5e7eb;
571|  border-radius: 999px; font-size: 12px; font-weight: 500; color: var(--text-muted); background: #fff;
572|  cursor: pointer; transition: all 0.15s;
573|}
574|.filter-tab:hover { border-color: #63A8B3; color: #63A8B3; }
575|.filter-tab.active { background: #63A8B3; color: #fff; border-color: #63A8B3; }
576|.filter-count { font-size: 11px; opacity: 0.7; }
577|
578|/* Glass Card */
579|.glass-card { background: #fff; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
580|
581|/* Loading */
582|.loading-grid { display: flex; flex-direction: column; gap: 8px; }
583|.skeleton { background: linear-gradient(90deg, #f3f4f6 25%, #e5e7eb 50%, #f3f4f6 75%); background-size: 200% 100%; animation: shimmer 1.5s infinite; border-radius: 6px; }
584|@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
585|
586|/* Error */
587|.error-card { padding: 24px; text-align: center; color: #dc2626; }
588|.btn { padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; }
589|.btn-primary { background: #63A8B3; color: #fff; }
590|.btn-primary:hover { background: #4a9aa8; }
591|.btn-sm { padding: 6px 12px; font-size: 12px; }
592|
593|/* Empty */
594|.empty-card { padding: 48px; text-align: center; color: var(--text-muted); display: flex; flex-direction: column; align-items: center; gap: 12px; }
595|
596|/* Orders List */
597|.orders-list { display: flex; flex-direction: column; gap: 8px; }
598|
599|/* Order Card */
600|.order-card { overflow: hidden; transition: all 0.2s; }
601|.order-card.expanded { box-shadow: 0 4px 12px rgba(0,0,0,0.08); }
602|
603|.order-header {
604|  display: flex; justify-content: space-between; align-items: center; padding: 14px 16px;
605|  cursor: pointer; gap: 12px; transition: background 0.15s;
606|}
607|.order-header:hover { background: #f9fafb; }
608|.order-main { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
609|.order-id { font-weight: 700; color: var(--text-primary); font-size: 14px; }
610|.order-user { font-size: 13px; color: var(--text-secondary); }
611|.order-date { font-size: 12px; color: var(--text-muted); }
612|.order-right { display: flex; align-items: center; gap: 10px; }
613|.order-total { font-weight: 600; color: var(--text-primary); font-size: 14px; }
614|.expand-icon { transition: transform 0.2s; color: var(--text-muted); display: flex; }
615|.expand-icon.rotated { transform: rotate(180deg); }
616|
617|/* Badges */
618|.badge { padding: 3px 10px; border-radius: 999px; font-size: 11px; font-weight: 600; white-space: nowrap; }
619|.badge-warning { background: #fef3c7; color: #92400e; }
620|.badge-info { background: #dbeafe; color: #1e40af; }
621|.badge-primary { background: #e0f2fe; color: #0369a1; }
622|.badge-success { background: #d1fae5; color: #065f46; }
623|.badge-error { background: #fee2e2; color: #991b1b; }
624|.badge-muted { background: var(--border-light); color: var(--text-muted); }
625|
626|/* Order Detail */
627|.order-detail { padding: 0 16px 16px; border-top: 1px solid #f3f4f6; }
628|
629|/* Status Stepper */
630|.status-stepper { display: flex; align-items: center; padding: 20px 0; gap: 0; }
631|.step { display: flex; flex-direction: column; align-items: center; position: relative; flex: 1; }
632|.step-dot {
633|  width: 28px; height: 28px; border-radius: 50%; display: flex; align-items: center; justify-content: center;
634|  font-size: 11px; font-weight: 600; background: var(--border-light); color: var(--text-muted); border: 2px solid #e5e7eb;
635|  transition: all 0.2s; z-index: 1;
636|}
637|.step.active .step-dot { background: #63A8B3; color: #fff; border-color: #63A8B3; }
638|.step.current .step-dot { box-shadow: 0 0 0 4px rgba(99,168,179,0.2); transform: scale(1.1); }
639|.step-label { font-size: 10px; color: var(--text-muted); margin-top: 6px; white-space: nowrap; }
640|.step.active .step-label { color: var(--text-secondary); font-weight: 500; }
641|.step-line {
642|  position: absolute; top: 14px; left: 50%; width: 100%; height: 2px; background: #e5e7eb; z-index: 0;
643|}
644|.step-line.filled { background: #63A8B3; }
645|
646|/* Order Items */
647|.order-items { margin-top: 12px; }
648|.order-items h4 { font-size: 13px; font-weight: 600; color: var(--text-secondary); margin: 0 0 8px; }
649|.order-item { display: flex; align-items: center; gap: 10px; padding: 8px 0; border-bottom: 1px solid #f9fafb; }
650|.order-item:last-child { border-bottom: none; }
651|.item-thumb { width: 40px; height: 40px; border-radius: 8px; object-fit: cover; }
652|.item-info { flex: 1; display: flex; flex-direction: column; }
653|.item-name { font-size: 13px; font-weight: 500; color: var(--text-secondary); }
654|.item-qty { font-size: 12px; color: var(--text-muted); }
655|.item-subtotal { font-size: 13px; font-weight: 600; color: var(--text-primary); }
656|
657|/* Address */
658|.order-address { display: flex; align-items: center; gap: 6px; margin-top: 12px; padding: 10px 12px; background: #f9fafb; border-radius: 8px; font-size: 12px; color: var(--text-muted); }
659|
660|/* Actions */
661|.order-actions { display: flex; align-items: center; gap: 8px; margin-top: 12px; }
662|.action-label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
663|.status-select {
664|  padding: 6px 10px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 12px;
665|  font-family: inherit; background: #fff; cursor: pointer; transition: border 0.2s;
666|}
667|.status-select:focus { border-color: #63A8B3; outline: none; }
668|</style>
669|