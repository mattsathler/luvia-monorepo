import React from "react";

export type TabProps = {
    title: string;
    children?: React.ReactNode;
};

export function Tab({ children }: TabProps) {
    return <div className="tab">{children}</div>;
}