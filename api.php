<?php

header('Content-Type: application/json');

$servername = "xxx";
$dbname = "xxx";
$username = "xxx";
$password = "xxx";

if ($_REQUEST["db"] && $_REQUEST["db"] != '') {
  $dbname = $_REQUEST["db"];
}

try {
  $conn = new PDO("mysql:host=$servername;dbname=$dbname", $username, $password);
  // set the PDO error mode to exception
  $conn->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

  //echo "Connected successfully";
} catch(PDOException $e) {
  echo "Connection failed: " . $e->getMessage();
}

if ($_REQUEST["q"] == 'last') {
  $limit = 3;
  if ($_REQUEST["a"]) {
    $limit = $_REQUEST["a"];
  }
  $stmt = $conn->prepare("SELECT * FROM edges WHERE sentiment IS NOT NULL LIMIT $limit");
} else if ($_REQUEST["q"] == 'learn') {
  $stmt = $conn->prepare("SELECT * FROM edges LIMIT 1000");
} else if ($_REQUEST["q"] == 'group_learn') {
  $stmt = $conn->prepare('SELECT DATE_FORMAT(created_at, "%Y-%m-%d") as date, avg(sentiment) as average_sentiment FROM edges where sentiment is not null GROUP BY DATE_FORMAT(created_at, "%Y-%m-%d") order by created_at desc LIMIT 100');
} else if ($_REQUEST["q"] == 'group_last3') {
  $stmt = $conn->prepare('SELECT DATE_FORMAT(created_at, "%Y-%m-%d") as date, avg(sentiment) as average_sentiment FROM edges where sentiment is not null  GROUP BY DATE_FORMAT(created_at, "%Y-%m-%d") order by created_at desc LIMIT 3');
} else {
  echo 'Welcome to our COINS - Collective Horoscope API :)';
}


if ($stmt) {
  $stmt->execute();
  $conn = null;
  $results = $stmt->fetchAll(PDO::FETCH_ASSOC);
  $json = json_encode($results);
  echo $json;
}



//$conn = null;

?>
