$(document).ready(function () {
    $('#deadline').pickadate({
        format: 'dd/mm/yyyy',
        hiddenName: true,
        clear: 'limpar',
        close: 'fechar',
        min: true
    });

});