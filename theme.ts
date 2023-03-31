import Cookies from '../node_modules/js-cookie/dist/js.cookie.min.mjs';

type ThemeMode = 'dark' | 'light' | 'system';

/**
 * Expects a label element with a child checkbox, checked meaning "dark mode".
 * Sets a data-attribute 'theme' on the <html> element that can be read by
 * other scripts and stylesheets.
 * Sets a cookie that can be used to set the same attribute at page load.
*/

export class Theme {
    toggle_button: HTMLLabelElement;
    cookie_key: String;
    current_theme: ThemeMode;
    html: HTMLHtmlElement;

    constructor(toggle_button: HTMLLabelElement, cookie_key: String = 'theme') {
        this.toggle_button = toggle_button;
        this.cookie_key = cookie_key;
        this.html = document.querySelector('html');

        this.current_theme = 'system';
        switch (this.html.dataset.theme ?? 'system') {
        case 'dark':
            this.current_theme = 'dark';
            break;
        case 'light':
            this.current_theme = 'light';
            break;
        default:
            this.current_theme = 'system';
        }

        const checkbox = this.toggle_button.querySelector('input');
        // Set if toggle should be checked
        if (this.isDarkMode()) {
            checkbox.removeAttribute('checked');
        } else {
            checkbox.setAttribute('checked', 'checked');
        }

        checkbox.addEventListener('change', (event) => {
            event.stopPropagation();
            event.preventDefault();
            this.setMode();
        });
    }

    isDarkMode(): boolean {
        if (this.current_theme === 'dark' ||
            this.current_theme === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return true;
        }
        return false;
    }

    setMode(): void {
        switch (this.current_theme) {
        case 'dark':
            this.switchToLight();
            break;
        case 'light':
            this.switchToDark();
            break;
        case 'system':
            this.isDarkMode() ? this.switchToLight() : this.switchToDark();
            break;

        default:
            this.switchToSystem();
        }
    }

    switchToLight(): void {
        this.current_theme = 'light';
        Cookies.set(this.cookie_key, 'light', { expires: 365 });
        this.html.setAttribute('data-theme', 'light');
    }

    switchToDark(): void {
        this.current_theme = 'dark';
        Cookies.set(this.cookie_key, 'dark', { expires: 365 });
        this.html.setAttribute('data-theme', 'dark');
    }

    switchToSystem(): void {
        this.current_theme = 'system';
        Cookies.set(this.cookie_key, 'system', { expires: 365 });
        this.html.setAttribute('data-theme', 'system');
    }
}
