// src/utils/navigate.js
let navigator;

export const setNavigator = (nav) => {
  navigator = nav;
};

export const navigateTo = (path) => {
  if (navigator) {
    navigator(path, { replace: true });
  } else {
    window.location.href = path; // fallback
  }
};
