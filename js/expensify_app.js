/////////////////////////////////////////////////
// Util Functions ///////////////////////////////
/////////////////////////////////////////////////

// function that makes an ajax call to the expensify API
var ajaxExpensify = function(url, params, successHandler, jsonErrorCodeObject){
    $.ajax({
        dataType: "json",
        url: this.formElmt.action,
        data: $(this.formElmt).serialize(),
        success: function(data){
            if (data.jsonCode == "200"){
                successHandler(data);
            }
            else {
                jsonErrorCodeObject[data.jsonCode](data, errorElmt);
            }
        },
        error: function(jqXHR, clientStatus, httpStatus){
            if (clientStatus){
                console.log(clientStatus);
                alert("Uh oh! An exception occured: " + clientStatus);
            }
            if (httpStatus) {
                alert("Uh oh! A server error occurred: " + httpStatus + ". Try again later.");
            }
        },
    });
};

// function checks if object has any unset properties
// i.e. checks if object has any properties with a
// null value
// Parameters:
//      target -- the object to be checked
// Returns:
//      String -- the (first) unset property if it exists
//      false -- if the object has no unset property
var illDefined = function (target) {
    for (var member in target) {
        if (target[member] === null)
            return member;
        }
    return false;
};

// function checks if target is defined and if so
// calls a call, if not it throws an error with a
// message about the undefined property
// Parameters:
//      target -- the object to be checked
//      callback -- the function to be called
//          if the object is well defined
var ifWellDefinedThen = function (target, callback){
    var isIllDefined = illDefined(target);
    if(isIllDefined === false){
        callback();
    }
    else {
        throw new Error("The following property is not defined: " + isIllDefined);
    }
};

// function creates a cookie
// Parameters:
//      cookie_name -- name of the cookie to be deleted
//      value -- value to be assigned to the cookie
//      hours -- integer number of hours before expiration
var createCookie = function (cookie_name, value, hours) {
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
};

// function gets the value of a cookie if it exists
// otherwise return null
// Parameters:
//      cookie_name -- name of the cookie to be deleted
var getCookieValue = function (cookie_name) {
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
};

// function resets cookie to have expired an hour ago
// causing the browser to delete the cookie altogether
// Parameters:
//      cookie_name -- name of the cookie to be deleted
var deleteCookie = function (cookie_name) {
    createCookie(cookie_name, "", -1);
};


/////////////////////////////////////////////////
// Classes //////////////////////////////////////
/////////////////////////////////////////////////

function Form(formElmt, errorElmt){
    if (!(this instanceof Form)){
        return new Form(formElmt, errorElmt);
    }
    this.formElmt = formElmt;
    this.errorElmt = errorElmt || null;
}

Form.prototype.ajaxifySubmit = function(successHandler, jsonErrorCodeObject) {
    var self = this;
    var url = self.formElmt.action;
    var params = $(self.formElmt).serialize();
    $(self.formElmt).submit(function(event){
        ajaxExpensify(url, params, successHandler, jsonErrorCodeObject);
    });
};

/////////////////////////////////////////////////
// Helper Functions /////////////////////////////
/////////////////////////////////////////////////

var errorInvalidInput = function(){
    alert("Invalid user input. Try again!");
};

var errorPrivileges = function(){
    alert("Oops! You do not have the privileges to do that!");
};

var errorServer = function(){
    alert("Oops! Expensify is experiencing some issues on their end. Try again later.");
};

// function logs out the user by deleting the
// authentication cookie and refreshing the page
// so that the cookie actually get removed by
// the browser, this should also "redirect" to
// the login "page"
var logoutUser = function (){
    deleteCookie("authToken");
    location.reload(true);
};

// function that handles login json error codes
// Parameters:
//      error -- the error object return by the API call
//      errorElmt -- the inline element to contain the error
//          the login error message to be displayed
var errorLogin = function(error, errorElmt){
    errorElmt.innerHTML = error.message;
};

// object that handles the default set of json error codes
var jsonCodeDefaultHandlers = {
    // 400 unrecognized command
    "400": errorInvalidInput,
    // 402 missing argument
    "402": errorInvalidInput,
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

// object that handle the set of json error codes
// specific to the Authenticate API command
var loginErrorHandlers = {
    // 401 incorrect password
    "401": errorLogin,
    // 404 account not found
    "404": errorLogin,
    // 405 email not validated
    "405": errorLogin,
};

// object composed of login specific json errors
// and the default set of json error codes
var jsonCodeLoginErrorHandlers = $.extend(loginErrors, jsonDefaultHandlerObject);


/////////////////////////////////////////////////
// Abstractions of Application Structure ////////
/////////////////////////////////////////////////

// transaction -- object that abstracts
//      the portion of the application that
//      is devoted to displaying and creating
//      user transactions
// Properties:
//      containerElmt -- div element that contains
//          elements that display or create transaction
//          data
//      adder -- module that abstracts the part of
//          application that creates new transactions
//      table -- module that abstracts the part of the
//          application that displays transactions
var transactions = {
    containerElmt: null,
    adder: null,
    table: null,
};

// transactionTable -- module that abstracts
//      the portion of the application that
//      is solely devoted to displaying transactions
// Properties:
//          tableElmt -- table element that holds transaction data
//          fetchForm -- form element where users input parameters
//              required by API to fetch transaction data
//          fetchSuccessHandler -- handler to be called if the ajax
//              request fired by for submision succeeds
//          fetchErrorHandlers -- object that contains handlers as
//              properties, keys being specific json error codes
//          showAllButtonElmt -- button element that is to fire
//              a request for all user transactions on file
//          showAllButtonBehavior -- event handler bound to click
//              that is to make ajax call for all transaction data
//          addTransaction -- function that creates new table row of
//              transaction data
//          clearTable -- function that clears the table of all rows
//          config -- function that attaches all even handlers to
//              the relevant elements
var transactionTable = {
    element: null,
    form: null,
    showAllButtonELmt: null,
    formSuccessHandler: function (response){
        this.clearTable();
        for (var transaction in response){
            addTransaction(transaction, this.tableElmt);
        }
    },
    formErrorHandlers: jsonCodeDefaultHandlers,
    showAllButtonBehavior: function (){
        ajaxExpensify("get_proxy.php",
                      { command: "Get", returnValueList: "transactionList" },
                      this.fetchSuccessHandler, this.fetchErrorHandlers);
    },
    addTransaction: function (transaction, table){
        var row = document.createElement("tr");
        table.appendChild(row);
        var date_cell = document.createElement("td");
        date_cell.innerHTML = transaction.created;
        row.appendChild(date_cell);
        var amount_cell = document.createElement("td");
        amount_cell.innerHTML = transaction.amount;
        row.appendChild(amount_cell);
        var merchant_cell = document.createElement("td");
        merchant_cell.innerHTML = transaction.merchant;
        row.appendChild(merchant_cell);
        var comment_cell = document.createElement("td");
        comment_cell.innerHTML = transaction.comment ? transaction.comment : "";
        row.appendChild(comment_cell);
        table.appendChild(row);
    },
    clearTable: function(){
        $(this.tableElmt).children().remove();
    },
    config: function(){
        ifWellDefinedThen(this, function (){
            $(showAllButtonELmt).on("click", this.showAllButtonBehavior);
            // set handlers for form submission for fetching user transactions
            this.fetchForm.ajaxifySubmit(this.fetchSuccessHandler,
                                         this.fetchErrorHandlers);
        }.bind(this));
    },
};

// transactionAdder -- object that abstracts
//      the portion of the application that
//      is solely devoted to creating transactions
// Properties:
//          addForm -- form element where users input parameters
//              required by API to fetch transaction data
//          addSuccessHandler -- handler to be called if the ajax
//              request fired by for submision succeeds
//          addErrorHandlers -- object that contains handlers as
//              properties, keys being specific json error codes
//          addButtonElmt -- button element that is to display the
//              form which has action of adding transaction data to
//              the database
//          addButtonBehavior -- event handler bound to the click event
//              on the button element to display the add transaction form
//          cancelButtonElmt -- button element that is to hide the form
//              which has the above action
//          cancelButtonBehavior -- behavior bound to click event to hide
//              the above form
//          config -- function that attaches all even handlers to
//              the relevant elements
var transactionsAdder = {
    form: null,
    addButtonElmt: null,
    cancelButtonElmt: null,
    formSuccessHandler: function(response){
        console.log("transaction added");
    },
    formErrorHandlers: jsonCodeDefaultHandlers,
    addButtonBehavior: function(){
        addButtonElmt.style.display = "none";
        addForm.style.display = "";
    },
    cancelButtonBehavior: function(){
        addForm.style.display = "none";
        addButtonElmt.style.display = "";
    },
    config: function () {
        ifWellDefinedThen(this, function(){
            // bind click on add button to appropriate event
            $(addButtonElmt).on("click", addButtonBehavior);
            // bind click on cancel button to appropriate event
            $(cancelButtonElmt).on("click", cancelButtonBehavior);
            // set handlers for form submission for fetching user transactions
            this.addForm.ajaxifySubmit(this.addSuccessHandler,
                                        this.addErrorObject);
        }.bind(this));
    },
};

transactions.adder = transactionAdder;
transactions.table = transactionTable;

// navBar -- object that abstracts the portion
//      of the application that comprises and
//      handles the navigation bar
// Properties:
//      navElmt -- nav element that contains user
//          information and navigation elements
//      usernameElmt -- inline element that is to
//          display the current user
//      logoutElmt -- button element
var navBar = {
    element: null,
    usernameElmt: null,
    logoutButton: null,
    logoutButtonBehavior: logoutUser,
    config: function (){
        ifWellDefinedThen(this, function(username){
            this.navElmt.style.display = "";
            this.usernameElmt.innerHTML = username;
            $(logoutButton).on("click", this.logoutButtonBehavior);
        }.bind(this));
    },
};

// login -- object that abstracts the portion
//      of the application that comprises and
//      handles user authentication
// Properties:
//      containerElmt -- div element that contains login form
//      form -- the form element that authenticates users by
//          making an expensify API call
//      remove -- method that removes login from document
//      successHandler -- success callback for authentication call
//      errorHandlers -- object of handlers for specific json error
//          code keys
//      config -- function that attaches all even handlers to
//          the relevant elements
var login = {
    containerElmt: null,
    form: null,
    remove: function() {
        if (containerElmt){
            $(containerElmt).remove();
        }
    },
    successHandler: function(response){
        this.remove();
        if(response){
            createCookie("email", response.email, 1);
            createCookie("authToken", response.authToken, 1);
        }
        navBar.congfig();
        transactions.table.config();
        transactions.adder.config();
    },
    errorHandlers: jsonCodeLoginErrorHandlers,
    config: function(){
        ifWellDefinedThen(this, function(){
            this.form.ajaxifySubmit(this.successHandler, this.errorObject);
        }.bind(this));
    },
};

/////////////////////////////////////////////////
// On DOM Ready Code ////////////////////////////
/////////////////////////////////////////////////

$(document).ready(function (){
    var authToken = getCookieValue("authToken");
    transactions.containerElmt = document.getElementById("trans_con");
    transactions.table.element = document.getElementById("trans_table");
    transactions.table.form = new Form(document.getElementById("show_form"));
    transactions.table.showAllButtonELmt = document.getElementById("show_all");
    transactions.adder.element = document.getElementById("add_trans");
    transactions.adder.cancelButtonElmt = document.getElementById("cancel_add");
    transactions.adder.form = new Form(document.getElementById("add_form"));
    navBar.element = document.getElementsByTagName("nav")[0];
    navBar.logoutElmt = document.getElementById("logout");
    navBar.usernameElmt = document.getElementById("username");
    login.containerElmt = document.getElementById("login_con");
    var login_form = document.getElementById("login_form");
    var login_message = document.getElementById("message");
    login.form = new Form(login_form, login_message);
    if (!authToken){
        login.config();
    }
    else {
        login.successHandler();
    }
});
