/* Editor side of the Currency Converter block. Rendered on the server; no build step. */
( function ( blocks, element, blockEditor, components, i18n ) {
	var el = element.createElement;
	var __ = i18n.__;
	var TD = 'allratestoday-currency-converter';
	var code = function ( v ) {
		return String( v || '' ).replace( /[^A-Za-z]/g, '' ).toUpperCase().slice( 0, 3 );
	};

	blocks.registerBlockType( 'allratestoday/converter', {
		edit: function ( props ) {
			var a = props.attributes;
			var set = props.setAttributes;
			return el(
				'div',
				blockEditor.useBlockProps(),
				el(
					blockEditor.InspectorControls,
					null,
					el(
						components.PanelBody,
						{ title: __( 'Converter settings', TD ) },
						el( components.TextControl, { label: __( 'From currency', TD ), value: a.base, onChange: function ( v ) { set( { base: code( v ) } ); } } ),
						el( components.TextControl, { label: __( 'To currency', TD ), value: a.target, onChange: function ( v ) { set( { target: code( v ) } ); } } ),
						el( components.TextControl, { label: __( 'Starting amount', TD ), type: 'number', min: 0, value: a.amount, onChange: function ( v ) { set( { amount: parseFloat( v ) || 1 } ); } } ),
						el( components.SelectControl, {
							label: __( 'Theme', TD ),
							value: a.theme,
							options: [ { label: __( 'Light', TD ), value: 'light' }, { label: __( 'Dark', TD ), value: 'dark' } ],
							onChange: function ( v ) { set( { theme: v } ); },
						} )
					)
				),
				el(
					components.Placeholder,
					{ icon: 'money-alt', label: __( 'Currency Converter', TD ) },
					el( 'p', null, a.amount + ' ' + a.base + ' → ' + a.target + ' · ' + __( 'shown live on the published page', TD ) )
				)
			);
		},
		save: function () {
			return null;
		},
	} );
} )( window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components, window.wp.i18n );
