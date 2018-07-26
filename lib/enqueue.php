<?php

/**
 * Enqueue
 *
 * Functions that enqueue CSS and JS files
 */

if(!defined("ABSPATH")) exit; // Exit if accessed directly

if(!function_exists("registerJsDynamic")) {
  function registerJsDynamic($sourceDir = "/js/inc/dynamic/") {
    $dirJS = new DirectoryIterator(get_stylesheet_directory() . $sourceDir);

    foreach ($dirJS as $file) {
      if (pathinfo($file, PATHINFO_EXTENSION) === "js") {
        $fullName = basename($file);
        $name = substr(basename($fullName), 0, strpos(basename($fullName), "-"));

        switch($name) {
          case "critical":
            $deps = null;
            $inFooter = false;
            break;

          default:
            $deps = array("critical");
            $inFooter = true;
            break;
        }
        wp_enqueue_script($name, get_theme_file_uri($sourceDir . $fullName), $deps, null, $inFooter);
      }
    }
  }
}

if(!function_exists("registerTemplateCss")) {
  function registerTemplateCss() {
    wp_register_style("main", get_theme_file_uri("style.css"));
  }
  add_action("init", "registerTemplateCss");
}

if(!function_exists("registerPageCss")) {
  function registerPageCss() {
    $src = "css/";
    wp_register_style("home", get_theme_file_uri($src."home.css"));
  }
  add_action("init", "registerPageCss");
}

if(!function_exists("enqueueTemplateCss")) {
  /**
   * Enqueues stylesheets into the asset pipeline.
   */
  function enqueueTemplateCss() {
    wp_enqueue_style("main");
  }
  add_action("wp_enqueue_scripts", "enqueueTemplateCss", 15); // enqueue later
}

if(!function_exists("enqueuePageCss")) {
  /**
   * Enqueues stylesheets for each page depending on the page requested.
   */
  function enqueuePageCss($query) {
    if($query->is_home() && $query->is_main_query())
      wp_enqueue_style("home");
  }
  add_action("pre_get_posts", "enqueuePageCss");
}

if(!function_exists("enqueueTemplateScripts")) {
  function enqueueTemplateScripts() {
    registerJsDynamic();
    wp_enqueue_script("jquery");
    wp_enqueue_script('google-map-api', 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDTXco5SypsxwgXIt9t05kelv2PNxFoc5o', array( 'jquery' ) ); // live key - AIzaSyBc9A7CzFQglLvpdxGbd4KY8GbKIyd6rZA
    wp_enqueue_script("galleria", 'https://cdnjs.cloudflare.com/ajax/libs/galleria/1.5.7/galleria.min.js', array( 'jquery'), '' , true );
  }
  add_action("wp_enqueue_scripts", "enqueueTemplateScripts");
}
