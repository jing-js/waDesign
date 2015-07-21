/*
 * https://gist.github.com/yrezgui/5653591
 */
app
  .filter( 'bytes', function () {
  const units = ['Bytes', 'K', 'M', 'G', 'T', 'P'];

  return function( bytes, precision = 0 ) {
    let unit = 0;
    while ( bytes >= 1024 ) {
      bytes /= 1024;
      unit ++;
    }
    return bytes.toFixed(precision) + units[ unit ];
  };
});