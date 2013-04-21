<?php
  $sub_reddit = "r/funny";

  $after = "";
  if( $_GET['r'] !== "0" )
    $after = "&after=" .  preg_replace( '#[^a-zA-Z0-9_-]+#', '', $_GET['r'] );
 
  echo file_get_contents( "http://www.reddit.com/" . $sub_reddit . ".json?limit=80" . $after );
?>