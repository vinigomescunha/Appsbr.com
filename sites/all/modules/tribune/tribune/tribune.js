(function($) {
if (typeof(Drupal) == "undefined" || !Drupal.tribune) {
  Drupal.tribune = {
    notification: false,
    notification_original_title: document.title
  };
}

$.expr[":"].textequals = function(obj, index, meta, stack) {
  return (obj.textContent || obj.innerText || $(obj).text() || "") == meta[3];
}

Drupal.behaviors.tribune = {
  attach: function(context) {
    $('div.tribune-wrapper', context).each(function(index, element) {
      Drupal.tribune.setupTribune($(this));
    })
  }
};

Drupal.tribune.setupTribune = function(tribune) {
  tribune.settings = Drupal.settings.tribune['tribune-' + tribune.attr('data-nid')];
  tribune.settings.postData = {};
  if (undefined == tribune.settings.elements) {
    tribune.settings.elements = [];
  }
  tribune.settings.elements.push(tribune);

  $(document).mousemove(function() {Drupal.tribune.resetNotification(tribune);});
  $(window).focus(function() {Drupal.tribune.resetNotification(tribune);});

  var posts = tribune.find('li.tribune-post');
  posts.each(function(index, element) {
    Drupal.tribune.findClocks($(this));
    Drupal.tribune.findUsernames($(this));
    Drupal.tribune.attachClockHandlers(tribune, $(this));
    Drupal.tribune.attachUsernameHandlers(tribune, $(this));

    if (tribune.settings.permissions && tribune.settings.permissions.mod) {
      Drupal.tribune.attachModHandlers(tribune, $(this));
    }
  });
  Drupal.tribune.updatePostClasses(tribune, posts);
  
  Drupal.settings.tribune['tribune-' + tribune.attr('data-nid')].after_reload = [
    function(tribune, nodes) {
      nodes.each(function() {
        Drupal.tribune.findClocks($(this));
        Drupal.tribune.findUsernames($(this));
        Drupal.tribune.attachClockHandlers(tribune, $(this));
        Drupal.tribune.attachUsernameHandlers(tribune, $(this));
      });
    },
    function(tribune, nodes) {
      Drupal.tribune.updatePostClasses(tribune, nodes);
    },
    function(tribune, nodes) {
      Drupal.tribune.setNotification(tribune, nodes);
    }
  ];

  Drupal.tribune.attachPostHandler(tribune);
  if (undefined != $.fn.appear) {
    // if the jquery-appear library is loaded, use it
    tribune.appear((function(tribune) {
      return function() {
        tribune.timer = setInterval(function() {Drupal.tribune.startReloading(tribune);}, 30000);
      };
    })(tribune));
  } else {
    tribune.timer = setInterval(function() {Drupal.tribune.startReloading(tribune);}, 30000);
  }
};

Drupal.tribune.setNotification = function(tribune, nodes) {
  nodes.each(function() {
    if (!$(this).hasClass("tribune-own-post")) {
      if ($(this).hasClass("tribune-answer")) {
        document.title = "# " + Drupal.tribune.notification_original_title;
        Drupal.tribune.notification = true;
        Drupal.tribune.setNotificationFavicon(tribune, tribune.settings.favicons.answer);
        return;
      } else if (!Drupal.tribune.notification) {
        document.title = "* " + Drupal.tribune.notification_original_title;
        Drupal.tribune.notification = true;
        Drupal.tribune.setNotificationFavicon(tribune, tribune.settings.favicons.new_post);
      }
    }
  });
}

Drupal.tribune.setNotificationFavicon = function(tribune, url) {
  // browsers only take into account *new* favicons
  // so just removing the last one doesn't restore the previous favicon
  // you have to remove the previous one too, and append it again to head

  if (tribune.settings.favicon_notification) {
    var oldlink = $('link#tribune-notification-favicon');

    if (url) {
      var newlink = $('<link />');
      newlink.attr('rel', 'shortcut icon');
      newlink.attr('type', 'image/x-icon');
      newlink.attr('href', url);
      newlink.attr('id', 'tribune-notification-favicon');
      $('head').append(newlink);
    }

    oldlink.remove();

    $('link[rel=shortcut icon]').remove().appendTo($('head'));
  }
}

Drupal.tribune.resetNotification = function(tribune) {
  if (Drupal.tribune.notification) {
    document.title = Drupal.tribune.notification_original_title;
    Drupal.tribune.notification = false;
    Drupal.tribune.setNotificationFavicon(tribune, null);
  }
}

Drupal.tribune.attachPostHandler = function(tribune) {
  tribune.find('form.tribune-post-form').submit(function() {
    tribune.find('form.tribune-post-form input[name=message]').attr('disabled', 'disabled');
    tribune.addClass('tribune-posting');
    Drupal.settings.tribune['tribune-' + tribune.attr('data-nid')].postData.message = tribune.find('input[name=message]').val();
    Drupal.settings.tribune['tribune-' + tribune.attr('data-nid')].postData.last = tribune.find('li:last').attr('value');
    $.ajax({
      url: tribune.settings.posturl,
      data: Drupal.settings.tribune['tribune-' + tribune.attr('data-nid')].postData,
      dataType: 'json',
      cache: false,
      type: 'POST',
      success: function(data, textStatus, jqXHR) {Drupal.tribune.postSuccess(data, tribune)},
      error: function(jqXHR, textStatus, errorThrown) {Drupal.tribune.postError(tribune)},
      complete: function(jqXHR, textStatus) {Drupal.tribune.postComplete(tribune)},
    });
    Drupal.settings.tribune['tribune-' + tribune.attr('data-nid')].postData = {};
    return false;
  });
};

Drupal.tribune.postSuccess = function(data, tribune) {
  tribune.find('input[name=message]').val('');
  tribune.removeClass('tribune-post-error');
  Drupal.tribune.reloadSuccess(data, tribune);
};

Drupal.tribune.postError = function(tribune) {
  tribune.addClass('tribune-post-error');
};

Drupal.tribune.postComplete = function(tribune) {
  tribune.find('form.tribune-post-form input[name=message]').attr('disabled', '');
  tribune.removeClass('tribune-posting');
};

Drupal.tribune.attachModHandlers = function(tribune, post) {
  var a = $('<a></a>').attr('id', 'tribune-delete-post').attr('title', Drupal.t('Delete this post')).attr('href', '#').text('✖');
  a.click(function() {
    $.ajax({
      url: tribune.settings.controlurl,
      data: {'delete': post.attr('value')},
      cache: false,
      method: 'post',
      dataType: 'json',
      success: function(data, textStatus, jqXHR) {Drupal.tribune.postDeleteSuccess(data, tribune, post)},
    });
    return false;
  });
  post.find('.tribune-date').after($('<span></span>').append(a));
}

Drupal.tribune.postDeleteSuccess = function(data, tribune, post) {
  post.slideUp(function() {Drupal.tribune.startReloading(tribune);});
};

Drupal.tribune.attachUsernameHandlers = function(tribune, post) {
  post.find('.tribune-message span.tribune-post-user').hover(
    function(e) {Drupal.tribune.postUsernameHoverIn(tribune, $(this));},
    function(e) {Drupal.tribune.unHighlightPosts(tribune);}
  );
  post.find('.tribune-user').click(function() {Drupal.tribune.usernameClick(tribune, $(this));});
};

Drupal.tribune.usernameClick = function(tribune, usertag) {
  var username = usertag.text();
  Drupal.tribune.insertText(tribune.find('form.tribune-post-form input[name=message]'), username.replace(/ /, ' ') + '< ');
};

Drupal.tribune.attachClockHandlers = function(tribune, post) {
  post.find('.tribune-message span.tribune-post-clock').hover(
    function(e) {Drupal.tribune.postClockHoverIn(tribune, $(this));},
    function(e) {Drupal.tribune.unHighlightPosts(tribune);}
  );
  post.find('.tribune-message span.tribune-post-clock').click(function() {Drupal.tribune.scrollToClock(tribune, $(this));});
  post.find('.tribune-clock').hover(
    function(e) {Drupal.tribune.highlightPost(tribune, $(this).parent(), true);},
    function(e) {Drupal.tribune.unHighlightPosts(tribune);}
  );
  post.find('.tribune-clock').click(function() {Drupal.tribune.clockClick(tribune, $(this));});
};

Drupal.tribune.scrollToClock = function(tribune, clock) {
  $('html, body').animate({
    scrollTop: clock.position().top
  }, 1000);
};

Drupal.tribune.clockClick = function(tribune, clock) {
  var post = clock.parents('.tribune-post:first');
  var same_time = post.siblings('[data-timestamp=' + post.attr('data-timestamp') + ']').andSelf();
  if (same_time.size() > 1) {
    var index = same_time.index(post) + 1;
    if (index < 10) {
      var map = {1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹'};
      var suffix = map[index];
    } else {
      var suffix = ':' + index;
    }
  } else {
    var suffix = '';
  }
  Drupal.tribune.insertText(tribune.find('form.tribune-post-form input[name=message]'), clock.text() + suffix + ' ');
};

Drupal.tribune.insertText = function(input, text) {
  var range = Drupal.tribune.getSelectionRange(input.get(0));
  var originalText = input.val();
  input.get(0).focus();
  input.val(originalText.substring(0, range[0]) + text + originalText.substring(range[1], originalText.length));
  Drupal.tribune.setSelectionRange(input.get(0), range[0] + text.length, range[0] + text.length);
  input.change();
};

Drupal.tribune.getSelectionRange = function(field) {
    if (field.setSelectionRange) {
        return [field.selectionStart, field.selectionEnd];
  } else if (field.createTextRange) {
        var range = document.selection.createRange();

    if (range.parentElement() == field) {
      var range2 = field.createTextRange();
      range2.collapse(true);
      range2.setEndPoint('EndToEnd', range);
      return [range2.text.length - range.text.length, range2.text.length];
    }
    }
    return [field.value.length, field.value.length];
}

Drupal.tribune.setSelectionRange = function(field, start, end) {
    if (field.setSelectionRange) {
        field.setSelectionRange(start, end);
  } else if (field.createTextRange) {
    var range = field.createTextRange();
    range.collapse(true);
    range.moveStart('character', start);
    range.moveEnd('character', end - start);
    range.select();
    }
}

Drupal.tribune.getReferencesTo = function(tribune, post) {
  var same_time = post.siblings('[data-timestamp=' + post.attr('data-timestamp') + ']').andSelf();
  if (same_time.size() > 1) {
    var index = same_time.index(post) + 1;
  } else {
    var index = 0;
  }

  var timestamp_full = post.attr('data-timestamp').substr(-6, 6);
  var timestamp_short = post.attr('data-timestamp').substr(-6, 4);
  var referencing = tribune.find('li.tribune-post span.tribune-message span.tribune-post-clock[data-timestamp=' + timestamp_full + ']');
  referencing = referencing.add(tribune.find('li.tribune-post span.tribune-message span.tribune-post-clock[data-timestamp=' + timestamp_short + ']'));

  if (index > 0) {
    var timestamp_with_index = post.attr('data-timestamp').substr(-6, 6) + ':' + index;
    referencing = referencing.add(tribune.find('li.tribune-post span.tribune-message span.tribune-post-clock[data-timestamp=' + timestamp_with_index + ']'));

    if (index < 10) {
      var map = {1: '¹', 2: '²', 3: '³', 4: '⁴', 5: '⁵', 6: '⁶', 7: '⁷', 8: '⁸', 9: '⁹'};
      var timestamp_with_superscript = post.attr('data-timestamp').substr(-6, 6) + map[index];
      referencing = referencing.add('li.tribune-post span.tribune-message span.tribune-post-clock[data-timestamp=' + timestamp_with_superscript + ']', tribune);
    }
  }

  return referencing;
};

Drupal.tribune.highlightPost = function(tribune, post, hide_reference) {
  var referencing = Drupal.tribune.getReferencesTo(tribune, post);

  post.addClass('tribune-highlighted');
  referencing.addClass('tribune-highlighted');

  if (!hide_reference) {
    Drupal.tribune.showReferencePost(tribune, post.html());
  }
};

Drupal.tribune.unHighlightPosts = function(tribune) {
  tribune.find('.tribune-highlighted').removeClass('tribune-highlighted');
  Drupal.tribune.hideReferencePost(tribune);
};

Drupal.tribune.postUsernameHoverIn = function(tribune, username) {
  username.addClass('tribune-highlighted');

  setTimeout((function(tribune, username) {
    return function() {
      if (username.hasClass('tribune-highlighted')) {
        var username_text = username.attr('data-username').replace(/ /, ' ');
        var reference = tribune.find('li.tribune-post[data-username=' + username_text + ']');
        reference = reference.add(tribune.find('li.tribune-post[data-user=0] span.tribune-user:textequals("' + username_text + '")').parent());
        if (reference.size()) {
          Drupal.tribune.highlightPost(tribune, reference, true);
        }
      }
    }
  })(tribune, username), 50);
};

Drupal.tribune.postClockHoverIn = function(tribune, clock) {
  clock.addClass('tribune-highlighted');

  setTimeout((function(tribune, clock) {
    return function() {
      if (clock.hasClass('tribune-highlighted')) {
        var timestamp = clock.attr('data-timestamp');
        if (timestamp.length == 4) {
          var reference = tribune.find('li.tribune-post[data-timestamp*=' + timestamp + ']');
        } else if (timestamp.length == 6) {
          var reference = tribune.find('li.tribune-post[data-timestamp$=' + timestamp + ']');
        } else if (timestamp.length == 7) {
          var timestamp_full = timestamp.substr(0, 6);
          var index = timestamp.substr(6, 1);
          var map = {'¹': 1, '²': 2, '³': 3, '⁴': 4, '⁵': 5, '⁶': 6, '⁷': 7, '⁸': 8, '⁹': 9};
          var reference = tribune.find('li.tribune-post[data-timestamp$=' + timestamp_full + ']');
          if (undefined != map[index]) {
            index = map[index] - 1;
            reference = reference.eq(index);
          }
        } else if (timestamp.length > 7) {
          var timestamp_full = timestamp.substr(0, 6);
          var index = timestamp.substr(7) - 1;
          var reference = tribune.find('li.tribune-post[data-timestamp$=' + timestamp_full + ']');
          reference = reference.eq(index);
        }

        if (undefined == reference || reference.size() == 0) {
          Drupal.tribune.showPostAjax(tribune, clock);
        } else {
          Drupal.tribune.highlightPost(tribune, reference);
        }
      }
    }
  })(tribune, clock), 50);
};

Drupal.tribune.showPostAjax = function(tribune, clock) {
  var post = clock.parents('li.tribune-post:first');

  $.ajax({
    url: tribune.settings.referencesearchurl,
    data: {timestamp: clock.attr('data-timestamp'), from: post.attr('value')},
    cache: false,
    method: 'post',
    dataType: 'json',
    success: (function(tribune, clock) {
      return function(data, textStatus, jqXHR) {
        if (clock.hasClass('tribune-highlighted')) {
          for (i in data.posts) {
            var post = $(data.posts[i]);
            Drupal.tribune.showReferencePost(tribune, post.html());
            var references = Drupal.tribune.getReferencesTo(tribune, post);
            references.addClass('tribune-highlighted');
            break;
          }
        }
      }
    })(tribune, clock)
  });
};

Drupal.tribune.showReferencePost = function(tribune, html) {
  var wrapper = $('<div class="tribune-post-preview tribune-post"></div>');
  wrapper.css('width', tribune.css('width'));
  wrapper.html(html);
  wrapper.hide();
  tribune.prepend(wrapper);
  wrapper.slideDown(100);
};

Drupal.tribune.hideReferencePost = function(tribune) {
  tribune.find('.tribune-post-preview').slideUp(100, function() {$(this).remove();});
};

Drupal.tribune.findUsernames = function(post) {
  var text = post.find('.tribune-message').html().replace(/(([ \w]+)&lt;)/g, "<span class='tribune-post-user' data-username='\$2'>\$1</span>");
  post.find('.tribune-message').html(text);
};

Drupal.tribune.findClocks = function(post) {
  var text = post.find('.tribune-message').html().replace(/((([01]?[0-9])|(2[0-3])):([0-5][0-9])(:([0-5][0-9]))?([:\^][0-9]|¹|²|³|⁴|⁵|⁶|⁷|⁸|⁹)?(@[0-9A-Za-z]+)?)/g, "<span class='tribune-post-clock' data-timestamp='$2$5$7$8'>\$1</span>");
  post.find('.tribune-message').html(text);
};

Drupal.tribune.startReloading = function(tribune) {
  clearInterval(tribune.timer);
  tribune.addClass('tribune-reloading');
  tribune.find('form.tribune-post-form input[name=message]').addClass('form-autocomplete').addClass('throbbing');

  $.ajax({
    url: tribune.settings.reloadurl,
    data: {last: tribune.find('li:last').attr('value')},
    cache: false,
    method: 'post',
    dataType: 'json',
    success: function(data, textStatus, jqXHR) {Drupal.tribune.reloadSuccess(data, tribune)},
    error: function(jqXHR, textStatus, errorThrown) {Drupal.tribune.reloadError(tribune)},
    complete: function(jqXHR, textStatus) {Drupal.tribune.reloadComplete(tribune)},
  });
};

Drupal.tribune.reloadSuccess = function(data, tribune) {
  tribune.removeClass('tribune-reload-error');

  Drupal.tribune.removeModeratedPosts(tribune, data.moderated);
  Drupal.tribune.addNewPosts(tribune, data.posts);
}

Drupal.tribune.removeModeratedPosts = function(tribune, moderated) {
  for (post_id in moderated) {
    tribune.find('ol li[value=' + moderated[post_id] + ']').each(function() {
      $(this).slideUp(function() {$(this).remove()});
    });
  }
};

Drupal.tribune.addNewPosts = function(tribune, posts) {
  var last_id = tribune.find('li:last').attr('value');
  // When a tribune has no post, this will of course return
  // an undefined value, hence the following conditional check.
  if (!last_id) {
    last_id = 0;
  }

  var new_posts = $();

  for (post_id in posts) {
    if (post_id > last_id) {
      post = $(posts[post_id]);

      if (tribune.settings.permissions.mod) {
        Drupal.tribune.attachModHandlers(tribune, post);
      }

      tribune.find('ol').append(post);

      if (tribune.find('li.tribune-post').size() > tribune.settings.count) {
        tribune.find('li.tribune-post:first').remove();
      }

      new_posts = new_posts.add(post);
    }
  }

  for (i in Drupal.settings.tribune['tribune-' + tribune.attr('data-nid')].after_reload) {
    Drupal.settings.tribune['tribune-' + tribune.attr('data-nid')].after_reload[i](tribune, new_posts);
  }

  Drupal.attachBehaviors(new_posts);
};

Drupal.tribune.updatePostClasses = function(tribune, posts) {
  if (tribune.settings.uid != 0) {
    $('li[data-user=' + tribune.settings.uid + ']', tribune).each(function() {
      $(this).addClass('tribune-own-post');
      var referencing = Drupal.tribune.getReferencesTo(tribune, $(this));
      referencing.each(function() {
        $(this).parents('li:first').addClass('tribune-answer');
      });
    });
  }
  if (tribune.settings.username) {
    $('li[data-username=' + tribune.settings.username + ']', tribune).each(function() {
      $(this).addClass('tribune-own-post');
      var referencing = Drupal.tribune.getReferencesTo(tribune, $(this));
      referencing.each(function() {
        $(this).parents('li:first').addClass('tribune-answer');
      });
    });
  }
};

Drupal.tribune.reloadError = function(tribune) {
  tribune.addClass('tribune-reload-error');
};

Drupal.tribune.reloadComplete = function(tribune) {
  tribune.removeClass('tribune-reloading');
  tribune.find('form.tribune-post-form input[name=message]').removeClass('form-autocomplete').removeClass('throbbing');
  tribune.timer = setInterval(function() {
    Drupal.tribune.startReloading(tribune);
  }, 30000);
};

})(jQuery);
