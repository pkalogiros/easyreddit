(function( w ) {
  document.addEventListener( 'touchmove', function(e) {
    e.preventDefault();
  }, false);

  /** "a,s - j,k - left,right **/
  w.prev = function() {
    gallery.prev();
  }
  w.next = function() {
    gallery.next();
  }
  document.addEventListener( 'keydown', function( e ) {
    switch ( e.keyCode ) {
        case 65: // a
        case 37: // left arrow
        case 74: // j
          gallery.prev();
          break;
        case 83: // s
        case 39: // right arrow
        case 75: // k
          gallery.next();
          break;
    }
  }, false );

  /** remove the top bar **/
  setTimeout(function() {
    w.scrollTo( 0, 1500 );
  }, 20 );
  
  var innerHeight = w.innerHeight,
      innerWidth = w.innerWidth,
      first_time = true; // first time loading?
  
  /** handle resizing (and orientation change) **/
  var resizeFunc = function( e ) {
    innerHeight = w.innerHeight;
    innerWidth = w.innerWidth;

    container.style.height = innerHeight + "px";
    container.style.width = innerWidth + "px";
    setTimeout(function() {
      w.scrollTo( 0, 1500 );
      setTimeout(function(){ gallery.__resize() }, 0);
    }, 10 );
  };
  window.addEventListener( 'resize',resizeFunc, false );
  setTimeout(function() {
    resizeFunc();
  }, 1180 );
  
  /** grab the listings **/
  var _switch = false;
  function getMore() {
    if( _switch )
      return false;

    var xhr = new XMLHttpRequest(),
        after = localStorage.getItem("a") || "0";
    
    _switch = true;
    xhr.open( "GET", "post.php?r=" + after );
    xhr.onload = function( e ) {
      if( xhr.responseText === "" ) {
        clear();
        return false;
      }

      var json = JSON.parse( xhr.responseText ),
          entries = json.data.children;
      if( entries.length === 0 ) {
        clear();
        return false;
      }
      _switch = false;
      prepareList( json, entries );
    }
    xhr.send();
  }
  getMore();

  var container = document.getElementById('appWindow'),
      gallery = new SwipeView('#appWindow');

  container.style.height = innerHeight + "px";

  function prepareList( json, entries ) {
    // create the first 3
    var i = 0, j = -1;
    while( true ) {
      if( !entries[ ++j ] ) {
        first_time = false;
        break; 
      }

      if( addEntry( entries[ j ].data ) )
        ++i;
      if( i === 3 && first_time ) {
        // Load initial data
        for ( i = 0; i < 3; ++i ) {
          page = i == 0 ? slides.length - 1 : i - 1;
          el = document.createElement('img');
          el.src = slides[page].img;
          el.onload = function () {
            this.className = '';
          }
          gallery.masterPages[i].appendChild(el);
          el = document.createElement('span');
          el.innerHTML = slides[page].desc;
          gallery.masterPages[i].appendChild(el);
        }
        gallery.__resize();
        w.scrollTo( 0, 1500 );
        first_time = false;
      }
    }
  }

  /** Class Entry **/
  function Entry( src, title, id ) {
    this.img = src;
    this.desc = title;
    this.id = id;
  }

  function addEntry( obj ) {
    var url = obj.url,
        img;

    if( url.match( /\.(?:gif|png|jpg|jpeg)/i ) ) {
      // go through the slides and do not if a duplicate is found
      return checkForDuplicate( obj, slides, obj.url );
    }
    else if( url.indexOf('imgur') !== -1 ) {
      obj.url = "/r/imgfetch.php?type=0&url=" + escape( obj.url );
      return checkForDuplicate( obj, slides, obj.url );
    }
    else if( url.indexOf('quickmeme') !== -1 ) {
      obj.url = "/r/imgfetch.php?type=1&url=" + escape( obj.url );
      return checkForDuplicate( obj, slides, obj.url );
    }
    else if( url.indexOf('9gag.com') !== -1 ) {
      obj.url = "/r/imgfetch.php?type=2&url=" + escape( obj.url );
      return checkForDuplicate( obj, slides, obj.url );
    }
    return false;
  }
  function checkForDuplicate( obj, slides, url ) {
      // go through the slides and do not if a duplicate is found
      var ll = slides.length;
      while( ll-- )
        if( slides[ ll ].id === obj.name )
          return true;

      slides.push( new Entry( url, obj.title, obj.name ) );
      return true;
  }
    
  var	el,
    i,
    page,
    slides = [],
    slideIndex = 0;

  gallery.onFlip(function ( e ) {
    var el,
      upcoming,
      i, len = slides.length;
    gallery.options.numberOfPages = len;
    localStorage.setItem("a", slides[gallery.masterPages[2].dataset.pageIndex].id);
    
    if( gallery.masterPages[0].dataset.pageIndex > ( len - 10 ) )
      getMore();
    
    for (i=0; i<3; i++) {
      upcoming = gallery.masterPages[i].dataset.upcomingPageIndex;

      if (upcoming != gallery.masterPages[i].dataset.pageIndex) {
        el = gallery.masterPages[i];
        el = el.getElementsByTagName('img')[0];
        el.src = slides[upcoming].img;
        el.className = " loading";

        el = gallery.masterPages[i].getElementsByTagName('span')[0];
        el.innerHTML = slides[upcoming].desc;
      }
    }
  });
  gallery.onMoveOut(function () {
    gallery.masterPages[gallery.currentMasterPage].className = gallery.masterPages[gallery.currentMasterPage].className.replace(/(^|\s)swipeview-active(\s|$)/, '');
  });

  gallery.onMoveIn(function () {
    var className = gallery.masterPages[gallery.currentMasterPage].className;
    /(^|\s)swipeview-active(\s|$)/.test(className) || (gallery.masterPages[gallery.currentMasterPage].className = !className ? 'swipeview-active' : className + ' swipeview-active');
  });
  
  /** using a touch enabled device? **/
  if( !('ontouchstart' in w ) ) {
    document.body.style.overflow = "hidden";
    document.getElementById('prevv').style.display = "block";
    document.getElementById('nexxt').style.display = "block";
  }
})( this );

/** Clears the stored Entries **/
function clear() {
  localStorage.removeItem('a');
  window.location.reload();
  return false;
}