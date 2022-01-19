// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  Popup,
  Button,
  MoreIcon,
  Menu,
} from "@fluentui/react-northstar";
import { IWidgetActionKey, IDashboardCallout } from "../types/CallOut";

const DashboardCallout: React.FC<IDashboardCallout> = (props) => {
  const {
    open,
    onOpenChange,
    menuProps: { offset, position },
    widgetActionGroup,
    handleCalloutItemClick,
  } = props;

  return (
    <>
      <Popup
        offset={offset}
        position={position}
        open={open}
        onOpenChange={onOpenChange}
        trigger={(
          <Button
            text
            iconOnly
            aria-label="More actions"
            icon={<MoreIcon />}
            styles={{
              margin: "0 -0.35rem",
            }}
          />
        )}
        content={{
          styles: {
            width: "203px",
            height: "32px",
            "& .ui-popup__content__content": { padding: 0 },
            "& ul": { border: "none", width: "100%", padding: "5px 0" },
          },
          content: (
            <Menu
              items={
                widgetActionGroup
                  ? [
                    ...widgetActionGroup.map(
                      ({ id, icon, title }: IWidgetActionKey) => ({
                        key: id,
                        icon,
                        content: title,
                      }),
                    ),
                  ]
                  : []
              }
              vertical
              onItemClick={handleCalloutItemClick}
            />
          ),
        }}
        trapFocus={{
          firstFocusableSelector:
            ".extended-toolbar__filters-menu__tree [data-is-focusable=true]",
        }}
      />
    </>
  );
};

export default DashboardCallout;
