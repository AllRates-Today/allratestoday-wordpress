<?php
/**
 * Remove the plugin's options on uninstall.
 *
 * @package AllRatesToday_Currency_Converter
 */

if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

delete_option( 'artcc_api_key' );
delete_option( 'artcc_show_credit' );
