(function () {
  'use strict';

  var data = RecruitData.load();

  var sideLinks = document.querySelectorAll('.side-link[data-view]');
  var views = document.querySelectorAll('.admin-view');

  function switchView(name) {
    sideLinks.forEach(function (l) { l.classList.toggle('active', l.dataset.view === name); });
    views.forEach(function (v) { v.classList.toggle('active', v.id === 'view-' + name); });
    if (name === 'dashboard') renderDashboard();
    if (name === 'jobs') renderJobs();
    if (name === 'applications') { populateJobFilter(); renderApplications(); }
  }

  sideLinks.forEach(function (l) {
    l.addEventListener('click', function () { switchView(l.dataset.view); });
  });

  document.getElementById('btnResetData').addEventListener('click', function () {
    if (!confirm('确定要重置成示例数据吗？这会清空你新增/修改的所有内容。')) return;
    data = RecruitData.reset();
    switchView('dashboard');
  });

  function jobById(id) {
    return data.jobs.find(function (j) { return j.id === id; });
  }

  function jobTitle(id) {
    var j = jobById(id);
    return j ? j.title : '（已删除职位）';
  }

  function salaryLabel(job) {
    return '¥' + job.salaryMin.toLocaleString() + ' - ¥' + job.salaryMax.toLocaleString();
  }

  function currentYm() {
    var now = new Date();
    return now.getFullYear() + '-' + String(now.getMonth() + 1).padStart(2, '0');
  }

  // ---------- Dashboard ----------
  function renderDashboard() {
    var openJobsCount = data.jobs.filter(function (j) { return j.status === 'open'; }).length;
    var totalApps = data.applications.length;
    var pendingCount = data.applications.filter(function (a) { return a.status === '待筛选'; }).length;
    var ym = currentYm();
    var hiredThisMonth = data.applications.filter(function (a) {
      return a.status === '已录用' && (a.updatedAt || '').slice(0, 7) === ym;
    }).length;

    var stats = [
      { label: '在招职位数', value: openJobsCount },
      { label: '简历总数', value: totalApps },
      { label: '待筛选', value: pendingCount },
      { label: '本月已录用', value: hiredThisMonth },
    ];
    document.getElementById('statGrid').innerHTML = stats.map(function (s) {
      return '<div class="stat-card"><div class="num">' + s.value + '</div><div class="label">' + s.label + '</div></div>';
    }).join('');

    var recent = data.applications.slice().sort(function (a, b) { return b.appliedDate < a.appliedDate ? -1 : 1; }).slice(0, 5);
    document.getElementById('recentAppsBody').innerHTML = recent.map(function (a) {
      return '<tr><td>' + a.candidateName + '</td><td>' + jobTitle(a.jobId) + '</td><td>' + a.appliedDate + '</td>' +
        '<td><span class="badge ' + statusClass(a.status) + '">' + a.status + '</span></td></tr>';
    }).join('') || '<tr><td colspan="4" style="color:var(--muted)">暂无应聘记录</td></tr>';
  }

  function statusClass(s) {
    return { '待筛选': 'pending', '面试中': 'interview', '已录用': 'hired', '已拒绝': 'rejected' }[s] || 'pending';
  }

  // ---------- Jobs ----------
  var jobModalBackdrop = document.getElementById('jobModalBackdrop');
  var jobModalTitle = document.getElementById('jobModalTitle');
  var jobModalMsg = document.getElementById('jobModalMsg');
  var jobForm = document.getElementById('jobForm');
  var jobIdInput = document.getElementById('jobIdInput');
  var jobTitleInput = document.getElementById('jobTitleInput');
  var jobDeptInput = document.getElementById('jobDeptInput');
  var jobCityInput = document.getElementById('jobCityInput');
  var jobSalaryMinInput = document.getElementById('jobSalaryMinInput');
  var jobSalaryMaxInput = document.getElementById('jobSalaryMaxInput');
  var jobTypeInput = document.getElementById('jobTypeInput');
  var jobReqInput = document.getElementById('jobReqInput');

  function renderJobs() {
    document.getElementById('jobsBody').innerHTML = data.jobs.map(function (j) {
      var toggleLabel = j.status === 'open' ? '下架' : '上线';
      return '<tr><td>' + j.title + '</td><td>' + j.department + '</td><td>' + j.city + '</td><td>' + salaryLabel(j) + '</td><td>' + j.jobType + '</td>' +
        '<td><span class="badge ' + j.status + '">' + (j.status === 'open' ? '在招' : '已下架') + '</span></td>' +
        '<td class="table-actions">' +
        '<button class="btn btn-sm" data-edit="' + j.id + '">编辑</button>' +
        '<button class="btn btn-sm" data-toggle="' + j.id + '">' + toggleLabel + '</button>' +
        '<button class="btn btn-sm btn-danger" data-delete="' + j.id + '">删除</button>' +
        '</td></tr>';
    }).join('') || '<tr><td colspan="7" style="color:var(--muted)">暂无职位</td></tr>';

    document.querySelectorAll('[data-edit]').forEach(function (btn) {
      btn.addEventListener('click', function () { openJobModal(btn.dataset.edit); });
    });
    document.querySelectorAll('[data-toggle]').forEach(function (btn) {
      btn.addEventListener('click', function () { toggleJobStatus(btn.dataset.toggle); });
    });
    document.querySelectorAll('[data-delete]').forEach(function (btn) {
      btn.addEventListener('click', function () { deleteJob(btn.dataset.delete); });
    });
  }

  function openJobModal(id) {
    jobModalMsg.innerHTML = '';
    jobForm.reset();
    if (id) {
      var j = jobById(id);
      jobModalTitle.textContent = '编辑职位';
      jobIdInput.value = j.id;
      jobTitleInput.value = j.title;
      jobDeptInput.value = j.department;
      jobCityInput.value = j.city;
      jobSalaryMinInput.value = j.salaryMin;
      jobSalaryMaxInput.value = j.salaryMax;
      jobTypeInput.value = j.jobType;
      jobReqInput.value = j.requirements;
    } else {
      jobModalTitle.textContent = '新增职位';
      jobIdInput.value = '';
      jobTypeInput.value = '全职';
    }
    jobModalBackdrop.classList.add('show');
  }

  document.getElementById('btnAddJob').addEventListener('click', function () { openJobModal(null); });
  document.getElementById('btnCloseJobModal').addEventListener('click', function () { jobModalBackdrop.classList.remove('show'); });
  jobModalBackdrop.addEventListener('click', function (e) { if (e.target === jobModalBackdrop) jobModalBackdrop.classList.remove('show'); });

  jobForm.addEventListener('submit', function (e) {
    e.preventDefault();
    var title = jobTitleInput.value.trim();
    var department = jobDeptInput.value.trim();
    var city = jobCityInput.value.trim();
    var salaryMin = parseFloat(jobSalaryMinInput.value);
    var salaryMax = parseFloat(jobSalaryMaxInput.value);
    var jobType = jobTypeInput.value;
    var requirements = jobReqInput.value.trim();

    if (!title || !department || !city || !requirements || !(salaryMin >= 0) || !(salaryMax >= 0)) {
      jobModalMsg.innerHTML = '<div class="msg error">请完整填写所有必填项。</div>';
      return;
    }
    if (salaryMax < salaryMin) {
      jobModalMsg.innerHTML = '<div class="msg error">薪资上限不能低于薪资下限。</div>';
      return;
    }

    var id = jobIdInput.value;
    if (id) {
      var j = jobById(id);
      j.title = title; j.department = department; j.city = city;
      j.salaryMin = salaryMin; j.salaryMax = salaryMax; j.jobType = jobType; j.requirements = requirements;
    } else {
      data.jobs.push({
        id: RecruitData.uid('j'), title: title, department: department, city: city,
        salaryMin: salaryMin, salaryMax: salaryMax, jobType: jobType, requirements: requirements,
        status: 'open', postedDate: RecruitData.today(),
      });
    }
    RecruitData.save(data);
    jobModalBackdrop.classList.remove('show');
    renderJobs();
  });

  function toggleJobStatus(id) {
    var j = jobById(id);
    if (!j) return;
    j.status = j.status === 'open' ? 'closed' : 'open';
    RecruitData.save(data);
    renderJobs();
  }

  function deleteJob(id) {
    if (!confirm('确定删除这个职位吗？关联的应聘记录会保留但会显示"已删除职位"。')) return;
    data.jobs = data.jobs.filter(function (j) { return j.id !== id; });
    RecruitData.save(data);
    renderJobs();
  }

  // ---------- Applications ----------
  var currentStatusFilter = 'all';
  var currentJobFilter = 'all';

  function populateJobFilter() {
    var select = document.getElementById('jobFilter');
    var prev = select.value || 'all';
    select.innerHTML = '<option value="all">全部职位</option>' + data.jobs.map(function (j) {
      return '<option value="' + j.id + '">' + j.title + '</option>';
    }).join('');
    select.value = data.jobs.some(function (j) { return j.id === prev; }) ? prev : 'all';
    currentJobFilter = select.value;
  }

  document.getElementById('jobFilter').addEventListener('change', function (e) {
    currentJobFilter = e.target.value;
    renderApplications();
  });

  document.querySelectorAll('#appFilters .filter-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      currentStatusFilter = btn.dataset.status;
      document.querySelectorAll('#appFilters .filter-btn').forEach(function (b) { b.classList.toggle('active', b === btn); });
      renderApplications();
    });
  });

  function renderApplications() {
    var list = data.applications.filter(function (a) {
      if (currentJobFilter !== 'all' && a.jobId !== currentJobFilter) return false;
      if (currentStatusFilter !== 'all' && a.status !== currentStatusFilter) return false;
      return true;
    });

    document.getElementById('appsBody').innerHTML = list.map(function (a) {
      var actions = '<button class="btn btn-sm" data-view="' + a.id + '">查看</button> ';
      if (a.status === '待筛选') {
        actions += '<button class="btn btn-sm" data-advance="' + a.id + '" data-to="面试中">进入面试</button> ' +
          '<button class="btn btn-sm btn-danger" data-advance="' + a.id + '" data-to="已拒绝">拒绝</button>';
      } else if (a.status === '面试中') {
        actions += '<button class="btn btn-sm" data-advance="' + a.id + '" data-to="已录用">录用</button> ' +
          '<button class="btn btn-sm btn-danger" data-advance="' + a.id + '" data-to="已拒绝">拒绝</button>';
      }
      return '<tr><td>' + a.candidateName + '</td><td>' + jobTitle(a.jobId) + '</td><td>' + a.phone + '</td><td>' + a.appliedDate + '</td>' +
        '<td><span class="badge ' + statusClass(a.status) + '">' + a.status + '</span></td>' +
        '<td class="table-actions">' + actions + '</td></tr>';
    }).join('') || '<tr><td colspan="6" style="color:var(--muted)">暂无应聘记录</td></tr>';

    document.querySelectorAll('[data-view]').forEach(function (btn) {
      btn.addEventListener('click', function () { viewApplication(btn.dataset.view); });
    });
    document.querySelectorAll('[data-advance]').forEach(function (btn) {
      btn.addEventListener('click', function () { setApplicationStatus(btn.dataset.advance, btn.dataset.to); });
    });
  }

  function setApplicationStatus(id, status) {
    var a = data.applications.find(function (x) { return x.id === id; });
    if (!a) return;
    a.status = status;
    a.updatedAt = RecruitData.today();
    RecruitData.save(data);
    renderApplications();
  }

  var appModalBackdrop = document.getElementById('appModalBackdrop');
  var appModalMeta = document.getElementById('appModalMeta');
  var appModalResume = document.getElementById('appModalResume');

  function viewApplication(id) {
    var a = data.applications.find(function (x) { return x.id === id; });
    if (!a) return;
    document.getElementById('appModalTitle').textContent = a.candidateName + ' · ' + jobTitle(a.jobId);
    appModalMeta.textContent = a.phone + ' · 应聘于 ' + a.appliedDate + ' · 状态：' + a.status;
    appModalResume.innerHTML = '<strong>简历摘要：</strong><br>' + a.resumeText;
    appModalBackdrop.classList.add('show');
  }

  document.getElementById('btnCloseAppModal').addEventListener('click', function () { appModalBackdrop.classList.remove('show'); });
  appModalBackdrop.addEventListener('click', function (e) { if (e.target === appModalBackdrop) appModalBackdrop.classList.remove('show'); });

  switchView('dashboard');
})();
