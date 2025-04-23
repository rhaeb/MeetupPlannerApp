declare module "expo-router" {
    export type LinkProps = {
      href: string; // Loosen the type for dynamic paths
      asChild?: boolean;
      replace?: boolean;
      scroll?: boolean;
    };
  }
  