<?php 
if( !isset($_GET) || !isset($_GET['url']) ) {
  echo "What the hell is wrong with you?";
  return false;
}

$type = (int)$_GET['type']; 
$path = urldecode( $_GET['url'] );
$html = "";
$image = "";
$temp = 0;

if( $type === 0 ) { // imgur
  $html = file_get_contents( $path );
  $temp = strrpos( $html, '<link rel="image_src"' ) + 28;
  $image = substr( $html, $temp, 100 );
  $image = substr( $image, 0, strrpos( $image, ">" ) - 2 );
}
else if( $type === 1 ) { // quick meme
  $html = file_get_contents( $path );
  $temp = strrpos( $html, 'id="img"' );
  $image = substr( $html, $temp, 200 );
  $temp = strrpos( $image, 'src=' ) + 5;
  $image = substr( $image, $temp, strrpos( $image, ">" ) - $temp - 1 );
}
else if( $type === 2 ) { // 9gag
  $html = file_get_contents( $path );
  $temp = strrpos( $html, '<div class="img-wrap">' );
  $image = substr( $html, $temp, 200 );
  $temp = strrpos( $image, 'src=' ) + 7;
  $image = substr( $image, $temp, strrpos( $image, "alt=" ) - $temp - 2 );
  $image = "http://" . $image;
}

if( strrpos( $image, ".gif" ) > 0 )
  header( 'Content-Type: image/gif' );
else if( strrpos( $image, ".png" ) > 0 )
  header( 'Content-Type: image/[ng' );
else
  header( 'Content-Type: image/jpeg' );

echo file_get_contents( $image );