(function (global) {
  'use strict';
  var STORAGE_KEY = 'recruit_lite_data_v1';

  function seed() {
    return {
      jobs: [
        { id: 'j1', title: '前端开发工程师', department: '技术部', city: '北京', salaryMin: 15000, salaryMax: 25000, jobType: '全职', requirements: '熟悉 Vue/React 等前端框架，3 年以上相关开发经验，有大型项目经验优先。', status: 'open', postedDate: '2026-08-15' },
        { id: 'j2', title: '招聘专员', department: '人力资源部', city: '上海', salaryMin: 8000, salaryMax: 12000, jobType: '全职', requirements: '熟悉招聘全流程，善于沟通与简历筛选，1 年以上招聘相关经验优先。', status: 'open', postedDate: '2026-08-16' },
        { id: 'j3', title: '新媒体运营实习生', department: '市场部', city: '深圳', salaryMin: 4000, salaryMax: 6000, jobType: '实习', requirements: '熟悉小红书/抖音等平台运营，文案功底扎实，在校生优先，每周至少 3 天到岗。', status: 'open', postedDate: '2026-08-18' },
        { id: 'j4', title: '销售代表', department: '销售部', city: '广州', salaryMin: 6000, salaryMax: 15000, jobType: '全职', requirements: '1 年以上销售经验，能承受业绩压力，普通话标准，有客户资源者优先。', status: 'open', postedDate: '2026-08-14' },
        { id: 'j5', title: 'UI设计师', department: '设计部', city: '杭州', salaryMin: 10000, salaryMax: 18000, jobType: '全职', requirements: '精通 Figma / Sketch，有完整设计作品集，具备基本前端切图能力者优先。', status: 'open', postedDate: '2026-08-20' },
        { id: 'j6', title: '客服专员（兼职）', department: '客服部', city: '成都', salaryMin: 3000, salaryMax: 5000, jobType: '兼职', requirements: '性格耐心细致，能适应排班制，有客服经验者优先，时间灵活可长期合作。', status: 'open', postedDate: '2026-08-24' },
        { id: 'j7', title: '后端开发工程师', department: '技术部', city: '北京', salaryMin: 18000, salaryMax: 30000, jobType: '全职', requirements: '熟悉 Java/Go，有分布式系统经验，该职位已完成招聘。', status: 'closed', postedDate: '2026-07-10' },
      ],
      applications: [
        { id: 'a1', jobId: 'j1', candidateName: '张伟', phone: '13800000001', resumeText: '3 年前端开发经验，熟悉 Vue3 + TypeScript，主导过公司中台系统重构。', appliedDate: '2026-08-20', status: '待筛选', updatedAt: '2026-08-20' },
        { id: 'a2', jobId: 'j1', candidateName: '李娜', phone: '13800000002', resumeText: '前端开发 4 年经验，熟悉 React 生态，有跨端小程序开发经验。', appliedDate: '2026-08-18', status: '面试中', updatedAt: '2026-08-25' },
        { id: 'a3', jobId: 'j1', candidateName: '王强', phone: '13800000003', resumeText: '资深前端工程师，5 年经验，曾负责电商平台首页性能优化。', appliedDate: '2026-08-05', status: '已录用', updatedAt: '2026-08-15' },
        { id: 'a4', jobId: 'j2', candidateName: '陈静', phone: '13800000004', resumeText: '2 年招聘专员经验，独立负责过校招和社招全流程。', appliedDate: '2026-08-22', status: '待筛选', updatedAt: '2026-08-22' },
        { id: 'a5', jobId: 'j2', candidateName: '刘洋', phone: '13800000005', resumeText: '应届毕业生，人力资源管理专业，有实习期招聘协助经验。', appliedDate: '2026-08-19', status: '已拒绝', updatedAt: '2026-08-24' },
        { id: 'a6', jobId: 'j3', candidateName: '赵敏', phone: '13800000006', resumeText: '在校大三学生，运营过个人小红书账号，粉丝 2 万+。', appliedDate: '2026-08-26', status: '待筛选', updatedAt: '2026-08-26' },
        { id: 'a7', jobId: 'j4', candidateName: '孙涛', phone: '13800000007', resumeText: '2 年 To B 销售经验，擅长客户关系维护，有稳定客户资源。', appliedDate: '2026-08-15', status: '面试中', updatedAt: '2026-08-28' },
        { id: 'a8', jobId: 'j5', candidateName: '周雨', phone: '13800000008', resumeText: 'UI/UX 设计师，3 年经验，作品集涵盖电商与 SaaS 类产品。', appliedDate: '2026-08-12', status: '待筛选', updatedAt: '2026-08-12' },
      ],
    };
  }

  function load() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        var s = seed();
        localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
        return s;
      }
      return JSON.parse(raw);
    } catch (e) {
      return seed();
    }
  }

  function save(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function uid(prefix) {
    return prefix + '_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
  }

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function countApplications(data, jobId) {
    return data.applications.filter(function (a) { return a.jobId === jobId; }).length;
  }

  global.RecruitData = {
    load: load,
    save: save,
    uid: uid,
    today: today,
    countApplications: countApplications,
    reset: function () { var s = seed(); save(s); return s; },
  };
})(window);
