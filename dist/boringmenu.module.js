'use strict';
class $bc2d8f1f3c9c1c0f$export$2e2bcd8739ae039 {
    /**
	 * Constructor
	 *
	 * @param {Object} options Options for an instance of boringmenu
	 */ constructor(options = {}){
        // Default options
        this.defaultOptions = {
            selectors: {
                menu: '.boringmenu',
                item: ':scope > li'
            },
            classes: {
                item: 'boringmenu__item',
                itemActive: 'boringmenu__item--active',
                itemParent: 'boringmenu__item--parent',
                toggle: 'boringmenu__toggle',
                toggleTextContainer: 'boringmenu__sr-only',
                hidden: ''
            },
            labels: {
                'menu.open': 'Open',
                'menu.close': 'Close'
            },
            icons: {
                'menu.open': 'fas fa-plus',
                'menu.close': 'fas fa-times'
            },
            id: 'boringmenu-' + this.getID(),
            mode: 'default',
            path: ''
        };
        // Polyfills for IE11
        this.polyfills();
        // Merge our provided options with defaults
        this.options = this.mergeOptions(options);
        // In case of class options, convert all values to arrays for consistency
        if (this.options.classes) Object.keys(this.options.classes).forEach((key)=>{
            if (typeof this.options.classes[key] === 'string') this.options.classes[key] = this.options.classes[key].split(' ');
            else if (!Array.isArray(this.options.classes[key])) this.options.classes[key] = [];
        });
        // Find menu element and bail out early if none found
        this.menu = document.querySelector(this.options.selectors.menu);
        if (!this.menu) {
            // Trigger the init done event in case some third party is waiting for this to happen
            document.dispatchEvent(new CustomEvent('boringmenu-init-done'));
            return;
        }
        // Set root menu depth
        this.menu.setAttribute('data-boringmenu-depth', 1);
        // Running counter for menu num
        this.menuNum = 0;
        // Menu object stash
        this.menuObjects = [
            this.menu
        ];
        // Merge menu options with existing options
        if (this.menu.getAttribute('data-boringmenu')) try {
            this.options = this.mergeOptions(JSON.parse(this.menu.getAttribute('data-boringmenu'), this.options));
        } catch (e) {}
        // Add active and parent classes
        this.addClasses(this.menu, this.options.classes);
        // Find submenu elements and create toggles
        this.findSubMenus(this.menu);
        // Trigger event when menu has been initialized
        this.menu.dispatchEvent(new CustomEvent('boringmenu-init-done', {
            bubbles: true,
            cancelable: true
        }));
    }
    /**
	 * Add active and parent classes
	 *
	 * @param {Object} menu
	 * @param {Object} classes
	 */ addClasses(menu, classes) {
        const currentPath = this.options.path || window.location.pathname.replace(/\/$/, '') + '/';
        const itemsSelector = classes.item.map((itemClass)=>'.' + itemClass + '[href="' + currentPath + '"]');
        menu.querySelectorAll(itemsSelector.join(', ')).forEach((item)=>{
            item.classList.add(...classes.itemActive);
            item = item.parentNode;
            while(item.parentNode){
                item = item.parentNode;
                if (item.tagName == 'LI') {
                    const childItem = item.firstElementChild;
                    if (childItem !== null && this.hasClass(childItem, classes.item) && !this.hasClass(childItem, classes.itemActive)) childItem.classList.add(...classes.itemParent);
                } else if (item.matches(this.options.selectors.menu)) break;
            }
        });
    }
    /**
	 * Find submenu elements and create toggles
	 *
	 * @param {Object} menu
	 * @param {Number} depth
	 */ findSubMenus(menu, depth = 2) {
        menu.querySelectorAll(this.options.selectors.item).forEach((item)=>{
            // Look for a submenu, bail out early if none found
            const submenu = item.querySelector('ul');
            if (!submenu) return;
            // Add unique ID and keep track of depth
            this.menuNum++;
            submenu.setAttribute('id', this.options.id + '-' + this.menuNum);
            submenu.setAttribute('data-boringmenu-depth', depth);
            // Hide menu
            if (!this.hasClass(item, this.options.classes.itemActive) && !item.querySelector('.' + this.options.classes.itemActive)) this.setHidden(submenu, true);
            // Insert toggle button before menu item
            submenu.parentNode.insertBefore(this.getToggle(submenu), submenu);
            // Store menu in stash
            this.menuObjects.push(submenu);
            // Find nested submenu elements
            this.findSubMenus(submenu, depth + 1);
        });
    }
    /**
	 * Helper function for displaying or hiding a menu
	 *
	 * @param {Object} menu
	 * @param {Object} menuToggle
	 * @param {Object} menuToggleText
	 * @param {(Object|null)} menuToggleIcon
	 * @param {boolean} hiddenState
	 * @param {boolean} triggerEvent
	 * @param {boolean} isRecursive
	 */ toggleMenu(menu, menuToggle, menuToggleText, menuToggleIcon, hiddenState, triggerEvent = true, isRecursive = false) {
        this.setHidden(menu, hiddenState);
        menu.menuToggleIcon = menu.menuToggleIcon || null;
        menuToggle.setAttribute('aria-expanded', !this.isHidden(menu));
        menuToggleText.nodeValue = this.options.labels[this.isHidden(menu) ? 'menu.open' : 'menu.close'];
        if (menuToggleIcon != null) {
            menu.menuToggleIcon = this.getToggleIcon(menu);
            menuToggleIcon.parentNode.replaceChild(menu.menuToggleIcon, menuToggleIcon);
        }
        if (!isRecursive && this.options.mode === 'accordion') this.menuObjects.forEach((menuObject)=>{
            if (menuObject.id === menu.id || this.isHidden(menuObject) || menuObject.contains(menu) || !menuObject.menuToggle) return;
            this.toggleMenu(menuObject, menuObject.menuToggle, menuObject.menuToggleText, menuObject.menuToggleIcon, true, true, true);
        });
        if (triggerEvent) this.menu.dispatchEvent(new CustomEvent('boringmenu-menu-toggle-done', {
            bubbles: true,
            cancelable: true,
            detail: {
                'menu': menu,
                'menuDepth': menu.getAttribute('data-boringmenu-depth')
            }
        }));
    }
    /**
	 * Get menu toggle element (button)
	 *
	 * @param {Object} submenu
	 * @returns {Object}
	 */ getToggle(submenu) {
        // Create menu toggle button
        const menuToggle = document.createElement('button');
        menuToggle.classList.add(...this.options.classes.toggle);
        menuToggle.setAttribute('aria-haspopup', 'true');
        menuToggle.setAttribute('aria-expanded', !this.isHidden(submenu));
        menuToggle.setAttribute('aria-controls', submenu.getAttribute('id'));
        // Add text within container
        const menuToggleTextContainer = document.createElement('span');
        if (this.options.classes.toggleTextContainer) menuToggleTextContainer.classList.add(...this.options.classes.toggleTextContainer);
        menuToggle.appendChild(menuToggleTextContainer);
        const menuToggleText = document.createTextNode(this.options.labels[this.isHidden(submenu) ? 'menu.open' : 'menu.close']);
        menuToggleTextContainer.appendChild(menuToggleText);
        // Add icon (optional)
        let menuToggleIcon = this.getToggleIcon(submenu);
        if (menuToggleIcon != null) menuToggle.appendChild(menuToggleIcon);
        // Store references to toggle objects in menu
        submenu.menuToggle = menuToggle;
        submenu.menuToggleText = menuToggleText;
        submenu.menuToggleIcon = menuToggleIcon;
        // Add click event listener
        menuToggle.addEventListener('click', (event)=>{
            event.stopPropagation();
            this.toggleMenu(submenu, submenu.menuToggle, submenu.menuToggleText, submenu.menuToggleIcon, !this.isHidden(submenu));
        });
        // Add keydown event listener
        menuToggle.addEventListener('keydown', (event)=>{
            let hiddenState;
            // 40 = down, 38 = up, 13 = enter, 32 = space
            if ([
                40,
                38,
                13,
                32
            ].indexOf(event.keyCode) > -1) {
                event.preventDefault();
                hiddenState = event.keyCode === 40 ? false : event.keyCode === 38 ? true : !this.isHidden(submenu);
                this.toggleMenu(submenu, submenu.menuToggle, submenu.menuToggleText, submenu.menuToggleIcon, hiddenState);
            }
        });
        return menuToggle;
    }
    /**
	 * Get menu toggle icon
	 *
	 * @param {Object} submenu
	 * @param {(Object|null)} menuToggleIcon
	 * @returns {(Object|null)}
	 */ getToggleIcon(submenu, menuToggleIcon) {
        menuToggleIcon = menuToggleIcon || null;
        if (this.options.icons['menu.open'] && this.options.icons['menu.close']) {
            menuToggleIcon = this.options.icons[this.isHidden(submenu) ? 'menu.open' : 'menu.close'];
            if (typeof menuToggleIcon == 'string') {
                const menuToggleIconClass = menuToggleIcon;
                menuToggleIcon = document.createElement('i');
                menuToggleIcon.setAttribute('aria-hidden', true);
                menuToggleIcon.classList.add(...menuToggleIconClass.split(' '));
            } else if (Array.isArray(menuToggleIcon)) {
                menuToggleIcon = document.createElement('i');
                menuToggleIcon.setAttribute('aria-hidden', true);
                menuToggleIcon.classList.add(...menuToggleIcon);
            } else if (typeof menuToggleIcon == 'object' && typeof menuToggleIcon.cloneNode == 'function') menuToggleIcon = menuToggleIcon.cloneNode(true);
            else if (typeof menuToggleIcon == 'function') menuToggleIcon = menuToggleIcon(submenu, submenu.getAttribute('data-boringmenu-depth'));
        }
        return menuToggleIcon;
    }
    /**
	 * Merge array of new options with default options
	 *
	 * @param {Object} options
	 * @param {(Object|null)} defaults
	 * @param {Number} depth
	 * @returns {Object}
	 */ mergeOptions(options, defaults, depth = 1) {
        if (defaults == null) defaults = this.defaultOptions;
        let keys = Object.keys(options);
        if (!keys.length) return defaults;
        for(let i = 0; i < keys.length; i++){
            const key = keys[i];
            if (defaults[key] !== null) {
                if (typeof defaults[key] === 'object') Object.assign(options[key], this.mergeOptions(defaults[key], options[key], depth + 1));
                else if (depth === 1) defaults[key] = options[key];
            }
        }
        Object.assign(options || {}, defaults);
        return options;
    }
    /**
	 * Get (mostly) unique identifier
	 *
	 * @returns {Number}
	 */ getID() {
        return Date.now();
    }
    /**
	 * Get root menu object
	 *
	 * @returns {Object}
	 */ getMenu() {
        return this.menu;
    }
    /**
	 * Get array of all menu objects
	 *
	 * @returns {Object}
	 */ getMenuObjects() {
        return this.menuObjects;
    }
    /**
	 * Check if menu is hidden
	 *
	 * @param {Object} menu
	 * @returns {boolean}
	 */ isHidden(menu) {
        return this.options.classes.hidden && this.hasClass(menu, this.options.classes.hidden) || !this.options.classes.hidden && menu.hidden;
    }
    /**
	 * Set menu hidden
	 *
	 * @param {Object} menu
	 * @param {boolean} hidden
	 */ setHidden(menu, hidden) {
        if (this.options.classes.hidden) {
            if (hidden) menu.classList.add(...this.options.classes.hidden);
            else menu.classList.remove(...this.options.classes.hidden);
            return;
        }
        menu.hidden = hidden;
    }
    /**
	 * Check if item contains given class (single string value) or classes (array)
	 *
	 * @param {Object} item
	 * @param {(string|Array)} classes
	 * @returns {boolean}
	 */ hasClass(item, classes) {
        if (!item || !classes || Array.isArray(classes) && !classes.length) return false;
        if (Array.isArray(classes)) for(let i = 0; i < classes.length; i++){
            if (item.classList.contains(classes[i])) return true;
        }
        else if (item.classList.contains(classes)) return true;
        return false;
    }
    /**
	 * Initialize polyfills
	 */ polyfills() {
        // Polyfill NodeList.forEach (IE11)
        // https://developer.mozilla.org/en-US/docs/Web/API/NodeList/forEach
        if ('NodeList' in window && !NodeList.prototype.forEach) NodeList.prototype.forEach = function(callback, thisArg) {
            thisArg = thisArg || window;
            for(let i = 0; i < this.length; i++)callback.call(thisArg, this[i], i, this);
        };
        // Polyfill Object.assign (IE11)
        // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/assign
        if (typeof Object.assign !== 'function') // Must be writable: true, enumerable: false, configurable: true
        Object.defineProperty(Object, "assign", {
            value: function assign(target, varArgs) {
                if (target === null || target === undefined) throw new TypeError('Cannot convert undefined or null to object');
                let to = Object(target);
                for(let i = 1; i < arguments.length; i++){
                    let nextSource = arguments[i];
                    if (nextSource !== null && nextSource !== undefined) {
                        for(let nextKey in nextSource)// Avoid bugs when hasOwnProperty is shadowed
                        if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) to[nextKey] = nextSource[nextKey];
                    }
                }
                return to;
            },
            writable: true,
            configurable: true
        });
    }
}


var $9870e4c7f021a338$export$2e2bcd8739ae039 = (0, $bc2d8f1f3c9c1c0f$export$2e2bcd8739ae039);


export {$9870e4c7f021a338$export$2e2bcd8739ae039 as default};
//# sourceMappingURL=boringmenu.module.js.map
