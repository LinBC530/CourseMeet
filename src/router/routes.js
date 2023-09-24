
const routes = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/JoinPage.vue') },
      // { path: 'Main', component: () => import('pages/MeetingPage.vue') },
      // { path: 'Exit', component: () => import('pages/exitPage.vue') },
      // { path: 'Whiteboard', component: () => import('pages/WhiteboardPage.vue') },
      { path: 'Login', component: () => import('pages/LoginPage.vue') },
      { path: 'Account', component: () => import('pages/AccountPage.vue')}
    ]
  },
  {
    path: '/Main',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      { path: '', component: () => import('pages/MeetingPage.vue') },
      { path: 'Exit', component: () => import('pages/exitPage.vue') },
      { path: 'Whiteboard', component: () => import('pages/WhiteboardPage.vue') },
    ]
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue')
  }
]

export default routes
