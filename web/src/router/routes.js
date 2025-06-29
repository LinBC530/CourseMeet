const routes = [
  {
    path: "/",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/EntryPage.vue") },
      {
        path: "resetpassword/:token([a-zA-Z0-9]{32})",
        component: () => import("pages/ResetPasswordPage.vue"),
      },
    ],
    meta: { requiresAuth: false }
  },
  {
    path: "/meeting/:id([a-zA-Z0-9]{8})",
    component: () => import("layouts/MeetingLayout.vue"),
    children: [
      {
        path: "",
        components: {
          default: () => import("pages/MeetingPage.vue"),
          drawer: () => import("components/meetLayout/MeetingDrawer.vue"),
          footer: () => import("components/meetLayout/MeetingFooter.vue"),
        },
      },
    ],
    meta: { requiresAuth: true }
  },
  {
    path: "/meeting/:id([a-zA-Z0-9]{8})/prejoin",
    component: () => import("layouts/MainLayout.vue"),
    children: [
      { path: "", component: () => import("src/pages/WeatingPage.vue") },
    ],
    meta: { requiresAuth: true }
  },
  {
    path: "/exit",
    component: () => import("layouts/MainLayout.vue"),
    children: [{ path: "", component: () => import("src/pages/ExitPage.vue") }],
    meta: { requiresAuth: true }
  },

  // Always leave this as last one,
  // but you can also remove it
  {
    path: "/:catchAll(.*)*",
    component: () => import("pages/ErrorNotFound.vue"),
  },
];

export default routes;
