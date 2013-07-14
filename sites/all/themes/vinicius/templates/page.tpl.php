<div id="page-wrapper">
  <div id="page">
    <div id="header"><div class="container section header clearfix">
        <?php if ($logo): ?>
          <a href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>" rel="home" id="logo" class="logo">
            <img src="<?php print $logo; ?>" alt="<?php print t('Home'); ?>" />
          </a>
        <?php endif; ?>
        <div id="search">
          <?php print $search_block_form; ?>
        </div>
        <div id="user-links" class="clearfix"><?php if (isset($user_links))
            print theme('links', $user_links); ?></div>
        <?php if ($site_name || $site_slogan): ?>
          <div id="name-and-slogan">
            <?php if ($site_name): ?>
              <?php if ($title): ?>
                <div id="site-name"><strong>
                    <a href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>" rel="home"><span><?php print $site_name; ?></span></a>
                  </strong></div>
              <?php else: /* Use h1 when the content title is empty */ ?>
                <h1 id="site-name">
                  <a href="<?php print $front_page; ?>" title="<?php print t('Home'); ?>" rel="home"><span><?php print $site_name; ?></span></a>
                </h1>
              <?php endif; ?>
            <?php endif; ?>
            <?php if ($site_slogan): ?>
              <div id="site-slogan"><?php print $site_slogan; ?></div>
            <?php endif; ?>
          </div> <!-- /#name-and-slogan -->
        <?php endif; ?>
        <?php print render($page['header']); ?>
      </div><!-- /.section .header -->
    </div> <!-- /#header -->
    <?php if ($main_menu || $secondary_menu): ?>
      <div id="navigation">
        <div class="container navigation section">
          <?php print theme('links__system_main_menu', array('links' => $main_menu, 'attributes' => array('id' => 'main-menu', 'class' => array('links', 'clearfix')))); ?>
        </div><!-- /.section .navigation -->
      </div> <!-- /#navigation -->
    <?php endif; ?>
    <div id="banner-wrap" class="slider-content <?php if (!$page['banner'])
      print 'empty' ?>">
           <?php if ($breadcrumb): ?>
        <div id="breadcrumb" class="container"><?php print $breadcrumb; ?></div>
      <?php endif; ?>
      <?php if ($page['banner']): ?>
        <div id="banner" class="clearfix">
          <div class="container region">
            <?php print render($page['banner']); ?>
          </div>
        </div>
      <?php endif; ?>
    </div>  
    <div id="main-wrapper">
      <?php print $messages; ?>
      <div id="content-wrap" class="container content-wrap clearfix">   
        <div id="main" class="main clearfix">
          <div id="content" class="column clear-fix">
            <?php if ($page['sidebar_first']): ?>
              <div id="first-sidebar" class="column sidebar first-sidebar">
                <div class="section">
                  <div class="gutter">
                    <?php print render($page['sidebar_first']); ?>
                  </div>
                </div><!-- /.section -->
              </div><!-- /#sidebar-first -->
            <?php endif; ?>
            <div class="page-content content-column section">
              <div class="gutter">
                <?php if ($page['highlighted']): ?><div id="highlighted"><?php print render($page['highlighted']); ?></div><?php endif; ?>
                <a id="main-content"></a>
                <?php print render($title_prefix); ?>
                <?php if ($title): ?><h1 class="title" id="page-title"><?php print $title; ?></h1><?php endif; ?>
                <?php print render($title_suffix); ?>
                <?php if ($tabs): ?><div class="tabs"><?php print render($tabs); ?></div><?php endif; ?>
                <?php print render($page['help']); ?>
                <?php if ($action_links): ?><ul class="action-links"><?php print render($action_links); ?></ul><?php endif; ?>
                <?php print render($page['content']); ?>
                <?php print $feed_icons; ?>
              </div>
            </div><!-- /.section .content .gutter -->
          </div> <!-- /#content -->
        </div><!-- /#main -->
        <?php if ($page['sidebar_second']): ?>
          <div id="second-sidebar" class="column sidebar second-sidebar">
            <div class="section">
              <div class="gutter">
                <?php print render($page['sidebar_second']); ?>
              </div><!-- /.gutter -->
            </div><!-- /.section -->
          </div> <!-- /#sidebar-second -->
        <?php endif; ?>
      </div> <!-- /#main-wrapper -->
    </div><!-- /#content-main -->
  </div><!-- /#page -->
  <div id="footer">
    <?php if ($page['bottom_one'] || $page['bottom_two']): ?>
      <div id="bottom" class="container clearfix">
        <?php if ($page['bottom_one']): ?>
          <div class="region bottom bottom-one<?php print ' bottom-' . $bottom; ?>">
            <div class="gutter">
              <?php print render($page['bottom_one']); ?>
            </div>
          </div>
        <?php endif; ?>
        <?php if ($page['bottom_two']): ?>
          <div class="region bottom bottom-two<?php print ' bottom-' . $bottom; ?>">
            <div class="gutter">
              <?php print render($page['bottom_two']); ?>
            </div>
          </div>
        <?php endif; ?>
      </div>
    <?php endif; ?>
    <div class="container section footer">
      <?php print render($page['footer']);
                  array_shift($main_menu); ?>
      <div class="footer-content-forever"><?php print theme('links__system_main_menu', array('links' => $main_menu, 'attributes' => array('id' => 'footer-menu', 'class' => array('links')))); ?></div>
      <div id="footer-container"><?php print l(t('AppsBr @year ',array( '@year'=>date('Y'))), '<front>'); ?></div>
  </div><!-- /.section -->
  </div> <!-- /#footer -->
</div> <!-- /#page-wrapper -->
