// lib/config/routes.ts
export const ROUTES = {
    LANDING: '/',
    WORKSPACE_CREATE: '/workspace/create',
    PROJECT_CREATE: '/createProject',
    PROJECT: (workspaceId: string) => `/project/${workspaceId}`,
    SIGN_IN: '/sign-in',
    SIGN_UP: '/sign-up',
} as const;

export const PUBLIC_ROUTES = [
    ROUTES.LANDING,
    ROUTES.SIGN_IN,
    ROUTES.SIGN_UP,
] as const;

export const REDIRECT_ROUTES = [
    ROUTES.LANDING,
    ROUTES.WORKSPACE_CREATE,
    ROUTES.PROJECT_CREATE,
] as const;
