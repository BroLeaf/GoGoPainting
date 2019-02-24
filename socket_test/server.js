var drawer_appear = 0;
var ttmmppX = [];
var ttmmppY = [];
var ttmmpp_where = -1;
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
var drawer = 1;
var pre_drawer = 1;
var drawer_num = 1;
var drawer_min = 100;
var answer = 0;
var first = 0;
var changed = 0;
if (timer >= 30) timer -= 30;
setInterval(function() {
  timer += 1;
  if (timer >= 30) {
    timer -= 30;
    answer += 1;
    if (answer == 20) answer = 0;
  }
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

  socket.on('my XY list event', function (datax, datay) {
    ttmmppX.push(datax);
    ttmmppY.push(datay);
    ttmmppX = datax;
    ttmmppY = datay;
  });

  socket.on('join room', function() {
    drawer_num++;
  });

  /* select the next drawer, the next must accordind the sequence of enter */
  socket.on('I want to draw', function(client_drawer) {
    /* return to minimun number */
    if (client_drawer < drawer_min)
      drawer_min = client_drawer;
    if (pre_drawer < client_drawer) {
      /* if haven't change this turn or it changed but new one has higher priorty*/
      if (pre_drawer == drawer || client_drawer < drawer) {
        drawer = client_drawer;
      }
    }
  });

  socket.on('get data', function(num) {
    //console.log("request from " + num);
    socket.emit('draw all', ttmmppX, ttmmppY);
  });

  setInterval(function(){
    /* every 30 seconds */
    if (timer >= 27) {
      if (timer == 29) {
        if (drawer == pre_drawer)
          drawer = drawer_min;
          if (answer >= 20) answer = 0;
          socket.emit('clear', answer);
          
      }
      //socket.emit('clear', answer);
      ttmmppX.splice(0, ttmmppX.length);
      ttmmppY.splice(0, ttmmppY.length);
      socket.emit('change drawer', 0); 
    } else if (timer == 0) {
      if (drawer == 100 || drawer == 0)
        drawer = 1;
      socket.emit('change drawer', drawer);
      /*
      console.log("change to " + drawer); 
      console.log("pre is " + pre_drawer); 
      console.log("drawer_num " + drawer_num);
      console.log("drawer_min " + drawer_min);
      */
      pre_drawer = drawer;
    } else if (timer < 27){
      /* every second */
      console.log("answer is " + answer);
      drawer_min = 100;
      socket.emit('first connect', ttmmppX, ttmmppY, drawer_num, answer);
    }
  }, 1000);

});