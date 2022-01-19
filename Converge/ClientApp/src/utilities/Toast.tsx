// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React, { useEffect } from "react";
import {
  Box,
} from "@fluentui/react-northstar";
import {
  DESCRIPTION, UISections, UI_SECTION, USER_INTERACTION,
} from "../types/LoggerTypes";
import { logEvent } from "./LogWrapper";

export interface ToastProps {
  id: string;
  destroy: () => void;
  title: string;
  content: string;
  duration?: number;
}

const Toast: React.FC<ToastProps> = (props) => {
  const {
    destroy, content, title, duration = 0, id,
  } = props;

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (duration) {
      timer = setTimeout(() => {
        destroy();
      }, duration);
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [destroy, duration]);

  return (
    <Box id={id}>
      <Box className="toast-header">
        <Box>
          {title}
        </Box>
        <button
          onClick={() => {
            destroy();
            logEvent(USER_INTERACTION, [
              {
                name: UI_SECTION,
                value: UISections.Toast,
              },
              {
                name: DESCRIPTION,
                value: "close_toast",
              },
            ]);
          }}
          type="button"
        >
          X
        </button>
      </Box>
      <Box className="toast-body">{content}</Box>
    </Box>
  );
};

export default Toast;
