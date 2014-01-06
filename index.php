<?php $authToken = $_COOKIE["authToken"]; ?>
<!DOCTYPE HTML>
<html>
    <head>
        <meta charset="utf-8">
        <title>Expensify Transactions</title>
        <link rel="stylesheet" href="css/expensify_app.css" />
        <script type="text/javascript" src="//code.jquery.com/jquery-1.10.2.min.js"></script>
        <script type="text/javascript" src="js/expensify_app.js"></script>
    </head>
    <body>
        <div id="header">
            <a href="/">
                <h1 id="title">ExpensifyTransactions</h1>
            </a>
        </div>
        <div id="content">
            <nav  style="display:none;">
                <span id="username"></span><a id="logout">logout</a>
            </nav>
        <?php
            $display = "";
            if (!$authToken){
                $display = "display:none;";
            }
            require_once 'login.php';
            echo '<div id="trans_con" style=' . $display . '>';
                require_once 'content.php';
        ?>
            </div>
        </div>
    </body>
</html>
