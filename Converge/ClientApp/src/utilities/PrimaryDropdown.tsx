// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import {
  Dropdown, Provider, SiteVariablesPrepared, DropdownProps,
  ShorthandValue, DropdownItemProps, ComponentSlotStyle, ShorthandCollection,
} from "@fluentui/react-northstar";
import { makeStyles } from "@fluentui/react-theme-provider";

const usePrimaryDropdownStyles = makeStyles(() => ({
  lightTheme: {
    "& .ui-dropdown__container": {
      borderRadius: "4px",
    },
    "& .ui-button__content": {
      fontWeight: "normal",
    },
  },
}));

interface Props {
  items: ShorthandCollection<DropdownItemProps, Record<string, unknown>>;
  handleDropdownChange?:
  (event: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element> | null,
     data: DropdownProps) => void;
  value? : ShorthandValue<DropdownItemProps> |
    ShorthandCollection<DropdownItemProps, Record<string, unknown>>;
  inverted? : boolean;
  search? : boolean;
  multiple? : boolean;
  onSearchQueryChange?:
  (event: React.MouseEvent<Element, MouseEvent> | React.KeyboardEvent<Element> | null,
     data: DropdownProps) => void;
  loading? : boolean;
  loadingMessage?: string;
  noResultsMessage?: string;
  placeholder? : string;
  getA11ySelectionMessage? : ({
    onAdd: (item: ShorthandValue<DropdownItemProps>) => string;
    onRemove: (item: ShorthandValue<DropdownItemProps>) => string;
  });
  clearable?: boolean;
  width?: string;
  styles?: ComponentSlotStyle;
  defaultActiveSelectedIndex?: number;
  defaultValue?: ShorthandValue<DropdownItemProps> |
    ShorthandCollection<DropdownItemProps, Record<string, unknown>>
}

const PrimaryDropdown: React.FC<Props> = (props) => {
  const {
    items, handleDropdownChange, value, inverted, search, multiple, onSearchQueryChange, loading,
    loadingMessage, noResultsMessage, placeholder, getA11ySelectionMessage, clearable, width,
    defaultActiveSelectedIndex, defaultValue,
  } = props;
  const classes = usePrimaryDropdownStyles();

  return (
    <Provider
      className={classes.lightTheme}
      theme={{
        componentVariables: {
          Dropdown: {
            width,
            height: "32px",
          },
          DropdownItem: ({ colorScheme }: SiteVariablesPrepared) => ({
            color: colorScheme.default.foreground,
            backgroundColor: colorScheme.default.background,
            borderColor: colorScheme.default.foreground,
            listItemColorHover: colorScheme.default.foreground3,
            listItemBackgroundColorHover: colorScheme.brand.background,
            invertedBackgroundColorHover: colorScheme.brand.background,
          }),
          DropdownSelectedItem: ({ colorScheme }: SiteVariablesPrepared) => ({
            selectedItemBackgroundColor: colorScheme.default.background5,
          }),
        },
      }}
    >
      <Dropdown
        defaultValue={defaultValue}
        defaultActiveSelectedIndex={defaultActiveSelectedIndex}
        items={items}
        onChange={handleDropdownChange}
        value={value}
        inverted={inverted}
        search={search}
        multiple={multiple}
        onSearchQueryChange={onSearchQueryChange}
        loading={loading}
        loadingMessage={loadingMessage}
        noResultsMessage={noResultsMessage}
        placeholder={placeholder}
        getA11ySelectionMessage={getA11ySelectionMessage}
        clearable={clearable}
      />
    </Provider>
  );
};

export default PrimaryDropdown;
