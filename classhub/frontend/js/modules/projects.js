/**
 * Module: Projects (shared across Student/CR views)
 */
const ModProjects = (() => {

  const render = async (containerId, canManage) => {
    const el = document.getElementById(containerId);
    el.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>`;
    try {
      const res = await ChAPI.get('/projects');
      if (!res.projects || res.projects.length === 0) {
        el.innerHTML = ChUtils.emptyState('bi-kanban', 'No projects assigned yet.');
        return;
      }
      el.innerHTML = `<div class="row g-3">` + res.projects.map(p => `
        <div class="col-md-6">
          <div class="ch-panel h-100">
            <div class="ch-panel-body">
              <span class="badge bg-info bg-opacity-10 text-info badge-ch mb-2">${ChUtils.escapeHtml(p.subject)}</span>
              <h6 class="fw-bold">${ChUtils.escapeHtml(p.title)}</h6>
              <p class="small mb-3" style="color:var(--ch-text-muted)">${ChUtils.escapeHtml(p.description || 'No description provided.')}</p>
              <div class="d-flex justify-content-between small mb-3" style="color:var(--ch-text-muted)">
                <span><i class="bi bi-calendar-plus me-1"></i>Assigned: ${ChUtils.formatDate(p.assigned_date)}</span>
                <span><i class="bi bi-flag me-1"></i>Deadline: ${ChUtils.formatDate(p.submission_deadline)}</span>
              </div>
              <div class="d-flex justify-content-between align-items-center">
                <span class="small" style="color:var(--ch-text-muted)"><i class="bi bi-person-circle me-1"></i>${ChUtils.escapeHtml(p.uploaded_by_name)}</span>
                <div class="d-flex gap-2">
                  ${p.attachment_path ? `<a href="${ChUtils.fileUrl(p.attachment_path)}" target="_blank" class="btn btn-sm btn-ch-outline py-1 px-2"><i class="bi bi-paperclip"></i></a>` : ''}
                  ${canManage ? `<button class="btn btn-sm btn-outline-danger py-1 px-2" onclick="ModProjects.remove(${p.project_id}, '${containerId}', ${canManage})"><i class="bi bi-trash"></i></button>` : ''}
                </div>
              </div>
            </div>
          </div>
        </div>`).join('') + `</div>`;
    } catch (err) {
      el.innerHTML = ChUtils.emptyState('bi-wifi-off', err.message);
    }
  };

  const uploadForm = async (e, containerId) => {
    e.preventDefault();
    const form = document.getElementById('projectForm');
    const formData = new FormData(form);
    const btn = document.getElementById('projectSubmitBtn');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner-border spinner-border-sm me-2"></span>Saving...';
    try {
      await ChAPI.post('/projects', formData);
      ChUtils.toast('Project posted successfully!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('projectModal')).hide();
      form.reset();
      render(containerId, true);
    } catch (err) {
      ChUtils.toast(err.message, 'error');
    } finally {
      btn.disabled = false;
      btn.innerHTML = '<i class="bi bi-upload me-2"></i>Post Project';
    }
  };

  const remove = async (id, containerId, canManage) => {
    if (!ChUtils.confirmAction('Delete this project?')) return;
    try {
      await ChAPI.delete(`/projects/${id}`);
      ChUtils.toast('Project deleted.', 'success');
      render(containerId, canManage);
    } catch (err) {
      ChUtils.toast(err.message, 'error');
    }
  };

  return { render, uploadForm, remove };
})();
