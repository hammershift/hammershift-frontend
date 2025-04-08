import React from "react";

import { cn } from "@/helpers/utils";

interface IProps {
  className?: string;
  children: React.ReactNode;
}

const Card = ({ className, children }: IProps) => (
  <div
    className={cn(
      "bg-card text-card-foreground rounded-xl border shadow",
      className
    )}
  >
    {children}
  </div>
);

const CardHeader = ({ className, children }: IProps) => (
  <div className={cn("flex flex-col space-y-1.5 p-6", className)}>
    {children}
  </div>
);

const CardTitle = ({ className, children }: IProps) => (
  <div className={cn("font-semibold leading-none tracking-tight", className)}>
    {children}
  </div>
);

const CardDescription = ({ className, children }: IProps) => (
  <div className={cn("text-muted-foreground text-sm", className)}>
    {children}
  </div>
);

const CardContent = ({ className, children }: IProps) => (
  <div className={cn("p-6 pt-0", className)}>{children}</div>
);

const CardFooter = ({ className, children }: IProps) => (
  <div className={cn("flex items-center p-6 pt-0", className)}>{children}</div>
);

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
};
