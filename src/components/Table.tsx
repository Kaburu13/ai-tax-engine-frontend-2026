import React from "react";

export type ThProps = React.ComponentPropsWithoutRef<"th">;
export type TdProps = React.ComponentPropsWithoutRef<"td">;

export const Th: React.FC<ThProps> = ({ children, style, ...rest }) => (
  <th
    {...rest}
    style={{
      textAlign: "left",
      borderBottom: "1px solid #e5e7eb",
      padding: "8px 10px",
      background: "#f8fafc",
      position: "sticky",
      top: 0,
      ...style
    }}
  >
    {children}
  </th>
);

export const Td: React.FC<TdProps> = ({ children, style, ...rest }) => (
  <td
    {...rest}
    style={{
      padding: "8px 10px",
      borderBottom: "1px solid #f1f5f9",
      ...style
    }}
  >
    {children}
  </td>
);
