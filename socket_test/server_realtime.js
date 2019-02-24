var drawer_appear = 0;
var ttmmppX = [];
var ttmmppY = [];
var ttmmpp_where = -1;
var has_sendX = [];
var has_sendY = [];
var count = 0;
var fs = require('fs')
  , http = require('http')
  // 發佈socket.io server，並且聽取8080 port
  , io = require('socket.io').listen('9999')
  , path;
//var timer = 30;
var real_time = new Date().getSeconds();
var timer = real_time;
//console.log(timer);

setInterval(function(){
  timer += 1;
  if (timer >= 30) {
    timer -= 30;
  }
  console.log(timer);
}, 1000);

/**
 * 實作socket io，並在connection開啟後，於callback function中實作要處理的事件
 */
io.sockets.on('connection', function (socket) {
  /*
   * 每隔三秒鐘進行一次emit動作
   * 而emit的內容是發佈一個news
   * 內容為JSON物件，以time為key，value為emit當下的時間
   */

  /*
   setInterval(function(){
    socket.emit('news', 'hi client' );
  }, 1000);
  */
  console.log('server connect');

  socket.on('my XY event', function (datax, datay) {
      if( ttmmppX.indexOf(datax) > -1 && ttmmppY.indexOf(datay) > -1) {
        
      }
      else{
        //console.log('[my XY event]' + datax + ',' + datay);
        ttmmppX.push(datax);
        ttmmppY.push(datay);
      }
  });

  socket.on('my XY list event', function (datax, datay) {
    ttmmppX = datax;
    ttmmppY = datay;
  });
/*
  setInterval(function(){
    socket.emit('list plot go', ttmmppX, ttmmppY);
  }, 1000);
*/
  setInterval(function(){count+=1;
    //console.log('setinterval  '+count);
    if(ttmmpp_where+1<ttmmppX.length && ttmmppX.length>0){
      ttmmpp_where = ttmmpp_where + 1;
      socket.emit('server give plot', ttmmppX[ttmmpp_where], ttmmppY[ttmmpp_where]);
      //console.log('give u plot '+ttmmppX[ttmmpp_where]+', '+ ttmmppY[ttmmpp_where]);
    }
  }, 100);
  
  setInterval(function(){
    /* every second */
    if(drawer_appear == 0){
      console.log('drawer appear = 1');
      drawer_appear = 1;
      socket.emit('drawer appear', drawer_appear);
    }

    socket.emit('first connect', ttmmppX, ttmmppY);
    socket.emit('list plot go', ttmmppX, ttmmppY);
    socket.emit('news', 'hi client' );
    socket.emit('draw all', ttmmppX, ttmmppY);

    /* every 30 seconds */
    if (timer == 0) {
      socket.emit('clear', ttmmppX, ttmmppY);
      console.log("clear paint!");

      ttmmppX.splice(0, ttmmppX.length);
      ttmmppY.splice(0, ttmmppY.length);
    }
  }, 1000);
});
