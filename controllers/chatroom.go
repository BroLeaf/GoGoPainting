// Copyright 2013 Beego Samples authors
//
// Licensed under the Apache License, Version 2.0 (the "License"): you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

package controllers

import (
	"container/list"
	"fmt"
	"strings"
	"time"

	"github.com/astaxie/beego"
	"github.com/gorilla/websocket"

	"GoGoPainting/models"
)

var idx int = 0
var i int = 0
var guess [20]string
var answer string

type Subscription struct {
	Archive []models.Event      // All the events from the archive.
	New     <-chan models.Event // New events coming in.
}

func newEvent(ep models.EventType, user, roomid, msg string) models.Event {

	if strings.Compare(msg, guess[idx]) == 0 {

		return models.Event{ep, user, roomid, int(time.Now().Unix()), "猜對了 !"}
	} else {
		return models.Event{ep, user, roomid, int(time.Now().Unix()), msg}
	}

}

func Join(user string, roomid string, ws *websocket.Conn) {
	subscribe <- Subscriber{Name: user, RoomId: roomid, Conn: ws}
}

func Leave(user string) {
	unsubscribe <- user
}

type Subscriber struct {
	Name   string
	RoomId string
	Conn   *websocket.Conn // Only for WebSocket users; otherwise nil.
}

var (
	// Channel for new join users.
	subscribe = make(chan Subscriber, 10)
	// Channel for exit users.
	unsubscribe = make(chan string, 10)
	// Send events here to publish them.
	publish = make(chan models.Event, 10)
	// Long polling waiting list.
	waitingList = list.New()
	subscribers = list.New()
)

// This function handles all incoming chan messages.
func chatroom() {

	for {

		//2017-06-20 18:16:15
		var s string
		//var c string

		//***
		if i == 0 {
			i++
			ticker := time.NewTicker(time.Millisecond * 1000)
			go func() {
				for range ticker.C {

					now := time.Now()
					formatNow := now.Format("2006-01-02 15:04:05")

					s = string([]byte(formatNow)[17:19])
					//c = string([]byte(formatNow)[18:19])
					fmt.Println("[ time ]", string([]byte(formatNow)[11:19]))
					/*
						if c == "0" {
							idx = (idx + 1) % 20
							fmt.Println("Answer change to <", guess[idx], ">")
						}
					*/
					if s == "30" || s == "00" {
						idx = (idx + 1) % 20
						fmt.Println("答案變成 <", guess[idx], ">")
					}

				}
			}()
			i++
		}
		// Ticker和Timer一样可以被停止。一旦Ticker停止后，通道将不再
		// 接收数据，这里我们将在1500毫秒之后停止
		//time.Sleep(time.Millisecond * 900000)
		//ticker.Stop()
		//fmt.Println("Ticker stopped")

		//***
		/*
			ticker := time.NewTicker(time.Second * 1)
			wg := sync.WaitGroup{}

			wg.Add(10)
			go func() {
				for t := range ticker.C {
					fmt.Printf("Backup at %s\n", t)
					wg.Done()
				}
			}()

			wg.Wait()
			ticker.Stop()
		*/
		select {
		case sub := <-subscribe:
			if !isUserExist(subscribers, sub.Name) {
				subscribers.PushBack(sub) // Add user to the end of list.
				// Publish a JOIN event.
				publish <- newEvent(models.EVENT_JOIN, sub.Name, sub.RoomId, "")
				beego.Info("New user:", sub.Name, ";WebSocket:", sub.Conn != nil)
			} else {
				beego.Info("Old user:", sub.Name, ";WebSocket:", sub.Conn != nil)
			}
		case event := <-publish:
			// Notify waiting list.
			for ch := waitingList.Back(); ch != nil; ch = ch.Prev() {
				ch.Value.(chan bool) <- true
				waitingList.Remove(ch)
			}

			broadcastWebSocket(event)
			models.NewArchive(event)

			if event.Type == models.EVENT_MESSAGE {
				beego.Info("Message from", event.User, ";Content:", event.Content)
			}
		case unsub := <-unsubscribe:
			for sub := subscribers.Front(); sub != nil; sub = sub.Next() {
				if sub.Value.(Subscriber).Name == unsub {
					subscribers.Remove(sub)
					// Clone connection.
					ws := sub.Value.(Subscriber).Conn
					if ws != nil {
						ws.Close()
						beego.Error("WebSocket closed:", unsub)
					}
					publish <- newEvent(models.EVENT_LEAVE, unsub, sub.Value.(Subscriber).RoomId, "") // Publish a LEAVE event.
					break
				}
			}
		}
	}
}

func init() {
	guess[0] = "水壺"
	guess[1] = "廚房"
	guess[2] = "豬"
	guess[3] = "媽媽"
	guess[4] = "高爾夫"
	guess[5] = "臉書"
	guess[6] = "筆電"
	guess[7] = "樹葉"
	guess[8] = "三星"
	guess[9] = "玫瑰"
	guess[10] = "牙刷"
	guess[11] = "消防車"
	guess[12] = "蟬"
	guess[13] = "吉他"
	guess[14] = "輪框"
	guess[15] = "海灘褲"
	guess[16] = "泡麵"
	guess[17] = "肥宅"
	guess[18] = "大便"
	guess[19] = "網球"

	answer = guess[idx]
	fmt.Println("[ 答案 ]", guess[idx])

	go chatroom()
}

func isUserExist(subscribers *list.List, user string) bool {
	for sub := subscribers.Front(); sub != nil; sub = sub.Next() {
		if sub.Value.(Subscriber).Name == user {
			return true
		}
	}
	return false
}
