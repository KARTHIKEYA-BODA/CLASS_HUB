/**
 * Module: Schedule (shared across Student/CR/Admin views)
 */
const ModSchedule = (() => {
  const DAYS = ['Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

  const renderToday = async (containerId) => {
    const el = document.getElementById(containerId);
    el.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>`;
    try {
      const res = await ChAPI.get('/schedule/today');
      if (!res.schedule || res.schedule.length === 0) {
        el.innerHTML = ChUtils.emptyState('bi-calendar-x', res.message || 'No classes scheduled for today.');
        return;
      }
      el.innerHTML = `<div class="d-flex flex-column gap-2">` + res.schedule.map(s => `
        <div class="ch-list-item">
          <div class="ch-time-chip">${ChUtils.formatTime(s.start_time)}</div>
          <div class="flex-grow-1">
            <div class="fw-bold">${ChUtils.escapeHtml(s.subject)}</div>
            <div class="small" style="color:var(--ch-text-muted)">
              <i class="bi bi-person me-1"></i>${ChUtils.escapeHtml(s.faculty)}
              <span class="mx-1">•</span><i class="bi bi-door-open me-1"></i>Room ${ChUtils.escapeHtml(s.room_number)}
            </div>
          </div>
          <span class="badge bg-primary bg-opacity-10 text-primary">${ChUtils.formatTime(s.start_time)} - ${ChUtils.formatTime(s.end_time)}</span>
        </div>`).join('') + `</div>`;
    } catch (err) {
      el.innerHTML = ChUtils.emptyState('bi-wifi-off', err.message);
    }
  };

  const renderWeekly = async (containerId, canManage, uploaderRole) => {
    const el = document.getElementById(containerId);
    el.innerHTML = `<div class="text-center py-4"><div class="spinner-border text-primary"></div></div>`;
    try {
      const res = await ChAPI.get('/schedule/weekly');
      const byDay = {};
      DAYS.forEach(d => byDay[d] = []);
      (res.schedule || []).forEach(s => byDay[s.day_of_week]?.push(s));

      let html = `<div class="row g-3">`;
      DAYS.forEach(day => {
        html += `
          <div class="col-lg-4 col-md-6">
            <div class="ch-panel h-100">
              <div class="ch-panel-header"><h5>${day}</h5>${canManage ? `<button class="btn btn-sm btn-ch-primary" onclick="ModSchedule.openAddModal('${day}')"><i class="bi bi-plus-lg"></i></button>` : ''}</div>
              <div class="ch-panel-body">
                ${byDay[day].length === 0 ? `<p class="small text-center mb-0" style="color:var(--ch-text-muted)">No classes</p>` :
                  byDay[day].map(s => `
                    <div class="d-flex justify-content-between align-items-center mb-2 pb-2" style="border-bottom:1px solid var(--ch-border)">
                      <div>
                        <div class="fw-semibold small">${ChUtils.escapeHtml(s.subject)}</div>
                        <div style="font-size:.76rem; color:var(--ch-text-muted)">${ChUtils.escapeHtml(s.faculty)} • ${s.room_number} • ${ChUtils.formatTime(s.start_time)}</div>
                      </div>
                      ${canManage ? `<button class="btn btn-sm text-danger" onclick="ModSchedule.remove(${s.schedule_id})"><i class="bi bi-trash"></i></button>` : ''}
                    </div>`).join('')}
              </div>
            </div>
          </div>`;
      });
      html += `</div>`;
      el.innerHTML = html;
    } catch (err) {
      el.innerHTML = ChUtils.emptyState('bi-wifi-off', err.message);
    }
  };

  const openAddModal = (day) => {
    document.getElementById('scheduleModalDay').value = day;
    document.getElementById('scheduleModalTitle').textContent = `Add Class – ${day}`;
    document.getElementById('scheduleForm').reset();
    document.getElementById('scheduleModalDay').value = day;
    new bootstrap.Modal(document.getElementById('scheduleModal')).show();
  };

  const submitForm = async (e) => {
    e.preventDefault();
    const payload = {
      day_of_week: document.getElementById('scheduleModalDay').value,
      subject: document.getElementById('scheduleSubject').value,
      faculty: document.getElementById('scheduleFaculty').value,
      start_time: document.getElementById('scheduleStart').value,
      end_time: document.getElementById('scheduleEnd').value,
      room_number: document.getElementById('scheduleRoom').value
    };
    try {
      await ChAPI.post('/schedule', payload);
      ChUtils.toast('Class added to schedule!', 'success');
      bootstrap.Modal.getInstance(document.getElementById('scheduleModal')).hide();
      renderWeekly('weeklyScheduleContainer', true);
    } catch (err) {
      ChUtils.toast(err.message, 'error');
    }
  };

  const remove = async (id) => {
    if (!ChUtils.confirmAction('Delete this class from the schedule?')) return;
    try {
      await ChAPI.delete(`/schedule/${id}`);
      ChUtils.toast('Class removed.', 'success');
      renderWeekly('weeklyScheduleContainer', true);
    } catch (err) {
      ChUtils.toast(err.message, 'error');
    }
  };

  return { renderToday, renderWeekly, openAddModal, submitForm, remove };
})();
