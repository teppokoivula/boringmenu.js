'use strict';

/**
 * boringmenu.js
 *
 * @version 0.0.1
 */
export default class boringmenu {

	/**
	 * Constructor
	 *
   	 * @param {Object} options Options for an instance of boringmenu
	 */
	constructor(options = {}) {

		// Default options
		this.options = {
			selectors: {
				menu: '.boringmenu',
				menuItem: ':scope > li',
			},
			classes: {
				menuItemActive: 'boringmenu__item--active',
				menuToggle: 'boringmenu__toggle',
				menuToggleTextContainer: 'boringmenu__sr-only',
			},
			labels: {
				'menu.open': 'Open',
				'menu.close': 'Close',
			},
			icons: {
				'menu.open': 'fas fa-plus',
				'menu.close': 'fas fa-times',
			},
			id: 'boringmenu-' + this.getID(),
		};

		// Merge our provided options with defaults
		this.options = this.mergeOptions(options);

		// Find menu element and bail out early if none found
		this.menu = document.querySelector(this.options.selectors.menu);
		if (!this.menu) {
			// Trigger the init done event in case some third party is waiting for this to happen
			document.dispatchEvent(new CustomEvent('boringmenu-init-done'));
			return;
		}

		// Polyfill NodeList.forEach (IE11)
		if ('NodeList' in window && !NodeList.prototype.forEach) {
			NodeList.prototype.forEach = function (callback, thisArg) {
				thisArg = thisArg || window;
				for (var i = 0; i < this.length; i++) {
					callback.call(thisArg, this[i], i, this);
				}
			};
		}

		// Merge menu options with existing options
		if (this.menu.getAttribute('data-boringmenu')) {
			try {
				this.options = this.mergeOptions(JSON.parse(this.menu.getAttribute('data-boringmenu')));
			} catch(e) {};
		}

		// Find submenu elements and create toggles
		this.findSubMenus(this.menu);

		// Trigger event when menu has been initialized
		this.menu.dispatchEvent(new CustomEvent('boringmenu-init-done', {
			bubbles: true,
			cancelable: true
		}));
	}

	/**
	 * Find submenu elements and create toggles
	 *
	 * @param {Object} menu Menu element
	 */
	findSubMenus(menu) {
		menu.querySelectorAll(this.options.selectors.menuItem).forEach((menuItem, index) => {

			// Look for a submenu, bail out early if none found
			const submenu = menuItem.querySelector('ul');
			if (!submenu) return;

			// Add unique ID
			submenu.setAttribute('id', this.options.id + '-' + index);

			// Hide menu
			if (!menuItem.classList.contains(this.options.classes.menuItemActive) && !submenu.querySelectorAll('.' + this.options.classes.menuItemActive).length) {
				submenu.hidden = true;
			}

			// Insert toggle button before menu item
			submenu.parentNode.insertBefore(this.getMenuToggle(submenu), submenu);

			// Find nested submenu elements
			this.findSubMenus(submenu);
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
	 * @returns {Object} Modified arguments
	 */
	toggleMenu(menu, menuToggle, menuToggleText, menuToggleIcon, hiddenState) {
		menu.hidden = hiddenState;
		menuToggle.setAttribute('aria-expanded', !menu.hidden);
		menuToggleText.nodeValue = this.options.labels[menu.hidden ? 'menu.open' : 'menu.close'];
		if (menuToggleIcon != null) {
			const newMenuToggleIcon = this.getMenuToggleIcon(menu, menuToggleIcon);
			menuToggleIcon.parentNode.replaceChild(newMenuToggleIcon, menuToggleIcon);
			menuToggleIcon = newMenuToggleIcon;
		}
		return {
			menuToggleIcon: menuToggleIcon
		};
	}

	/**
	 * Get menu toggle element (button)
	 *
	 * @param {Object} submenu
	 * @returns {Object}
	 */
	getMenuToggle(submenu) {

		// Create menu toggle button
		const menuToggle = document.createElement('button');
		menuToggle.classList.add(this.options.classes.menuToggle);
		menuToggle.setAttribute('aria-haspopup', 'true');
		menuToggle.setAttribute('aria-expanded', !submenu.hidden);
		menuToggle.setAttribute('aria-controls', submenu.getAttribute('id'));

		// Add text within container
		const menuToggleTextContainer = document.createElement('span');
		if (this.options.classes.menuToggleTextContainer) {
			menuToggleTextContainer.classList.add(this.options.classes.menuToggleTextContainer);
		}
		menuToggle.appendChild(menuToggleTextContainer);
		const menuToggleText = document.createTextNode(this.options.labels[submenu.hidden ? 'menu.open' : 'menu.close']);
		menuToggleTextContainer.appendChild(menuToggleText);

		// Add icon (optional)
		let menuToggleIcon = this.getMenuToggleIcon(submenu);
		if (menuToggleIcon != null) {
			menuToggle.appendChild(menuToggleIcon);
		}

		// Add click event listener
		menuToggle.addEventListener('click', () => {
			const menuArgs = this.toggleMenu(submenu, menuToggle, menuToggleText, menuToggleIcon, !submenu.hidden);
			if (menuArgs.menuToggleIcon != null) {
				menuToggleIcon = menuArgs.menuToggleIcon;
			}
		});

		// Add keydown event listener
		menuToggle.addEventListener('keydown', (event) => {
			let hiddenState;
			// 40 = down, 38 = up, 13 = enter, 32 = space
			if ([40, 38, 13, 32].indexOf(event.keyCode) > -1) {
				event.preventDefault();
				hiddenState = event.keyCode === 40 ? false : (event.keyCode === 38 ? true : !submenu.hidden);
				const menuArgs = this.toggleMenu(submenu, menuToggle, menuToggleText, menuToggleIcon, hiddenState);
				if (menuArgs.menuToggleIcon != null) {
					menuToggleIcon = menuArgs.menuToggleIcon;
				}
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
	 */
	getMenuToggleIcon(submenu, menuToggleIcon) {
		menuToggleIcon = menuToggleIcon || null;
		if (this.options.icons['menu.open'] && this.options.icons['menu.close']) {
			menuToggleIcon = this.options.icons[submenu.hidden ? 'menu.open' : 'menu.close'];
			if (typeof menuToggleIcon == 'string') {
				const menuToggleIconClass = menuToggleIcon;
				menuToggleIcon = document.createElement('i');
				menuToggleIcon.setAttribute('aria-hidden', true);
				menuToggleIconClass.split(' ').forEach(iconClass => {
					menuToggleIcon.classList.add(iconClass);
				});
			}
		}
		return menuToggleIcon;
	}

	/**
	 * Merge array of new options with current options
	 *
	 * @param {Object} options
	 * @param {(Object|null)} defaults
	 * @returns {Object}
	 */
	mergeOptions(options, defaults) {
		if (defaults == null) {
			defaults = this.options;
		}
		for (const key of Object.keys(options)) {
			if (typeof options[key] === 'object') {
				Object.assign(options[key], this.mergeOptions(defaults[key], options[key]));
			}
		}
		Object.assign(options || {}, defaults);
		return options;
	}

	/**
	 * Get (mostly) unique identifier
	 *
	 * @returns {Number}
	 */
	getID() {
		return Date.now();
	}

}
