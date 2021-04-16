STATE="${STATE:-ma}"
COOKIEJAR='cookies.txt'
REFERER='https://www.cvs.com/immunizations/covid-19-vaccine'
DATA="https://www.cvs.com/immunizations/covid-19-vaccine.vaccine-status.$STATE.json?vaccineinfo"
curl --cookie-jar $COOKIEJAR  --silent $REFERER > /dev/null
curl  \
  -H 'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:87.0) Gecko/20100101 Firefox/87.0' \
  -H 'Accept: */*' \
  -H 'Accept-Language: en-US,en;q=0.5' \
  --compressed \
  -H "Referer: $REFERER" \
  -H 'Connection: keep-alive' \
  --cookie-jar cookies.txt \
  --silent \
  $DATA
