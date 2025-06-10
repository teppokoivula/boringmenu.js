Boring menu
-----------

Boring menu is a JavaScript library for generating tree type navigation menus with toggle buttons for branches. Primarily developed with mobile navigation in mind, but technically the library can be used whenever a "boring menu" is needed.

## Getting started

You can find an example using boring menu from the [demo directory](./demo/index.html).

### 1. Install the library

```console
npm i @teppokoivula/boringmenu
```

Alternatively download or clone module source code (or just the dist directory) from https://github.com/teppokoivula/boringmenu.js.

### 2. Include JavaScript

Import module:

```javascript
import boringmenu from '@teppokoivula/boringmenu'
```

Alternatively you can include boringmenu.min.js directly:

```html
<script src="boringmenu.js/dist/boringmenu.min.js"></script>
```

If IE11 support is required, include the compat version:

```html
<script src="boringmenu.js/dist/boringmenu.compat.js"></script>
```

### 3. Include default styles (optional)

If using webpack or similar build tool:

```scss
@import '@teppokoivula/boringmenu/scss/boringmenu.scss';
```

In HTML:

```html
<link rel="stylesheet" href="boringmenu.js/dist/boringmenu.min.css">
```

### 4. Initialize menu

```javascript
new boringmenu();
```

## Configuration settings

When initializing boring menu, you can optionally provide following configuration settings:

```javascript
new boringmenu({
	selectors: {
		menu: '.boringmenu',
		item: ':scope > li',
	},
	classes: {
		// each key can contain either one class, or multiple classes with space as a separator
		item: 'boringmenu__item',
		itemActive: 'boringmenu__item--active',
		itemParent: 'boringmenu__item--parent',
		toggle: 'boringmenu__toggle',
		toggleTextContainer: 'boringmenu__sr-only',
	},
	labels: {
		'menu.open': 'Open',
		'menu.close': 'Close',
	},
	icons: {
		// supported values for icons:
		//
		// 1) string — used as `<i>` element `class` property
		// 2) DOM node — gets cloned for use
		// 3) function — gets called, must return DOM node node; menu object and menu depth get
		//    passed in as params, e.g. `(menu, depth) => { ... }`
		'menu.open': 'fas fa-plus',
		'menu.close': 'fas fa-times',
	},
	id: 'boringmenu-1667758153965',
	// supported values for mode:
	//
	// 1) 'default' — allows opening multiple menu branches
	// 2) 'accordion' — limits open branches of each menu to one, closing all others automatically
	mode: 'default',
});
```

Values displayed above are current default values, except for "id" which is by default generated automatically (`boringmenu-[current timestamp]`).

## Development

In order to develop and build boring menu you'll need to install a few JavaScript dependencies, and then run the [Parcel](https://parceljs.org/) powered build script (defined in [package.json](./package.json)):

```
npm install
npm run build
```
