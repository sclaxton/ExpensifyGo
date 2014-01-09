<?php
function getResponseHeaders($response, $header_size) {
    $header_str = substr($response, 0, $header_size);
    $headers = explode("\r\n", preg_replace('/\x0D\x0A[\x09\x20]+/', ' ', $header_str));
    return $headers;
}
function proxyRequest($url){
    $ch = curl_init();
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_VERBOSE, 1);
    curl_setopt($ch, CURLOPT_HEADER, 1);
    curl_setopt($ch, CURLOPT_URL, $url);
    $response = curl_exec($ch);
    $header_size = curl_getinfo($ch, CURLINFO_HEADER_SIZE);
    curl_close($ch);
    $headers = getResponseHeaders($response, $header_size);
    $body = substr($response, $header_size);
    foreach($headers as $hdr){
        if (strpos($hdr, "Set-Cookie") === 0){
            continue;
        }
        else {
            header($hdr);
        }
    }
    echo $body;
}
if ($_GET['command']){
    $qs = $_SERVER['QUERY_STRING'];
    $api_url = "https://api.expensify.com?";
    if ($_GET['command'] == "Authenticate"){
        $partnerName = "applicant";
        $partnerPassword = "d7c3119c6cdab02d68d9";
        $useExpensifyLogin = "false";
        $qs = $qs . "&partnerName=" . $partnerName . "&partnerPassword=" . $partnerPassword;
        $qs = $qs . "&useExpensifyLogin=" . $useExpensifyLogin;
        $api_url = $api_url . $qs;
        proxyRequest($api_url);
    }
    else if ($_COOKIE['authToken']){
        if ($_GET['command'] == "CreateTransaction"){
            $qs = $qs . "&created=" . date("Y-m-d H:i:s");
        }
        $authToken = $_COOKIE['authToken'];
        $qs = $qs . "&authToken=" . $authToken;
        $api_url = $api_url . $qs;
        echo $api_url;
        // proxyRequest($api_url);
    }
}
?>
