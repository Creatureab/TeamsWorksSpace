// Minimal Next.js type shims because the installed `next` package is missing its .d.ts files.
// Replace these with the official declarations when the package contents are fixed.

declare module "next" {
  export type Metadata = any;
  export type Viewport = any;
  export type NextConfig = any;
  const next: any;
  export default next;
}

declare module "next/*" {
  const mod: any;
  export = mod;
}

declare module "next/server" {
  export class NextRequest extends Request {
    nextUrl: URL;
    ip?: string | null;
    geo?: Record<string, string | null>;
    cookies: {
      get(name: string): { name: string; value: string } | undefined;
      set(name: string, value: string): void;
      delete(name: string): void;
    };
  }

  export class NextResponse extends Response {
    static json(data: any, init?: ResponseInit): NextResponse;
    static redirect(url: string | URL, status?: number): NextResponse;
    static rewrite(url: string | URL, init?: ResponseInit): NextResponse;
    static next(init?: { request?: NextRequest; headers?: HeadersInit }): NextResponse;
  }

  export type NextMiddleware = (
    request: NextRequest,
    event: { respondWith: (res: Response | Promise<Response>) => void }
  ) => Response | NextResponse | void | Promise<Response | NextResponse | void>;

  export interface NextFetchEvent {
    waitUntil(promise: Promise<any>): void;
  }
}

declare module "next/server.js" {
  export * from "next/server";
}

declare module "next/types.js" {
  export type ResolvingMetadata = any;
  export type ResolvingViewport = any;
}

declare module "next/navigation" {
  export const useRouter: any;
  export const usePathname: () => string;
  export const useSearchParams: () => URLSearchParams;
  export function useParams<
    T extends Record<string, string | string[] | undefined> = Record<string, string | string[] | undefined>
  >(): T;
  export const redirect: (url: string) => never;
  export const notFound: () => never;
}

declare module "next/link" {
  import * as React from "react";
  export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    href: string | URL;
  }
  const Link: React.FC<LinkProps>;
  export default Link;
}

declare module "next/image" {
  import * as React from "react";
  export interface ImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
    src: string | URL;
    width?: number;
    height?: number;
    alt: string;
  }
  const Image: React.FC<ImageProps>;
  export default Image;
}

declare module "next/font/google" {
  export type FontResult = {
    className: string;
    style?: { fontFamily: string };
    variable?: string;
  };

  export function Plus_Jakarta_Sans(options?: Record<string, any>): FontResult;
}

declare module "next/headers" {
  export const headers: () => Headers;
  export const cookies: () => any;
}

declare module "next/cache" {
  export const revalidatePath: (path: string) => void;
}
