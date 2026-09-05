/**
 * Theme constants shared by the server layout and the client toggle. Kept in a
 * plain module (no "use client") so the layout can inline the init script
 * without pulling the toggle's client bundle into a server component.
 */
export const THEME_STORAGE_KEY = "aiadaptiv-theme";

/**
 * Runs before paint in the layout's <head>, so a stored choice is applied with
 * no flash of the wrong theme. Stored choice wins; otherwise the OS preference
 * decides.
 */
export const themeInitScript = `(function(){try{var s=localStorage.getItem('${THEME_STORAGE_KEY}');var d=s?s==='dark':window.matchMedia('(prefers-color-scheme: dark)').matches;if(d)document.documentElement.setAttribute('data-theme','dark');}catch(e){}})();`;
