function onFileSelectedForUpload(target) {
    var currentTargetIx = target.name.substring(10);
    var newIndex = currentTargetIx;
    newIndex++;

    if (!$("input[name='fileUpload" + newIndex + "']").length) {
        $("input[name='" + target.name + "']").after('<br><input type="file" name="fileUpload' + newIndex + '" onchange="onFileSelectedForUpload(this)">');
    }
}

function onAddPlaceFormLoaded() {

    var options = {
        beforeSubmit: beforeSubmit,
        success: afterSubmit
    };

    $('#send_data_form').submit(function () {

        try {
            $('#send_data_form').ajaxSubmit(options);
        } catch (e) {
            MyAlert(e.message);
        }
        
        return false;
    });
}


function beforeSubmit() {
    
    try {
        $("input[name*='fileUpload']").filter(function () { return this.value == '' }).remove();
    } catch (e) {
        MyAlert("beforeSubmit error: " + e.message);
    }
    
    showWaitMessage();
}


function afterSubmit(responseText, statusText, xhr, $form) {
    hideWaitMessage();
    closeMe('popupContent');
    //parent.showBaloonMessage(responseText);
}