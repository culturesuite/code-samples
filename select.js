export class Select {
    constructor(root_node, form, style) {
        this.root_node = root_node;
        this.form = form;
        this.style = style ?? 'default';

        this.toggle_button = root_node.querySelector('button[aria-expanded]');
        this.options = Array.from(root_node.querySelectorAll('input'));
        this.apply_button = root_node.querySelector('button[type="submit"]');
        this.dropdown_id = this.toggle_button.getAttribute('aria-controls');
        this.dropdown = document.getElementById(this.dropdown_id);
        this.default_label = this.root_node.dataset.defaultLabel;

        ['click', 'keyup'].forEach(ev => {
            this.root_node.addEventListener(ev, (event) => {
                event.stopPropagation();
            });
        });

        this.selected_values = [];
        this.form_is_dirty = false;

        this.handleCloseEvents();
        this.initOptions();

        this.toggle_button.addEventListener('click', (e) => {
            e.stopPropagation();
            e.preventDefault();
            this.toggle();
        });

        if (this.apply_button) {
            this.apply_button.addEventListener('click', (event) => {
                event.preventDefault();
                this.form.submit();
            });
        }


        // on multi-selects implement up/down for prev/next
        // on single-selects this is already handled by the browser
        const multiselect = this.root_node.querySelector('[role="listbox"][aria-multiselectable="true"]');
        if (multiselect) {
            multiselect.addEventListener('keyup', (e) => {
                if (e.code === 'ArrowUp') {
                    this.navigate(e, 'prev');
                } else if (e.code === 'ArrowDown') {
                    this.navigate(e, 'next');
                }
            });
        }
    }

    show() {
        this.toggle_button.setAttribute('aria-expanded', true);
        this.dropdown.setAttribute('aria-hidden', false);
        this.options[0].focus();
    }

    hide() {
        this.toggle_button.setAttribute('aria-expanded', false);
        this.dropdown.setAttribute('aria-hidden', true);
        this.toggle_button.focus();
    }

    toggle() {
        if (JSON.parse(this.toggle_button.getAttribute('aria-expanded'))) {
            this.hide();
        } else {
            this.show();
        }
    }

    handleCloseEvents() {
        ['click', 'focusin'].forEach(ev => {
            window.addEventListener(ev, (event) => {
                if (!this.root_node.contains(event.target)) {
                    if (JSON.parse(this.toggle_button.getAttribute('aria-expanded')) && this.style !== 'sidebar') {
                        this.hide();
                        if (this.form_is_dirty) {
                            this.form.submit();
                        }
                    }
                }
            });
        });

        // close dropdown on escape key
        this.dropdown.addEventListener('keydown', (e) => {
            e.stopPropagation();
            if (e.code === 'Escape') {
                e.preventDefault();
                this.hide();
                // TODO: should reset to initial values and not submit
                if (this.form_is_dirty) {
                    this.form.submit();
                }
            }
        });
    }

    navigate(event, direction) {
        event.preventDefault();

        if (document.activeElement.tagName.toLowerCase() !== 'input') {
            return;
        }

        let index = this.options.indexOf(document.activeElement);

        // if somehow not focused on an option, restore focus to the first option
        if (index < 0) {
            return this.options[0].focus();
        }

        // if it's last element allow default behavior
        if (direction === 'next' && index === this.options.length - 1) {
            return;
        }
        // if it's first element allow default behavior
        if (direction !== 'next' && index === 0) {
            return;
        }

        if (direction === 'next') {
            this.options[index += 1].focus();
        } else {
            this.options[index -= 1].focus();
        }
    }


    createDropdownLabel() {
        const label = this.toggle_button.querySelector('span');

        if (this.selected_values.length === 0) {
            label.innerText = this.default_label;
            label.classList.add('placeholder');
        } else {
            label.classList.remove('placeholder');
            if (this.selected_values.length <= 2) {
                label.innerText = this.selected_values.join(', ');
            } else {
                let allValues = [...this.selected_values];
                let remaining = allValues.splice(2, allValues.length + 1).length;
                label.innerText = allValues
                    .splice(0, 3)
                    .join(', ')
                    .concat(` +${remaining}`);
            }
        }
    }

    updateState(option) {
        let label = option.nextSibling.textContent.trim();

        if (option.checked === true) {
            option.setAttribute('aria-selected', 'true');
            if (option.getAttribute('type') === 'radio') {
                this.selected_values = [];
            }
            this.selected_values.push(label);
        } else {
            option.setAttribute('aria-selected', 'false');
            let index = this.selected_values.indexOf(label);
            if (index !== -1) {
                this.selected_values.splice(index, 1);
            }
        }
        if (this.style !== 'sidebar') {
            this.createDropdownLabel();
        }
    }

    clearOptions(current) {
        this.options.map((option) => {
            if (option && option !== current) {
                option.checked = false;
                option.setAttribute('aria-selected', 'false');
            }
        });
        this.selected_values = [];
    }

    initOptions() {
        this.options.forEach(option => {
            if (!option) {
                return;
            }
            this.updateState(option);

            option.addEventListener('change', () => {
                let isExcludeFieldChecked = this.options.filter((checkbox) => {
                    return checkbox &&
                        checkbox.checked &&
                        checkbox.dataset &&
                        checkbox.dataset.exclude &&
                        JSON.parse(checkbox.dataset.exclude);
                });
                if (isExcludeFieldChecked.length > 0) {
                    this.clearOptions(option);
                }
                this.root_node.querySelector('[role="listbox"]').setAttribute('aria-activedescendant', option.id);
                this.updateState(option);
                this.form_is_dirty = true;
                if (this.apply_button) {
                    this.apply_button.removeAttribute('disabled');
                }
            });
        });
    }
}
