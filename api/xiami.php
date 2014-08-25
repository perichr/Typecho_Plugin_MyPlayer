<?php
/*
 * 虾米音乐

 0 default
 1 album
 2 artist
 3 collect
 */
class XIAMI extends API{
    private $id;
    private $type;
    protected function LoadParams( ) {
        if( TryGetParam( 'id', $id ) ) {
            $this->id = $id;
        } else{
            return false;
        }
        TryGetParam( 'type', $type );
        switch ( $type )
        {
            case '1' :
            case 'album' :
                $this->type = 1;
                break;        
            case '2' :
            case 'artist' :
                $this->type = 2;
                break;        
            case '3' :
            case 'collect' :
                $this->type = 3;
                break;        
            default:
                $this->type = 0;
                break;
        }
        return true;
        
    }
    protected function GetCacheName( ) {
        switch ( $this->type )
        {
            case 1 :
                return 'xiami_album_' . $this->id;
            case 2 :
                return 'xiami_artist_' . $this->id;
            case 3 :
                return 'xiami_collect_' . $this->id;
            default:
                return 'xiami_song_' . $this->id;
        }
        
    }
    protected function LoadRemote( ) {
        $this->data =array();
        $url = "http://query.yahooapis.com/v1/public/yql?q=select%20*%20from%20xml%20where%20url%3D'http%3A%2F%2Fwww.xiami.com%2Fsong%2Fplaylist%2Fid%2F{$this->id}%2Ftype%2F{$this->type}'&format=json";
        $json = json_decode(GetUrlContent( $url ));
        if(is_null($json)){
            return;
        }
        $json = $json->{'query'};
        if(is_null($json)){
            return;
        }
        $json = $json->{'results'};
        if(is_null($json)){
            return;
        }
        $json = $json->{'playlist'};
        if(is_null($json)){
            return;
        }
        $json = $json->{'trackList'};
        if(is_null($json)){
            return;
        }
        $json = $json->{'track'};
        if(is_null($json)){
            return;
        }
        if(!is_array($json)){
            $arrayName = array( );
            array_push($arrayName, $json);
            $json = $arrayName;
        }
        foreach($json as $track){
            array_push($this->data, $this->Filter($track));
        }
    }
    function Filter($track){
        $value = array();
        $value['title'] = $track->{'title'};
        $value['url'] = $this->GetUrl($track->{'location'});
        $value['artist'] = $track->{'artist'};
        $value['lyric_url'] = $track->{'lyric_url'};
        $value['album'] = $track->{'album_name'};
        $value['album_pic'] = $track->{'album_pic'};
        $value['song_id'] = $track->{'song_id'};
        $value['album_id'] = $track->{'album_id'};
        $value['artist_id'] = $track->{'artist_id'};

        return $value;
    }
    function GetUrl($location){
        $num = substr( $location, 0, 1 );
        $inp = substr( $location, 1 );
        $iLe = strlen( $inp ) % $num;
        $quo = ( strlen( $inp ) - $iLe ) / $num;
        
        $a = 0;
        $ret = '';
        $arr = array();
        for ( $i = 0; $i < $num; $i ++ ) {
            $arr[$i] = ( $iLe > $i ? 1 : 0 ) + $quo;
        }
        for ( $i = 0; $i < $arr[1] ; $i ++) {
            $a = 0;
            for ( $j = 0; $j < $num; $j ++) {
                $ret .= substr( $inp, $a + $i, 1 );
                $a += $arr[$j];
            }
        }
        
        $location = rawurldecode( $ret );
        $location = str_replace( '^', '0', $location );
        $location = str_replace( '+', ' ', $location );
        $location = preg_replace( '/00-0-nul(.*)/', '00-0-null', $location );
        return $location;
    }
}
