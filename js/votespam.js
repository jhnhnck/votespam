/**
 * Clemson Battle of the Bands - Final Vote Spamming
 * https://www.flomarching.com/articles/6301642-college-football-playoff-2018-battle-of-the-bands-finals
 *
 * Authors:
 * - @MayorMonty#4692 (https://bren.app/)
 * - @jhnhnck#1776 (https://www.jhnhnck.com/)
 */

import '/js/js-cookie.min.js'

const voteURL = 'https://polldaddy.com/n/11aad1b680d8efba7827f20b7f5d778c/10203269?1546562786842'
const urlVersion = 200
const perSecond = 25
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
  if (Cookies.get('__votespam') === undefined) {
    Cookies.set('__votespam', cookie, cookieConfig)
  } else {
    Object.assign(cookie, Cookies.getJSON('__votespam'))
    cookie.url = urlVersion
  }

  // Enable counter
  let numDisplay = document.getElementById('vote-contrib')

  // Welome back message
  if (cookie.contrib > 0) {
    numDisplay.innerText = `Welcome back, ${cookie.contrib} votes already!`
  } else {
    numDisplay.innerText = `${cookie.contrib} votes`
  }

  numDisplay.removeAttribute('hidden')

  // Disable button and start voter
  document.getElementById('init-voter').setAttribute('disabled', '')
  document.getElementById('cookie-warning').setAttribute('hidden', '')
  voter()
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
    const http = new XMLHttpRequest()

    // Prepare and send request
    http.open('POST', '/api/votespam/report', true)
    http.setRequestHeader('Content-type', 'application/json')
    http.send(JSON.stringify(cookie));

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
  return fetch(voteURL,
    { mode: 'no-cors', cache: 'no-store', referrerPolicy: "no-referrer" }
  )
}

