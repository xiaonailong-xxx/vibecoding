const LOCAL_STORAGE_KEY = 'enterpro-credit-requests-v2'
const SESSION_KEY = 'enterpro-credit-session-v2'
const ADMIN_KEY = 'enterpro-admin-session-v1'
const PAGE_SIZE = 20

const demoApplications = [
  {
    id: crypto.randomUUID(),
    email: 'linxiaomai@enter.pro',
    name: '林小麦',
    course: 'Agentic Coding 工作流课',
    status: 'pending',
    adminFeedback: '管理员已收到申请，正在处理充值。',
    createdAt: '2026-04-16 09:42',
    updatedAt: '2026-04-16 09:42',
  },
  {
    id: crypto.randomUUID(),
    email: 'chenbeihai@enter.pro',
    name: '陈北海',
    course: 'AI Coding 入门课',
    status: 'approved',
    adminFeedback: '已完成充值，请刷新页面确认 Credits 是否到账。',
    createdAt: '2026-04-16 08:55',
    updatedAt: '2026-04-16 09:18',
  },
  {
    id: crypto.randomUUID(),
    email: 'wangchaoyu@enter.pro',
    name: '王朝雨',
    course: 'Vibe Coding 项目实践课',
    status: 'rejected',
    adminFeedback: '请先完成第一阶段作业后再申请 Credits。',
    createdAt: '2026-04-15 20:12',
    updatedAt: '2026-04-15 20:35',
  },
]

const statusMap = {
  pending: '待处理',
  approved: '通过',
  rejected: '驳回',
}

const state = {
  currentPortal: 'student',
  currentStudentView: 'form',
  currentPage: 1,
  currentFilter: 'all',
  selectedTicketId: null,
  applications: [],
}

const portalTabs = Array.from(document.querySelectorAll('.portal-tab'))
const studentPortal = document.querySelector('#student-portal')
const adminPortal = document.querySelector('#admin-portal')
const studentFormPanel = document.querySelector('#student-form-panel')
const studentResultPanel = document.querySelector('#student-result-panel')
const studentFormTab = document.querySelector('#student-form-tab')
const studentResultTab = document.querySelector('#student-result-tab')
const dataSourceBanner = document.querySelector('#data-source-banner')

const heroTotal = document.querySelector('#hero-total')
const heroPending = document.querySelector('#hero-pending')
const heroApproved = document.querySelector('#hero-approved')
const summaryTotal = document.querySelector('#summary-total')
const summaryPending = document.querySelector('#summary-pending')
const summaryRejected = document.querySelector('#summary-rejected')

const form = document.querySelector('#application-form')
const emailInput = document.querySelector('#email-input')
const nameInput = document.querySelector('#name-input')
const courseInput = document.querySelector('#course-input')
const submitButton = document.querySelector('#submit-button')
const fillDemoButton = document.querySelector('#fill-demo')
const formFeedback = document.querySelector('#form-feedback')

const studentResultEmpty = document.querySelector('#student-result-empty')
const studentResultCard = document.querySelector('#student-result-card')
const resultTitle = document.querySelector('#result-title')
const resultEmail = document.querySelector('#result-email')
const resultCourse = document.querySelector('#result-course')
const resultCreatedAt = document.querySelector('#result-created-at')
const resultUpdatedAt = document.querySelector('#result-updated-at')
const resultStatus = document.querySelector('#result-status')
const resultProgress = document.querySelector('#result-progress')
const resultNote = document.querySelector('#result-note')
const refreshResultButton = document.querySelector('#refresh-result')
const newApplicationButton = document.querySelector('#new-application')

const adminLoginPanel = document.querySelector('#admin-login-panel')
const adminDashboardPanel = document.querySelector('#admin-dashboard-panel')
const adminLoginForm = document.querySelector('#admin-login-form')
const adminEmailInput = document.querySelector('#admin-email-input')
const adminPasswordInput = document.querySelector('#admin-password-input')
const adminLoginButton = document.querySelector('#admin-login-button')
const adminLoginFeedback = document.querySelector('#admin-login-feedback')
const statusFilter = document.querySelector('#status-filter')
const refreshAdminButton = document.querySelector('#refresh-admin')
const logoutAdminButton = document.querySelector('#logout-admin')
const resetDataButton = document.querySelector('#reset-data')
const ticketList = document.querySelector('#ticket-list')
const paginationMeta = document.querySelector('#pagination-meta')
const pageIndicator = document.querySelector('#page-indicator')
const prevPageButton = document.querySelector('#prev-page')
const nextPageButton = document.querySelector('#next-page')
const ticketDetailEmpty = document.querySelector('.ticket-detail__empty')
const ticketDetailContent = document.querySelector('#ticket-detail-content')
const detailTitle = document.querySelector('#detail-title')
const detailEmail = document.querySelector('#detail-email')
const detailCourse = document.querySelector('#detail-course')
const detailCreatedAt = document.querySelector('#detail-created-at')
const detailUpdatedAt = document.querySelector('#detail-updated-at')
const detailNote = document.querySelector('#detail-note')
const detailStatus = document.querySelector('#detail-status')
const detailFeedback = document.querySelector('#detail-feedback')
const approveTicketButton = document.querySelector('#approve-ticket')
const rejectTicketButton = document.querySelector('#reject-ticket')
const detailFeedbackMessage = document.querySelector('#detail-feedback-message')

function cloneDemoApplications() {
  return demoApplications.map((item) => ({ ...item }))
}

function setBanner(message, type = '') {
  dataSourceBanner.textContent = message
  dataSourceBanner.classList.remove('is-error', 'is-success')
  if (type) {
    dataSourceBanner.classList.add(type)
  }
}

function setStudentSession(id) {
  localStorage.setItem(SESSION_KEY, id)
}

function getStudentSession() {
  return localStorage.getItem(SESSION_KEY)
}

function clearStudentSession() {
  localStorage.removeItem(SESSION_KEY)
}

function setAdminLoggedIn(isLoggedIn) {
  localStorage.setItem(ADMIN_KEY, isLoggedIn ? 'true' : 'false')
}

function isAdminLoggedIn() {
  return localStorage.getItem(ADMIN_KEY) === 'true'
}

function nowString() {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  const day = String(now.getDate()).padStart(2, '0')
  const hour = String(now.getHours()).padStart(2, '0')
  const minute = String(now.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

function setStatusPill(element, status) {
  element.dataset.status = status
  element.textContent = statusMap[status]
}

function setFeedback(node, message, type = '') {
  node.textContent = message
  node.classList.remove('is-error', 'is-success')
  if (type) {
    node.classList.add(type)
  }
}

function setButtonBusy(button, isBusy, busyLabel) {
  if (!button.dataset.defaultLabel) {
    button.dataset.defaultLabel = button.textContent.trim()
  }

  button.disabled = isBusy
  button.classList.toggle('is-busy', isBusy)
  button.textContent = isBusy ? busyLabel : button.dataset.defaultLabel
}

function validateStudentForm() {
  const email = emailInput.value.trim()
  const name = nameInput.value.trim()
  const course = courseInput.value.trim()
  const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  const nameValid = /^[A-Za-z\u4e00-\u9fa5\s]{1,20}$/.test(name)
  const valid = emailValid && nameValid && Boolean(course)
  submitButton.disabled = !valid
  return valid
}

function mapDbRowToApplication(row) {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    course: row.course,
    status: row.status,
    adminFeedback: row.admin_feedback || '',
    createdAt: formatTimestamp(row.created_at),
    updatedAt: formatTimestamp(row.updated_at),
  }
}

function mapApplicationToDbRow(application) {
  return {
    email: application.email,
    name: application.name,
    course: application.course,
    status: application.status,
    admin_feedback: application.adminFeedback,
  }
}

function formatTimestamp(value) {
  if (!value) return ''
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hour = String(date.getHours()).padStart(2, '0')
  const minute = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day} ${hour}:${minute}`
}

const supabaseConfig = window.APP_CONFIG?.supabase || window.SUPABASE_CONFIG || {}
const supabaseReady = Boolean(
  window.supabase &&
  supabaseConfig.url &&
  supabaseConfig.anonKey &&
  !String(supabaseConfig.url).includes('your-project') &&
  !String(supabaseConfig.anonKey).includes('your-anon-key')
)

const dataService = supabaseReady
  ? createSupabaseService(supabaseConfig)
  : createLocalService()

function createLocalService() {
  function readLocalApplications() {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!raw) {
      const seeded = cloneDemoApplications()
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }

    try {
      const parsed = JSON.parse(raw)
      return Array.isArray(parsed) ? parsed : cloneDemoApplications()
    } catch (_error) {
      const seeded = cloneDemoApplications()
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(seeded))
      return seeded
    }
  }

  function saveLocalApplications(applications) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(applications))
  }

  return {
    mode: 'local',
    async initialize() {
      const applications = readLocalApplications()
      return { applications, adminLoggedIn: isAdminLoggedIn() }
    },
    async listApplications() {
      return readLocalApplications().sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    },
    async createApplication(application) {
      const applications = readLocalApplications()
      applications.push(application)
      saveLocalApplications(applications)
      return application
    },
    async updateApplication(id, updates) {
      const applications = readLocalApplications()
      const target = applications.find((item) => item.id === id)
      if (!target) {
        throw new Error('未找到对应工单')
      }

      Object.assign(target, updates)
      saveLocalApplications(applications)
      return target
    },
    async loginAdmin() {
      setAdminLoggedIn(true)
      return true
    },
    async logoutAdmin() {
      setAdminLoggedIn(false)
      return true
    },
    async getAdminSession() {
      return isAdminLoggedIn()
    },
    async reset() {
      const seeded = cloneDemoApplications()
      saveLocalApplications(seeded)
      setAdminLoggedIn(false)
      return seeded
    },
  }
}

function createSupabaseService(config) {
  const client = window.supabase.createClient(config.url, config.anonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
    },
  })

  return {
    mode: 'supabase',
    async initialize() {
      const applications = await this.listApplications()
      const { data } = await client.auth.getSession()
      return { applications, adminLoggedIn: Boolean(data.session) }
    },
    async listApplications() {
      const { data, error } = await client
        .from(config.table || 'credit_applications')
        .select('id, email, name, course, status, admin_feedback, created_at, updated_at')
        .order('created_at', { ascending: false })

      if (error) {
        throw error
      }

      return (data || []).map(mapDbRowToApplication)
    },
    async createApplication(application) {
      const { data, error } = await client
        .from(config.table || 'credit_applications')
        .insert(mapApplicationToDbRow(application))
        .select('id, email, name, course, status, admin_feedback, created_at, updated_at')
        .single()

      if (error) {
        throw error
      }

      return mapDbRowToApplication(data)
    },
    async updateApplication(id, updates) {
      const { data, error } = await client
        .from(config.table || 'credit_applications')
        .update(mapApplicationToDbRow(updates))
        .eq('id', id)
        .select('id, email, name, course, status, admin_feedback, created_at, updated_at')
        .single()

      if (error) {
        throw error
      }

      return mapDbRowToApplication(data)
    },
    async loginAdmin(email, password) {
      const { error } = await client.auth.signInWithPassword({ email, password })
      if (error) {
        throw error
      }
      return true
    },
    async logoutAdmin() {
      const { error } = await client.auth.signOut()
      if (error) {
        throw error
      }
      return true
    },
    async getAdminSession() {
      const { data, error } = await client.auth.getSession()
      if (error) {
        throw error
      }
      return Boolean(data.session)
    },
    async reset() {
      throw new Error('连接 Supabase 时不支持页面内重置演示数据')
    },
  }
}

function getApplications() {
  return [...state.applications].sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

function getFilteredApplications() {
  const applications = getApplications()
  if (state.currentFilter === 'all') return applications
  return applications.filter((item) => item.status === state.currentFilter)
}

function getApplicationById(id) {
  return getApplications().find((item) => item.id === id) || null
}

function updateHeroStats(applications) {
  const pending = applications.filter((item) => item.status === 'pending').length
  const approved = applications.filter((item) => item.status === 'approved').length
  const rejected = applications.filter((item) => item.status === 'rejected').length

  heroTotal.textContent = String(applications.length)
  heroPending.textContent = String(pending)
  heroApproved.textContent = String(approved)
  summaryTotal.textContent = String(applications.length)
  summaryPending.textContent = String(pending)
  summaryRejected.textContent = String(rejected)
}

function togglePortal(portal) {
  state.currentPortal = portal
  const isStudent = portal === 'student'
  studentPortal.classList.toggle('is-active', isStudent)
  adminPortal.classList.toggle('is-active', !isStudent)

  portalTabs.forEach((tab) => {
    tab.classList.toggle('is-active', tab.dataset.portal === portal)
  })
}

function toggleStudentView(view) {
  state.currentStudentView = view
  const isForm = view === 'form'
  studentFormPanel.classList.toggle('is-active', isForm)
  studentResultPanel.classList.toggle('is-active', !isForm)
  studentFormPanel.hidden = !isForm
  studentResultPanel.hidden = isForm
}

function renderStudentResult() {
  const requestId = getStudentSession()
  const request = requestId ? getApplicationById(requestId) : null

  if (!request) {
    clearStudentSession()
    studentResultEmpty.hidden = false
    studentResultCard.hidden = true
    return
  }

  studentResultEmpty.hidden = true
  studentResultCard.hidden = false

  resultTitle.textContent = `${request.name} 的 Credits 申请`
  resultEmail.textContent = request.email
  resultCourse.textContent = request.course
  resultCreatedAt.textContent = request.createdAt
  resultUpdatedAt.textContent = request.updatedAt
  resultNote.textContent = request.adminFeedback
  setStatusPill(resultStatus, request.status)

  if (request.status === 'pending') {
    resultProgress.innerHTML = '<strong>处理中</strong><span>管理员已经在充值后台看到你的工单，处理完成后可点击刷新查看结果。</span>'
  } else if (request.status === 'approved') {
    resultProgress.innerHTML = '<strong>充值已完成</strong><span>页面状态已更新为通过，请登录 Enter.pro 确认 Credits 是否到账。</span>'
  } else {
    resultProgress.innerHTML = '<strong>申请被驳回</strong><span>管理员提供了驳回原因。你可以根据反馈修改后再次提交。</span>'
  }
}

function renderAdminAuth(adminLoggedIn) {
  adminLoginPanel.hidden = adminLoggedIn
  adminDashboardPanel.hidden = !adminLoggedIn
  if (!adminLoggedIn) {
    adminPasswordInput.value = ''
  }
}

function renderTicketList() {
  const applications = getFilteredApplications()
  const totalPages = Math.max(1, Math.ceil(applications.length / PAGE_SIZE))

  if (state.currentPage > totalPages) {
    state.currentPage = totalPages
  }

  const start = (state.currentPage - 1) * PAGE_SIZE
  const pageItems = applications.slice(start, start + PAGE_SIZE)

  ticketList.innerHTML = ''

  if (pageItems.length === 0) {
    ticketList.innerHTML = '<div class="empty-state">当前筛选条件下暂无工单。</div>'
    paginationMeta.textContent = '0 条结果'
    pageIndicator.textContent = '第 1 页'
    prevPageButton.disabled = true
    nextPageButton.disabled = true
    state.selectedTicketId = null
    renderTicketDetail()
    return
  }

  pageItems.forEach((item) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'ticket-item'
    if (item.id === state.selectedTicketId) {
      button.classList.add('is-active')
    }
    button.dataset.id = item.id

    button.innerHTML = `
      <div class="ticket-item__top">
        <div>
          <strong class="ticket-item__name">${item.name}</strong>
          <p class="ticket-item__meta">${item.email}</p>
        </div>
        <span class="status-pill" data-status="${item.status}">${statusMap[item.status]}</span>
      </div>
      <p class="ticket-item__submeta">${item.course}</p>
      <p class="ticket-item__submeta">申请时间：${item.createdAt}</p>
    `

    ticketList.appendChild(button)
  })

  const startLabel = applications.length === 0 ? 0 : start + 1
  const endLabel = Math.min(start + PAGE_SIZE, applications.length)
  paginationMeta.textContent = `${startLabel}-${endLabel} / ${applications.length} 条`
  pageIndicator.textContent = `第 ${state.currentPage} / ${totalPages} 页`
  prevPageButton.disabled = state.currentPage === 1
  nextPageButton.disabled = state.currentPage === totalPages

  const hasSelectedOnPage = pageItems.some((item) => item.id === state.selectedTicketId)
  if (!hasSelectedOnPage) {
    state.selectedTicketId = pageItems[0].id
  }

  renderTicketDetail()
}

function renderTicketDetail() {
  const request = state.selectedTicketId ? getApplicationById(state.selectedTicketId) : null

  if (!request) {
    ticketDetailEmpty.hidden = false
    ticketDetailContent.hidden = true
    setFeedback(detailFeedbackMessage, '')
    return
  }

  ticketDetailEmpty.hidden = true
  ticketDetailContent.hidden = false

  detailTitle.textContent = `${request.name} 的申请工单`
  detailEmail.textContent = request.email
  detailCourse.textContent = request.course
  detailCreatedAt.textContent = request.createdAt
  detailUpdatedAt.textContent = request.updatedAt
  detailNote.textContent = request.adminFeedback
  detailFeedback.value = request.status === 'pending' ? '' : request.adminFeedback
  setFeedback(detailFeedbackMessage, '')
  setStatusPill(detailStatus, request.status)
}

async function reloadApplications() {
  state.applications = await dataService.listApplications()
}

async function refreshAll() {
  updateHeroStats(state.applications)
  renderStudentResult()
  const adminLoggedIn = await dataService.getAdminSession()
  renderAdminAuth(adminLoggedIn)

  if (adminLoggedIn) {
    renderTicketList()
  }
}

async function safeReloadAndRender() {
  try {
    await reloadApplications()
    await refreshAll()
  } catch (error) {
    console.error(error)
    setBanner(`数据加载失败：${error.message}`, 'is-error')
  }
}

portalTabs.forEach((tab) => {
  tab.addEventListener('click', () => {
    togglePortal(tab.dataset.portal)
  })
})

studentFormTab.addEventListener('click', () => {
  toggleStudentView('form')
})

studentResultTab.addEventListener('click', async () => {
  toggleStudentView('result')
  await safeReloadAndRender()
})

form.addEventListener('input', () => {
  validateStudentForm()
})

form.addEventListener('submit', async (event) => {
  event.preventDefault()

  if (!validateStudentForm()) {
    setFeedback(formFeedback, '请先正确填写邮箱、名称和所学课程。', 'is-error')
    return
  }

  const timestamp = nowString()
  const request = {
    id: crypto.randomUUID(),
    email: emailInput.value.trim(),
    name: nameInput.value.trim(),
    course: courseInput.value.trim(),
    status: 'pending',
    adminFeedback: '申请单已创建，等待管理员完成充值。',
    createdAt: timestamp,
    updatedAt: timestamp,
  }

  try {
    setButtonBusy(submitButton, true, '提交中...')
    fillDemoButton.disabled = true
    const created = await dataService.createApplication(request)
    setStudentSession(created.id)
    setFeedback(formFeedback, '申请提交成功，已跳转到申请结果页。', 'is-success')
    toggleStudentView('result')
    await safeReloadAndRender()
  } catch (error) {
    console.error(error)
    setFeedback(formFeedback, `提交失败：${error.message}`, 'is-error')
  } finally {
    setButtonBusy(submitButton, false, '提交中...')
    fillDemoButton.disabled = false
    validateStudentForm()
  }
})

form.addEventListener('reset', () => {
  window.setTimeout(() => {
    setFeedback(formFeedback, '表单已清空。')
    validateStudentForm()
  }, 0)
})

fillDemoButton.addEventListener('click', () => {
  emailInput.value = 'zhaoxingchen@enter.pro'
  nameInput.value = '赵星辰'
  courseInput.value = 'Enter.pro 平台实战营'
  validateStudentForm()
  setFeedback(formFeedback, '演示数据已填入，可以直接提交。')
})

refreshResultButton.addEventListener('click', async () => {
  setButtonBusy(refreshResultButton, true, '刷新中...')
  try {
    await safeReloadAndRender()
  } finally {
    setButtonBusy(refreshResultButton, false, '刷新中...')
  }
})

newApplicationButton.addEventListener('click', () => {
  clearStudentSession()
  form.reset()
  validateStudentForm()
  toggleStudentView('form')
  setFeedback(formFeedback, '可以重新提交新的申请。')
  renderStudentResult()
})

adminLoginForm.addEventListener('submit', async (event) => {
  event.preventDefault()

  const formData = new FormData(adminLoginForm)
  const email = String(formData.get('adminEmail')).trim()
  const password = String(formData.get('adminPassword')).trim()

  try {
    setButtonBusy(adminLoginButton, true, '登录中...')
    adminEmailInput.disabled = true
    adminPasswordInput.disabled = true
    await dataService.loginAdmin(email, password)
    setFeedback(adminLoginFeedback, '登录成功，已进入申请处理后台。', 'is-success')
    state.currentPage = 1
    await safeReloadAndRender()
    state.selectedTicketId = getFilteredApplications()[0]?.id || null
    renderTicketList()
  } catch (error) {
    console.error(error)
    setFeedback(adminLoginFeedback, `登录失败：${error.message}`, 'is-error')
  } finally {
    setButtonBusy(adminLoginButton, false, '登录中...')
    adminEmailInput.disabled = false
    adminPasswordInput.disabled = false
  }
})

statusFilter.addEventListener('change', () => {
  state.currentFilter = statusFilter.value
  state.currentPage = 1
  state.selectedTicketId = null
  renderTicketList()
})

refreshAdminButton.addEventListener('click', async () => {
  setButtonBusy(refreshAdminButton, true, '刷新中...')
  try {
    await safeReloadAndRender()
  } finally {
    setButtonBusy(refreshAdminButton, false, '刷新中...')
  }
})

logoutAdminButton.addEventListener('click', async () => {
  try {
    setButtonBusy(logoutAdminButton, true, '退出中...')
    await dataService.logoutAdmin()
    state.selectedTicketId = null
    await safeReloadAndRender()
  } catch (error) {
    console.error(error)
    setFeedback(adminLoginFeedback, `退出失败：${error.message}`, 'is-error')
  } finally {
    setButtonBusy(logoutAdminButton, false, '退出中...')
  }
})

ticketList.addEventListener('click', (event) => {
  const target = event.target instanceof HTMLElement ? event.target.closest('.ticket-item') : null
  if (!target) return
  state.selectedTicketId = target.dataset.id
  renderTicketList()
})

async function updateTicketStatus(nextStatus) {
  if (!state.selectedTicketId) return

  const request = getApplicationById(state.selectedTicketId)
  if (!request) return

  const feedback = detailFeedback.value.trim()
  if (nextStatus === 'rejected' && !feedback) {
    setFeedback(detailFeedbackMessage, '驳回申请时需要填写驳回理由。', 'is-error')
    detailFeedback.focus()
    return
  }

  const updates = {
    ...request,
    status: nextStatus,
    adminFeedback: feedback || (
      nextStatus === 'approved'
        ? '已完成充值，请刷新页面确认 Credits 是否到账。'
        : '申请被驳回，请根据反馈调整后重新提交。'
    ),
    updatedAt: nowString(),
  }

  try {
    setButtonBusy(approveTicketButton, true, '处理中...')
    setButtonBusy(rejectTicketButton, true, '处理中...')
    detailFeedback.disabled = true
    setFeedback(detailFeedbackMessage, nextStatus === 'approved' ? '正在标记为已充值...' : '正在驳回申请...')
    await dataService.updateApplication(request.id, updates)
    setFeedback(
      detailFeedbackMessage,
      nextStatus === 'approved' ? '工单已更新为已充值。' : '工单已驳回并写入反馈。',
      'is-success'
    )
    await safeReloadAndRender()
  } catch (error) {
    console.error(error)
    setBanner(`更新工单失败：${error.message}`, 'is-error')
    setFeedback(detailFeedbackMessage, `更新失败：${error.message}`, 'is-error')
  } finally {
    setButtonBusy(approveTicketButton, false, '处理中...')
    setButtonBusy(rejectTicketButton, false, '处理中...')
    detailFeedback.disabled = false
  }
}

approveTicketButton.addEventListener('click', async () => {
  await updateTicketStatus('approved')
})

rejectTicketButton.addEventListener('click', async () => {
  await updateTicketStatus('rejected')
})

prevPageButton.addEventListener('click', () => {
  if (state.currentPage === 1) return
  state.currentPage -= 1
  renderTicketList()
})

nextPageButton.addEventListener('click', () => {
  const totalPages = Math.max(1, Math.ceil(getFilteredApplications().length / PAGE_SIZE))
  if (state.currentPage >= totalPages) return
  state.currentPage += 1
  renderTicketList()
})

resetDataButton.addEventListener('click', async () => {
  try {
    setButtonBusy(resetDataButton, true, '重置中...')
    await dataService.reset()
    clearStudentSession()
    state.currentPage = 1
    state.currentFilter = 'all'
    state.selectedTicketId = null
    statusFilter.value = 'all'
    form.reset()
    validateStudentForm()
    toggleStudentView('form')
    await safeReloadAndRender()
    setFeedback(formFeedback, '演示数据已重置。')
  } catch (error) {
    console.error(error)
    setBanner(`重置失败：${error.message}`, 'is-error')
  } finally {
    setButtonBusy(resetDataButton, false, '重置中...')
  }
})

async function bootstrap() {
  validateStudentForm()
  togglePortal('student')
  toggleStudentView(getStudentSession() ? 'result' : 'form')

  try {
    const initState = await dataService.initialize()
    state.applications = initState.applications

    if (dataService.mode === 'supabase') {
      setBanner('已连接 Supabase，申请单和管理员登录现在使用在线数据。', 'is-success')
      resetDataButton.disabled = true
      resetDataButton.title = '连接 Supabase 后不支持页面内重置在线数据'
    } else {
      setBanner('尚未配置 Supabase，当前使用本地演示数据。', '')
      resetDataButton.disabled = false
      resetDataButton.title = ''
    }

    renderAdminAuth(initState.adminLoggedIn)
    updateHeroStats(state.applications)
    renderStudentResult()
    if (initState.adminLoggedIn) {
      state.selectedTicketId = getFilteredApplications()[0]?.id || null
      renderTicketList()
    }
  } catch (error) {
    console.error(error)
    setBanner(`初始化失败：${error.message}`, 'is-error')
  }
}

bootstrap()
