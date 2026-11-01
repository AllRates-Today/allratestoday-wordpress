/* Editor side of the Official Exchange Rate block. Rendered on the server; no build step. */
( function ( blocks, element, blockEditor, components, i18n ) {
	var el = element.createElement;
	var __ = i18n.__;
	var TD = 'allratestoday-currency-converter';
	var code = function ( v ) {
		return String( v || '' ).replace( /[^A-Za-z]/g, '' ).toUpperCase().slice( 0, 3 );
	};

	blocks.registerBlockType( 'allratestoday/official-rate', {
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
						{ title: __( 'Rate settings', TD ) },
						el( components.TextControl, {
							label: __( 'Bank code', TD ),
							help: __( 'e.g. ecb, boe, rbi, boj, snb, hmrc, ustreasury', TD ),
							value: a.bank,
							onChange: function ( v ) { set( { bank: String( v || '' ).toLowerCase().replace( /[^a-z0-9_-]/g, '' ) } ); },
						} ),
						el( components.TextControl, { label: __( 'From currency', TD ), value: a.source, onChange: function ( v ) { set( { source: code( v ) } ); } } ),
						el( components.TextControl, { label: __( 'To currency', TD ), value: a.target, onChange: function ( v ) { set( { target: code( v ) } ); } } ),
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
					{ icon: 'bank', label: __( 'Official Exchange Rate', TD ) },
					el( 'p', null, a.bank.toUpperCase() + ': ' + a.source + ' → ' + a.target + ' · ' + __( 'shown live on the published page', TD ) )
				)
			);
		},
		save: function () {
			return null;
		},
	} );
} )( window.wp.blocks, window.wp.element, window.wp.blockEditor, window.wp.components, window.wp.i18n );
