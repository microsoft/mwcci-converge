// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  ComponentEventHandler,
  PopupProps,
  Position,
  Offset,
} from "@fluentui/react-northstar";

export interface IWidgetActionKey {
  id: string;
  icon?: JSX.Element;
  title: string;
}

interface IMenuProps {
  offset: Offset;
  position: Position;
}

export interface IDashboardCallout {
  open: boolean;
  onOpenChange: ComponentEventHandler<PopupProps>;
  menuProps: IMenuProps;
  widgetActionGroup?: IWidgetActionKey[];
  handleCalloutItemClick?: () => void;
}
