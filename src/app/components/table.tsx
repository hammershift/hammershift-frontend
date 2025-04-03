import React from "react";
import { cn } from "@/helpers/utils";

interface IProps {
  className?: string;
  children: React.ReactNode;
  [x: string]: any;
}
const Table = ({ className, children, props }: IProps) => (
  <div className="relative w-full overflow-auto">
    <table
      className={cn("w-full caption-bottom text-sm", className)}
      {...props}
    >
      {children}
    </table>
  </div>
);
const TableHeader = ({ className, children, props }: IProps) => (
  <thead className={cn("[&_tr]:border-b", className)} {...props}>
    {children}
  </thead>
);

const TableBody = ({ className, children, props }: IProps) => (
  <tbody className={cn("[&_tr:last-child]:border-0", className)} {...props}>
    {children}
  </tbody>
);

const TableFooter = ({ className, children, props }: IProps) => (
  <tfoot
    className={cn(
      "bg-muted/50 border-t font-medium [&>tr]:last:border-b-0",
      className
    )}
    {...props}
  >
    {children}
  </tfoot>
);

const TableRow = ({ className, children, props }: IProps) => (
  <tr
    className={cn(
      "hover:bg-muted/50 data-[state=selected]:bg-muted border-b transition-colors",
      className
    )}
    {...props}
  >
    {children}
  </tr>
);

const TableHead = ({ className, children, props }: IProps) => (
  <th
    className={cn(
      "text-muted-foreground h-10 px-2 text-left align-middle font-medium [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  >
    {children}
  </th>
);

const TableCell = ({ className, children, props }: IProps) => (
  <td
    className={cn(
      "p-2 align-middle [&:has([role=checkbox])]:pr-0 [&>[role=checkbox]]:translate-y-[2px]",
      className
    )}
    {...props}
  >
    {children}
  </td>
);

const TableCaption = ({ className, children, props }: IProps) => (
  <caption
    className={cn("text-muted-foreground mt-4 text-sm", className)}
    {...props}
  >
    {children}
  </caption>
);

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
