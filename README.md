A performance analysis tool especially useful for IE6/IE7.

##Usage:

When importing timer.js into page, make sure there is no other js file is using the namespace of **timer**.
 
There are two types of timers: KeyTimer and MarkTimer. Both timers will not block origin process.

**KeyTimer** supplies timing functions like [console.time/console.timeEnd](https://getfirebug.com/wiki/index.php/Console_API#console.time.28name.29).

    var kt = timer.newKeyTimer();
    kt.time('a key name');
    kt.timeEnd('a key name'); // return a number in millisecond

But notice that time() and timeEnd() not allow duplicated key.

    var kt = timer.newKeyTimer();
    kt.time('a key name');
    kt.time('a key name'); // will throw error

You can get the time of a timing-process at any time if it is finished.

    var kt = timer.newKeyTimer();
    kt.time('a key name');
    kt.timeEnd('a key name');
    /* code block */
    kt.getTime('a key name');

KeyTimer also can output report in text or in html. The timing processes can be executed out of order, but in report they will be ordered by begin time.

    var kt = timer.newKeyTimer();
    kt.time(1);
    kt.time(2);
    kt.time(3);
    kt.timeEnd(2);
    kt.timeEnd(1);
    kt.timeEnd(3);

    kt.text();
    kt.html();

You can also finish timing process in a callback.

    var kt = timer.newKeyTimer();
    kt.time(1);
    setTimeout(function(){
      kt.timeEnd(1);
      kt.text();
    }, 4000);

Use reset() to reset the KeyTimer. All results and remaining processes will be cleared.

**MarkTimer**'s timing processes will be fabricated in a tree. The mark can be reused because it is not considered as a key.

    var mt = timer.newMarkTimer();
    
    mt.start('level1');
    mt.start('level2');
    mt.stop('level2');
    mt.start('level2');
    mt.start('level3');
    mt.stop('level3');
    mt.stop('level2');
    mt.stop('level1');
    mt.start('level1');
    mt.stop('level1');
    
    mt.text();

You will get:
<pre>
Total: 0
    level1: 0
        level2: 0
        level2: 0
            level3: 0
    level1: 0
</pre>

You must close all 'start's before you call total(), text() and html().

You should also not use stop() if there is no 'start' begun.

    var mt = timer.newMarkTimer();
    
    mt.start('level1');
    mt.start('level2');
    mt.stop('level2');
    mt.stop('level1');
    
    mt.stop('level1'); // Error

Mark should be matched when you close a timing-process.

    var mt = timer.newMarkTimer();
    
    mt.start('level1');
    mt.start('level2');
    mt.stop('abcd'); // Error

Notice that MarkTimer's timing-processes are in order.

    var mt = timer.newMarkTimer();
    
    mt.start('level1');
    mt.start('level2');
    mt.stop('level1'); // Error

Use getCurrentMark() to know where current timing-process is.

    var mt = timer.newMarkTimer();
    
    mt.start('level1');
    mt.start('level2');

    mt.getCurrentMark(); // level2

It is not recommended to stop a timing-process in another asynchronous callback. It might throw timing-process into confusion.

    var mt = timer.newMarkTimer();
    mt.start('level1');
    mt.start('level2');
    setTimeout(function(){
      mt.stop('level2');
    }, 4000);

    /*some code may cost more than 4 second*/

    mt.stop('level1');

You can query a timing-process by it's path.

    var mt = timer.newMarkTimer();
    
    mt.start('level1');
    mt.start('level2');
    mt.stop('level2');
    mt.start('level2');
    mt.start('level3');
    mt.stop('level3');
    mt.stop('level2');
    mt.stop('level1');
    mt.start('level1');
    mt.stop('level1');
    mt.start('level1');
    mt.start('level2');
    mt.stop('level2');
    mt.start('level2');
    mt.start('level3');
    mt.stop('level3');
    mt.stop('level2');
    mt.stop('level1');

    mt.query('level1');
    mt.query('level1:0'); // same with above. Index is 0-base

    mt.query('level1:2|level2:1|level3');

MarkTimer also can output report in text or in html.

    var mt = timer.newMarkTimer();
    mt.start('a loop');
    for (var i = 0; i < 100; i++) {
      mt.start('Loop ' + i);
      var str = new Array(10000).join('a not so long test string');
      mt.stop('Loop ' + i);
    }
    mt.stop('a loop');

    mt.text();
    mt.html();

Use reset() to reset the MarkTimer. All results and remaining processes will be cleared.
