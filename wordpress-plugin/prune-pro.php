<?php
/**
 * Plugin Name: PrunePro
 * Plugin URI: https://prunepro.com
 * Description: Automated content pruning with safety rails. Remove zombie pages before they drain your rankings.
 * Version: 1.0.0
 * Author: EZ MONEY Pte. Ltd.
 * License: GPL v2 or later
 * Text Domain: prune-pro
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Define plugin constants
define('PRUNE_PRO_VERSION', '1.0.0');
define('PRUNE_PRO_PLUGIN_URL', plugin_dir_url(__FILE__));
define('PRUNE_PRO_PLUGIN_PATH', plugin_dir_path(__FILE__));

class PrunePro {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('admin_menu', array($this, 'add_admin_menu'));
        add_action('wp_ajax_prune_pro_apply_actions', array($this, 'handle_apply_actions'));
        add_action('wp_ajax_prune_pro_rollback', array($this, 'handle_rollback'));
        add_action('wp_ajax_prune_pro_get_status', array($this, 'handle_get_status'));
        
        // Register activation hook
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    public function init() {
        // Load text domain
        load_plugin_textdomain('prune-pro', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    public function activate() {
        // Create database tables
        $this->create_tables();
        
        // Set default options
        add_option('prune_pro_api_key', '');
        add_option('prune_pro_site_id', '');
        add_option('prune_pro_last_sync', '');
    }
    
    public function deactivate() {
        // Clean up if needed
    }
    
    private function create_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // Actions table
        $table_name = $wpdb->prefix . 'prune_pro_actions';
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            url varchar(255) NOT NULL,
            action_type varchar(20) NOT NULL,
            rationale text,
            risk_score int(3) DEFAULT 0,
            zombie_score int(3) DEFAULT 0,
            target_url varchar(255),
            status varchar(20) DEFAULT 'pending',
            applied_at datetime,
            rollback_token varchar(255),
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY url (url),
            KEY status (status)
        ) $charset_collate;";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($sql);
        
        // Changes log table
        $table_name = $wpdb->prefix . 'prune_pro_changes';
        $sql = "CREATE TABLE $table_name (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            action_id mediumint(9) NOT NULL,
            change_type varchar(20) NOT NULL,
            old_value text,
            new_value text,
            applied_at datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY action_id (action_id)
        ) $charset_collate;";
        
        dbDelta($sql);
    }
    
    public function add_admin_menu() {
        add_menu_page(
            'PrunePro',
            'PrunePro',
            'manage_options',
            'prune-pro',
            array($this, 'admin_page'),
            'dashicons-trash',
            30
        );
        
        add_submenu_page(
            'prune-pro',
            'Dashboard',
            'Dashboard',
            'manage_options',
            'prune-pro',
            array($this, 'admin_page')
        );
        
        add_submenu_page(
            'prune-pro',
            'Settings',
            'Settings',
            'manage_options',
            'prune-pro-settings',
            array($this, 'settings_page')
        );
    }
    
    public function admin_page() {
        ?>
        <div class="wrap">
            <h1>PrunePro Dashboard</h1>
            <div id="prune-pro-app">
                <div class="prune-pro-loading">
                    <p>Loading PrunePro dashboard...</p>
                </div>
            </div>
        </div>
        
        <script>
        // Initialize PrunePro dashboard
        document.addEventListener('DOMContentLoaded', function() {
            // This would connect to the PrunePro API
            console.log('PrunePro dashboard initialized');
        });
        </script>
        <?php
    }
    
    public function settings_page() {
        if (isset($_POST['submit'])) {
            update_option('prune_pro_api_key', sanitize_text_field($_POST['api_key']));
            update_option('prune_pro_site_id', sanitize_text_field($_POST['site_id']));
            echo '<div class="notice notice-success"><p>Settings saved!</p></div>';
        }
        
        $api_key = get_option('prune_pro_api_key', '');
        $site_id = get_option('prune_pro_site_id', '');
        ?>
        <div class="wrap">
            <h1>PrunePro Settings</h1>
            <form method="post" action="">
                <table class="form-table">
                    <tr>
                        <th scope="row">API Key</th>
                        <td>
                            <input type="text" name="api_key" value="<?php echo esc_attr($api_key); ?>" class="regular-text" />
                            <p class="description">Your PrunePro API key from the dashboard</p>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Site ID</th>
                        <td>
                            <input type="text" name="site_id" value="<?php echo esc_attr($site_id); ?>" class="regular-text" />
                            <p class="description">Your site ID from PrunePro</p>
                        </td>
                    </tr>
                </table>
                <?php submit_button(); ?>
            </form>
        </div>
        <?php
    }
    
    public function handle_apply_actions() {
        check_ajax_referer('prune_pro_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $actions = json_decode(stripslashes($_POST['actions']), true);
        $results = array();
        
        foreach ($actions as $action) {
            $result = $this->apply_action($action);
            $results[] = $result;
        }
        
        wp_send_json_success($results);
    }
    
    private function apply_action($action) {
        global $wpdb;
        
        $url = $action['url'];
        $action_type = $action['action'];
        $target_url = $action['target_url'] ?? '';
        
        $rollback_token = wp_generate_password(32, false);
        
        // Insert action record
        $wpdb->insert(
            $wpdb->prefix . 'prune_pro_actions',
            array(
                'url' => $url,
                'action_type' => $action_type,
                'rationale' => $action['rationale'],
                'risk_score' => $action['risk'],
                'zombie_score' => $action['zombie_score'],
                'target_url' => $target_url,
                'status' => 'applied',
                'applied_at' => current_time('mysql'),
                'rollback_token' => $rollback_token
            )
        );
        
        $action_id = $wpdb->insert_id;
        
        // Apply the actual action
        switch ($action_type) {
            case 'prune':
                $this->apply_noindex($url, $action_id);
                break;
            case 'redirect':
                $this->apply_redirect($url, $target_url, $action_id);
                break;
            case 'consolidate':
                $this->apply_redirect($url, $target_url, $action_id);
                break;
            case 'refresh':
                // Mark for refresh - could integrate with Content Phoenix
                $this->mark_for_refresh($url, $action_id);
                break;
        }
        
        return array(
            'action_id' => $action_id,
            'url' => $url,
            'action_type' => $action_type,
            'status' => 'applied',
            'rollback_token' => $rollback_token
        );
    }
    
    private function apply_noindex($url, $action_id) {
        global $wpdb;
        
        // Get post ID from URL
        $post_id = url_to_postid($url);
        
        if ($post_id) {
            // Add noindex meta
            update_post_meta($post_id, '_prune_pro_noindex', true);
            update_post_meta($post_id, '_prune_pro_noindex_applied', current_time('mysql'));
            
            // Log the change
            $wpdb->insert(
                $wpdb->prefix . 'prune_pro_changes',
                array(
                    'action_id' => $action_id,
                    'change_type' => 'noindex',
                    'old_value' => 'indexed',
                    'new_value' => 'noindex'
                )
            );
        }
    }
    
    private function apply_redirect($from_url, $to_url, $action_id) {
        global $wpdb;
        
        // Add redirect to .htaccess or use redirect plugin
        $redirect_rule = "Redirect 301 {$from_url} {$to_url}";
        
        // Log the change
        $wpdb->insert(
            $wpdb->prefix . 'prune_pro_changes',
            array(
                'action_id' => $action_id,
                'change_type' => 'redirect',
                'old_value' => $from_url,
                'new_value' => $to_url
            )
        );
        
        // Store redirect for .htaccess update
        update_option('prune_pro_redirects', array(
            'from' => $from_url,
            'to' => $to_url,
            'applied_at' => current_time('mysql')
        ));
    }
    
    private function mark_for_refresh($url, $action_id) {
        global $wpdb;
        
        $post_id = url_to_postid($url);
        
        if ($post_id) {
            // Mark for refresh
            update_post_meta($post_id, '_prune_pro_refresh', true);
            update_post_meta($post_id, '_prune_pro_refresh_brief', $_POST['refresh_brief'] ?? '');
            
            // Log the change
            $wpdb->insert(
                $wpdb->prefix . 'prune_pro_changes',
                array(
                    'action_id' => $action_id,
                    'change_type' => 'refresh',
                    'old_value' => 'original',
                    'new_value' => 'marked_for_refresh'
                )
            );
        }
    }
    
    public function handle_rollback() {
        check_ajax_referer('prune_pro_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        $rollback_token = sanitize_text_field($_POST['rollback_token']);
        
        global $wpdb;
        
        // Get action to rollback
        $action = $wpdb->get_row($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}prune_pro_actions WHERE rollback_token = %s",
            $rollback_token
        ));
        
        if (!$action) {
            wp_send_json_error('Action not found');
        }
        
        // Rollback based on action type
        switch ($action->action_type) {
            case 'prune':
                $this->rollback_noindex($action);
                break;
            case 'redirect':
            case 'consolidate':
                $this->rollback_redirect($action);
                break;
            case 'refresh':
                $this->rollback_refresh($action);
                break;
        }
        
        // Update action status
        $wpdb->update(
            $wpdb->prefix . 'prune_pro_actions',
            array('status' => 'rolled_back'),
            array('id' => $action->id)
        );
        
        wp_send_json_success('Rollback completed');
    }
    
    private function rollback_noindex($action) {
        global $wpdb;
        
        $post_id = url_to_postid($action->url);
        
        if ($post_id) {
            delete_post_meta($post_id, '_prune_pro_noindex');
            delete_post_meta($post_id, '_prune_pro_noindex_applied');
        }
    }
    
    private function rollback_redirect($action) {
        // Remove redirect from .htaccess or redirect plugin
        // Implementation depends on redirect method used
    }
    
    private function rollback_refresh($action) {
        global $wpdb;
        
        $post_id = url_to_postid($action->url);
        
        if ($post_id) {
            delete_post_meta($post_id, '_prune_pro_refresh');
            delete_post_meta($post_id, '_prune_pro_refresh_brief');
        }
    }
    
    public function handle_get_status() {
        check_ajax_referer('prune_pro_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        global $wpdb;
        
        $actions = $wpdb->get_results(
            "SELECT * FROM {$wpdb->prefix}prune_pro_actions ORDER BY created_at DESC LIMIT 50"
        );
        
        wp_send_json_success($actions);
    }
}

// Initialize the plugin
new PrunePro();
