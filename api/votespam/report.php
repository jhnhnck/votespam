<?php

$REPORTS_DIR = realpath('/var/webroot/api-cache/');
$rawPost = file_get_contents('php://input');
$currentURL = '202';

if ($_SERVER['CONTENT_TYPE'] == 'application/json') {
  file_put_contents($REPORTS_DIR . '/voting_report.json', $rawPost . "\n", $flags = FILE_APPEND);
  echo '{"message":"Accepted.","currentURL":' . $currentURL . '}';
  die();
} else {
  header($_SERVER['SERVER_PROTOCOL'] . ' 400 Bad Request', true, 400);
  echo'{"message":"Invalid Content-Type for POST request.","currentURL":'.$currentURL.'}';
  die();
}

?>
