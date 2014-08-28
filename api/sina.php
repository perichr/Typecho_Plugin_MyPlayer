<?php
/*
 * 新浪视频
 */
class sina extends API{
    private $url;
    protected function LoadParams( ) {
        if( TryGetParam( 'url', $url ) ) {
            $this->url = $url;
        } else{
            return false;
        }
        return true;
    }
    protected function GetCacheName( ) {
        return 'sina_'.md5($this->url);
    }
    protected function LoadRemote( ) {
        $html = GetUrlContent( "http://dp.sina.cn/dpool/video/pad/play.php?url={$this->url}" );
        $count = preg_match_all( '/$SCOPE\[\'vid\'\]\s=\s"(\d+)";/s', $html, $matchs );
        if( $count ){
            $this->data = array( );
            $this->data['url'] = $matchs[1][0];
            $this->data['url'] = 'http://you.video.sina.com.cn/api/sinawebApi/outplayrefer.php/vid={$matchs[1][0]}/s.swf'
        }
    }
}
