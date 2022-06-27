import React from "react";
import classnames from "classnames";
import "./styles.scss";

function ReactIcon(props) {
  const {
    className,
    children,
    onClick,
    color = "white",
    size = "sm",
    id,
  } = props;

  const reactIconClass = classnames(
    {
      "react-icon": true,
      [`react-icon--color-${color}`]: color,
      [`react-icon--size-${size}`]: size,
    },
    className
  );

  return (
    <div className={reactIconClass} onClick={onClick} id={id}>
      {children}
    </div>
  );
}

export default ReactIcon;
