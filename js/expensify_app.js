/////////////////////////////////////////////////
// Util Functions ///////////////////////////////
/////////////////////////////////////////////////

// function that makes an ajax call to the expensify API
function ajaxJSON(url, params, callback, before){
    $.ajax({
        beforeSend: before,
        dataType: "json",
        url: url,
        data: params,
        success: function(data) {
            callback(data);
        },
        error: function(jqXHR, clientStatus, httpStatus){
            if (clientStatus){
                console.log(clientStatus);
                alert("Uh oh! An exception occured.");
            }
            else if (httpStatus) {
                alert("Uh oh! A server error occurred: " + httpStatus + ". Try again later.");
            }
        },
    });
}

// function creates a cookie
// Parameters:
//      cookie_name -- name of the cookie to be deleted
//      value -- value to be assigned to the cookie
//      hours -- integer number of hours before expiration
function createCookie(cookie_name, value, hours) {
    var expires;
    if (hours) {
        var date = new Date();
        date.setTime(date.getTime()+(hours*60*60*1000));
        expires = "; expires="+date.toGMTString();
    }
    else {
        expires = "";
    }
    document.cookie = cookie_name+"="+value+expires+"; path=/";
}

// function gets the value of a cookie if it exists
// otherwise return null
// Parameters:
//      cookie_name -- name of the cookie to be deleted
function getCookieValue(cookie_name) {
    // add '=' so we get the value when we
    // find the cookies
    var cookie_name_eq = cookie_name + "=";
    var cookie_array = document.cookie.split(';');
    // search through all cookies associated
    // with the domain for this session
    for(var i=0; i < cookie_array.length; i += 1) {
        var cookie = cookie_array[i];
        // find first non-whitespace character of cookie
        while ( cookie.charAt(0) == ' ' ){
            cookie = cookie.substring(1,cookie.length);
        }
        // return corresponding value if cookie key == cookie_name
        if (cookie.indexOf(cookie_name_eq) === 0){
            return cookie.substring(cookie_name_eq.length,cookie.length);
        }
    }
    // otherwise return null
    return null;
}

// function resets cookie to have expired an hour ago
// causing the browser to delete the cookie altogether
// Parameters:
//      cookie_name -- name of the cookie to be deleted
function deleteCookie(cookie_name) {
    createCookie(cookie_name, "", -1);
}


/////////////////////////////////////////////////
// Classes //////////////////////////////////////
/////////////////////////////////////////////////

// this class abstracts DOM form elements
function Form(formElmt, errorElmt){
    if (!(this instanceof Form)){
        return new Form(formElmt, errorElmt);
    }
    this.formElmt = formElmt;
}

// class method that ajaxify's form submission on a form
Form.prototype.ajaxifySubmit = function(responseHandler, before) {
    var self = this;
    var formElmt = self.formElmt;
    var url = formElmt.action;
    $(self.formElmt).submit(function(event){
        var params = $(self.formElmt).serialize();
        var $fields = $(formElmt).find("input, button");
        $fields.attr("disabled", true);
        ajaxJSON(url, params, function(response){
            formElmt.reset();
            $fields.attr("disabled", false);
            responseHandler(response);
        }, before);
        return false;
    });
};


/////////////////////////////////////////////////
// Application Specific Code ////////////////////
/////////////////////////////////////////////////

// The application code is made up of modules that
// encapsulate the functionalities and structure
// of the apllication


// AppTools -- module that encapsulates all
//      application specific code used in other
//      application modules
function AppTools(){
    function errorInvalidInput(){
        alert("Invalid user input. Try again!");
    }
    function errorPrivileges(){
        alert("Oops! You do not have the privileges to do that!");
    }
    function errorServer(){
        alert("Oops! Expensify is experiencing some issues on their end. Try again later.");
    }
    // function logs out the user by deleting the
    // authentication cookie and refreshing the page
    // so that the cookie actually get removed by
    // the browser, this should also "redirect" to
    // the login "page"
    function logoutUser(){
        deleteCookie("authToken");
        location.reload(true);
    }
    // function that handles login json error codes
    // Parameters:
    //      error -- the error object return by the API call
    //      errorElmt -- the inline element to contain the error
    //          the login error message to be displayed
    function errorLogin(error, errorElmt){
        var message = "";
        var errorCode = Number(error.jsonCode);
        switch(errorCode){
            case 401:
                message = "Wrong password.";
                break;
            case 404:
                message = "Account not found.";
                break;
            case 405:
                message = "Unvalidated email address.";
                break;
        }
        errorElmt.innerHTML = message;
    }
    // object that handles the default set of json error codes
    var errorCodeHandlers = {
        // 400 unrecognized command
        "400": errorInvalidInput,
        // 401 incorrect password
        "401": errorLogin,
        // 402 missing argument
        "402": errorInvalidInput,
        // 404 account not found
        "404": errorLogin,
        // 405 email not validated
        "405": errorLogin,
        // 407 malformed authToken
        "407": logoutUser,
        // 408 authToken expired
        "408": logoutUser,
        // 411 Insufficient privileges
        "411": errorPrivileges,
        // 500 Aborted
        "500": errorServer,
        // 501 db transaction error
        "501": errorServer,
        // 502 query error
        "502": errorServer,
        // query response error
        "503": errorServer,
        // unrecognized object state
        "504": errorServer,
    };
    // higher order function that takes in a callback for
    // a successful ajax form submission and the optional
    // argument of an element to display errors to
    // function return a callback function that handles
    // the json code errors specific to the expensify API
    // Parameters:
    //          successCallback -- callback to be called on
    //              successful ajax form submission
    //          errorElmt -- inline DOM element to display error
    //              messages to
    function expensifyFormHandler(successCallback, errorElmt){
        return function(data){
            if (data.jsonCode == "200"){
                successCallback(data);
            }
            else {
                errorCodeHandlers[data.jsonCode](data, errorElmt);
            }
        };
    }
    function cancelAddButtonBehavior(formElmt){
        var buttons = document.getElementById("buttons");
        buttons.classList.toggle("hide");
        formElmt.classList.toggle("hide");
    }
    // module exports
    return {
        cancelAddButtonBehavior: cancelAddButtonBehavior,
        logoutUser: logoutUser,
        formHandler: expensifyFormHandler,
    };
}

// Transaction -- module that abstracts
//      the portion of the application that
//      is devoted to displaying and creating
//      user transactions
function Transactions(Table, Adder){
    var containerElmt = document.getElementById("trans_con");
    function showTransactions(){
        if(containerElmt){
            containerElmt.classList.toggle("hide");
        }
    }
    return {
        show: showTransactions,
        Adder: Adder,
        Table: Table,
    };
}

// Table -- encapsulates the portion of the app
//          that displays transactions
function Table(AppTools){
    var bodyElmt = document.getElementById("trans_body");
    var formElmt = document.getElementById("show_form");
    var form = new Form(formElmt);
    var moreButtonElmt = document.getElementById("see_more");
    var cancelButtonElmt = document.getElementById("cancel_show");
    var showAllButtonELmt = document.getElementById("show_all");
    function clearTable(){
        $(bodyElmt).children().remove();
    }
    // function add $ sign in the right place
    // for the display of monetary amounts
    function parseMoney(string){
        if (string) {
            var temp = Number(string);
            if ( temp < 0){
                temp = Math.abs(temp);
                temp = "-$" + temp;
                return temp;
            }
            else {
                return "$" + temp;
            }
        }
        return "void";
    }
    //function computes the current date
    //and then return an params object to
    //pass to an ajax call requesting transactions
    //from the current month. function puts date into
    //this date into YYYY-MM-DD format
    function currentMonthParams(){
        var currentdate_date = new Date();
        var month = currentdate_date.getMonth()+1;
        month = month < 10 ? '0' + month : month;
        var day = currentdate_date.getDate();
        day = day < 10 ? '0' + day : day;
        var year = currentdate_date.getFullYear();
        var start = (year + '-' + month + '-' + '01');
        var end = (year + '-' + month + '-' + day);
        return {
            command: "Get",
            returnValueList: "transactionList",
            startDate: start,
            endDate: end
        };
    }
    // function parses date in YYYY-MM-DD
    // format and return a MM/DD/YYYY date
    // Parameters:
    //      UTCdate -- date in YYYY-MM-DD format
    function readifyUTCDate(UTCdate){
        var array = UTCdate.split("-");
        var year = array[0];
        var month = array[1];
        var day = array[2];
        return month + "/" + day + "/" + year;
    }
    // function displays a string into a message box
    // in the center of the transactions table body
    function insertTableMessage(message){
        var row = document.createElement("tr");
        var cell = document.createElement("td");
        row.id = "message_row";
        var messageElmt = document.createElement("div");
        messageElmt.innerHTML = message;
        row.appendChild(cell);
        cell.appendChild(messageElmt);
        bodyElmt.appendChild(row);
    }
    // function inserts html string into the message
    function dataLoading(){
        clearTable();
        var htmlString = "<p id='loading'>Loading<span>.</span><span>.</span><span>.</span></p>";
        insertTableMessage(htmlString);
    }
    // function loads a single transaction into a table
    // Parameters:
    //      transaction -- json object populated with
    //          transaction data
    //      table -- DOM table element that displays
    //          transaction data
    function addTransaction(tableBody, transaction){
        var row = document.createElement("tr");
        tableBody.appendChild(row);
        var date_cell = document.createElement("td");
        date_cell.innerHTML = readifyUTCDate(transaction.created);
        row.appendChild(date_cell);
        var amount_cell = date_cell.cloneNode(false);
        console.log(!transaction.amount);
        amount_cell.innerHTML = parseMoney(transaction.amount);
        row.appendChild(amount_cell);
        var merchant_cell = date_cell.cloneNode(false);
        merchant_cell.innerHTML = transaction.merchant;
        row.appendChild(merchant_cell);
        var comment_cell = date_cell.cloneNode(false);
        comment_cell.innerHTML = transaction.comment;
        row.appendChild(comment_cell);
    }
    // functions loads response data received from
    // ajax call to API into tables
    // Parameters:
    //      response -- object populated with transaction
    //          objects
    function showSuccessConstructor(dates, response){
        var transactions = response.transactionList;
        console.log(transactions);
        clearTable();
        if (transactions.length < 1) {
            var message = "No transactions to show.";
            if (dates){
                var startDate = readifyUTCDate(dates.startDate);
                var endDate = readifyUTCDate(dates.endDate);
                message = "No transactions in the period " + startDate + " – " + endDate + ".";
            }
            insertTableMessage(message);
        }
        transactions.forEach(addTransaction.bind(undefined, bodyElmt));
    }
    var showAllSuccessHandler = showSuccessConstructor.bind(undefined, null);
    var showAllHandler = AppTools.formHandler(showAllSuccessHandler);
    var showAllParams = { command: "Get", returnValueList: "transactionList" };
    // binds handler to click event on showAll button
    function showAllButtonBehavior(){
        ajaxJSON("get_proxy.php", showAllParams, showAllHandler, dataLoading);
    }
    function configTable(){
        // attach event handler to see more and cancel buttons
        $([moreButtonElmt, cancelButtonElmt]).on("click", function (event){
            console.log(event.target);
            AppTools.cancelAddButtonBehavior(formElmt);
        });
        // show the current month's transactions
        var requestMonths = currentMonthParams();
        var showPeriodSuccessHandler = showSuccessConstructor.bind(undefined, requestMonths);
        var formHandler = AppTools.formHandler(showPeriodSuccessHandler, dataLoading);
        ajaxJSON("get_proxy.php", requestMonths, formHandler, dataLoading);
        // configure the transactions display table
        $(showAllButtonELmt).on("click", showAllButtonBehavior);
        // set handler for form submission that fetches user transactions
        form.ajaxifySubmit(formHandler);
    }
    return {
        config: configTable,
    };
}

// Adder -- Module that encapsulates the portion
//          of the application that adds transactions
//          to a user's account
function  Adder(AppTools){
    var formElmt = document.getElementById("add_form");
    var addButtonElmt = document.getElementById("add_trans");
    var cancelButtonElmt = document.getElementById("cancel_add");
    var form = new Form(formElmt);
    function addSuccessHandler(response){
        console.log("transaction added");
        cancelButtonBehavior();
    }
    var formHandler = AppTools.formHandler(addSuccessHandler);
    function configAdder(){
        // attach behavior to add transaction and cancel buttons
        $([addButtonElmt, cancelButtonElmt]).on("click", function (event){
            AppTools.cancelAddButtonBehavior(formElmt);
        });
        // set handlers for form submission for fetching user transactions
        form.ajaxifySubmit(formHandler);
    }
    return {
        config: configAdder,
    };
}


// NavBar -- module that encapsulates the portion
//      of the application that comprises and
//      handles the navigation bar
function NavBar(AppTools){
    var navElmt = document.getElementsByTagName("nav")[0];
    var usernameElmt = document.getElementById("username");
    var logoutButton = document.getElementById("logout");
    var logoutButtonBehavior = AppTools.logoutUser;
    function configNavBar(email){
        var username = email || getCookieValue("email");
        navElmt.classList.toggle("hide");
        usernameElmt.innerHTML = username;
        $(logoutButton).on("click", logoutButtonBehavior);
    }
    return {
        config: configNavBar,
    };
}


// Login -- module that encapsulates the portion of
//          of the application that handles user
//          authentication
function Login(Transactions, NavBar, AppTools){
    var containerElmt = document.getElementById("login_con");
    var formElmt = document.getElementById("login_form");
    var messageElmt  = document.getElementById("message");
    var form = new Form(formElmt);
    function loginSuccessHandler(response) {
        $(containerElmt).remove();
        var email;
        if(response){
            email = response.email;
            createCookie("email", email, 1);
            createCookie("authToken", response.authToken, 1);
        }
        NavBar.config(email);
        Transactions.show();
        Transactions.Table.config();
        Transactions.Adder.config();
    }
    var formHandler = AppTools.formHandler(loginSuccessHandler, messageElmt);
    function configLogin(){
        form.ajaxifySubmit(formHandler);
    }
    return {
       config: configLogin,
       success: loginSuccessHandler,
    };
}

/////////////////////////////////////////////////
// On DOM Ready Code ////////////////////////////
/////////////////////////////////////////////////

$(document).ready(function (){
    var authToken = getCookieValue("authToken");
    // load up modules
    var apptools = AppTools();
    var transactions = Transactions(Table(apptools), Adder(apptools));
    var navbar = NavBar(apptools);
    var login = Login(transactions, navbar, apptools);
    if (!authToken){
        login.config();
    }
    else {
        login.success();
    }
});
