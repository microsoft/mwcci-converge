// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";

type IProps = {
  width?: string
  title?: string
};

const TruncateText: React.FC<IProps> = (props) => {
  const { children, width, title } = props;
  return (
    <span
      style={{
        maxWidth: width || "100%",
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
        display: "inline-block",
      }}
      title={title || ""}
    >
      {children}
    </span>
  );
};

export default TruncateText;
