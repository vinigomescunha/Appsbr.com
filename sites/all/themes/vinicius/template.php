<?php

define("OK", 'OK');

function viniciuslink() {
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

function vinicius_preprocess_page(&$vars) {
  $vars['bottom'] = count(array_filter(array($vars['page']['bottom_one'], $vars['page']['bottom_two'])));
  $vars['user_links'] = viniciuslink();
  $form = drupal_get_form('search_block_form');
  $vars['search_block_form'] = drupal_render($form);
  if (arg(0) == 'node' && !arg(1)) {
    drupal_goto('404');
  }
}

function vinicius_preprocess_breadcrumb(&$vars) {
  $vars['breadcrumb'][] = drupal_get_title();
}

function vinicius_form_search_block_form_alter(&$form, &$form_state, $form_id) {
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

function vinicius_theme() {
  $items = array();

  $items['user_login'] = array(
    'render element' => 'form',
    'path' => drupal_get_path('theme', 'vinicius') . '/templates',
    'template' => 'user',
    'preprocess functions' => array(
      'vinicius_preprocess_user_login'
    ),
  );
  $items['user_register_form'] = array(
    'render element' => 'form',
    'path' => drupal_get_path('theme', 'vinicius') . '/templates',
    'template' => 'user',
    'preprocess functions' => array(
      'vinicius_preprocess_user_register_form'
    ),
  );
  $items['user_pass'] = array(
    'render element' => 'form',
    'path' => drupal_get_path('theme', 'vinicius') . '/templates',
    'template' => 'user',
    'preprocess functions' => array(
      'vinicius_preprocess_user_pass'
    ),
  );

  return $items;
}

function vinicius_preprocess_user_login(&$vars) {
  $vars['user_text'] = t('Login');
  $vars['form']['actions']['submit']['#value'] = OK;
  unset($vars['form']['name']['#description']);
  unset($vars['form']['pass']['#description']);
}

function vinicius_preprocess_user_register_form(&$vars) {
  $vars['user_text'] = t('Register');
  $vars['form']['actions']['submit']['#value'] = OK;
  unset($vars['form']['account']['name']['#description']);
  unset($vars['form']['account']['mail']['#description']);
}

function vinicius_preprocess_user_pass(&$vars) {
  $vars['user_text'] = t('New Password');
  $vars['form']['actions']['submit']['#value'] = OK;
}
function vinicius_preprocess_node(&$vars) {
  if ($vars['submitted']) {
   $name = $vars['name'];
    $vars['submitted'] = t(" $name @datetime" , array('@datetime' => format_date($vars['node']->created, 'custom' ,'d/m/Y H:i')));
  }
}
