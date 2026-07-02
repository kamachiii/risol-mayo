1|<script setup>
2|import { ref, computed, onMounted } from 'vue'
3|import { useAuthStore } from '@/stores/auth'
4|import { useToast } from '@/composables/useToast'
5|import api, { getImageUrl } from '@/services/api'
6|
7|const auth = useAuthStore()
8|const toast = useToast()
9|const products = ref([])
10|const categories = ref([])
11|const loading = ref(true)
12|const showModal = ref(false)
13|const editMode = ref(false)
14|const saving = ref(false)
15|const errorMsg = ref('')
16|const currentPage = ref(1)
17|const perPage = ref(10)
18|
19|const defaultForm = { name: '', price: '', description: '', stock: '', category_id: '' }
20|const form = ref({ ...defaultForm })
21|const formImage = ref(null)
22|const editingId = ref(null)
23|const imagePreview = ref('')
24|
25|const fetchError = ref('')
26|
27|const paginatedProducts = computed(() => products.value)
28|
29|const totalPages = computed(() => totalServerPages.value)
30|
31|const totalServerItems = ref(0)
32|const totalServerPages = ref(1)
33|
34|const fetchProducts = async () => {
35|  loading.value = true
36|  fetchError.value = ''
37|  try {
38|    const { data } = await api.get('/products', { params: { page: currentPage.value, limit: perPage.value } })
39|    products.value = data.data || []
40|    totalServerItems.value = data.pagination?.total || 0
41|    totalServerPages.value = data.pagination?.totalPages || 1
42|  } catch (e) {
43|    console.error(e)
44|    fetchError.value = 'Gagal memuat produk. Silakan coba lagi.'
45|  } finally {
46|    loading.value = false
47|  }
48|}
49|
50|const goToPage = (page) => {
51|  currentPage.value = page
52|  fetchProducts()
53|}
54|
55|const fetchCategories = async () => {
56|  try {
57|    const { data } = await api.get('/categories')
58|    categories.value = data.data || []
59|  } catch (e) {
60|    console.error(e)
61|  }
62|}
63|
64|onMounted(() => { fetchProducts(); fetchCategories() })
65|
66|const openAdd = () => {
67|  editMode.value = false
68|  form.value = { ...defaultForm }
69|  formImage.value = null
70|  imagePreview.value = ''
71|  errorMsg.value = ''
72|  showModal.value = true
73|}
74|
75|const openEdit = (p) => {
76|  editMode.value = true
77|  editingId.value = p.id
78|  form.value = {
79|    name: p.name,
80|    price: p.price,
81|    description: p.description,
82|    stock: p.stock,
83|    category_id: p.category_id
84|  }
85|  imagePreview.value = p.image_url ? getImageUrl(p.image_url) : ''
86|  formImage.value = null
87|  errorMsg.value = ''
88|  showModal.value = true
89|}
90|
91|const onImageChange = (e) => {
92|  const file = e.target.files[0]
93|  if (!file) return
94|  const allowed = ['image/jpeg', 'image/png', 'image/jpg']
95|  if (!allowed.includes(file.type)) {
96|    errorMsg.value = 'Format file harus JPG atau PNG'
97|    e.target.value = ''
98|    return
99|  }
100|  if (file.size > 5 * 1024 * 1024) {
101|    errorMsg.value = 'Ukuran file maksimal 5MB'
102|    e.target.value = ''
103|    return
104|  }
105|  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value)
106|  formImage.value = file
107|  imagePreview.value = URL.createObjectURL(file)
108|}
109|
110|const validateForm = () => {
111|  if (!form.value.name || form.value.name.trim() === '') {
112|    errorMsg.value = 'Nama produk wajib diisi'
113|    return false
114|  }
115|  if (!form.value.price || Number(form.value.price) < 0) {
116|    errorMsg.value = 'Harga tidak valid (harus >= 0)'
117|    return false
118|  }
119|  if (form.value.stock === '' || Number(form.value.stock) < 0) {
120|    errorMsg.value = 'Stok tidak valid (harus >= 0)'
121|    return false
122|  }
123|  if (!form.value.category_id) {
124|    errorMsg.value = 'Kategori wajib dipilih'
125|    return false
126|  }
127|  if (!editMode.value && !formImage.value) {
128|    errorMsg.value = 'Gambar produk wajib diunggah'
129|    return false
130|  }
131|  return true
132|}
133|
134|const saveProduct = async () => {
135|  saving.value = true
136|  errorMsg.value = ''
137|  if (!validateForm()) {
138|    saving.value = false
139|    return
140|  }
141|  try {
142|    const fd = new FormData()
143|    fd.append('name', form.value.name)
144|    fd.append('price', form.value.price)
145|    fd.append('description', form.value.description)
146|    fd.append('stock', form.value.stock)
147|    fd.append('category_id', form.value.category_id)
148|    if (formImage.value) fd.append('image', formImage.value)
149|
150|    if (editMode.value) {
151|      await api.put(`/products/${editingId.value}`, fd, {
152|        headers: { 'Content-Type': 'multipart/form-data' }
153|      })
154|    } else {
155|      await api.post('/products', fd, {
156|        headers: { 'Content-Type': 'multipart/form-data' }
157|      })
158|    }
159|    showModal.value = false
160|    await fetchProducts()
161|  } catch (e) {
162|    errorMsg.value = e.response?.data?.message || 'Gagal menyimpan produk'
163|  } finally {
164|    saving.value = false
165|  }
166|}
167|
168|const deleteProductId = ref(null)
169|const showDeleteConfirm = ref(false)
170|
171|const confirmDelete = (id) => {
172|  deleteProductId.value = id
173|  showDeleteConfirm.value = true
174|}
175|
176|const doDelete = async () => {
177|  showDeleteConfirm.value = false
178|  try {
179|    await api.delete(`/products/${deleteProductId.value}`)
180|    toast.success('Produk berhasil dihapus')
181|    await fetchProducts()
182|  } catch (e) {
183|    toast.error(e.response?.data?.message || 'Gagal hapus produk')
184|  }
185|}
186|
187|const cancelDelete = () => {
188|  showDeleteConfirm.value = false
189|  deleteProductId.value = null
190|}
191|
192|const fmtPrice = (n) => 'Rp ' + Number(n).toLocaleString('id-ID')
193|</script>
194|
195|<template>
196|  <div class="admin-page">
197|198|    <div class="admin-top">
199|      <div class="admin-tabs">
200|        <router-link to="/admin" class="admin-tab">Pesanan</router-link>
201|        <router-link to="/admin/products" class="admin-tab active">Produk</router-link>
202|        <router-link to="/admin/users" class="admin-tab">User</router-link>
203|        <router-link to="/admin/categories" class="admin-tab">Kategori</router-link>
204|      </div>
205|    </div>
206|208|    <div class="admin-header">
209|      <div>
210|        <h1>Produk</h1>
211|        <p class="header-sub">Kelola produk minimarket</p>
212|      </div>
213|      <button class="btn-primary" @click="openAdd">+ Tambah Produk</button>
214|    </div>
215|
216|    <div v-if="loading" class="loading-state">Memuat...</div>
217|    <div v-else-if="fetchError" class="error-state">
218|      <p>{{ fetchError }}</p>
219|      <button class="btn-sm btn-edit" @click="fetchProducts">Coba Lagi</button>
220|    </div>
221|
222|    <div v-else class="table-wrap">
223|      <table class="admin-table">
224|        <thead>
225|          <tr>
226|            <th>Gambar</th>
227|            <th>Nama</th>
228|            <th>Kategori</th>
229|            <th>Harga</th>
230|            <th>Stok</th>
231|            <th>Aksi</th>
232|          </tr>
233|        </thead>
234|        <tbody>
235|          <tr v-for="p in paginatedProducts" :key="p.id">
236|            <td>
237|              <img v-if="p.image_url" :src="getImageUrl(p.image_url)" class="thumb" :alt="p.name" />
238|              <div v-else class="no-img">
239|                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>
240|              </div>
241|            </td>
242|            <td class="name-cell">{{ p.name }}</td>
243|            <td>{{ p.category_name || '-' }}</td>
244|            <td>{{ fmtPrice(p.price) }}</td>
245|            <td :class="{ 'low-stock': p.stock < 5 }">{{ p.stock }}</td>
246|            <td class="actions-cell">
247|              <button class="btn-sm btn-edit" @click="openEdit(p)">Edit</button>
248|              <button class="btn-sm btn-delete" @click="confirmDelete(p.id)">Hapus</button>
249|            </td>
250|          </tr>
251|          <tr v-if="!loading && paginatedProducts.length === 0" class="empty-row">
252|            <td colspan="6">Tidak ada produk</td>
253|          </tr>
254|        </tbody>
255|      </table>
256|      <!-- Pagination -->
257|      <div v-if="totalPages > 1" class="pagination">
258|        <button class="page-btn" :disabled="currentPage <= 1" @click="goToPage(currentPage - 1)">‹</button>
259|        <span class="page-info">Halaman {{ currentPage }} dari {{ totalPages }}</span>
260|        <button class="page-btn" :disabled="currentPage >= totalPages" @click="goToPage(currentPage + 1)">›</button>
261|      </div>
262|    </div>
263|
264|    <!-- Modal Add/Edit -->
265|    <div v-if="showModal" class="modal-overlay" @click.self="showModal = false">
266|      <div class="modal-card">
267|        <h2>{{ editMode ? 'Edit Produk' : 'Tambah Produk' }}</h2>
268|        <p v-if="errorMsg" class="error-msg">{{ errorMsg }}</p>
269|        <form @submit.prevent="saveProduct" class="modal-form">
270|          <div class="form-row">
271|            <div class="form-col">
272|              <label>Nama Produk</label>
273|              <input v-model="form.name" required />
274|            </div>
275|            <div class="form-col">
276|              <label>Kategori</label>
277|              <select v-model="form.category_id" required>
278|                <option value="">Pilih kategori</option>
279|                <option v-for="c in categories" :key="c.id" :value="c.id">{{ c.name }}</option>
280|              </select>
281|            </div>
282|          </div>
283|          <div class="form-row">
284|            <div class="form-col">
285|              <label>Harga (Rp)</label>
286|              <input v-model="form.price" type="number" min="0" required />
287|            </div>
288|            <div class="form-col">
289|              <label>Stok</label>
290|              <input v-model="form.stock" type="number" min="0" required />
291|            </div>
292|          </div>
293|          <div class="form-group">
294|            <label>Deskripsi</label>
295|            <textarea v-model="form.description" rows="3"></textarea>
296|          </div>
297|          <div class="form-group">
298|            <label>Gambar Produk</label>
299|            <input type="file" accept="image/*" @change="onImageChange" />
300|            <img v-if="imagePreview" :src="imagePreview" class="preview-img" />
301|          </div>
302|          <div class="modal-actions">
303|            <button type="button" class="btn-secondary" @click="showModal = false">Batal</button>
304|            <button type="submit" class="btn-primary" :disabled="saving">
305|              {{ saving ? 'Menyimpan...' : 'Simpan' }}
306|            </button>
307|          </div>
308|        </form>
309|      </div>
310|    </div>
311|
312|    <!-- Delete Confirm Modal -->
313|    <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="cancelDelete">
314|      <div class="modal-box delete-modal">
315|        <h3>Hapus Produk</h3>
316|        <p>Yakin ingin menghapus produk ini? Tindakan ini tidak dapat dibatalkan.</p>
317|        <div class="modal-actions">
318|          <button class="btn-secondary" @click="cancelDelete">Batal</button>
319|          <button class="btn-danger" @click="doDelete">Hapus</button>
320|        </div>
321|      </div>
322|    </div>
323|  </div>
324|</template>
325|
326|<style scoped>
327|.admin-page { padding: 24px; max-width: 1100px; margin: 0 auto; }
328|329|.admin-top { display: flex; align-items: center; margin-bottom: 16px; }
330|.admin-top h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
331|.admin-tabs { display: flex; gap: 4px; background: var(--border-light); padding: 4px; border-radius: 10px; }
332|.admin-tab { padding: 8px 16px; border-radius: 8px; font-size: 13px; font-weight: 500; text-decoration: none; color: var(--text-muted); transition: all 0.15s; }
333|.admin-tab.active, .admin-tab.router-link-exact-active { background: #fff; color: var(--text-primary); box-shadow: 0 1px 3px rgba(0,0,0,0.08); }
334|.admin-tab:hover { color: var(--text-secondary); }
335|337|.admin-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
338|.admin-header h1 { font-size: 22px; font-weight: 700; }
339|.header-sub { font-size: 13px; color: var(--text-muted); margin-top: 2px; }
340|.admin-header h1 { font-size: 22px; font-weight: 700; color: var(--text-primary); }
341|.btn-primary { padding: 10px 20px; background: #63A8B3; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
342|.btn-primary:hover { background: #4a9aa8; }
343|.btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }
344|.btn-secondary { padding: 10px 20px; background: var(--border-light); color: var(--text-secondary); border: 1px solid #e5e7eb; border-radius: 8px; font-size: 13px; cursor: pointer; }
345|.btn-secondary:hover { background: #e5e7eb; }
346|.loading-state { text-align: center; padding: 48px; color: #9ca3af; }
347|.error-state { text-align: center; padding: 48px; color: #dc2626; }
348|.error-state p { margin-bottom: 12px; }
349|.table-wrap { overflow-x: auto; }
350|.admin-table { width: 100%; border-collapse: collapse; background: #fff; border-radius: 12px; overflow: hidden; box-shadow: 0 1px 3px rgba(0,0,0,0.06); }
351|.admin-table th { text-align: left; padding: 12px 16px; background: #f9fafb; font-size: 12px; font-weight: 600; color: var(--text-muted); text-transform: uppercase; letter-spacing: 0.5px; }
352|.admin-table td { padding: 12px 16px; border-top: 1px solid #f3f4f6; font-size: 13px; color: var(--text-secondary); }
353|.admin-table tr:hover td { background: #f9fafb; }
354|.thumb { width: 48px; height: 48px; border-radius: 8px; object-fit: cover; }
355|.no-img { width: 48px; height: 48px; border-radius: 8px; background: var(--border-light); display: flex; align-items: center; justify-content: center; color: #d1d5db; }
356|.name-cell { font-weight: 600; }
357|.low-stock { color: #dc2626; font-weight: 600; }
358|.empty-row { text-align: center; color: #9ca3af; padding: 32px; }
359|
360|.pagination {
361|  display: flex;
362|  align-items: center;
363|  justify-content: center;
364|  gap: 12px;
365|  padding: 16px;
366|  border-top: 1px solid var(--border-light);
367|}
368|
369|.page-btn {
370|  width: 32px;
371|  height: 32px;
372|  border-radius: 8px;
373|  border: 1.5px solid var(--border-medium);
374|  background: white;
375|  font-size: 14px;
376|  cursor: pointer;
377|  display: flex;
378|  align-items: center;
379|  justify-content: center;
380|  transition: all 0.15s;
381|}
382|
383|.page-btn:hover:not(:disabled) {
384|  border-color: var(--brand);
385|  color: var(--brand);
386|  background: var(--brand-light);
387|}
388|
389|.page-btn:disabled {
390|  opacity: 0.4;
391|  cursor: not-allowed;
392|}
393|
394|.page-info {
395|  font-size: 13px;
396|  color: var(--text-muted);
397|}
398|.delete-modal { max-width: 380px; }
399|.delete-modal h3 { margin-bottom: 8px; }
400|.delete-modal p { color: var(--text-muted); margin-bottom: 20px; font-size: 14px; }
401|.btn-danger { padding: 10px 20px; background: #dc2626; color: #fff; border: none; border-radius: 8px; font-size: 13px; font-weight: 600; cursor: pointer; }
402|.btn-danger:hover { background: #b91c1c; }
403|.actions-cell { display: flex; gap: 6px; }
404|.btn-sm { padding: 5px 12px; border: none; border-radius: 6px; font-size: 12px; font-weight: 500; cursor: pointer; transition: background 0.15s; }
405|.btn-edit { background: #e0f2fe; color: #0369a1; }
406|.btn-edit:hover { background: #bae6fd; }
407|.btn-delete { background: #fee2e2; color: #dc2626; }
408|.btn-delete:hover { background: #fecaca; }
409|.modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); display: flex; align-items: center; justify-content: center; z-index: 999; backdrop-filter: blur(2px); }
410|.modal-card { background: #fff; border-radius: 16px; padding: 32px; width: 90%; max-width: 560px; max-height: 85vh; overflow-y: auto; box-shadow: 0 20px 60px rgba(0,0,0,0.15); }
411|.modal-card h2 { font-size: 18px; font-weight: 700; margin-bottom: 20px; }
412|.error-msg { color: #dc2626; font-size: 13px; margin-bottom: 12px; }
413|.modal-form { display: flex; flex-direction: column; gap: 16px; }
414|.form-row { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
415|
416|/* ── Mobile ── */
417|@media (max-width: 768px) {
418|  .admin-page { padding: 16px 12px; }
419|  .page-title { font-size: 20px; }
420|421|  .admin-tabs { gap: 8px; }
422|424|  .form-row { grid-template-columns: 1fr; gap: 12px; }
425|  .form-actions { flex-direction: column; }
426|  .form-actions button { width: 100%; }
427|  /* Table → card layout */
428|  .admin-table { display: none; }
429|  .product-cards { display: flex; flex-direction: column; gap: 12px; margin-top: 12px; }
430|  .product-card { display: flex; gap: 12px; padding: 12px; background: var(--surface); border: 1px solid var(--border-subtle); border-radius: 10px; align-items: center; }
431|  .product-card img { width: 60px; height: 60px; border-radius: 8px; object-fit: cover; flex-shrink: 0; }
432|  .product-card .no-img { width: 60px; height: 60px; border-radius: 8px; flex-shrink: 0; display: flex; align-items: center; justify-content: center; font-size: 24px; }
433|  .product-card .info { flex: 1; min-width: 0; }
434|  .product-card .info .name { font-weight: 600; font-size: 14px; margin-bottom: 2px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
435|  .product-card .info .price { color: var(--brand); font-size: 13px; }
436|  .product-card .actions { display: flex; gap: 8px; flex-shrink: 0; }
437|}
438|.form-col { display: flex; flex-direction: column; gap: 4px; }
439|.form-group { display: flex; flex-direction: column; gap: 4px; }
440|label { font-size: 12px; font-weight: 600; color: var(--text-muted); }
441|input, select, textarea { padding: 10px 12px; border: 1.5px solid #e5e7eb; border-radius: 8px; font-size: 13px; font-family: inherit; background: #f9fafb; transition: border 0.2s; }
442|input:focus, select:focus, textarea:focus { border-color: #63A8B3; outline: none; background: #fff; }
443|.preview-img { width: 80px; height: 80px; border-radius: 8px; object-fit: cover; margin-top: 8px; }
444|.modal-actions { display: flex; justify-content: flex-end; gap: 8px; margin-top: 8px; }
445|</style>
446|