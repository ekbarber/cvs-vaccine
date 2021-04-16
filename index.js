#!/usr/bin/env node

const axios = require('axios')
const _ = require('lodash')
const nodemailer = require('nodemailer')
const logger = require('pino')()
const debug = require('debug')('vaccine')
const fs = require('fs')

const stdin = process.stdin
stdin.setEncoding('utf8')

require('dotenv').config()

const INTERVAL=5000 //5 seconds

const SMTP_HOST = 'smtp.gmail.com'
const SMTP_USER = _.get(process, 'env.SMTP_USER')
const SMTP_PASS = _.get(process, 'env.SMTP_PASS')
const EMAIL_TO = _.get(process, 'env.EMAIL_TO', SMTP_USER)

function run(){
  debug(`SMTP_USER: ${SMTP_USER}`)
  debug(`SMTP_PASS: ${SMTP_PASS}`)
  let dataStr = ''
  stdin.on('data', (chunk)=> dataStr += chunk)
  stdin.on('end', ()=>{
	  const stateStr = fs.readFileSync('./data/state.json')
	  const state = JSON.parse(stateStr)
	  debug({stateStr, state})
    const parsed = JSON.parse(dataStr)
    const currentTimeStr = _.get(parsed, 'responsePayloadData.currentTime')
   const currentTime = Date.parse(currentTimeStr)
	const previousTimeStr = _.get(state, 'currentTimeStr')
	debug({currentTimeStr, previousTimeStr})	
	if(_.isEmpty(previousTimeStr) || Date.parse(currentTimeStr) > Date.parse(previousTimeStr)){

		const data = _.get(parsed, 'responsePayloadData.data.MA')
    		const availableTowns = _.filter(data, (town)=>_.get(town, 'status') !== 'Fully Booked')

	    if(availableTowns.length){
	      const emailContent = formatEmail(availableTowns)
	      sendEmail(emailContent)
		.then(()=> logger.info('Email Sent!'))
		.catch((err)=>logger.error(err))
	    }else{
	      logger.info('No Vaccines Available')
	    }

	}else {
		logger.info('No Updates Available')
	}
    
    fs.writeFileSync('data/state.json', JSON.stringify({ currentTimeStr }))
  })
}

function formatEmail(towns){
  let message = `
    Vaccines available at ${towns.length} locations!
    <p><a href="https://www.cvs.com/immunizations/covid-19-vaccine">https://www.cvs.com/immunizations/covid-19-vaccine</a>
    <ul>
  `
  _.each(towns, (town) => message+= `<li>${_.get(town, 'city')}</li>`)
  return message
}
async function sendEmail(content){
  logger.info('Sending email')
  const transport = nodemailer.createTransport({
    host: SMTP_HOST,
    port:465,
    auth:{
      user: SMTP_USER,
      pass: SMTP_PASS
    }
  })
  const msg = {
    from:SMTP_USER,
    to:EMAIL_TO,
    subject: 'Vaccine Available',
    html:content
  }
  await transport.sendMail(msg)
}



run()
  // .catch((e)=>{console.error(e)})
  // .finally((exitCode)=>process.exit(exitCode || 0))
