$(document).ready(function () {
    $('#imageFile').on('change', function (e) {
        var file = e.target.files[0];
        if (file) {
            var reader = new FileReader();
            reader.onload = function (e) {
                if ($('#currentImage').length) {
                    $('#currentImage').hide();
                }
                $('#imagePreview').html('<img src="' + e.target.result + '" style="max-width: 200px; max-height: 200px; border-radius: 8px; margin-top: 10px;" />');
            };
            reader.readAsDataURL(file);
        }
    });

    var priceInput = $('#ProductPrice');
    if (priceInput.length) {
        priceInput.on('input', function () {
            var value = $(this).val().replace(/[^\d]/g, '');
            if (value) {
                $(this).val(value);
            }
        });

        priceInput.closest('form').on('submit', function (e) {
            var displayValue = priceInput.val();
            var numericValue = displayValue.replace(/[^\d]/g, '');
            if (numericValue) {
                priceInput.val(numericValue);
            } else {
                priceInput.val('0');
            }
        });
    }
});

