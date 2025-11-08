
    import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
    import {
      getFirestore, collection, addDoc, getDocs, onSnapshot,
      doc, updateDoc, deleteDoc, query, where
    } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

    // -------------------------------
    // Firebase config (user provided)
    // -------------------------------
    const firebaseConfig = {
      apiKey: "AIzaSyBOVl1hdmprJXpgdN_sNTO3FsNePD_zNZY",
      authDomain: "aahes-cee-cutoffs.firebaseapp.com",
      databaseURL: "https://aahes-cee-cutoffs-default-rtdb.asia-southeast1.firebasedatabase.app",
      projectId: "aahes-cee-cutoffs",
      storageBucket: "aahes-cee-cutoffs.firebasestorage.app",
      messagingSenderId: "706066626405",
      appId: "1:706066626405:web:0d254ab82beb288108938c"
    };

    const app = initializeApp(firebaseConfig);
    const db = getFirestore(app);

    // -------------------------------
    // Elements (single reference block)
    // -------------------------------
    const loginForm = document.getElementById('loginForm');
    const emailInput = document.getElementById('emailInput');
    const passwordInput = document.getElementById('passwordInput');

    const userSection = document.getElementById('userSection');
    const userEmail = document.getElementById('userEmail');
    const logoutBtn = document.getElementById('logoutBtn');

    const tabDataEntry = document.getElementById('tabDataEntry');
    const tabDatabase = document.getElementById('tabDatabase');
    const tabRoles = document.getElementById('tabRoles');

    const dataEntrySection = document.getElementById('dataEntrySection');
    const databaseSection = document.getElementById('databaseSection');
    const rolesSection = document.getElementById('rolesSection');

    const uploadForm = document.getElementById('uploadForm');
    const singleUploadBtn = document.getElementById('singleUploadBtn');
    const jsonInput = document.getElementById('jsonInput');
    const jsonFile = document.getElementById('jsonFile');
    const uploadJSONBtn = document.getElementById('uploadJSONBtn');

    const dataBody = document.getElementById('dataBody');
    const filterCollege = document.getElementById('filterCollege');
    const filterCat = document.getElementById('filterCat');
    const sortBy = document.getElementById('sortBy');
    const sortDir = document.getElementById('sortDir');
    const refreshBtn = document.getElementById('refreshBtn');
    const searchInput = document.getElementById('searchInput');
    const tableInfo = document.getElementById('tableInfo');

    // Edit modal elements
    const editModal = document.getElementById('editModal');
    const editForm = document.getElementById('editForm');
    const edit_id = document.getElementById('edit_id');
    const edit_college = document.getElementById('edit_college');
    const edit_branch = document.getElementById('edit_branch');
    const edit_cat = document.getElementById('edit_cat');
    const edit_round = document.getElementById('edit_round');
    const edit_close = document.getElementById('edit_close');
    const edit_marks = document.getElementById('edit_marks');
    const saveEdit = document.getElementById('saveEdit');
    const cancelEdit = document.getElementById('cancelEdit');
    const closeEdit = document.getElementById('closeEdit');

    // Admins management elements
    const manageAdminsNote = document.getElementById('manageAdminsNote');
    const adminsBody = document.getElementById('adminsBody');
    const adminFormWrap = document.getElementById('adminFormWrap');
    const newAdminName = document.getElementById('newAdminName');
    const newAdminEmail = document.getElementById('newAdminEmail');
    const newAdminPassword = document.getElementById('newAdminPassword');
    const newAdminRole = document.getElementById('newAdminRole');
    const addAdminBtn = document.getElementById('addAdminBtn');

    const exportBtn = document.getElementById('exportBtn');

    // -------------------------------
    // State
    // -------------------------------
    let allRecords = [];
    let unsubscribeSnapshot = null;
    let currentUserEmail = null;
    let currentUserRole = null;
    let currentUserName = null;

    // -------------------------------
    // Helper functions
    // -------------------------------
    function esc(s){ if (s === undefined || s === null) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
    function show(el){ el.classList.remove('hidden-el'); }
    function hide(el){ if(!el.classList.contains('hidden-el')) el.classList.add('hidden-el'); }
    function setActiveTab(tabBtn){
      [tabDataEntry, tabDatabase, tabRoles].forEach(b => b.classList.remove('active'));
      tabBtn.classList.add('active');
    }

    // -------------------------------
    // Tab wiring
    // -------------------------------
    tabDataEntry.addEventListener('click', () => {
      setActiveTab(tabDataEntry);
      show(dataEntrySection);
      hide(databaseSection);
      hide(rolesSection);
    });
    tabDatabase.addEventListener('click', () => {
      setActiveTab(tabDatabase);
      hide(dataEntrySection);
      show(databaseSection);
      hide(rolesSection);
      startRealtimeListener();
      loadAdminsList(); // keep admin list up to date for context
    });
    tabRoles.addEventListener('click', () => {
      setActiveTab(tabRoles);
      hide(dataEntrySection);
      hide(databaseSection);
      show(rolesSection);
      loadAdminsList();
    });

    // -------------------------------
    // Login (uses admins collection; emails stored lowercase)
    // -------------------------------
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = (emailInput.value || '').trim().toLowerCase();
      const password = (passwordInput.value || '').trim();
      if (!email || !password) { alert('Enter email & password'); return; }
      try {
        const q = query(collection(db, 'admins'), where('email','==', email), where('password','==', password));
        const snap = await getDocs(q);
        if (snap.empty) { alert('Invalid credentials or admin not found.'); return; }
        const docSnap = snap.docs[0];
        const data = docSnap.data();

        currentUserEmail = (data.email || email).toLowerCase();
        currentUserRole = data.role || 'viewer';
        currentUserName = data.name || currentUserEmail;

        // UI
        userEmail.textContent = `${currentUserName} (${currentUserRole})`;
        loginForm.classList.add('hidden');
        userSection.classList.remove('hidden');

        // show tabs
        tabDataEntry.classList.remove('hidden-el'); tabDataEntry.classList.remove('hidden'); tabDataEntry.classList.remove('hidden-el');
        tabDatabase.classList.remove('hidden'); tabRoles.classList.remove('hidden');

        // default tab
        setActiveTab(tabDataEntry);
        show(dataEntrySection);
        hide(databaseSection);
        hide(rolesSection);

        // apply role permissions
        applyRolePermissions();

        passwordInput.value = '';
        alert(`✅ Logged in as ${currentUserName} (${currentUserRole})`);
      } catch (err) {
        console.error(err);
        alert('Login error: ' + err.message);
      }
    });

    logoutBtn.addEventListener('click', () => {
      // simple full reload to clear state safely
      window.location.reload();
    });

    // -------------------------------
    // Role permissions UI
    // -------------------------------
    function applyRolePermissions(){
      // defaults
      manageAdminsNote.classList.add('hidden');
      adminFormWrap.style.display = 'grid';

      if (!currentUserRole) {
        singleUploadBtn.disabled = true;
        uploadJSONBtn.disabled = true;
        adminFormWrap.style.display = 'none';
        return;
      }

      if (currentUserRole === 'viewer') {
        // viewers can view database and roles list, but cannot modify
        singleUploadBtn.disabled = true;
        uploadJSONBtn.disabled = true;
        addAdminBtn.disabled = true;
        addAdminBtn.classList.add('opacity-50','cursor-not-allowed');
        adminFormWrap.style.pointerEvents = 'none';
        manageAdminsNote.classList.remove('hidden');
      } else if (currentUserRole === 'editor') {
        // editors can add/edit/delete cutoffs, but cannot manage admins
        singleUploadBtn.disabled = false;
        uploadJSONBtn.disabled = false;
        addAdminBtn.disabled = true;
        adminFormWrap.style.pointerEvents = 'none';
        manageAdminsNote.classList.remove('hidden');
      } else if (currentUserRole === 'superadmin') {
        // full access
        singleUploadBtn.disabled = false;
        uploadJSONBtn.disabled = false;
        addAdminBtn.disabled = false;
        adminFormWrap.style.pointerEvents = 'auto';
        manageAdminsNote.classList.add('hidden');
      } else {
        // unknown roles -> conservative
        singleUploadBtn.disabled = true;
        uploadJSONBtn.disabled = true;
        addAdminBtn.disabled = true;
        adminFormWrap.style.pointerEvents = 'none';
        manageAdminsNote.classList.remove('hidden');
      }
    }

    // -------------------------------
    // Data upload: single and bulk
    // -------------------------------
    singleUploadBtn.addEventListener('click', async (e) => {
      e.preventDefault();
      if (!currentUserEmail) return alert('Please log in first.');
      if (currentUserRole === 'viewer') return alert('Unauthorized: viewer cannot add records.');

      const docObj = {
        college: (uploadForm.college.value || '').trim(),
        branch: (uploadForm.branch.value || '').trim(),
        cat: (uploadForm.cat.value || '').trim(),
        round: (uploadForm.round.value || '').trim(),
        close: Number(uploadForm.close.value) || null,
        marks: Number(uploadForm.marks.value) || null,
        createdBy: currentUserEmail,
        createdAt: Date.now()
      };
      if (!docObj.college || !docObj.branch) return alert('Enter college & branch');

      try {
        await addDoc(collection(db, 'cutoffs'), docObj);
        alert('✅ Single entry uploaded!');
        uploadForm.reset();
      } catch (err) {
        console.error(err);
        alert('Upload failed: ' + err.message);
      }
    });

    jsonFile.addEventListener('change', async (ev) => {
      const file = ev.target.files[0];
      if (!file) return;
      const text = await file.text();
      jsonInput.value = text;
    });

    uploadJSONBtn.addEventListener('click', async () => {
      if (!currentUserEmail) return alert('Please log in first.');
      if (currentUserRole === 'viewer') return alert('Unauthorized: viewer cannot add records.');
      let jsonData;
      try { jsonData = JSON.parse(jsonInput.value); }
      catch(e){ alert('Invalid JSON: ' + e.message); return; }
      if (!Array.isArray(jsonData)) { alert('JSON must be an array'); return; }
      let count = 0;
      for (const item of jsonData) {
        const docObj = {
          round: item.round ?? item.Round ?? '',
          college: item.college ?? item.College ?? '',
          branch: item.branch ?? item.Branch ?? '',
          cat: item.cat ?? item.Cat ?? '',
          close: Number(item.close ?? item.Close ?? null),
          marks: Number(item.marks ?? item.Marks ?? null),
          createdBy: currentUserEmail,
          createdAt: Date.now()
        };
        try { await addDoc(collection(db, 'cutoffs'), docObj); count++; }
        catch(err){ console.error('Upload error', err); }
      }
      alert(`✅ Uploaded ${count} records!`);
      jsonInput.value = ''; jsonFile.value = '';
    });

    // -------------------------------
    // Realtime listener and rendering
    // -------------------------------
    function startRealtimeListener(){
      if (unsubscribeSnapshot) return;
      const collRef = collection(db, 'cutoffs');
      unsubscribeSnapshot = onSnapshot(collRef, snapshot => {
        allRecords = [];
        snapshot.forEach(s => allRecords.push({ id: s.id, ...s.data() }));
        populateFilters();
        renderTable();
      }, err => {
        console.error('Snapshot error', err);
        alert('Could not load data: ' + err.message);
      });
    }

    function populateFilters(){
      const colleges = Array.from(new Set(allRecords.map(r => r.college).filter(Boolean))).sort();
      const prev = filterCollege.value || '';
      filterCollege.innerHTML = `<option value="">All</option>` + colleges.map(c => `<option value="${esc(c)}">${esc(c)}</option>`).join('');
      if (colleges.includes(prev)) filterCollege.value = prev;
    }

    function renderTable(){
      let rows = allRecords.slice();

      const search = (searchInput.value || '').trim().toLowerCase();
      if (search){
        rows = rows.filter(r =>
          (r.college && r.college.toLowerCase().includes(search)) ||
          (r.branch && r.branch.toLowerCase().includes(search)) ||
          (r.cat && r.cat.toLowerCase().includes(search))
        );
      }

      const fc = filterCollege.value;
      if (fc) rows = rows.filter(r => r.college === fc);

      const fc2 = filterCat.value;
      if (fc2) rows = rows.filter(r => r.cat === fc2);

      const sBy = sortBy.value;
      const dir = sortDir.value === 'asc' ? 1 : -1;
      rows.sort((a,b) => {
        let va = a[sBy], vb = b[sBy];
        if (typeof va === 'number' && typeof vb === 'number') return (va - vb) * dir;
        va = (va === undefined || va === null) ? '' : String(va).toLowerCase();
        vb = (vb === undefined || vb === null) ? '' : String(vb).toLowerCase();
        if (va < vb) return -1 * dir;
        if (va > vb) return 1 * dir;
        return 0;
      });

      tableInfo.textContent = `${rows.length} records`;
      if (rows.length === 0){
        dataBody.innerHTML = `<tr><td colspan="7" class="text-gray-400 py-4">No records found</td></tr>`;
        return;
      }

      const html = rows.map(r => `
        <tr data-id="${r.id}">
          <td>${esc(r.college)}</td>
          <td>${esc(r.branch)}</td>
          <td>${esc(r.cat)}</td>
          <td>${esc(r.round)}</td>
          <td>${r.close ?? ''}</td>
          <td>${r.marks ?? ''}</td>
          <td>
            <button data-id="${r.id}" class="editBtn px-3 py-1 mr-2 bg-emerald-600 rounded text-xs text-white">Edit</button>
            <button data-id="${r.id}" class="deleteBtn px-3 py-1 bg-red-600 rounded text-xs text-white">Delete</button>
          </td>
        </tr>
      `).join('');
      dataBody.innerHTML = html;

      // attach handlers
      document.querySelectorAll('.editBtn').forEach(b => b.addEventListener('click', onEditClick));
      document.querySelectorAll('.deleteBtn').forEach(b => b.addEventListener('click', onDeleteClick));

      // role-based disabling (visual)
      if (currentUserRole === 'viewer'){
        document.querySelectorAll('.editBtn, .deleteBtn, #singleUploadBtn, #uploadJSONBtn').forEach(el => {
          try { el.disabled = true; el.classList.add('opacity-50','cursor-not-allowed'); } catch{}
        });
      } else {
        // ensure enabled
        document.querySelectorAll('.editBtn, .deleteBtn, #singleUploadBtn, #uploadJSONBtn').forEach(el => {
          try { el.disabled = false; el.classList.remove('opacity-50','cursor-not-allowed'); } catch{}
        });
      }
    }

    // -------------------------------
    // Edit / Delete actions
    // -------------------------------
    function onEditClick(e){
      const id = e.currentTarget.getAttribute('data-id');
      const rec = allRecords.find(r => r.id === id);
      if (!rec) { alert('Record not found'); return; }
      edit_id.value = rec.id;
      edit_college.value = rec.college || '';
      edit_branch.value = rec.branch || '';
      edit_cat.value = rec.cat || '';
      edit_round.value = rec.round || '';
      edit_close.value = rec.close ?? '';
      edit_marks.value = rec.marks ?? '';
      openEditModal();
    }

    async function onDeleteClick(e){
      if (!currentUserEmail) return alert('Please log in first.');
      if (currentUserRole === 'viewer') return alert('Unauthorized: viewer cannot delete.');
      const id = e.currentTarget.getAttribute('data-id');
      if (!confirm('Delete this record? This cannot be undone.')) return;
      try {
        await deleteDoc(doc(db, 'cutoffs', id));
        alert('✅ Deleted');
      } catch (err) {
        console.error(err);
        alert('Delete failed: ' + err.message);
      }
    }

    function openEditModal(){ show(editModal); editModal.style.display = 'flex'; }
    function closeEditModal(){ hide(editModal); editModal.style.display = 'none'; }

    closeEdit.addEventListener('click', closeEditModal);
    cancelEdit.addEventListener('click', closeEditModal);

    saveEdit.addEventListener('click', async () => {
      const id = edit_id.value;
      if (!id) return;
      if (currentUserRole === 'viewer') return alert('Unauthorized: viewer cannot edit.');
      const updated = {
        college: (edit_college.value || '').trim(),
        branch: (edit_branch.value || '').trim(),
        cat: (edit_cat.value || '').trim(),
        round: (edit_round.value || '').trim(),
        close: Number(edit_close.value) || null,
        marks: Number(edit_marks.value) || null,
        updatedBy: currentUserEmail,
        updatedAt: Date.now()
      };
      try {
        await updateDoc(doc(db, 'cutoffs', id), updated);
        alert('✅ Updated');
        closeEditModal();
      } catch (err) {
        console.error(err);
        alert('Update failed: ' + err.message);
      }
    });

    // -------------------------------
    // Search / filter hooks
    // -------------------------------
    [filterCollege, filterCat, sortBy, sortDir, searchInput].forEach(el => {
      el.addEventListener('change', renderTable);
      el.addEventListener('input', renderTable);
    });
    refreshBtn.addEventListener('click', () => renderTable());

    // -------------------------------
    // Export (password confirmation)
    // -------------------------------
    exportBtn.addEventListener('click', async () => {
      if (!currentUserEmail) return alert('Please log in first.');
      const enteredPassword = prompt('Enter your admin password to export data:');
      if (!enteredPassword) return;
      try {
        const q = query(collection(db, 'admins'), where('email','==', currentUserEmail.toLowerCase()), where('password','==', enteredPassword));
        const snap = await getDocs(q);
        if (snap.empty) { alert('Incorrect password.'); return; }
        const cutoffSnap = await getDocs(collection(db, 'cutoffs'));
        const allData = [];
        cutoffSnap.forEach(d => allData.push({ id: d.id, ...d.data() }));
        const blob = new Blob([JSON.stringify(allData, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `cutoffs_export_${new Date().toISOString().slice(0,10)}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        alert(`✅ Exported ${allData.length} records successfully!`);
      } catch (err) {
        console.error(err);
        alert('Export failed: ' + err.message);
      }
    });

    // -------------------------------
    // Admins: list/add/delete
    // -------------------------------
    async function loadAdminsList(){
      try {
        const snaps = await getDocs(collection(db, 'admins'));
        const rows = [];
        snaps.forEach(s => rows.push({ id: s.id, ...s.data() }));
        renderAdmins(rows);
      } catch (err) {
        console.error('Load admins error', err);
      }
    }

    function renderAdmins(list){
      if (!Array.isArray(list) || list.length === 0){
        adminsBody.innerHTML = `<tr><td colspan="4" class="text-gray-400 py-3">No admins found</td></tr>`;
        return;
      }
      adminsBody.innerHTML = list.map(a => `
        <tr data-id="${a.id}">
          <td class="p-2 text-sm">${esc(a.name || '')}</td>
          <td class="p-2 text-sm">${esc((a.email || '').toLowerCase())}</td>
          <td class="p-2 text-sm">${esc(a.role || '')}</td>
          <td class="p-2 text-sm">
            ${currentUserRole === 'superadmin' ? `<button data-id="${a.id}" class="deleteAdminBtn px-2 py-1 bg-red-600 text-xs text-white rounded">Delete</button>` : `<span class="text-xs text-gray-400">read-only</span>`}
          </td>
        </tr>
      `).join('');

      if (currentUserRole === 'superadmin'){
        document.querySelectorAll('.deleteAdminBtn').forEach(btn => btn.addEventListener('click', async (ev) => {
          const id = btn.getAttribute('data-id');
          if (!confirm('Delete this admin?')) return;
          try {
            await deleteDoc(doc(db, 'admins', id));
            alert('✅ Admin deleted');
            loadAdminsList();
          } catch (err) {
            console.error(err);
            alert('Delete failed: ' + err.message);
          }
        }));
      }
    }

    addAdminBtn.addEventListener('click', async () => {
      if (currentUserRole !== 'superadmin') return alert('Only superadmins can add admins.');
      const name = (newAdminName.value || '').trim();
      const email = (newAdminEmail.value || '').trim().toLowerCase();
      const password = (newAdminPassword.value || '').trim();
      const role = (newAdminRole.value || 'viewer');
      if (!name || !email || !password) return alert('Please provide name, email & password.');
      try {
        const q = query(collection(db, 'admins'), where('email','==', email));
        const snap = await getDocs(q);
        if (!snap.empty) return alert('Admin with this email already exists.');
        await addDoc(collection(db, 'admins'), { name, email, password, role });
        alert('✅ Admin added');
        newAdminName.value = ''; newAdminEmail.value = ''; newAdminPassword.value = '';
        loadAdminsList();
      } catch (err) {
        console.error(err);
        alert('Add admin failed: ' + err.message);
      }
    });

    // -------------------------------
    // Utility: initial UI state
    // -------------------------------
    window.addEventListener('load', () => {
      // hide tabs until login
      tabDataEntry.classList.add('hidden');
      tabDatabase.classList.add('hidden');
      tabRoles.classList.add('hidden');

      hide(dataEntrySection);
      hide(databaseSection);
      hide(rolesSection);
      hide(editModal);
    });
