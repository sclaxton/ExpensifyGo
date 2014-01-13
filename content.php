<div style="display:none;" id="trans_con">
    <div id="trans_table_con">
        <form id="show_form">
            <input type="hidden" name="command" value="Get">
            <input type="hidden" name="returnValueList" value="transactionList">
                <table>
                    <tr>
                        <td>
                            <input type="date" name="startDate" placeholder="yyyy/mm/dd">
                        </td>
                        <td>
                            <input type="date" name="endDate" placeholder="yyyy/mm/dd">
                        </td>
                        <td>
                            <button type="submit">Show</button>
                            <button type="reset">Reset</button>
                            <button type="button" id="show_all">show all</button>
                        </td>
                    </tr>
                </table>
        </form>
        <table id="trans_table"><progress id="progress">Loading...</progress></table>
    </div>
    <div id="add_con">
        <button id="add_trans">Add</button>
        <form style="display:none;" id="add_form" action="get_proxy.php">
            <input type="hidden" name="command" value="CreateTransaction">
            <table>
                <tr>
                    <td>
                        <input type="date" name="created" placeholder="yyyy/mm/dd">
                    </td>
                    <td>
                        <input type="text" name="amount" placeholder="Amount">
                    </td>
                    <td>
                        <input type="text" name="merchant" placeholder="Merchant">
                    </td>
                    <td>
                        <input type="text" name="comments" placeholder="Comments...">
                    </td>
                    <td>
                        <button type="submit">Add</button>
                        <button type="reset">Reset</button>
                        <button type="button" id="cancel_add">Cancel</button>
                    </td>
                </tr>
            </table>
        </form>
    </div>
</div>
