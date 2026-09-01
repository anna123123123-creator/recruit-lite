(function () {
  'use strict';

  var jobGrid = document.getElementById('jobGrid');
  var modalBackdrop = document.getElementById('modalBackdrop');
  var btnCloseModal = document.getElementById('btnCloseModal');
  var modalJobTitle = document.getElementById('modalJobTitle');
  var modalJobMeta = document.getElementById('modalJobMeta');
  var jobRequirements = document.getElementById('jobRequirements');
  var applyCount = document.getElementById('applyCount');
  var modalMsg = document.getElementById('modalMsg');
  var applyForm = document.getElementById('applyForm');
  var candidateNameInput = document.getElementById('candidateNameInput');
  var phoneInput = document.getElementById('phoneInput');
  var resumeInput = document.getElementById('resumeInput');

  var data = RecruitData.load();
  var currentJob = null;

  function openJobs() {
    return data.jobs.filter(function (j) { return j.status === 'open'; });
  }

  function salaryLabel(job) {
    return '¥' + job.salaryMin.toLocaleString() + ' - ¥' + job.salaryMax.toLocaleString() + '/月';
  }

  function renderGrid() {
    var jobs = openJobs();
    jobGrid.innerHTML = jobs.map(function (j) {
      return '<div class="job-card" data-id="' + j.id + '">' +
        '<div class="job-card__body">' +
        '<div class="job-card__top"><h3>' + j.title + '</h3><span class="badge type">' + j.jobType + '</span></div>' +
        '<div class="job-card__loc">' + j.department + ' · ' + j.city + '</div>' +
        '<div class="job-card__price">' + salaryLabel(j) + '</div>' +
        '<p class="job-card__req">' + j.requirements + '</p>' +
        '<div class="job-card__count">已有 ' + RecruitData.countApplications(data, j.id) + ' 人投递</div>' +
        '</div></div>';
    }).join('') || '<p style="color:var(--muted)">当前暂无在招职位，请稍后再来看看。</p>';

    jobGrid.querySelectorAll('.job-card').forEach(function (card) {
      card.addEventListener('click', function () {
        openModal(card.dataset.id);
      });
    });
  }

  function openModal(jobId) {
    currentJob = data.jobs.find(function (j) { return j.id === jobId; });
    if (!currentJob) return;

    modalJobTitle.textContent = currentJob.title;
    modalJobMeta.textContent = currentJob.department + ' · ' + currentJob.city + ' · ' + salaryLabel(currentJob) + ' · ' + currentJob.jobType;
    jobRequirements.innerHTML = '<strong>职位要求：</strong> ' + currentJob.requirements;
    updateApplyCount();

    modalMsg.innerHTML = '';
    applyForm.reset();
    modalBackdrop.classList.add('show');
  }

  function updateApplyCount() {
    applyCount.innerHTML = '<strong>已有人投递：</strong> ' + RecruitData.countApplications(data, currentJob.id) + ' 人';
  }

  function closeModal() {
    modalBackdrop.classList.remove('show');
    currentJob = null;
  }

  btnCloseModal.addEventListener('click', closeModal);
  modalBackdrop.addEventListener('click', function (e) {
    if (e.target === modalBackdrop) closeModal();
  });

  applyForm.addEventListener('submit', function (e) {
    e.preventDefault();
    if (!currentJob) return;

    var name = candidateNameInput.value.trim();
    var phone = phoneInput.value.trim();
    var resumeText = resumeInput.value.trim();

    if (!name) return showMsg('请填写姓名。', true);
    if (!phone) return showMsg('请填写手机号。', true);
    if (!resumeText) return showMsg('请填写简历摘要 / 自我介绍。', true);

    var application = {
      id: RecruitData.uid('a'),
      jobId: currentJob.id,
      candidateName: name,
      phone: phone,
      resumeText: resumeText,
      appliedDate: RecruitData.today(),
      status: '待筛选',
      updatedAt: RecruitData.today(),
    };
    data.applications.push(application);
    RecruitData.save(data);

    showMsg('应聘申请已提交，HR 会尽快联系你。', false);
    applyForm.reset();
    updateApplyCount();
    renderGrid();
  });

  function showMsg(text, isError) {
    modalMsg.innerHTML = '<div class="msg ' + (isError ? 'error' : 'success') + '">' + text + '</div>';
  }

  renderGrid();
})();
