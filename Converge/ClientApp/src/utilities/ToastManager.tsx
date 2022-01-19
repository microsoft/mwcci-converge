// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import React from "react";
import ReactDOM from "react-dom";
import Toast, { ToastProps } from "./Toast";

interface ToastOptions {
  id?: string;
  title: string;
  content: string;
  duration?: number;
}

const Notifications = (() => {
  let toasts: ToastProps[] = [];

  const body = document.getElementsByTagName("body")[0] as HTMLBodyElement;
  const toastContainer = document.createElement("div") as HTMLDivElement;
  toastContainer.id = "toast-container-main";
  body.insertAdjacentElement("beforeend", toastContainer);
  const containerRef = toastContainer;

  function render(): void {
    const toastsList = toasts.map((toastProps: ToastProps) => (
      <Toast
        key={toastProps.id}
        id={toastProps.id}
        destroy={toastProps.destroy}
        title={toastProps.title}
        content={toastProps.content}
        duration={toastProps.duration}
      />
    ));
    ReactDOM.render(toastsList, containerRef);
  }

  function destroy(id: string): void {
    toasts = toasts.filter((item: ToastProps) => item.id !== id);
    render();
  }

  function show(options: ToastOptions): void {
    const toastId = Math.random().toString(36).substr(2, 9);
    const newToast: ToastProps = {
      id: toastId,
      ...options, // if id is passed within options, it will overwrite the auto-generated one
      destroy: () => destroy(options.id ?? toastId),
    };

    toasts = [newToast, ...toasts];
    render();
  }

  return {
    show,
    destroy,
  };
})();

export default Notifications;
