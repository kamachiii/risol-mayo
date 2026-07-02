1|<script setup>
2|import { ref, onMounted, computed } from 'vue'
3|import { useToast } from '@/composables/useToast'
4|import api from '@/services/api'
5|import ConfirmModal from '@/components/common/ConfirmModal.vue'
6|
7|const toast = useToast()
8|const categories = ref([])
9|const loading = ref(true)
10|const showModal = ref(false)
11|const editMode = ref(false)
12|const editId = ref(null)
13|const saving = ref(false)
14|const deletingId = ref(null)
15|
16|const form = ref({ name: '' })
17|
18|const fetchCategories = async () => {
19|  loading.value = true
20|  try {
21|    const res = await api.get('/categories')
22|    categories.value = res.data.data
23|  } catch (e) {
24|    toast.error('Gagal memuat data kategori')
25|  } finally {
26|    loading.value = false
27|  }
28|}
29|
30|const openCreate = () => {
31|  editMode.value = false
32|  editId.value = null
33|  form.value = { name: '' }
34|  showModal.value = true
35|}
36|
37|const openEdit = (cat) => {
38|  editMode.value = true
39|  editId.value = cat.id
40|  form.value = { name: cat.name }
41|  showModal.value = true
42|}
43|
44|const saveCategory = async () => {
45|  if (!form.value.name.trim()) {
46|    return toast.error('Nama kategori wajib diisi')
47|  }
48|  saving.value = true
49|  try {
50|    if (editMode.value) {
51|      await api.put(`/categories/${editId.value}`, { name: form.value.name.trim() })
52|      toast.success('Kategori berhasil diupdate')
53|    } else {
54|      await api.post('/categories', { name: form.value.name.trim() })
55|      toast.success('Kategori berhasil ditambahkan')
56|    }
57|    showModal.value = false
58|    fetchCategories()
59|  } catch (e) {
60|    toast.error(e.response?.data?.message || 'Gagal menyimpan kategori')
61|  } finally {
62|    saving.value = false
63|  }
64|}
65|
66|const showDeleteConfirm = ref(false)
67|const deleteTargetId = ref(null)
68|
69|const openDeleteConfirm = (id) => {
70|  deleteTargetId.value = id
71|  showDeleteConfirm.value = true
72|}
73|
74|const deleteCategory = async () => {
75|  showDeleteConfirm.value = false
76|  const id = deleteTargetId.value
77|  deletingId.value = id
78|  try {
79|    await api.delete(`/categories/${id}`)
80|    toast.success('Kategori berhasil dihapus')
81|    fetchCategories()
82|  } catch (e) {
83|    toast.error(e.response?.data?.message || 'Gagal menghapus kategori')
84|  } finally {
85|    deletingId.value = null
86|  }
87|}
88|
89|const catIconMap = [
90|  { keyword: 'snack', icon: '🍪' },
91|  { keyword: 'cemilan', icon: '🍿' },
92|  { keyword: 'minuman', icon: '🥤' },
93|  { keyword: 'makanan', icon: '🍜' },
94|  { keyword: 'instan', icon: '🍜' },
95|  { keyword: 'dapur', icon: '🍳' },
96|  { keyword: 'mandi', icon: '🧴' },
97|  { keyword: 'rokok', icon: '🚬' },
98|  { keyword: 'kesehatan', icon: '💊' },
99|  { keyword: 'peralatan', icon: '🔧' },
100|  { keyword: 'perlengkapan', icon: '📦' },
101|  { keyword: 'rumah', icon: '🏠' },
102|]
103|
104|const getCatIcon = (name) => {
105|  const lower = name.toLowerCase()
106|  const match = catIconMap.find(m => lower.includes(m.keyword))
107|  return match ? match.icon : '📁'
108|}
109|
110|onMounted(fetchCategories)
111|</script>
112|
113|<template>
114|  <div class="admin-page">
115|116|    <div class="admin-top">
117|      <div class="admin-tabs">
118|        <router-link to="/admin" class="admin-tab">Pesanan</router-link>
119|        <router-link to="/admin/products" class="admin-tab">Produk</router-link>
120|        <router-link to="/admin/users" class="admin-tab">User</router-link>
121|        <router-link to="/admin/categories" class="admin-tab active">Kategori</router-link>
122|      </div>
123|    </div>
124|126|
127|    <!-- Header -->
128|    <div class="admin-header">
129|      <div>
130|        <h1>Manajemen Kategori</h1>
131|        <p class="header-sub">Total {{ categories.length }} kategori</p>
132|      </div>
133|      <button class="btn btn-primary" @click="openCreate">
134|        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
135|        Tambah Kategori
136|      </button>
137|    </div>
138|
139|    <!-- Loading -->
140|    <div v-if="loading" class="loading-grid">
141|      <div v-for="i in 4" :key="i" class="skeleton" style="height: 64px; border-radius: 12px;"></div>
142|    </div>
143|
144|    <!-- Category Grid -->
145|    <div v-else class="cat-grid">
146|      <div
147|        v-for="cat in categories"
148|        :key="cat.id"
149|        class="cat-card glass-card"
150|      >
151|        <div class="cat-icon">{{ getCatIcon(cat.name) }}</div>
152|        <div class="cat-info">
153|          <span class="cat-name">{{ cat.name }}</span>
154|          <span class="cat-id">ID: {{ cat.id }}</span>
155|        </div>
156|        <div class="cat-actions">
157|          <button class="btn-icon" title="Edit" @click="openEdit(cat)">
158|            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
159|          </button>
160|          <button class="btn-icon btn-danger" title="Hapus" @click="openDeleteConfirm(cat.id)" :disabled="deletingId === cat.id">
161|            <svg v-if="deletingId !== cat.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
162|            <span v-else class="spinner-sm"></span>
163|          </button>
164|        </div>
165|      </div>
166|
167|      <!-- Empty -->
168|      <div v-if="categories.length === 0" class="empty-state">
169|        <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
170|          <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
171|        </svg>
172|        <p>Belum ada kategori</p>
173|      </div>
174|    </div>
175|
176|    <!-- Modal -->
177|    <Teleport to="body">
178|      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
179|        <div class="modal-card">
180|          <div class="modal-header">
181|            <h3>{{ editMode ? 'Edit Kategori' : 'Tambah Kategori' }}</h3>
182|            <button class="modal-close" @click="showModal = false">
183|              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
184|            </button>
185|          </div>
186|          <div class="modal-body">
187|            <div class="form-group">
188|              <label>Nama Kategori</label>
189|              <input v-model="form.name" type="text" placeholder="Contoh: Makanan Ringan" class="form-input" @keyup.enter="saveCategory" />
190|            </div>
191|          </div>
192|          <div class="modal-footer">
193|            <button class="btn btn-ghost" @click="showModal = false">Batal</button>
194|            <button class="btn btn-primary" @click="saveCategory" :disabled="saving">
195|              <span v-if="saving" class="spinner-sm" style="border-top-color: white;"></span>
196|              {{ editMode ? 'Update' : 'Simpan' }}
197|            </button>
198|          </div>
199|        </div>
200|      </div>
201|    </Teleport>
202|  </div>
203|
204|  <!-- Delete Confirm Modal -->
205|  <ConfirmModal
206|    :show="showDeleteConfirm"
207|    title="Hapus Kategori?"
208|    message="Kategori akan dihapus secara permanen. Pastikan tidak ada produk yang menggunakan kategori ini."
209|    confirm-text="Ya, Hapus"
210|    cancel-text="Batal"
211|    type="danger"
212|    @confirm="deleteCategory"
213|    @cancel="showDeleteConfirm = false"
214|  />
215|</template>
216|
217|<style scoped>
218|.admin-page { padding: 24px; max-width: 1100px; margin: 0 auto; }
219|220|.admin-top { display: flex; align-items: center; margin-bottom: 16px; }
221|.admin-tabs { display: flex; gap: 4px; background: var(--border-light); padding: 4px; border-radius: 10px; }
222|.admin-tab {
223|  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
224|  text-decoration: none; color: var(--text-muted); transition: all 0.15s;
225|}
226|.admin-tab:hover { color: var(--text-secondary); }
227|.admin-tab.active, .admin-tab.router-link-exact-active { background: #fff; color: var(--text-primary); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
228|230|
231|.admin-header {
232|  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
233|}
234|.admin-header h1 { font-size: 22px; font-weight: 700; }
235|.header-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
236|
237|.cat-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 12px; }
238|.cat-card {
239|  display: flex; align-items: center; gap: 14px; padding: 16px;
240|  transition: transform 0.15s, box-shadow 0.15s; cursor: default;
241|}
242|.cat-card:hover { transform: translateY(-1px); box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
243|
244|.cat-icon { font-size: 28px; width: 48px; height: 48px; display: flex; align-items: center; justify-content: center; background: var(--surface-100); border-radius: 12px; flex-shrink: 0; }
245|.cat-info { flex: 1; min-width: 0; }
246|.cat-name { display: block; font-size: 15px; font-weight: 700; }
247|.cat-id { display: block; font-size: 12px; color: var(--text-muted); margin-top: 2px; }
248|.cat-actions { display: flex; gap: 4px; flex-shrink: 0; }
249|
250|.btn-icon {
251|  width: 32px; height: 32px; border-radius: var(--radius-sm); border: none; background: transparent;
252|  display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary);
253|  transition: all 0.15s;
254|}
255|.btn-icon:hover { background: var(--surface-100); color: var(--text-primary); }
256|.btn-icon.btn-danger:hover { background: #fee2e2; color: #dc2626; }
257|.empty-state { grid-column: 1 / -1; text-align: center; padding: 48px 16px; color: var(--text-muted); }
258|.empty-state p { margin-top: 12px; font-size: 14px; }
259|
260|.spinner-sm {
261|  width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.1); border-top-color: var(--brand);
262|  border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
263|}
264|@keyframes spin { to { transform: rotate(360deg); } }
265|
266|/* Modal */
267|.modal-overlay {
268|  position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
269|  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
270|}
271|.modal-card {
272|  background: white; border-radius: var(--radius-lg); width: 100%; max-width: 400px;
273|  box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: modalIn 0.2s ease;
274|}
275|@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } }
276|.modal-header {
277|  display: flex; justify-content: space-between; align-items: center;
278|  padding: 16px 20px; border-bottom: 1px solid var(--border-subtle);
279|}
280|.modal-header h3 { font-size: 16px; font-weight: 700; }
281|.modal-close { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; border-radius: 6px; }
282|.modal-close:hover { background: var(--surface-100); }
283|.modal-body { padding: 20px; }
284|.modal-footer {
285|  display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px;
286|  border-top: 1px solid var(--border-subtle);
287|}
288|
289|.form-group { margin-bottom: 14px; }
290|.form-group:last-child { margin-bottom: 0; }
291|.form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; }
292|.form-input {
293|  width: 100%; padding: 8px 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);
294|  font-size: 14px; outline: none; transition: border-color 0.15s; background: white;
295|}
296|.form-input:focus { border-color: var(--brand); }
297|
298|.btn {
299|  display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius-sm);
300|  font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: all 0.15s;
301|}
302|.btn-primary { background: var(--brand); color: white; }
303|.btn-primary:hover { filter: brightness(1.05); }
304|.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
305|.btn-ghost { background: transparent; color: var(--text-secondary); }
306|.btn-ghost:hover { background: var(--surface-100); }
307|
308|.loading-grid { display: flex; flex-direction: column; gap: 8px; }
309|.skeleton {
310|  background: linear-gradient(90deg, var(--surface-100) 25%, #e5e7eb 50%, var(--surface-100) 75%);
311|  background-size: 200% 100%; animation: shimmer 1.5s infinite;
312|}
313|@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
314|
315|@media (max-width: 768px) {
316|  .admin-page { padding: 16px 12px; }
317|318|  .admin-tabs { overflow-x: auto; }
319|  .admin-tab { white-space: nowrap; font-size: 12px; padding: 6px 10px; }
320|322|  .admin-header h1 { font-size: 18px; }
323|  .cat-grid { grid-template-columns: 1fr; }
324|}
325|</style>
326|