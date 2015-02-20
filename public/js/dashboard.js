$(document).ready(function () {
    $('#deadline').pickadate({
        format: 'dd/mm/yyyy',
        formatSubmit: 'dd/mm/yyyy',
        hiddenName: true,
        clear: 'limpar',
        close: 'fechar',
        min: true
    });
    
    
    $(".input-group.date span").click(function () {
        var picker = $("#deadline").pickadate('picker');
        if (picker.get("open")) {
            picker.close();
        }
        else {
            picker.open();
        }
        event.stopPropagation();
    });

});