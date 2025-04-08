import React from "react";
import { Trigger, List, Content, Root } from "@radix-ui/react-tabs";
import { cn } from "@/helpers/utils";

interface IProps {
  className?: string;
  children?: React.ReactNode;
  [x: string]: any;
}
const Tabs = Root;
const TabsList = ({ className, children, props }: IProps) => (
  <List
    className={cn(
      "bg-muted text-muted-foreground inline-flex h-9 items-center justify-center rounded-lg p-1",
      className
    )}
    {...props}
  >
    {children}
  </List>
);

const TabsTrigger = ({ className, children, props }: IProps) => (
  <Trigger
    className={cn(
      "ring-offset-background inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium transition-all focus-visible:outline",
      className
    )}
    {...props}
  >
    {children}
  </Trigger>
);

const TabsContent = ({ className, children, props }: IProps) => (
  <Content
    className={cn(
      "ring-offset-background focus-visible:ring-ring mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
      className
    )}
    {...props}
  >
    {children}
  </Content>
);

export { Tabs, TabsList, TabsTrigger, TabsContent };
