<!DOCTYPE html>
<html>
    <head>
        <meta charset="utf-8">
        <title>Expensify Go</title>
        <link rel="stylesheet" href="css/expensify_app.css" />
        <script type="text/javascript" src="//code.jquery.com/jquery-1.10.2.min.js"></script>
        <script type="text/javascript" src="js/expensify_app.js"></script>
    </head>
    <body>
        <div id="header">
            <a id="title" href="/">
                <h2>Expensify</h2><h2 class="color_me">Go</h2>
            </a>
            <nav class="hide">
                <span id="username"></span> | <button type="button" id="logout">Logout</button>
            </nav>
        </div>
        <div id="content">
        <?php
            require_once 'login.php';
            require_once 'content.php';
        ?>
        </div>
    </body>
</html>
