import React, { useState, type ReactElement } from "react";
import './Tabs.scss';
import { Tab } from "./Tab";

type TabProps = {
  title: string;
  children?: React.ReactNode;
};

type TabsProps = {
  children?: ReactElement<TabProps> | ReactElement<TabProps>[];
};

export function Tabs({ children }: TabsProps) {
  const [active, setActive] = useState<string>(children && Array.isArray(children) ? children[0].props.title : children?.props.title || "");

  const childrenArray = React.Children.toArray(children) as ReactElement<TabProps>[];

  const select = (title: string) => {
    setActive(title);
  };

  return (
    <div>
      <div className="tabs" >
        {
          childrenArray.map((child) => (
            <button
              key={child.props.title}
              onClick={() => select(child.props.title)}
              className={child.props.title === active ? "active" : ""}
            >
              {child.props.title}
            </button>
          ))
        }
      </div>

      <div className="tabs-content" >
        {
          childrenArray.map((child) =>
            child.props.title === active ? (
              <Tab key={child.props.title} title={child.props.title}> {child.props.children} </Tab>
            ) : null
          )
        }
      </div>
    </div>
  );
}