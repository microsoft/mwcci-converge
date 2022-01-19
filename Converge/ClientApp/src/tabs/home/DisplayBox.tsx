// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  Header,
  Menu,
  ShorthandCollection,
  MenuItemProps,
  MenuShorthandKinds,
  Segment,
  ComponentEventHandler,
  MenuProps,
  SiteVariablesPrepared,
  Flex,
} from "@fluentui/react-northstar";
import { IWidgetActionKey } from "../../types/CallOut";
import DashboardCallout from "../../utilities/DashboardCallout";

interface Props {
  gridColumnStart?: string;
  gridColumnEnd?: string;
  gridRowStart?: string;
  gridRowEnd?: string;
  descriptionContent: string;
  headerContent: string;
  activeMenuIndex?: string | number;
  onActiveMenuIndexChange?: ComponentEventHandler<MenuProps>;
  menuItems?: ShorthandCollection<MenuItemProps, MenuShorthandKinds>;
  gridArea: string;
  height?: string;
  showCallOut?: boolean;
  widgetActions?: IWidgetActionKey[];
  handleCalloutItemClick?: () => void;
  color?: string;
  withOutBoxShadow?: boolean;
  overflowX?: string;
  overflowY?: string;
}

const DisplayBox: React.FC<Props> = (props) => {
  const {
    activeMenuIndex,
    onActiveMenuIndexChange,
    descriptionContent,
    headerContent,
    menuItems,
    children,
    gridArea,
    height,
    showCallOut,
    widgetActions,
    handleCalloutItemClick,
    color,
    withOutBoxShadow,
    overflowX,
    overflowY,
  } = props;
  const [calloutOpen, setCalloutOpen] = React.useState(false);
  return (
    <Segment
      design={{ padding: "1.5em" }}
      styles={{
        "overflow-x": overflowX || "auto",
        "overflow-y": overflowY || "auto",
        whiteSpace: "nowrap",
        "grid-area": gridArea,
        position: "relative",
        height,
        "@media (max-width: 1366px)": {
          height: gridArea === "ConnectTeammates" || gridArea === "Reservations" ? "auto" : height,
        },
        boxShadow: withOutBoxShadow ? "none" : "rgb(34 36 38 / 15%) 0px 1px 1px 1px",
        padding: withOutBoxShadow ? "1.5em 0" : "1.5em",
      }}
      variables={({ colorScheme }: SiteVariablesPrepared) => ({
        backgroundColor: color || colorScheme.default.background,
        color: colorScheme.default.foreground,
      })}
      content={(
        <>
          <Flex gap="gap.small" space="between" style={{ minHeight: "2rem" }}>
            <Flex gap="gap.small" column>
              <Header
                content={headerContent}
                as="h4"
                design={{ marginTop: "0px" }}
                description={{
                  content: descriptionContent,
                  as: "span",
                  styles: { "font-size": "12px", lineHeight: "16px" },
                }}
                variables={({ colorScheme }: SiteVariablesPrepared) => ({
                  backgroundColor: colorScheme.default.background,
                  color: colorScheme.default.foreground,
                })}
              />
            </Flex>
            {
             showCallOut
             && (
             <DashboardCallout
               open={calloutOpen}
               onOpenChange={(_, callOutprops) => {
                 const open = !!callOutprops?.open;
                 setCalloutOpen(open);
               }}
               menuProps={{
                 offset: [-170, 0],
                 position: "below",
               }}
               widgetActionGroup={widgetActions}
               handleCalloutItemClick={() => {
                 setCalloutOpen(false);
                 if (handleCalloutItemClick) handleCalloutItemClick();
               }}
             />
             )
          }
          </Flex>
          {menuItems && (
          <Menu
            design={{
              margin: "12px 0 20px",
            }}
            styles={{
              borderBottom: "none",
              "& .ui-menu__itemwrapper": {
                paddingLeft: 0,
              },
            }}
            defaultActiveIndex={0}
            items={menuItems}
            underlined
            primary
            activeIndex={activeMenuIndex}
            onActiveIndexChange={onActiveMenuIndexChange}
          />
          )}
          {children}
        </>
    )}
    />
  );
};

export default DisplayBox;
