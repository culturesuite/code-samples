let handler;

/**
 * Ensure that when tabbing through elements focus stays inside a modal,
 * looping you through a list of focusable elements inside that modal.
 */
export class FocusTrap {
    modal:HTMLElement;

    constructor(modal:HTMLElement) {
        this.modal = modal;
    }

    private handleKeys(event: KeyboardEvent): void {
        // recalculate the focusable elements each time so that it includes dynamically added elements
        const focusable: Array<HTMLElement> = Array.from(this.modal.querySelectorAll(
            'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        ));

        if (event.code !== 'Tab') {
            return;
        }
        if (event.shiftKey) {
            if (document.activeElement === focusable[0]) {
                event.preventDefault();
                focusable[focusable.length - 1].focus();
            }
        } else {
            if (document.activeElement === focusable[focusable.length - 1]) {
                event.preventDefault();
                focusable[0].focus();
            }
        }
    }

    releaseTrap(): void {
        window.removeEventListener('keydown', handler);
    }

    setTrap(): void {
        this.modal.focus();
        window.addEventListener('keydown', handler = (event) => {
            this.handleKeys(event);
        });
    }
}
