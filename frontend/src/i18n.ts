export const translations = {
  en: {
    // Auth
    signIn: "Sign In",
    signUp: "Sign Up",
    emailPlaceholder: "name@company.com",
    passwordPlaceholder: "••••••••",
    fullName: "Full Name",
    emailLabel: "Email Address",
    passwordLabel: "Password",
    noAccount: "Don't have an account?",
    hasAccount: "Already have an account?",
    defaultAdminInfo: "Default Admin Login: admin@shtab.local / admin123",
    
    // Sidebar
    workspace: "Workspace",
    projects: "Projects",
    myStats: "My Statistics",
    adminPanel: "Admin Panel",
    noProjects: "No projects yet. Click + to create one.",
    signOut: "Sign Out",

    // Header
    welcome: "Welcome to Shtab",
    selectProjectHint: "Select a project to start managing tasks",
    searchTasks: "Search tasks...",
    kanban: "Kanban",
    list: "List",
    table: "Table",
    newTask: "New Task",
    notifications: "Notifications",
    unread: "unread",
    noNotifications: "No notifications yet.",

    // Kanban & Tasks
    colNew: "New",
    colInProgress: "In Progress",
    colReview: "Review",
    colDone: "Done",
    dueSoon: "Due <24h",
    noTasks: "No tasks",
    noDeadline: "No deadline",
    unassigned: "Unassigned",
    author: "Author",
    assignee: "Assigned to",
    priority: "Priority",
    dueDate: "Due Date",
    status: "Status",
    projectField: "Project",

    // Task Modal
    editTask: "Edit Task",
    createTask: "Create New Task",
    taskTitle: "Task Title",
    taskTitlePlaceholder: "e.g., Redesign landing page header",
    description: "Description",
    descPlaceholder: "Detailed explanation of the task...",
    deleteTask: "Delete Task",
    cancel: "Cancel",
    saveChanges: "Save Changes",

    // Stats
    statsTitle: "Performance & Statistics",
    statsSubtitle: "Overview of your task completion activity and personal productivity.",
    totalClosed: "Total Closed Tasks",
    closedWeek: "Closed This Week",
    closedMonth: "Closed This Month",
    dailyDynamics: "Task Completion Dynamics (Last 14 Days)",
    noDynamics: "No completion data recorded in the last 14 days.",

    // Admin
    adminTitle: "Admin Cabinet",
    adminSubtitle: "Manage registered users, inspect account metadata, and control access roles.",
    userColumn: "User",
    emailColumn: "Email",
    roleColumn: "Role",
    registeredColumn: "Registered",
    tasksCountColumn: "Tasks Count",
    actionsColumn: "Actions",
    demoteToUser: "Demote to User",
    makeAdmin: "Make Admin",

    // Project Modal
    createProjectModal: "Create New Project",
    projectName: "Project Name",
    projectNamePlaceholder: "e.g., Marketing Campaign",
    projectDescPlaceholder: "Brief description of project goals...",
    noProjectSelected: "No Project Selected",
    noProjectHint: "Create a new project from the sidebar to start organizing tasks.",
  },
  ru: {
    // Auth
    signIn: "Войти",
    signUp: "Регистрация",
    emailPlaceholder: "name@company.com",
    passwordPlaceholder: "••••••••",
    fullName: "Имя и Фамилия",
    emailLabel: "Email адрес",
    passwordLabel: "Пароль",
    noAccount: "Нет аккаунта?",
    hasAccount: "Уже есть аккаунт?",
    defaultAdminInfo: "Администратор по умолчанию: admin@shtab.local / admin123",
    
    // Sidebar
    workspace: "Рабочее пространство",
    projects: "Проекты",
    myStats: "Моя статистика",
    adminPanel: "Панель администратора",
    noProjects: "Пока нет проектов. Нажмите +, чтобы создать.",
    signOut: "Выйти",

    // Header
    welcome: "Добро пожаловать в Shtab",
    selectProjectHint: "Выберите проект для управления задачами",
    searchTasks: "Поиск задач...",
    kanban: "Канбан",
    list: "Список",
    table: "Таблица",
    newTask: "Новая задача",
    notifications: "Уведомления",
    unread: "непрочитанных",
    noNotifications: "Уведомлений пока нет.",

    // Kanban & Tasks
    colNew: "Новые",
    colInProgress: "В работе",
    colReview: "На проверке",
    colDone: "Готово",
    dueSoon: "Срок <24ч",
    noTasks: "Нет задач",
    noDeadline: "Без срока",
    unassigned: "Не назначен",
    author: "Автор",
    assignee: "Ответственный",
    priority: "Приоритет",
    dueDate: "Срок выполнения",
    status: "Статус",
    projectField: "Проект",

    // Task Modal
    editTask: "Редактировать задачу",
    createTask: "Создать новую задачу",
    taskTitle: "Название задачи",
    taskTitlePlaceholder: "например, Редизайн шапки лендинга",
    description: "Описание",
    descPlaceholder: "Подробное описание задачи...",
    deleteTask: "Удалить задачу",
    cancel: "Отмена",
    saveChanges: "Сохранить изменения",

    // Stats
    statsTitle: "Эффективность и Статистика",
    statsSubtitle: "Обзор вашей активности по закрытию задач и личной продуктивности.",
    totalClosed: "Всего закрыто задач",
    closedWeek: "Закрыто за неделю",
    closedMonth: "Закрыто за месяц",
    dailyDynamics: "Динамика закрытия задач (Последние 14 дней)",
    noDynamics: "Нет данных о закрытых задачах за последние 14 дней.",

    // Admin
    adminTitle: "Кабинет администратора",
    adminSubtitle: "Управление зарегистрировантелями пользователями и назначение ролей доступа.",
    userColumn: "Пользователь",
    emailColumn: "Email",
    roleColumn: "Роль",
    registeredColumn: "Дата регистрации",
    tasksCountColumn: "Кол-во задач",
    actionsColumn: "Действия",
    demoteToUser: "Снять админа",
    makeAdmin: "Сделать админом",

    // Project Modal
    createProjectModal: "Создать новый проект",
    projectName: "Название проекта",
    projectNamePlaceholder: "например, Маркетинговая кампания",
    projectDescPlaceholder: "Краткое описание целей проекта...",
    noProjectSelected: "Проект не выбран",
    noProjectHint: "Создайте новый проект в боковой панели, чтобы начать работу с задачами.",
  }
};

export type Lang = 'ru' | 'en';
