'use strict';

var app;
var config = {
  IMAGE_BASE_URL: 'images',
  LOCALE_BASE_URL: '_locales',

  _total: 0,
  _loaded: 0,
  _deal() {
    this._loaded++;
    if (this._loaded === this._total) {
      this._cb();
      this.images = null;
      this.scripts = null;
    }
  },
  _cb: null,
  load(locale, finish_cb) {
    this._total = Object.keys(this.images).length + this.scripts.length;
    this._cb = finish_cb;
    if (!locale) {
      this._after_locales_load({});
    } else {
      $.get(`${this.LOCALE_BASE_URL}/${locale}/message.json`, 'json').then((data) => {
        this._after_locales_load(data);
      });
    }
  },
  _after_locales_load(localeMessages) {
    var images = {};
    app
      .factory('R', [function() {
        return {
          t(msg) {
            return localeMessages[msg];
          },
          img(img_id) {
            return images[img_id];
          }
        }
      }]);


    _.forEach(this.images, (url, id) => {
      let img = new Image();
      images[id] = img;
      img.onload = () => {
        this._deal();
      };
      img.src = `${this.IMAGE_BASE_URL}/${url}`;
    });
    if (this.images.length === 0) {
      this._deal();
    }

    _.forEach(this.scripts, (url) => {
      let s = document.createElement('script');
      s.setAttribute('type', 'text/javascript;version=1.7');
      s.src = url;
      s.onload = () => {
        this._deal();
      };
      document.body.appendChild(s);
    });
    if (this.scripts.length === 0) {
      this._deal();
    }
  },
  locale: {},
  scripts: [],
  images: {},
  defaultPreferences: {
    locale: ''
  }
};

angular.element(document).ready(function() {
  let loc = config.locale;
  let pref = JSON.parse(localStorage.getItem('preferences') || 'null') || config.defaultPreferences;
  var curLoc = loc.enable ? pref.locale || loc.map[Object.keys(loc)[0]] : '';
  app.run(['$rootScope', '$preferences', function($rs, $pref) {
    $pref.locale = curLoc ? curLoc : $pref.locale;
  }]);
  config.load(curLoc, () => angular.bootstrap(document, [config.product]));
});
