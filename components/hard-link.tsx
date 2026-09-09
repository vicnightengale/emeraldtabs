"use client";

import type { ComponentProps } from "react";

type HardLinkProps = ComponentProps<"a"> & {
  href: string;
};

export function HardLink({ href, onClick, ...props }: HardLinkProps) {
  return (
    <a
      href={href}
      {...props}
      onClick={(event) => {
        onClick?.(event);
        if (event.defaultPrevented) return;
        if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) {
          return;
        }
        event.preventDefault();
        window.location.assign(href);
      }}
    />
  );
}
