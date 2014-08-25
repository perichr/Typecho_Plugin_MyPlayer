<?php
/*
 * 爱奇艺
 */
class IQIYI extends API{
    private $id;
    protected function LoadParams( ) {
        if( TryGetParam( 'id', $id ) ) {
            $this->id = $id;
        } else{
            return false;
        }
        return true;
    }
    protected function GetCacheName( ) {
	    return 'iqiyi_' . $this->id;
    }
    protected function LoadRemote( ) {
        $html = GetUrlContent( "http://www.iqiyi.com/v_{$this->id}.html" );
        $count = preg_match_all( '/\"vid\":\"([0-9a-z]+)\"/s', $html, $matchs );
        if( $count ){
            $vid = $matchs[1][0];
            $this->data = array( );
            $this->data['url'] = "http://player.video.qiyi.com/{$vid}/0/0/v_{$this->id}.swf";
        }
    }
}
