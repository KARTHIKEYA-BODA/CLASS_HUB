/**
 * Module: Assignments (shared across Student/CR views)
 */
const ModAssignments = (() => {

  const daysLeft = (dateStr) => {
    const diff = Math.ceil((new Date(dateStr) - new Date()) / (1000 * 60 * 60 * 24));
    if (diff < 0) return { text: 'Deadline passed', cls: 'text-danger' };
    if (diff === 0) return { text: 'Due today', cls: 'text-danger' };
    if (diff <= 3) return { text: `${diff} day${diff > 1 ? 's' : ''} left`, cls: 'text-warning' };
    return { text: `${diff} days left`, cls: 'text-success' };
  };

  const render = async (containerId, canManage) => {
    const el = document.getElementById(containerId);
    el.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>`;
    try {
      const res = await ChAPI.get('/assignments');
      if (!res.assignments || res.assignments.length === 0) {
        el.innerHTML = ChUtils.emptyState('bi-clipboard-x', 'No assignments posted yet.');
        return;
      }
      el.innerHTML = `<div class="row g-3">` + res.assignments.map(a => {
        const dl = daysLeft(a.last_submission);
        return `
        <div class="col-md-6">
          <div class="ch-panel h-100">
            <div class="ch-panel-body">
              <div class="d-flex justify-content-between align-items-start mb-2">
                <span class="badge bg-primary bg-opacity-10 text-primary badge-ch">${ChUtils.escapeHtml(a.subject)}</span>
                <span class="small fw-bold ${dl.cls}">${dl.text}</span>
              </div>
              <h6 class="fw-bold">${ChUtils.escapeHtml(a.title)}</h6>
              <p class="small mb-3" style="color:var(--ch-text-muted)">${ChUtils.escapeHtml(a.description || 'No description provided.')}</p>
              <div class="d-flex justify-content-between small mb-3" style="color:var(--ch-text-muted)">
                <span><i class="bi bi-calendar-plus me-1"></i>Assigned: ${ChUtils.formatDate(a.date_assigned)}</span>
                <span><i class="bi bi-calendar-x me-1"></i>Due: ${ChUtils.formatDate(a.last_submission)}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span class="small" style="color:var(--ch-text-muted)"><i class="bi bi-person-circle me-1"></i>${ChUtils.escapeHtml(a.uploaded_by_name)}</span>
                <div class="d-flex gap-2">
                  ${a.attachment_path ? `<a href="${ChUtils.fileUrl(a.attachment_path)}" target="_blank" class="btn btn-sm btn-ch-outline py-1 px-2"><i class="bi bi-paperclip"></i></a>` : ''}
                  ${canManage ? `<button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="ModAssignments.remove(${a.assignment_id}, '${containerId}', ${canManage})"><i class="bi bi-trash"></i></button>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>`;
      }).join('') + `</div>`;
    } catch (err) {
      el.innerHTML = ChUtils.emptyState('bi-wifi-off', err.message);
    }
  };

  const uploadForm = async (e, containerId) => {
    e.preventDefault();
    const form = document.getElementById('assignmentForm');
    const formData = new FormData(form);
    const btn = document.getElementById('assignmentSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    try {
      await ChAPI.post('/assignments', formData);
      ChUtils.toast('Assignment posted successfully!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('assignmentModal')).hide();
      form.reset();
      render(containerId, true);
    } catch (err) {
      ChUtils.toast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-upload me-2"></i>Post Assignment';
    }
  };

  const remove = async (id, containerId, canManage) => {
    if (!ChUtils.confirmAction('Delete this assignment?')) return;
    try {
      await ChAPI.delete(`/assignments/${id}`);
      ChUtils.toast('Assignment deleted.', 'success');
      render(containerId, canManage);
    } catch (err) {
      ChUtils.toast(err.message, 'error');
    }
  };

  return { render, uploadForm, remove };
})();
