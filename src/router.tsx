import { QueryClient } from "@tanstack/react-query";
import { createRouter } from "@tanstack/react-router";
import { routeTree } from "./routeTree.gen";

// Single QueryClient for the SPA lifetime.
export const queryClient = new QueryClient();

export const getRouter = () =>
  createRouter({
    routeTree,
    context: { queryClient },
    scrollRestoration: true,
    defaultPreloadStaleTime: 0,
    basepath: import.meta.env.BASE_URL.replace(/\/$/, "") || undefined,
  });
