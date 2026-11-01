<?php
/**
 * Plugin Name:       AllRatesToday Currency Converter
 * Plugin URI:        https://allratestoday.com/widget/
 * Description:       Free currency converter and official central-bank exchange rate widgets. Blocks and shortcodes, no API key needed.
 * Version:           1.0.0
 * Requires at least: 6.3
 * Requires PHP:      7.4
 * Author:            AllRatesToday
 * Author URI:        https://allratestoday.com
 * License:           GPLv2 or later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       allratestoday-currency-converter
 *
 * @package AllRatesToday_Currency_Converter
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'ARTCC_VERSION', '1.0.0' );
define( 'ARTCC_API_BASE', 'https://allratestoday.com' );

/**
 * Registered settings: an optional API key and the credit-link opt-in.
 */
function artcc_register_settings() {
	register_setting(
		'artcc_settings',
		'artcc_api_key',
		array(
			'type'              => 'string',
			'sanitize_callback' => 'artcc_sanitize_api_key',
			'default'           => '',
		)
	);
	register_setting(
		'artcc_settings',
		'artcc_show_credit',
		array(
			'type'              => 'boolean',
			'sanitize_callback' => 'rest_sanitize_boolean',
			'default'           => false,
		)
	);
}
add_action( 'admin_init', 'artcc_register_settings' );

/**
 * Keep only the characters an AllRatesToday key can contain.
 *
 * @param string $value Raw input.
 * @return string
 */
function artcc_sanitize_api_key( $value ) {
	return substr( preg_replace( '/[^A-Za-z0-9_\-]/', '', (string) $value ), 0, 128 );
}

/**
 * Settings page under Settings → AllRatesToday.
 */
function artcc_admin_menu() {
	add_options_page(
		__( 'AllRatesToday Currency Converter', 'allratestoday-currency-converter' ),
		__( 'AllRatesToday', 'allratestoday-currency-converter' ),
		'manage_options',
		'artcc',
		'artcc_render_settings_page'
	);
}
add_action( 'admin_menu', 'artcc_admin_menu' );

/**
 * Settings page markup.
 */
function artcc_render_settings_page() {
	if ( ! current_user_can( 'manage_options' ) ) {
		return;
	}
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'AllRatesToday Currency Converter', 'allratestoday-currency-converter' ); ?></h1>
		<form action="options.php" method="post">
			<?php settings_fields( 'artcc_settings' ); ?>
			<table class="form-table" role="presentation">
				<tr>
					<th scope="row"><?php esc_html_e( 'Credit link', 'allratestoday-currency-converter' ); ?></th>
					<td>
						<label>
							<input type="checkbox" name="artcc_show_credit" value="1" <?php checked( (bool) get_option( 'artcc_show_credit', false ) ); ?> />
							<?php esc_html_e( 'Show the "Exchange rates by AllRatesToday" link under each widget.', 'allratestoday-currency-converter' ); ?>
						</label>
						<p class="description">
							<?php esc_html_e( 'The free AllRatesToday service requires this link. Widgets stay hidden from visitors until you tick this box.', 'allratestoday-currency-converter' ); ?>
						</p>
					</td>
				</tr>
				<tr>
					<th scope="row"><label for="artcc_api_key"><?php esc_html_e( 'API key (optional)', 'allratestoday-currency-converter' ); ?></label></th>
					<td>
						<input type="text" class="regular-text" id="artcc_api_key" name="artcc_api_key" value="<?php echo esc_attr( get_option( 'artcc_api_key', '' ) ); ?>" autocomplete="off" />
						<p class="description">
							<?php
							echo wp_kses(
								sprintf(
									/* translators: %s: registration URL */
									__( 'Without a key the converter uses official ECB reference rates (30 currencies). A free key from %s adds real-time rates for 160+ currencies. The key is placed in your page HTML, so visitors can see it.', 'allratestoday-currency-converter' ),
									'<a href="https://allratestoday.com/register" target="_blank" rel="noopener">allratestoday.com/register</a>'
								),
								array(
									'a' => array(
										'href'   => array(),
										'target' => array(),
										'rel'    => array(),
									),
								)
							);
							?>
						</p>
					</td>
				</tr>
			</table>
			<?php submit_button(); ?>
		</form>
		<h2><?php esc_html_e( 'Shortcodes', 'allratestoday-currency-converter' ); ?></h2>
		<p><code>[allratestoday_converter base="USD" target="EUR" amount="100" theme="light"]</code></p>
		<p><code>[allratestoday_official_rate bank="ecb" source="USD" target="EUR" theme="light"]</code></p>
		<p>
			<?php esc_html_e( 'Or add the "Currency Converter" and "Official Exchange Rate" blocks in the editor.', 'allratestoday-currency-converter' ); ?>
			<a href="https://allratestoday.com/central-bank-rates-api/institutions/" target="_blank" rel="noopener"><?php esc_html_e( 'List of bank codes', 'allratestoday-currency-converter' ); ?></a>
		</p>
	</div>
	<?php
}

/**
 * Settings link on the Plugins screen.
 *
 * @param array $links Existing links.
 * @return array
 */
function artcc_action_links( $links ) {
	array_unshift( $links, '<a href="' . esc_url( admin_url( 'options-general.php?page=artcc' ) ) . '">' . esc_html__( 'Settings', 'allratestoday-currency-converter' ) . '</a>' );
	return $links;
}
add_filter( 'plugin_action_links_' . plugin_basename( __FILE__ ), 'artcc_action_links' );

/**
 * Bundled widget scripts. They call the AllRatesToday API, so point them at it.
 */
function artcc_register_scripts() {
	$base = 'window.ALLRATESTODAY_API_BASE = ' . wp_json_encode( ARTCC_API_BASE ) . ';';
	wp_register_script( 'artcc-converter', plugins_url( 'assets/widget.js', __FILE__ ), array(), ARTCC_VERSION, true );
	wp_add_inline_script( 'artcc-converter', $base, 'before' );
	wp_register_script( 'artcc-official-rate', plugins_url( 'assets/official-rates.js', __FILE__ ), array(), ARTCC_VERSION, true );
	wp_add_inline_script( 'artcc-official-rate', $base, 'before' );
}
add_action( 'init', 'artcc_register_scripts' );

/**
 * Normalise a currency code to three uppercase letters.
 *
 * @param mixed  $value    Raw value.
 * @param string $fallback Default code.
 * @return string
 */
function artcc_currency( $value, $fallback ) {
	$code = strtoupper( preg_replace( '/[^A-Za-z]/', '', (string) $value ) );
	return 3 === strlen( $code ) ? $code : $fallback;
}

/**
 * Widgets render only after the admin has agreed to show the credit link.
 * Admins see a pointer to the setting instead of an empty space.
 *
 * @return string|null Placeholder markup, or null when the widget may render.
 */
function artcc_gate() {
	if ( get_option( 'artcc_show_credit', false ) ) {
		return null;
	}
	if ( current_user_can( 'manage_options' ) ) {
		return '<p class="artcc-notice"><em>' . sprintf(
			/* translators: %s: settings page link */
			esc_html__( 'AllRatesToday widget hidden: enable the credit link in %s.', 'allratestoday-currency-converter' ),
			'<a href="' . esc_url( admin_url( 'options-general.php?page=artcc' ) ) . '">' . esc_html__( 'Settings → AllRatesToday', 'allratestoday-currency-converter' ) . '</a>'
		) . '</em></p>';
	}
	return '';
}

/**
 * Currency converter markup. Shared by the shortcode and the block.
 *
 * @param array $atts base, target, amount, theme.
 * @return string
 */
function artcc_render_converter( $atts ) {
	$gate = artcc_gate();
	if ( null !== $gate ) {
		return $gate;
	}
	$atts   = shortcode_atts(
		array(
			'base'   => 'USD',
			'target' => 'EUR',
			'amount' => '1',
			'theme'  => 'light',
		),
		(array) $atts,
		'allratestoday_converter'
	);
	$amount = (float) $atts['amount'];
	$key    = (string) get_option( 'artcc_api_key', '' );
	wp_enqueue_script( 'artcc-converter' );
	return sprintf(
		'<div class="art-currency-widget" data-base="%s" data-target="%s" data-amount="%s" data-theme="%s"%s></div>',
		esc_attr( artcc_currency( $atts['base'], 'USD' ) ),
		esc_attr( artcc_currency( $atts['target'], 'EUR' ) ),
		esc_attr( $amount > 0 ? (string) $amount : '1' ),
		'dark' === $atts['theme'] ? 'dark' : 'light',
		'' !== $key ? ' data-api-key="' . esc_attr( $key ) . '"' : ''
	);
}

/**
 * Official rate card markup. Shared by the shortcode and the block.
 *
 * @param array $atts bank, source, target, theme.
 * @return string
 */
function artcc_render_official_rate( $atts ) {
	$gate = artcc_gate();
	if ( null !== $gate ) {
		return $gate;
	}
	$atts = shortcode_atts(
		array(
			'bank'   => 'ecb',
			'source' => 'USD',
			'target' => 'EUR',
			'theme'  => 'light',
		),
		(array) $atts,
		'allratestoday_official_rate'
	);
	$bank = substr( preg_replace( '/[^a-z0-9_\-]/', '', strtolower( (string) $atts['bank'] ) ), 0, 40 );
	wp_enqueue_script( 'artcc-official-rate' );
	return sprintf(
		'<div class="art-official-rate" data-bank="%s" data-source="%s" data-target="%s" data-theme="%s"></div>',
		esc_attr( '' !== $bank ? $bank : 'ecb' ),
		esc_attr( artcc_currency( $atts['source'], 'USD' ) ),
		esc_attr( artcc_currency( $atts['target'], 'EUR' ) ),
		'dark' === $atts['theme'] ? 'dark' : 'light'
	);
}

add_shortcode( 'allratestoday_converter', 'artcc_render_converter' );
add_shortcode( 'allratestoday_official_rate', 'artcc_render_official_rate' );

/**
 * Blocks: attributes and editor script come from block.json; output is the shortcode markup.
 */
function artcc_register_blocks() {
	register_block_type( __DIR__ . '/blocks/converter', array( 'render_callback' => 'artcc_render_converter' ) );
	register_block_type( __DIR__ . '/blocks/official-rate', array( 'render_callback' => 'artcc_render_official_rate' ) );
}
add_action( 'init', 'artcc_register_blocks' );
