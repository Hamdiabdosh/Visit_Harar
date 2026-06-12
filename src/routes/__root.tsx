import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";

import { Toaster } from "sonner";
import appCss from "../styles.css?url";
import { getPublishedContactInfo } from "@/lib/contact-fns";
import { PublicContactProvider } from "@/components/public/contact-context";
import { getAnalyticsIdFn, getMaintenanceModeFn } from "@/lib/settings-fns";
import { MaintenancePage } from "@/components/public/MaintenancePage";
import { ORG_NAME } from "@/lib/org";

function isMaintenanceBypass(pathname: string) {
  return (
    pathname.startsWith("/admin") ||
    pathname.startsWith("/api/") ||
    pathname === "/robots.txt" ||
    pathname === "/sitemap.xml"
  );
}

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">
          Page not found
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-xl font-semibold tracking-tight text-foreground">
          This page didn't load
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Something went wrong on our end. You can try refreshing or head back
          home.
        </p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center justify-center rounded-md border border-input bg-background px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
          >
            Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()(
  {
    beforeLoad: async ({ location }) => {
      if (isMaintenanceBypass(location.pathname)) {
        return { maintenanceActive: false };
      }
      const maintenanceActive = await getMaintenanceModeFn();
      return { maintenanceActive };
    },
    loader: async () => {
      const contact = await getPublishedContactInfo();
      const analyticsId = await getAnalyticsIdFn();
      return { contact, analyticsId };
    },
    head: ({ loaderData }) => {
      const analyticsId = loaderData?.analyticsId;
      const scripts = analyticsId
        ? [
            {
              src: `https://www.googletagmanager.com/gtag/js?id=${analyticsId}`,
              async: true,
            },
            {
              children: `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${analyticsId}');`,
            },
          ]
        : undefined;

      return {
        meta: [
          { charSet: "utf-8" },
          { name: "viewport", content: "width=device-width, initial-scale=1" },
          { name: "author", content: ORG_NAME },
          { name: "twitter:card", content: "summary_large_image" },
        ],
        links: [
          {
            rel: "preconnect",
            href: "https://fonts.googleapis.com",
          },
          {
            rel: "preconnect",
            href: "https://fonts.gstatic.com",
            crossOrigin: "anonymous",
          },
          {
            rel: "stylesheet",
            href: "https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;0,700;0,800;1,400;1,600&family=Outfit:wght@300;400;500;600;700&display=swap",
          },
          {
            rel: "stylesheet",
            href: appCss,
          },
          {
            rel: "icon",
            href: "/logo.webp",
            type: "image/webp",
          },
          {
            rel: "apple-touch-icon",
            href: "/logo.webp",
          },
        ],
        scripts,
      };
    },
    shellComponent: RootShell,
    component: RootComponent,
    notFoundComponent: NotFoundComponent,
    errorComponent: ErrorComponent,
  },
);

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    // Browser extensions (Grammarly, ColorZilla, etc.) inject attributes on <html>/<body>
    // before React hydrates — suppressHydrationWarning avoids false-positive warnings.
    <html lang="en" suppressHydrationWarning>
      <head>
        <HeadContent />
      </head>
      <body suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const { contact } = Route.useLoaderData();
  const { maintenanceActive } = Route.useRouteContext({
    strict: false,
  }) as { maintenanceActive?: boolean };

  return (
    <QueryClientProvider client={queryClient}>
      {maintenanceActive ? (
        <MaintenancePage />
      ) : (
        <PublicContactProvider contact={contact}>
          <Outlet />
        </PublicContactProvider>
      )}
      <Toaster position="bottom-right" richColors closeButton />
    </QueryClientProvider>
  );
}
