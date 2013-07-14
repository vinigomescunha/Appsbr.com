(function($) {

Drupal.tribune_nodejs = {};

Drupal.behaviors.tribune_nodejs = {
  attach: function(context) {
    var push_tribunes = {};

    $('div.tribune-wrapper.tribune-local', context).each(function(index, element) {
      var nid = $(this).attr('data-nid');
      var tribune = Drupal.settings.tribune['tribune-' + nid];
      push_tribunes[nid] = true;

      for (var i in tribune.elements) {
        clearInterval(tribune.elements[i].timer);

        tribune.elements[i].nodejs = {};
        tribune.elements[i].nodejs.queue = {ids: [], posts: {}};
        tribune.elements[i].nodejs.timer = 0;
      }
    })

    // This function shouldn't be used for the push tribunes.
    Drupal.tribune_nodejs.startReloading = Drupal.tribune.startReloading;
    Drupal.tribune.startReloading = (function() {return function(tribune) {
      var nid = tribune.attr('data-nid');
      if (undefined == push_tribunes[nid]) {
        Drupal.tribune_nodejs.startReloading(tribune);
      }
    };})(push_tribunes);
  }
};

Drupal.Nodejs.callbacks.tribune_new_post = {
  callback: function(message) {
    var tribunes = Drupal.settings.tribune['tribune-' + message.data.tribune].elements;
    for (var i in tribunes) {
      var tribune = tribunes[i];

      if (tribune.nodejs.timer) {
        clearTimeout(tribune.nodejs.timer);
      }

      tribune.nodejs.queue.ids.push(message.data.post_id);
      tribune.nodejs.queue.posts[message.data.post_id] = message.data.post_html;

      tribune.nodejs.timer = setTimeout((function(tribune) {return function() {Drupal.tribune_nodejs.insertQueue(tribune);};})(tribune), 250);
    };
  }
};

Drupal.tribune_nodejs.insertQueue = function(tribune) {
  var posts = {};

  var ids = tribune.nodejs.queue.ids;
  var queued_posts = tribune.nodejs.queue.posts;
  tribune.nodejs.queue = {ids: [], posts: {}};

  ids.sort();

  for (var i in ids) {
    var id = ids[i];
    posts[id] = queued_posts[id];
  }

  Drupal.tribune.addNewPosts(tribune, posts);
};

})(jQuery);
