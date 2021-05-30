const path = require('path')
const express=require('express')
const http= require('http')
const socketio=require('socket.io')

//http is required inorder to start socketio


const Filter=require('bad-words')
const { generateMessage,generateLocation }= require('./utils/messages')
const {addUser,getUser,removeUser,getUsersInRoom}=require('./utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000
const publicDirectoryPath=path.join(__dirname,'../public')



app.use(express.static(publicDirectoryPath))


io.on('connection',(socket)=>{
  console.log('New web socket connection')

  socket.on('join',({username,room},callback)=>{
    const {error,user}=addUser({id:socket.id,username,room})

    if(error){
      return callback(error)
    }


    // console.log((generateMessage('Adim','welcom1!')).name)
    socket.join(user.room)
    console.log("gg")
    socket.emit('message',generateMessage('Admin','welcome!'))
    // console.log(username)
    // console.log(room)
    socket.broadcast.to(user.room).emit('message',generateMessage('Admin',`${user.username} has joined!`))
    io.to(user.room).emit('roomData',{
      room:user.room,
      users:getUsersInRoom(user.room)
    })
    callback()

  })


  socket.on('location',(mess,callback)=>{
    const user=getUser(socket.id)
    const link="https://www.google.com/maps?q="+mess[0]+","+mess[1]
    // io.to(user.room).emit('location-message',generateLocation(user.username,link))
    //initially this was done ie io.emit so all the users and self all see the same that is ridddhish also sees riddish khot ka message hai aaisa
    //but now what i am doing is broadcast except self user the name and then socket.emit to only self with name "you"
    console.log(link)
    socket.broadcast.to(user.room).emit('location-message',generateLocation(user.username,link))
    socket.emit('location-message',generateLocation('You',link))

    callback()
  })
  // // socket.emit('joined',(mess))
  // const link="https://www.google.com/maps?q="+mess[0]+","+mess[1]
  // io.emit('joined',link)


    //socket.emit - sends information to a specific users
    //io.emit - sends information to all connected to server
    //socket.broadcast.emit - sends information to a all users except for that specific user
    //io.to(room.no).emit - sends information to a specific room
    //socket.broadcast.to(room.no).emit - sends information to all users in that specific room except for that specific user




  socket.on('update',(mess,callback) =>{
    const filter = new Filter()
    const user=getUser(socket.id)
    // const usersInRoom=getUsersInRoom(user.room)
    // console.log(user.username)
    // socket.emit('joined',(mess))
    if (filter.isProfane(mess)) {
      return callback('profanity is not allowed')
    }

    // io.to(user.room).emit('message',generateLocation(user.username,mess))
    //initially this was done ie io.emit so all the users and self all see the same that is ridddhish also sees riddish khot ka message hai aaisa
    //but now what i am doing is broadcast except self user the name and then socket.emit to only self with name "you"
    socket.broadcast.to(user.room).emit('message',generateMessage(user.username,mess))
    socket.emit('message',generateMessage('You',mess))
    callback()

  })

  socket.on('disconnect',()=>{
    const user=removeUser(socket.id)
    if (user)
    {
      io.to(user.room).emit('message',generateMessage('Admin',`${user.username} has left`))
      io.to(user.room).emit('roomData',{
        room:user.room,
        users:getUsersInRoom(user.room)
      })
    }
  })
  // socket.emit('countUpdated',count)
  //
  // socket.on('update',()="Admin",> {
  //   count++
  //   //this below statement only emits the event to a specific connection
  //   // socket.emit('countUpdated',count)
  //   //whereas io.emit emit to all connections connected at that point
  //   io.emit('countUpdated',count)
  // })
})

server.listen(port,()=>{
  console.log(`server is running on port ${port}!`)
})
