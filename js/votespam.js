/**
 * Clemson Battle of the Bands - Final Vote Spamming
 * https://www.flomarching.com/articles/6301642-college-football-playoff-2018-battle-of-the-bands-finals
 *
 * Authors:
 * - @MayorMonty#4692 (https://bren.app/)
 * - @jhnhnck#1776 (https://www.jhnhnck.com/)
 */

import '/js/js-cookie.min.js'

const voteURL = 'https://polldaddy.com/n/11aad1b680d8efba7827f20b7f5d778c/10203269?'
const altVoteURL = 'https://polls.polldaddy.com/vote-js.php?p=10203269&b=0&a=46892247,&o=&va=0&cookie=0&url=https%3A//www.flomarching.com/articles/6304511-tarp-vs-turf-comparing-indoor-percussion-to-outdoor&n='
const urlVersion = 202
const perSecond = 20
const cookieConfig = { secure: true, expires: 28, domain: '.bcuzrobotics.com' }

let cookie = {
  contrib: 0,
  uuid: uuidv4(),
  url: urlVersion,
  reported: 0,
}

document.getElementById('init-voter').addEventListener('click', VoterInit, false)

/* Public Functions */

function VoterInit() {
  // Generate or merge browser cookie data
  const tmpCookie = Cookies.getJSON('__votespam')

  if (tmpCookie === undefined) {
    Cookies.set('__votespam', cookie, cookieConfig)
  } else if (tmpCookie.url < 202) {
    Object.assign(cookie, tmpCookie)
    cookie.contrib = 0
    cookie.reported = -1
    cookie.url = urlVersion
  } else {
    Object.assign(cookie, tmpCookie)
    cookie.url = urlVersion
  }

  // Enable counter
  let numDisplay = document.getElementById('vote-contrib')

  // Welome back message
  if (cookie.contrib > 0) {
    numDisplay.innerText = `Welcome back, ${cookie.contrib} votes already!`
  } else if (cookie.reported === -1) {
    numDisplay.innerText = 'Welcome back! New methods, so votes have been reset.'
  } else {
    numDisplay.innerText = `${cookie.contrib} votes`
  }

  numDisplay.removeAttribute('hidden')

  // Disable button and start voter
  document.getElementById('init-voter').setAttribute('disabled', '')
  document.getElementById('cookie-warning').setAttribute('hidden', '')
  voter()

  // Enable Percent field
  setTimeout(() => {
    document.getElementById('vote-percent-wrap').removeAttribute('hidden')
  }, 5 * 1000)
}

function voter() {
  setInterval(() => {
    let req = new Array(perSecond).fill(0).map(voteReq)
    Promise.all(req).then(() => { addVotes(perSecond) })
  }, 5 * 1000)
}

/* --- Private Functions --- */

function addVotes(votes) {
  // Update cookie
  cookie.contrib += votes
  Cookies.set('__votespam', cookie, cookieConfig)

  // Update contribution counter
  document.getElementById('vote-contrib').innerText = `${cookie.contrib} votes`

  // Shitty Reporting API
  if ((cookie.contrib - cookie.reported) > 1000) {
    const req = new XMLHttpRequest()

    // Prepare and send request
    req.open('POST', '/api/votespam/report', true)
    req.setRequestHeader('Content-type', 'application/json')
    req.send(JSON.stringify(cookie));

    req.onreadystatechange = () => {
      if (req.readyState === 4 && req.status === 200) {
        if (req.response.currentURL > urlVersion) {
          window.location.reload(true)
        }
      }
    }

    // Update reported value
    cookie.reported = cookie.contrib
    Cookies.set('__votespam', cookie, cookieConfig)
  }
}

function uuidv4() {
  return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, (c) =>
    (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
  )
}

function voteReq() {
  const fetchOpts = { mode: 'no-cors', cache: 'no-store', referrerPolicy: "no-referrer" }

  fetch(`${voteURL}${new Date().getTime()}`, fetchOpts).then((res) => {
    const pdv = /[a-f0-9]+\|[0-9]+/.exec(res.text())[0]

    fetch(`${altVoteURL}${pdv}`, fetchOpts).then((pdvres) => {
      const percent = /<span\s[a-z="\-]+>\sClemson\s[^&]+&nbsp;([0-9.%]+)<\/span>/.exec(pdvres.text())[1]
      document.getElementById('vote-percent').innerHTML = percent
      return
    })
  })
}

