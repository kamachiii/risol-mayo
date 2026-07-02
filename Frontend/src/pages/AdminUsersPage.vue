1|<script setup>
2|import { ref, onMounted, computed } from 'vue'
3|import { useToast } from '@/composables/useToast'
4|import api from '@/services/api'
5|import ConfirmModal from '@/components/common/ConfirmModal.vue'
6|
7|const toast = useToast()
8|const users = ref([])
9|const loading = ref(true)
10|const showModal = ref(false)
11|const editMode = ref(false)
12|const editId = ref(null)
13|const saving = ref(false)
14|const deletingId = ref(null)
15|
16|const form = ref({ name: '', email: '', password: '', role: 'customer' })
17|
18|const fetchUsers = async () => {
19|  loading.value = true
20|  try {
21|    const res = await api.get('/users')
22|    users.value = res.data.data
23|  } catch (e) {
24|    toast.error('Gagal memuat data user')
25|  } finally {
26|    loading.value = false
27|  }
28|}
29|
30|const openCreate = () => {
31|  editMode.value = false
32|  editId.value = null
33|  form.value = { name: '', email: '', password: '', role: 'customer' }
34|  showModal.value = true
35|}
36|
37|const openEdit = (user) => {
38|  editMode.value = true
39|  editId.value = user.id
40|  form.value = { name: user.name, email: user.email, password: '', role: user.role }
41|  showModal.value = true
42|}
43|
44|const saveUser = async () => {
45|  if (!form.value.name.trim() || !form.value.email.trim()) {
46|    return toast.error('Nama dan email wajib diisi')
47|  }
48|  if (!editMode.value && !form.value.password) {
49|    return toast.error('Password wajib diisi')
50|  }
51|  saving.value = true
52|  try {
53|    const payload = { ...form.value }
54|    if (editMode.value && !payload.password) delete payload.password
55|    if (editMode.value) {
56|      await api.put(`/users/${editId.value}`, payload)
57|      toast.success('User berhasil diupdate')
58|    } else {
59|      await api.post('/users', payload)
60|      toast.success('User berhasil ditambahkan')
61|    }
62|    showModal.value = false
63|    fetchUsers()
64|  } catch (e) {
65|    toast.error(e.response?.data?.message || 'Gagal menyimpan user')
66|  } finally {
67|    saving.value = false
68|  }
69|}
70|
71|const showDeleteConfirm = ref(false)
72|const deleteTargetId = ref(null)
73|
74|const openDeleteConfirm = (id) => {
75|  deleteTargetId.value = id
76|  showDeleteConfirm.value = true
77|}
78|
79|const deleteUser = async () => {
80|  showDeleteConfirm.value = false
81|  const id = deleteTargetId.value
82|  deletingId.value = id
83|  try {
84|    await api.delete(`/users/${id}`)
85|    toast.success('User berhasil dihapus')
86|    fetchUsers()
87|  } catch (e) {
88|    toast.error(e.response?.data?.message || 'Gagal menghapus user')
89|  } finally {
90|    deletingId.value = null
91|  }
92|}
93|
94|const formatDate = (d) => {
95|  if (!d) return '-'
96|  const dt = new Date(d)
97|  return dt.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })
98|}
99|
100|const stats = computed(() => ({
101|  total: users.value.length,
102|  admin: users.value.filter(u => u.role === 'admin').length,
103|  user: users.value.filter(u => u.role === 'customer').length,
104|}))
105|
106|onMounted(fetchUsers)
107|</script>
108|
109|<template>
110|  <div class="admin-page">
111|112|    <div class="admin-top">
113|      <div class="admin-tabs">
114|        <router-link to="/admin" class="admin-tab">Pesanan</router-link>
115|        <router-link to="/admin/products" class="admin-tab">Produk</router-link>
116|        <router-link to="/admin/users" class="admin-tab active">User</router-link>
117|        <router-link to="/admin/categories" class="admin-tab">Kategori</router-link>
118|      </div>
119|    </div>
120|122|
123|    <!-- Header -->
124|    <div class="admin-header">
125|      <div>
126|        <h1>Manajemen User</h1>
127|        <p class="header-sub">{{ users.length }} user terdaftar</p>
128|      </div>
129|      <button class="btn btn-primary" @click="openCreate">
130|        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
131|        Tambah User
132|      </button>
133|    </div>
134|
135|    <!-- Loading -->
136|    <div v-if="loading" class="loading-grid">
137|      <div v-for="i in 3" :key="i" class="skeleton" style="height: 48px; border-radius: 8px;"></div>
138|    </div>
139|
140|    <!-- Table -->
141|    <div v-else class="table-wrap">
142|      <table class="admin-table">
143|        <thead>
144|          <tr>
145|            <th>ID</th>
146|            <th>Nama</th>
147|            <th>Email</th>
148|            <th>Role</th>
149|            <th>Bergabung</th>
150|            <th>Aksi</th>
151|          </tr>
152|        </thead>
153|        <tbody>
154|          <tr v-for="user in users" :key="user.id">
155|            <td class="id-col">#{{ user.id }}</td>
156|            <td class="name-col">
157|              <div class="user-avatar">{{ user.name?.charAt(0)?.toUpperCase() || '?' }}</div>
158|              <span>{{ user.name }}</span>
159|            </td>
160|            <td>{{ user.email }}</td>
161|            <td>
162|              <span class="role-badge" :class="user.role === 'admin' ? 'role-admin' : 'role-customer'">
163|                {{ user.role === 'admin' ? 'Admin' : 'Customer' }}
164|              </span>
165|            </td>
166|            <td class="date-col">{{ formatDate(user.created_at) }}</td>
167|            <td class="actions-col">
168|              <button class="btn-icon" title="Edit" @click="openEdit(user)">
169|                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
170|              </button>
171|              <button class="btn-icon btn-danger" title="Hapus" @click="openDeleteConfirm(user.id)" :disabled="deletingId === user.id">
172|                <svg v-if="deletingId !== user.id" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"/></svg>
173|                <span v-else class="spinner-sm"></span>
174|              </button>
175|            </td>
176|          </tr>
177|          <tr v-if="users.length === 0">
178|            <td colspan="6" class="empty-row">Belum ada user</td>
179|          </tr>
180|        </tbody>
181|      </table>
182|    </div>
183|
184|    <!-- Modal -->
185|    <Teleport to="body">
186|      <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
187|        <div class="modal-card">
188|          <div class="modal-header">
189|            <h3>{{ editMode ? 'Edit User' : 'Tambah User' }}</h3>
190|            <button class="modal-close" @click="showModal = false">
191|              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
192|            </button>
193|          </div>
194|          <div class="modal-body">
195|            <div class="form-group">
196|              <label>Nama</label>
197|              <input v-model="form.name" type="text" placeholder="Nama lengkap" class="form-input" />
198|            </div>
199|            <div class="form-group">
200|              <label>Email</label>
201|              <input v-model="form.email" type="email" placeholder="email@contoh.com" class="form-input" />
202|            </div>
203|            <div class="form-group">
204|              <label>{{ editMode ? 'Password (kosongkan jika tidak ganti)' : 'Password' }}</label>
205|              <input v-model="form.password" type="password" :placeholder="editMode ? '••••••••' : 'Masukkan password'" class="form-input" />
206|            </div>
207|            <div class="form-group">
208|              <label>Role</label>
209|              <select v-model="form.role" class="form-input">
210|                <option value="customer">Customer</option>
211|                <option value="admin">Admin</option>
212|              </select>
213|            </div>
214|          </div>
215|          <div class="modal-footer">
216|            <button class="btn btn-ghost" @click="showModal = false">Batal</button>
217|            <button class="btn btn-primary" @click="saveUser" :disabled="saving">
218|              <span v-if="saving" class="spinner-sm" style="border-top-color: white;"></span>
219|              {{ editMode ? 'Update' : 'Simpan' }}
220|            </button>
221|          </div>
222|        </div>
223|      </div>
224|    </Teleport>
225|  </div>
226|
227|  <!-- Delete Confirm Modal -->
228|  <ConfirmModal
229|    :show="showDeleteConfirm"
230|    title="Hapus User?"
231|    message="User akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan."
232|    confirm-text="Ya, Hapus"
233|    cancel-text="Batal"
234|    type="danger"
235|    @confirm="deleteUser"
236|    @cancel="showDeleteConfirm = false"
237|  />
238|</template>
239|
240|<style scoped>
241|.admin-page { padding: 24px; max-width: 1100px; margin: 0 auto; }
242|243|.admin-top { display: flex; align-items: center; margin-bottom: 16px; }
244|.admin-tabs { display: flex; gap: 4px; background: var(--border-light); padding: 4px; border-radius: 10px; }
245|.admin-tab {
246|  padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500;
247|  text-decoration: none; color: var(--text-muted); transition: all 0.15s;
248|}
249|.admin-tab:hover { color: var(--text-secondary); }
250|.admin-tab.active, .admin-tab.router-link-exact-active { background: #fff; color: var(--text-primary); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
251|253|
254|.admin-header {
255|  display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;
256|}
257|.admin-header h1 { font-size: 22px; font-weight: 700; }
258|.header-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
259|
260|.table-wrap { overflow-x: auto; }
261|.admin-table { width: 100%; border-collapse: collapse; }
262|.admin-table th {
263|  text-align: left; padding: 10px 12px; font-size: 12px; font-weight: 700; color: var(--text-muted);
264|  text-transform: uppercase; letter-spacing: 0.04em; border-bottom: 2px solid var(--border-subtle);
265|}
266|.admin-table td { padding: 12px; border-bottom: 1px solid var(--border-subtle); font-size: 14px; }
267|.admin-table tr:hover td { background: var(--surface-100); }
268|
269|.id-col { font-weight: 700; color: var(--text-muted); font-size: 13px; }
270|.name-col { display: flex; align-items: center; gap: 10px; }
271|.user-avatar {
272|  width: 32px; height: 32px; border-radius: 50%; background: var(--brand); color: white;
273|  display: flex; align-items: center; justify-content: center; font-size: 13px; font-weight: 700; flex-shrink: 0;
274|}
275|.date-col { color: var(--text-muted); font-size: 13px; }
276|
277|.role-badge {
278|  padding: 3px 10px; border-radius: var(--radius-full); font-size: 12px; font-weight: 600;
279|}
280|.role-admin { background: #ede9fe; color: #7c3aed; }
281|.role-customer { background: #d1fae5; color: #059669; }
282|
283|.actions-col { display: flex; gap: 4px; }
284|.btn-icon {
285|  width: 32px; height: 32px; border-radius: var(--radius-sm); border: none; background: transparent;
286|  display: flex; align-items: center; justify-content: center; cursor: pointer; color: var(--text-secondary);
287|  transition: all 0.15s;
288|}
289|.btn-icon:hover { background: var(--surface-100); color: var(--text-primary); }
290|.btn-icon.btn-danger:hover { background: #fee2e2; color: #dc2626; }
291|.empty-row { text-align: center; color: var(--text-muted); padding: 32px !important; }
292|
293|.spinner-sm {
294|  width: 14px; height: 14px; border: 2px solid rgba(0,0,0,0.1); border-top-color: var(--brand);
295|  border-radius: 50%; animation: spin 0.6s linear infinite; display: inline-block;
296|}
297|@keyframes spin { to { transform: rotate(360deg); } }
298|
299|/* Modal */
300|.modal-overlay {
301|  position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(4px);
302|  display: flex; align-items: center; justify-content: center; z-index: 1000; padding: 16px;
303|}
304|.modal-card {
305|  background: white; border-radius: var(--radius-lg); width: 100%; max-width: 440px;
306|  box-shadow: 0 20px 60px rgba(0,0,0,0.2); animation: modalIn 0.2s ease;
307|}
308|@keyframes modalIn { from { opacity: 0; transform: scale(0.95) translateY(10px); } }
309|.modal-header {
310|  display: flex; justify-content: space-between; align-items: center;
311|  padding: 16px 20px; border-bottom: 1px solid var(--border-subtle);
312|}
313|.modal-header h3 { font-size: 16px; font-weight: 700; }
314|.modal-close { background: none; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; border-radius: 6px; }
315|.modal-close:hover { background: var(--surface-100); }
316|.modal-body { padding: 20px; }
317|.modal-footer {
318|  display: flex; justify-content: flex-end; gap: 8px; padding: 12px 20px;
319|  border-top: 1px solid var(--border-subtle);
320|}
321|
322|.form-group { margin-bottom: 14px; }
323|.form-group:last-child { margin-bottom: 0; }
324|.form-group label { display: block; font-size: 13px; font-weight: 600; margin-bottom: 4px; color: var(--text-primary); }
325|.form-input {
326|  width: 100%; padding: 8px 12px; border: 1px solid var(--border-subtle); border-radius: var(--radius-sm);
327|  font-size: 14px; outline: none; transition: border-color 0.15s; background: white; color: var(--text-primary);
328|}
329|.form-input:focus { border-color: var(--brand); }
330|
331|.btn {
332|  display: inline-flex; align-items: center; gap: 6px; padding: 8px 16px; border-radius: var(--radius-sm);
333|  font-size: 13px; font-weight: 600; border: none; cursor: pointer; transition: all 0.15s;
334|}
335|.btn-primary { background: var(--brand); color: white; }
336|.btn-primary:hover { filter: brightness(1.05); }
337|.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
338|.btn-ghost { background: transparent; color: var(--text-secondary); }
339|.btn-ghost:hover { background: var(--surface-100); }
340|
341|.loading-grid { display: flex; flex-direction: column; gap: 8px; }
342|.skeleton {
343|  background: linear-gradient(90deg, var(--surface-100) 25%, #e5e7eb 50%, var(--surface-100) 75%);
344|  background-size: 200% 100%; animation: shimmer 1.5s infinite;
345|}
346|@keyframes shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }
347|
348|/* Mobile */
349|@media (max-width: 768px) {
350|  .admin-page { padding: 16px 12px; }
351|352|  .admin-tabs { overflow-x: auto; }
353|  .admin-tab { white-space: nowrap; font-size: 12px; padding: 6px 10px; }
354|356|  .stats-row { grid-template-columns: repeat(3, 1fr); gap: 8px; }
357|  .stat-value { font-size: 18px; }
358|  .admin-header h1 { font-size: 18px; }
359|  .admin-table th, .admin-table td { padding: 8px 6px; font-size: 12px; }
360|  .date-col { display: none; }
361|}
362|</style>
363|