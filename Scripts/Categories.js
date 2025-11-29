$(document).ready(function () {
    initCategoryTable();
    initCategoryForm();
    initDeleteConfirmation();
});

function initCategoryTable() {
    $('.category-table tbody tr').each(function () {
        $(this).on('mouseenter', function () {
            $(this).find('.btn-custom').addClass('show');
        }).on('mouseleave', function () {
            $(this).find('.btn-custom').removeClass('show');
        });
    });
}

function initCategoryForm() {
    $('.category-form-container form').on('submit', function (e) {
        var categoryName = $('input[name="CategoryName"]').val().trim();

        if (!categoryName) {
            e.preventDefault();
            showAlert('Vui lòng nhập tên danh mục', 'danger');
            return false;
        }

        if (categoryName.length > 200) {
            e.preventDefault();
            showAlert('Tên danh mục không được vượt quá 200 ký tự', 'danger');
            return false;
        }

        $('.btn-submit').prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Đang xử lý...');
    });

    $('input[name="CategoryName"]').on('input', function () {
        var value = $(this).val();
        var length = value.length;
        var maxLength = 200;

        if (!$(this).parent().find('.char-count').length) {
            $(this).parent().append('<small class="char-count text-muted"></small>');
        }

        var remaining = maxLength - length;
        var charCountEl = $(this).parent().find('.char-count');

        if (remaining < 20) {
            charCountEl.text(remaining + ' ký tự còn lại').css('color', remaining < 0 ? '#dc3545' : '#ffc107');
        } else {
            charCountEl.text('');
        }
    });
}

function initDeleteConfirmation() {
    $('.btn-delete, .btn-delete-confirm').on('click', function (e) {
        if ($(this).hasClass('btn-delete-confirm')) {
            var hasRelatedProducts = $('.alert-danger-custom').length > 0;

            if (hasRelatedProducts) {
                e.preventDefault();
                showAlert('Không thể xóa danh mục có sản phẩm liên quan', 'danger');
                return false;
            }
        }

        var categoryName = $('.dl-horizontal dd').text().trim();

        if (!confirm('Bạn có chắc chắn muốn xóa danh mục "' + categoryName + '"?')) {
            e.preventDefault();
            return false;
        }

        $(this).prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Đang xóa...');
    });
}

function showAlert(message, type) {
    var alertClass = type === 'danger' ? 'alert-danger-custom' : 'alert-success';
    var alertHtml = '<div class="alert ' + alertClass + ' alert-custom alert-dismissible fade show" role="alert">' +
        message +
        '<button type="button" class="btn-close" data-bs-dismiss="alert"></button>' +
        '</div>';

    $('.category-form-container, .category-delete-container').prepend(alertHtml);

    setTimeout(function () {
        $('.alert-custom').fadeOut(function () {
            $(this).remove();
        });
    }, 5000);
}

function validateCategoryName() {
    var input = $('input[name="CategoryName"]');
    var value = input.val().trim();

    if (!value) {
        input.addClass('is-invalid');
        return false;
    }

    if (value.length > 200) {
        input.addClass('is-invalid');
        return false;
    }

    input.removeClass('is-invalid').addClass('is-valid');
    return true;
}

