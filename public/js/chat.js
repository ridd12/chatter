const socket=io()
//

//picking variables to make buttons off till the time the output is given
const $messageForm=document.querySelector('#message_form')
const $messageFormInput=$messageForm.querySelector('input')
const $messageFormButton=$messageForm.querySelector('button')
const $location_button=document.querySelector('#send-location')


//for renderning the message usnig mustache
const $messageDiv=document.querySelector('#messages')
const messageTemplate=document.querySelector('#message-template').innerHTML

//for rendering the location as  a link
// const $messageDiv=document.querySelector('#messages')
const locationTemplate=document.querySelector('#location-template').innerHTML


//for sidebars
const sidebarTemplate=document.querySelector('#sidebar-template').innerHTML




const {username,room}=Qs.parse(location.search,{ignoreQueryPrefix:true})


const autoscroll=()=>{
    const $newMessage=$messageDiv.lastElementChild

    const newMessageStyles=getComputedStyle($newMessage)
    const newMessageMargin=parseInt(newMessageStyles.marginBottom)
    const newMessageHeight=$newMessage.offsetHeight + newMessageMargin


    const visibleHeight=$messageDiv.offsetHeight

    const containerHeight=$messageDiv.scrollHeight

    const scrollOffset=$messageDiv.scrollTop + visibleHeight


    if(containerHeight - newMessageHeight <= scrollOffset){
    $messageDiv.scrollTop=$messageDiv.scrollHeight
    console.log("top")
    console.log(containerHeight - newMessageHeight , scrollOffset)

    }
    else{
      console.log("Bottom")

      console.log(containerHeight - newMessageHeight , scrollOffset)
    }

}


socket.on('message',(message)=>{
  // console.log(message)
  const html = Mustache.render(messageTemplate,{
    //this is done using a mustache library the {{dynamic}} part if changed to the second argument that is also message which is the above one consoleloggedone!
    username:message.username,
    message:message.text,
    createdAt:moment(message.createdAt).format('h:mm a')

  })
  $messageDiv.insertAdjacentHTML('beforeend',html)
  autoscroll()
})

socket.on('roomData',({room,users})=>{
    const html=Mustache.render(sidebarTemplate,{
      room,
      users
    })
    document.querySelector('#sidebar').innerHTML=html
})

socket.on('location-message',(message)=>{
  console.log(message)
  const html = Mustache.render(locationTemplate,{
    //this is done using a mustache library the {{dynamic}} part if changed to the second argument that is also location which is the above one consoleloggedone!
    username:message.username,
    location:message.link,
    createdAt:moment(message.createdAt).format('h:mm a')
  })
  $messageDiv.insertAdjacentHTML('beforeend',html)
  autoscroll()
})



document.querySelector('#message_form').addEventListener('submit',(e)=>{
  e.preventDefault()

  $messageFormButton.setAttribute('disabled','disabled')

  const mess= e.target.elements.message.value
  // console.log(mess)
  socket.emit('update',mess,(error)=>{
    $messageFormButton.removeAttribute('disabled')
    $messageFormInput.value=''
    $messageFormInput.focus()
    if (error){
      return console.log(error)
    }
    console.log('your message was deliverd!')
  })

})

document.querySelector('#send-location').addEventListener('click',()=>{
  if (!navigator.geolocation){
    return alert('geolocation is not support is not supported by your browers')
  }
  $location_button.setAttribute('disabled','disabled')
  navigator.geolocation.getCurrentPosition((position)=>{
    // console.log(position)
    // console.log(position.coords.latitude)
    // [
    const exact_position=[position.coords.latitude,position.coords.longitude]
    $location_button.removeAttribute('disabled')
    socket.emit('location',exact_position,()=>{
      console.log('location was shared!')
    })
  })
  // GeolocationPosition {coords: GeolocationCoordinates, timestamp: 1622034918721}
  // coords: GeolocationCoordinates
  // accuracy: 215611
  // altitude: null
  // altitudeAccuracy: null
  // heading: null
  // latitude: 22.258651999999998
  // longitude: 71.1923805
})


socket.emit('join',{username,room},(error)=>{
  if(error){
    alert(error)
    location.href='/'
  }
})

// socket.on('countUpdated',(count)=>{
//   console.log("hi your count has been updated",count)
// })
// document.querySelector('#increment').addEventListener('click',()=>{
//   console.log('Button got Clicked')
//   socket.emit('update')
// })
