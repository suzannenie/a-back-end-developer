// strings
var hours = document.getElementById('hours')
var minutes = document.getElementById('minutes')
var seconds = document.getElementById('seconds')

// buttons
var start = document.getElementById('timer_start')
var cancel = document.getElementById('timer_stop')

var quip = document.getElementById('quip')



function initTime() {
    var h = parseInt(localStorage.getItem('hrs'), 10) || 0
    var m = parseInt(localStorage.getItem('min'), 10) || 0
    var s = parseInt(localStorage.getItem('sec'), 10) || 0
    var ph = parseInt(localStorage.getItem('savehrs'), 10)
    var pm = parseInt(localStorage.getItem('savemin'), 10)
    var ps = parseInt(localStorage.getItem('savesec'), 10)
    console.log(h, m, s, ph, pm, ps)

    getVal (hours, h, h, m, s, ph)
    getVal (minutes, m, h, m, s, pm)
    getVal (seconds, s, h, m, s, ps)
}

function getVal (v, curr, h, m, s, p) {
    if (h === 0 && m === 0 && s === 0) {
        if (isNaN(p)) {
            v.value = "00"
        } else {
            v.value = (p > 9 ? p : `0${p}`)
        }
    }
    else {
        v.value = (curr > 9 ? curr : `0${curr}`)
    }
}

function editButtons() {
    var cancelVal = localStorage.getItem('cancel') || false
    if (cancelVal === "true"){
        start.className = "button disabled"
        cancel.className = "button"
    }
    else{
        start.className = "button"
        cancel.className = "button disabled"
    }
}

initTime()
editButtons()

function countdown() {
    var h = parseInt(localStorage.getItem('hrs'),10)
    var m = parseInt(localStorage.getItem('min'),10)
    var s = parseInt(localStorage.getItem('sec'),10)
    hours.value = h > 9 ? h : `0${h}`
    minutes.value =  m > 9 ? m : `0${m}`
    seconds.value =  s > 9 ? s : `0${s}`
}


function onMessage(message) {
    if (message.countdown){
        countdown()
        editButtons()
    }
    if (message.done){
        hours.value = parseInt(localStorage.getItem('savehrs'),10)
        minutes.value = parseInt(localStorage.getItem('savemin'),10)
        seconds.value = parseInt(localStorage.getItem('savesec'),10)
        start.className = "button"
        cancel.className = "button disabled"
    }
}

function onStart(event) {
    var h = parseInt(hours.value, 10)
    var m = parseInt(minutes.value, 10)
    var s = parseInt(seconds.value, 10)

    localStorage.setItem('hrs', h)
    localStorage.setItem('min', m)
    localStorage.setItem('sec', s)
    localStorage.setItem('savehrs', h)
    localStorage.setItem('savemin', m)
    localStorage.setItem('savesec', s)
    localStorage.setItem('cancel', true)
    cancel.className = "button"
    start.className = "button disabled"
    quip.innerHTML = "check your POSTURE"

    chrome.runtime.sendMessage({hours:h, minutes: m, seconds:s})
}

function onCancel(event) {
    quip.innerHTML = ""
    start.className = "button"
    cancel.className = "button disabled"
    chrome.alarms.clear("second")
    var h = parseInt(localStorage.getItem('savehrs'), 10)
    var m = parseInt(localStorage.getItem('savemin'), 10)
    var s = parseInt(localStorage.getItem('savesec'), 10)
    hours.value = h > 9 ? h : "0"+h
    minutes.value = m > 9 ? m : "0"+m
    seconds.value = s > 9 ? s : "0"+s
    localStorage.setItem('cancel', false)
    chrome.runtime.sendMessage({done: true})
}

function onTimeChange (value, hour, minute, second) {
    var val = parseInt(value, 10)
    if (isNaN(val)|| val < 0){
        if (hour) {
            hours.value = "00"
        }
        else if (minutes) {
            minutes.value = "00"
        }
        else {
            seconds.value = "00"
        }
    }
    else if ((hour && val>23) || minute && val>59 || second && val>59) {
        if (hour) {
            hours.value = "23"
        }
        else if (minutes) {
            minutes.value = "59"
        }
        else {
            seconds.value = "59"
        }
    }
    else{
        if (hour) {
            hours.value = val > 9 ? val : `0${val}`
        }
        else if (minute) {
            minutes.value = val > 9 ? val : `0${val}`
        }
        else {
            seconds.value = val > 9 ? val : `0${val}`
        }
    }
}


hours.addEventListener('keyup', event => onTimeChange(event.target.value, true, false, false))
minutes.addEventListener('keyup', event => onTimeChange(event.target.value, false, true, false))
seconds.addEventListener('keyup', event => onTimeChange(event.target.value, false, false, true))

start.addEventListener('click', onStart)
cancel.addEventListener('click', onCancel)

chrome.runtime.onMessage.addListener(onMessage)