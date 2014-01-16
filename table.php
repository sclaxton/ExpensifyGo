<div class="hide" id="trans_con">
    <div id="forms">
        <span id="buttons">
            <button id="add_trans">Add</button> | <button id="see_more">See More</button>
        </span>
        <form class="hide" id="add_form" action="get_proxy.php">
            <input type="hidden" name="command" value="CreateTransaction" />
            <table>
                <tbody>
                    <tr>
                        <td>
                            <input required type="date" name="created" placeholder="Date" />
                        </td>
                        <td>
                            <input required type="text" name="amount" placeholder="Amount" />
                        </td>
                        <td>
                            <input required type="text" name="merchant" placeholder="Merchant" />
                        </td>
                        <td>
                            <input type="text" name="comment" placeholder="Comments..." />
                        </td>
                        <td>
                            <button type="submit" id="add_button">Add</button>
                            <button type="reset">Reset</button>
                            <button type="button" id="cancel_add">Cancel</button>
                            <span class="fade_hide small" id="add_message">Added!</span>
                        </td>
                    </tr>
                </tbody>
            </table>
        </form>
        <form class="hide" id="show_form" action="get_proxy.php">
            <input type="hidden" name="command" value="Get">
            <input type="hidden" name="returnValueList" value="transactionList">
                <table>
                    <tbody>
                        <tr>
                            <td>
                                <label for="startDate">From:</label>
                                <input required type="date" name="startDate" placeholder="Start Date" />
                            </td>
                            <td>
                                <label for="endDate">To:</label>
                                <input required type="date" name="endDate" placeholder="End Date" />
                            </td>
                            <td>
                                <button type="submit" id="show_button">Show</button>
                                <button type="button" id="show_all">Show All</button>
                                <button type="button" id="cancel_show">Cancel</button>
                            </td>
                        </tr>
                    </tbody>
                </table>
        </form>
    </div>
    <div id="table_con">
        <table id="trans_table">
            <thead><tr><th>Date</th><th>Amount</th><th>Merchant</th><th>Comments</th></th></thead>
            <tbody id="trans_body">
            </tbody>
        </table>
    </div>
</div>
