 <?php

define("OK", 'OK');

/**
 * Preprocess and Process Functions SEE: http://drupal.org/node/254940#variables-processor
 * 1. Rename each function and instance of "appsbr" to match
 *    your subthemes name, e.g. if your theme name is "footheme" then the function
 *    name will be "footheme_preprocess_hook". Tip - you can search/replace
 *    on "appsbr".
 * 2. Uncomment the required function to use.
 * 3. Read carefully, especially within appsbr_preprocess_html(), there
 *    are extra goodies you might want to leverage such as a very simple way of adding
 *    stylesheets for Internet Explorer and a browser detection script to add body classes.
 */

/**
 * Override or insert variables into the html templates.
 */
function appsbr_preprocess_html(&$vars) {
  // Load the media queries styles
  // Remember to rename these files to match the names used here - they are
  // in the CSS directory of your subtheme.

// First, we must set up an array
/*$element = array(
  '#tag' => 'link', // The #tag is the html tag - <link />
   '#attributes' => array( // Set up an array of attributes inside the tag
    'href' => 'humans.txt', 
    'rel' => 'author',
   ),
);
drupal_add_html_head($element, 'google_font_cardo');*/

  $media_queries_css = array(
    'appsbr.responsive.style.css',
    'appsbr.responsive.gpanels.css'
  );
  load_subtheme_media_queries($media_queries_css, 'appsbr');

}

function temalink() {
  global $user;
  $user_links = array();
  if (empty($user->uid)) {
    $user_links[] = array('title' => t('Login'), 'href' => 'user');
    //verifico na variavel de registro.
    if (variable_get('user_register', 1)) {
      $user_links[] = array('title' => t('Register'), 'href' => 'user/register');
    }
  }
  else {
    $user_links[] = array('title' => t('@username', array('@username' => $user->name)), 'href' => 'user', 'html' => TRUE);
    $user_links[] = array('title' => t('Logout'), 'href' => "user/logout");
  }
  return array('links' => $user_links);
}

function appsbr_preprocess_page(&$vars) {
  $vars['user_links'] = temalink();
  $form = drupal_get_form('search_block_form');
  $vars['search_block_form'] = drupal_render($form);
  if (arg(0) == 'node' && !arg(1)) {
    drupal_goto('404');
  }
}

function appsbr_preprocess_breadcrumb(&$vars) {
  array_unshift($vars['breadcrumb'],l('Home','<front>'));
  $vars['breadcrumb'][] = drupal_get_title();
}

function appsbr_form_search_block_form_alter(&$form, &$form_state, $form_id) {
  if ($form_id == 'search_block_form') {
    $search = t('Search');
    $form['search_block_form']['#title'] = '';
    $form['search_block_form']['#title_display'] = 'invisible';
    $form['search_block_form']['#size'] = 20;
    $form['search_block_form']['#default_value'] = $search;
    $form['actions']['submit'] = array('#type' => 'image_button', '#src' => base_path() . path_to_theme() . '/images/search.png');
    $form['search_block_form']['#attributes']['onblur'] = "if (this.value == '') {this.value = '$search'}";
    $form['search_block_form']['#attributes']['onfocus'] = "if (this.value == '$search') {this.value = '';}";
  }
}
function appsbr_form_search_form_alter(&$form, &$form_state, $form_id) {
  if ($form_id == 'search_form') {
    $search = t('Search');
    $form['search_block_form']['#title'] = '';
    $form['search_block_form']['#title_display'] = 'invisible';
    $form['search_block_form']['#size'] = 20;
    $form['search_block_form']['#default_value'] = $search;
    $form['basic']['submit'] = array('#type' => 'image_button', '#src' => base_path() . path_to_theme() . '/images/search.png');
    $form['search_block_form']['#attributes']['onblur'] = "if (this.value == '') {this.value = '$search'}";
    $form['search_block_form']['#attributes']['onfocus'] = "if (this.value == '$search') {this.value = '';}";
  }
}


function appsbr_theme() {
  $items = array();

  $items['user_login'] = array(
    'render element' => 'form',
    'path' => drupal_get_path('theme', 'appsbr') . '/templates',
    'template' => 'user',
    'preprocess functions' => array(
      'appsbr_preprocess_user_login'
    ),
  );
  $items['user_register_form'] = array(
    'render element' => 'form',
    'path' => drupal_get_path('theme', 'appsbr') . '/templates',
    'template' => 'user',
    'preprocess functions' => array(
      'appsbr_preprocess_user_register_form'
    ),
  );
  $items['user_pass'] = array(
    'render element' => 'form',
    'path' => drupal_get_path('theme', 'appsbr') . '/templates',
    'template' => 'user',
    'preprocess functions' => array(
      'appsbr_preprocess_user_pass'
    ),
  );

  return $items;
}

function appsbr_preprocess_user_login(&$vars) {
  $vars['user_text'] = t('Login');
  $vars['form']['actions']['submit']['#value'] = OK;
  unset($vars['form']['name']['#description']);
  unset($vars['form']['pass']['#description']);
}

function appsbr_preprocess_user_register_form(&$vars) {
  $vars['user_text'] = t('Register');
  $vars['form']['actions']['submit']['#value'] = OK;
  unset($vars['form']['account']['name']['#description']);
  unset($vars['form']['account']['mail']['#description']);
}

function appsbr_preprocess_user_pass(&$vars) {
  $vars['user_text'] = t('New Password');
  $vars['form']['actions']['submit']['#value'] = OK;
}
function appsbr_preprocess_node(&$vars) {
  if ($vars['submitted']) {
   $name = $vars['name'];
    $vars['submitted'] = t(" $name @datetime" , array('@datetime' => format_date($vars['node']->created, 'custom' ,'d/m/Y H:i')));
  }
}
