export const routes = {
  home: "/",
  login: "/login",
  dashboard: "/dashboard",
  tasks: "/tasks",
};

export type AppRoute = keyof typeof routes;
