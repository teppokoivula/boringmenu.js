Boring menu
-----------

Boring menu is a JavaScript library for generating tree type navigation menus with toggle buttons for branches. Primarily developed with mobile navigation in mind, but technically the library can be used whenever a "boring menu" is needed.

You can find a simple example from the [demo directory](./demo/index.html).

## Getting started

1. Download or clone boringmenu from https://github.com/teppokoivula/boringmenu.js
2. Load boringmenu.min.js:

```HTML
<script src="boringmenu.js/dist/boringmenu.min.js"></script>
```

If IE11 support is required, load the compat version:

```HTML
<script src="boringmenu.js/dist/boringmenu.compat.js"></script>
```

3. Optionally load default styles:

```HTML
<link rel="stylesheet" href="boringmenu.js/dist/boringmenu.min.css">
```

4. Initialize menu:

```HTML
<script>
new boringmenu();
</script>
```

## Configuration settings

When initializing boring menu, you can optionally provide following configuration settings:

```HTML
<script>
new boringmenu({
	selectors: {
		menu: '.boringmenu',
		item: ':scope > li',
	},
	classes: {
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
		// supported values for icons are string (used as `<i>` element `class` property),
		// DOM node (gets cloned for use), or function (gets called, must return DOM node)
		'menu.open': 'fas fa-plus',
		'menu.close': 'fas fa-times',
	},
	id: 'boringmenu-1667758153965',
	// 'default' or 'accordion' mode: default mode allows opening multiple menu branches, while
	// accordion mode limits open branches of each menu to one, closing all others automatically
	mode: 'default',
});
</script>
```

Values displayed above are current default values, except for "id" which is by default generated automatically (`boringmenu-[current timestamp]`).

## Development

In order to develop and build boring menu you'll need to install a few JavaScript dependencies, and then run the [Parcel](https://parceljs.org/) powered build script (defined in [package.json](./package.json)):

```
npm install
npm run build
```
