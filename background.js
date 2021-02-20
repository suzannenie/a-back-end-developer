function countdown() {
  const s = parseInt(localStorage.getItem('sec'),10)
  const m = parseInt(localStorage.getItem('min'),10)
  const h = parseInt(localStorage.getItem('hrs'),10)

  if (s <= 0) {
    localStorage.setItem('sec', 0)
  } else {
    localStorage.setItem('sec', s-1)
  }

  if(m > 0 && s == 0){
    localStorage.setItem('sec', 59)
    localStorage.setItem('min', m-1)
    return;
  }

  if (h > 0 && m == 0 && s == 0){
    localStorage.setItem('sec', 59)
    localStorage.setItem('min', 59)
    localStorage.setItem('hrs', h-1)
    return;
  }
}

function getTimeLeftMs() {
  const s = parseInt(localStorage.getItem('sec'),10)
  const m = parseInt(localStorage.getItem('min'),10)
  const h = parseInt(localStorage.getItem('hrs'),10)
  return (s + (m* 60) + (h* 60)) * 1000
}


function onMessage (message) {
//  timer not finished
  if (!message.done) {
    chrome.alarms.create("onesecond", {when: Date.now() + 1000})
  }
}

function checkDone (alarm) {
  chrome.alarms.clear("onesecond")
  countdown()
  const timeLeft = getTimeLeftMs()
  if (timeLeft === 0){
      chrome.runtime.sendMessage({done: true})
      localStorage.setItem('cancel', false)
      chrome.tabs.create({url: 'home.html'});
      return;
  }
  chrome.runtime.sendMessage({countdown: true})
  chrome.alarms.create("onesecond", {when: Date.now() + 1000})
}



chrome.runtime.onMessage.addListener(onMessage)
chrome.alarms.onAlarm.addListener(checkDone)