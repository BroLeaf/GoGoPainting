var ttmmppX = [];
var ttmmppY = [];
var ttmmpp_where = -1;
var has_sendX = [];
var has_sendY = [];
var count = 0;
var fs = require('fs')
  , http = require('http')
  // 發佈socket.io server，並且聽取8080 port
  , io = require('socket.io').listen('9999');

/**
 * 實作socket io，並在connection開啟後，於callback function中實作要處理的事件
 */
io.sockets.on('connection', function (socket) {
  /**
   * 每隔三秒鐘進行一次emit動作
   * 而emit的內容是發佈一個news
   * 內容為JSON物件，以time為key，value為emit當下的時間
   */
  setInterval(function(){
    socket.emit('news', 'hi client' );
  }, 1000);
  console.log('server sonnect');
  /**
   * 接收client傳回的事件，並且於callback內接收該data做處理
   */
  socket.on('my XY event', function (datax, datay) {
      if( ttmmppX.indexOf(datax) > -1 && ttmmppY.indexOf(datay) > -1) {
        
      }
      else{
        console.log('[my XY event]' + datax + ',' + datay);
        ttmmppX.push(datax);
        ttmmppY.push(datay);
        //setInterval(function(){
          //socket.emit('do u want plot', 'nothing');
        //}, 1000);
      }
  });
  /*socket.on('client want plot', function (nothing) {
    if(ttmmpp_where+1<ttmmppX.length){
      console.log('give u plot');
      ttmmpp_where = ttmmpp_where + 1;
      socket.emit('server give plot', ttmmppX[ttmmpp_where], ttmmppY[ttmmpp_where]);
      //ttmmpp_where = ttmmpp_where + 1;
    }
  });*/

  setInterval(function(){count+=1;
    console.log('setinterval  '+count);
    if(ttmmpp_where+1<ttmmppX.length && ttmmppX.length>0){
      ttmmpp_where = ttmmpp_where + 1;
      socket.emit('server give plot', ttmmppX[ttmmpp_where], ttmmppY[ttmmpp_where]);
      console.log('give u plot '+ttmmppX[ttmmpp_where]+', '+ ttmmppY[ttmmpp_where]);
      //ttmmpp_where = ttmmpp_where + 1;
    }
  }, 10);

  setInterval(function(){
    socket.emit('first connect', ttmmppX, ttmmppY);
  }, 1000);

  setInterval(function(){
    socket.emit('draw all', ttmmppX, ttmmppY);
  }, 10000);

  setInterval(function(){
    socket.emit('clear', ttmmppX, ttmmppY);
    ttmmppX.splice(0, ttmmppX.length);
    ttmmppY.splice(0, ttmmppY.length);
  }, 10000);
});