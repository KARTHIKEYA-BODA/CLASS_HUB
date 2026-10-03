/**
 * Module: Semester Ranking (view for all, edit for Admin)
 */
const ModRanking = (() => {
  const render = async (containerId, canManage) => {
    const el = document.getElementById(containerId);
    el.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>`;
    try {
      const res = await ChAPI.get('/ranking');
      if (!res.ranking || res.ranking.length === 0) {
        el.innerHTML = ChUtils.emptyState('bi-trophy', 'Semester ranking has not been uploaded yet.');
        return;
      }
      el.innerHTML = `
        <div class="ch-table-wrap">
          <table class="table-ch">
            <thead><tr>
              <th>Rank</th><th>Student Name</th><th>Roll Number</th><th>Semester</th><th>SGPA</th><th>CGPA</th>
              ${canManage ? '<th>Actions</th>' : ''}
            </tr></thead>
            <tbody>
              ${res.ranking.map(r => `
                <tr class="${r.rank_no === 1 ? 'rank-1' : r.rank_no === 2 ? 'rank-2' : r.rank_no === 3 ? 'rank-3' : ''}">
                  <td>#${r.rank_no} ${r.rank_no <= 3 ? '<i class="bi bi-trophy-fill"></i>' : ''}</td>
                  <td class="fw-semibold">${ChUtils.escapeHtml(r.student_name)}</td>
                  <td>${ChUtils.escapeHtml(r.roll_number)}</td>
                  <td>Sem ${r.semester}</td>
                  <td>${r.sgpa}</td>
                  <td>${r.cgpa}</td>
                  ${canManage ? `<td><button class="btn btn-sm text-danger" onclick="ModRanking.remove(${r.ranking_id}, '${containerId}')"><i class="bi bi-trash"></i></button></td>` : ''}
                </tr>`).join('')}
            </tbody>
          </table>
        </div>`;
    } catch (err) {
      el.innerHTML = ChUtils.emptyState('bi-wifi-off', err.message);
    }
  };

  const submitForm = async (e, containerId) => {
    e.preventDefault();
    const payload = {
      student_id: document.getElementById('rankStudentSelect').value,
      semester: document.getElementById('rankSemester').value,
      rank_no: document.getElementById('rankNo').value,
      sgpa: document.getElementById('rankSgpa').value,
      cgpa: document.getElementById('rankCgpa').value
    };
    try {
      await ChAPI.post('/ranking', payload);
      ChUtils.toast('Ranking updated successfully!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('rankingModal')).hide();
      document.getElementById('rankingForm').reset();
      render(containerId, true);
    } catch (err) {
      ChUtils.toast(err.message, 'error');
    }
  };

  const remove = async (id, containerId) => {
    if (!ChUtils.confirmAction('Remove this student from the ranking list?')) return;
    try {
      await ChAPI.delete(`/ranking/${id}`);
      ChUtils.toast('Ranking entry removed.', 'success');
      render(containerId, true);
    } catch (err) {
      ChUtils.toast(err.message, 'error');
    }
  };

  return { render, submitForm, remove };
})();

/**
 * Module: Notices (post by Admin/CR, view by all)
 */
const ModNotices = (() => {
  const render = async (containerId, canManage, currentUserId, currentRole) => {
    const el = document.getElementById(containerId);
    el.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>`;
    try {
      const res = await ChAPI.get('/notices');
      if (!res.notices || res.notices.length === 0) {
        el.innerHTML = ChUtils.emptyState('bi-megaphone', 'No notices posted yet.');
        return;
      }
      el.innerHTML = `<div class="d-flex flex-column gap-3">` + res.notices.map(n => {
        const canDelete = canManage && (currentRole === 'admin' || n.posted_by_id === currentUserId);
        return `
        <div class="ch-panel ch-notice-card ${n.is_important ? 'important' : ''}">
          <div class="ch-panel-body">
            <div class="d-flex justify-content-between align-items-start mb-2 flex-wrap gap-2">
              <div class="d-flex align-items-center gap-2">
                <span class="badge ${n.is_important ? 'bg-danger' : 'bg-primary'} bg-opacity-10 ${n.is_important ? 'text-danger' : 'text-primary'} badge-ch">
                  ${n.is_important ? '<i class="bi bi-exclamation-triangle-fill me-1"></i>Important' : n.posted_by_role.toUpperCase()}
                </span>
                <span class="small" style="color:var(--ch-text-muted)">${ChUtils.formatDateTime(n.posted_date)}</span>
              </div>
              ${canDelete ? `<button class="btn btn-sm text-danger" onclick="ModNotices.remove(${n.notice_id}, '${containerId}', ${canManage}, ${currentUserId}, '${currentRole}')"><i class="bi bi-trash"></i></button>` : ''}
            </div>
            <h6 class="fw-bold">${ChUtils.escapeHtml(n.title)}</h6>
            <p class="small mb-2" style="color:var(--ch-text-muted)">${ChUtils.escapeHtml(n.description)}</p>
            <div class="small" style="color:var(--ch-text-muted)"><i class="bi bi-person-circle me-1"></i>Posted by ${ChUtils.escapeHtml(n.posted_by_name)}</div>
          </div>
        </div>`;
      }).join('') + `</div>`;
    } catch (err) {
      el.innerHTML = ChUtils.emptyState('bi-wifi-off', err.message);
    }
  };

  const submitForm = async (e, containerId, canManage, currentUserId, currentRole) => {
    e.preventDefault();
    const payload = {
      title: document.getElementById('noticeTitle').value,
      description: document.getElementById('noticeDescription').value,
      is_important: document.getElementById('noticeImportant').checked
    };
    try {
      await ChAPI.post('/notices', payload);
      ChUtils.toast('Notice posted successfully!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('noticeModal')).hide();
      document.getElementById('noticeForm').reset();
      render(containerId, canManage, currentUserId, currentRole);
    } catch (err) {
      ChUtils.toast(err.message, 'error');
    }
  };

  const remove = async (id, containerId, canManage, currentUserId, currentRole) => {
    if (!ChUtils.confirmAction('Delete this notice?')) return;
    try {
      await ChAPI.delete(`/notices/${id}`);
      ChUtils.toast('Notice deleted.', 'success');
      render(containerId, canManage, currentUserId, currentRole);
    } catch (err) {
      ChUtils.toast(err.message, 'error');
    }
  };

  return { render, submitForm, remove };
})();
