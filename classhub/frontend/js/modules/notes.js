/**
 * Module: Notes (shared across Student/CR views)
 */
const ModNotes = (() => {

  const fileIcon = (type) => type === 'pdf'
    ? '<i class="bi bi-file-earmark-pdf-fill"></i>'
    : '<i class="bi bi-file-earmark-image-fill"></i>';

  const render = async (containerId, canManage, currentUserId) => {
    const el = document.getElementById(containerId);
    el.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>`;
    try {
      const res = await ChAPI.get('/notes');
      if (!res.notes || res.notes.length === 0) {
        el.innerHTML = ChUtils.emptyState('bi-journal-x', 'No notes uploaded yet.');
        return;
      }
      el.innerHTML = `<div class="row g-3">` + res.notes.map(n => `
        <div class="col-md-6 col-lg-4">
          <div class="ch-file-card h-100">
            <div class="ch-file-icon ${n.file_type === 'pdf' ? 'bg-soft-danger' : 'bg-soft-info'}">${fileIcon(n.file_type)}</div>
            <div class="flex-grow-1 min-w-0">
              <div class="fw-bold small text-truncate">${ChUtils.escapeHtml(n.title)}</div>
              <div style="font-size:.76rem; color:var(--ch-text-muted)">${ChUtils.escapeHtml(n.subject)}</div>
              <div style="font-size:.72rem; color:var(--ch-text-muted)">By ${ChUtils.escapeHtml(n.uploaded_by_name)} • ${ChUtils.formatDate(n.upload_date)}</div>
            </div>
            <div class="d-flex flex-column gap-1">
              <a href="${ChUtils.fileUrl(n.file_path)}" target="_blank" class="btn btn-sm btn-ch-primary py-1 px-2"><i class="bi bi-download"></i></a>
              ${canManage ? `<button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="ModNotes.remove(${n.note_id}, '${containerId}', ${canManage}, ${currentUserId})"><i class="bi bi-trash"></i></button>` : ''}
            </div>
          </div>
        </div>`).join('') + `</div>`;
    } catch (err) {
      el.innerHTML = ChUtils.emptyState('bi-wifi-off', err.message);
    }
  };

  const uploadForm = async (e, containerId) => {
    e.preventDefault();
    const form = document.getElementById('notesUploadForm');
    const formData = new FormData(form);
    const btn = document.getElementById('notesUploadBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Uploading...';
    try {
      await ChAPI.post('/notes', formData);
      ChUtils.toast('Note uploaded successfully!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('notesModal')).hide();
      form.reset();
      render(containerId, true);
    } catch (err) {
      ChUtils.toast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-upload me-2"></i>Upload Note';
    }
  };

  const remove = async (id, containerId, canManage) => {
    if (!ChUtils.confirmAction('Delete this note? This cannot be undone.')) return;
    try {
      await ChAPI.delete(`/notes/${id}`);
      ChUtils.toast('Note deleted.', 'success');
      render(containerId, canManage);
    } catch (err) {
      ChUtils.toast(err.message, 'error');
    }
  };

  return { render, uploadForm, remove };
})();
