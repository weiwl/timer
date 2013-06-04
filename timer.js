/*!
 * timer.js - A performance analysis tool.
 * Released under the MIT license
 * Copyright weiwl07@gmail.com
 */

(function(context){
  if (context.timer) {
    throw Error('timer is existing or timer module has been loaded.');
  }
  var timer = {
    newKeyTimer: function() {
      var instance = {
        timers_: {},
        last_: null,
        time: function(key) {
          var me = this;
          if (me.timers_[key]) {
            throw Error(key + ' has been used.');
          }
          me.last_ = me.timers_[key] = {
            key: '' + key,
            begin: +new Date(),
            prev: me.last_
          };
        },
        timeEnd: function(key) {
          var t = this.timers_[key];
          if (!t) {
            throw Error(key + ' has not been started.');
          }
          if (t.end) {
            throw Error(key + ' has been stopped.');
          }
          t.end = +new Date();
          return t.end - t.begin;
        },
        getTime: function(key) {
          var t = this.timers_[key];
          return t&&t.end ? t.end - t.begin : null;
        },
        reset: function() {
          this.timers_ = {};
          this.last_ = null;
          return this;
        },
        text: function() {
          var me = this,
              iter = me.last_;
          var strs = [];
          for (;iter;) {
            var t = iter.end - iter.begin;
            strs.push(iter.key + ': ' + (isNaN(t) ? '---' : t));
            iter = iter.prev;
          }
          return strs.reverse().join('\n');
        },
        html: function() {
          var me = this,
              iter = me.last_;
          var strs = [];
          for (;iter;) {
            var t = iter.end - iter.begin;
            strs.push(iter.key + ': ' + (isNaN(t) ? '---' : t));
            iter = iter.prev;
          }
          return strs.reverse().join('<br />');
        }
      };
      return instance;
    },
    newMarkTimer: function() {
      var instance = {
        root: [],
        p_: null,
        start: function(mark) {
          var me = this;
          var section = [];
          section.mark = '' + mark;
          section.begin = +new Date();
          section.parent_ = me.p_;

          if (!me.p_) {
            me.p_ = me.root;
          }
          me.p_.push(section);
          me.p_ = section;
          return me;
        },
        stop: function(mark) {
          var me = this;
          if (!me.p_) {
            throw Error('There is no "start" before this "stop".');
          }
          if (me.p_.mark !== '' + mark) {
            throw Error('Mark not matched.');
          }
          me.p_.end = +new Date();
          me.p_ = me.p_.parent_;
          return me;
        },
        reset: function() {
          this.root = [];
          this.p_ = null;
          return this;
        },
        total: function() {
          var me = this;
          if (me.p_) {
            throw Error('There are some unfinished "start".');
          }
          var total = 0;
          for (var i = 0, length = me.root.length; i < length; i++) {
            var s = me.root[i];
            total += s.end - s.begin;
          }
          return total;
        },
        html: function() {
          var me = this;
          var strs = [];
          strs.push('Total: ' + me.total());
          me.loop_(me.root, strs, 1, '&nbsp;&nbsp;&nbsp;&nbsp;');
          return strs.join('<br />');
        },
        text: function() {
          var me = this;
          var strs = [];
          strs.push('Total: ' + me.total());
          me.loop_(me.root, strs, 1, '    ');
          return strs.join('\n');
        },
        loop_: function(sections, strArr, level, space) {
          var me = this;
          var indent = me.repeatSpace_(level, space);
          for (var i = 0, length = sections.length; i < length; i++) {
            var child = sections[i];
            strArr.push(indent + child.mark + ': ' + (child.end - child.begin));
            if (child.length) {
              me.loop_(child, strArr, level + 1, space);
            }
          }
        },
        repeatSpace_: function(times, space) {
          return new Array(times+1).join(space);
        },
        getCurrentMark: function() {
          return this.p_ ? this.p_.mark : null;
        },
        query: function(str) {
          if (typeof str !== 'string') {
            return null;
          }
          var arr = str.split('|');
          var found = this.root;
          for (var i = 0, length = arr.length; i < length; i++) {
            found = this.queryChild_(found, arr[i]);
            if (!found) {
              break;
            }
          }
          return found&&found.end ? (found.end - found.begin) : null;
        },
        queryChild_: function(parent, childMark) {
          var mark,
              order = 0;
          var index = childMark.search(/:\d+$/);
          if (index < 0) {
            mark = childMark;
          } else {
            mark = childMark.substring(0, index);
            order = parseInt(childMark.substring(index+1));
          }
          for (var i = 0, length = parent.length; i < length; i++) {
            if (parent[i].mark === mark && --order < 0) {
                return parent[i];
            }
          }
          return null;
        }
      };
      return instance;
    }
  };
  // exports
  context.timer = timer;
})(window);
