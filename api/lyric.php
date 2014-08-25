<?php
/*
 * 歌词文件
 */
class LYRIC extends API{
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
        return 'lyric_'.md5($this->url);
    }
    protected function LoadRemote( ) {
        $source = GetUrlContent( $this->url );
        $this->data = array( );
        $this->data['source'] = $source;
        //$this->data['json'] = $this->GetJson($source);
    }
    function GetJson($lyric){
        $lrc = array();
        $preg = '/^(.*?)$/m';
        $count = preg_match_all( $preg, $lyric, $match );
        foreach( $match[1] as $line ) {
            $preg = '/\[(\d{2}:.*?)\]/s';
            preg_match_all( $preg, $line, $m ); 
            $text = implode( '', $m[0] );
            $text = str_replace( $text, '' ,$line );
            foreach( $m[1] as $t ) {
                $i = explode( ':', $t );
                $time = $i[0] * 60 + $i[1];
                $lrc[] = array( $time, $text );    
            }
        }
        sort( $lrc );
        return $lrc;
    }
}
