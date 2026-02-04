"use client";

import * as React from "react";
import { CVIContext } from "@tavus/cvi-ui-react";

export function CVIProvider({ children }: { children: React.ReactNode }) {
    return <CVIContext>{children}</CVIContext>;
}
