$(document).ready(function () {
    var updateStockModal = null;
    var currentProductId = null;
    var currentRow = null;
    var updateStockUrl = $('.category-header').data('update-stock-url');

    function initModal() {
        if (!updateStockModal) {
            var modalElement = document.getElementById('updateStockModal');
            if (modalElement && typeof bootstrap !== 'undefined') {
                try {
                    updateStockModal = new bootstrap.Modal(modalElement, {
                        backdrop: true,
                        keyboard: true,
                        focus: true
                    });
                } catch (error) {
                    console.error('Lỗi khởi tạo modal:', error);
                }
            }
        }
        return updateStockModal;
    }

    $(document).on('click', '.btn-update-stock', function (e) {
        e.preventDefault();
        e.stopPropagation();

        var modal = initModal();
        if (!modal) {
            alert('Không thể khởi tạo form. Vui lòng tải lại trang.');
            console.error('Bootstrap hoặc modal element không tồn tại');
            return;
        }

        var $btn = $(this);
        var productId = $btn.data('product-id');
        var productName = $btn.data('product-name');
        var currentStock = $btn.data('current-stock');
        currentRow = $btn.closest('tr');

        if (!productId || !productName) {
            alert('Thông tin sản phẩm không hợp lệ');
            return;
        }

        $('#modalProductId').val(productId);
        $('#modalProductName').val(productName);
        $('#modalCurrentStock').val(currentStock);
        $('#modalNewStock').val(currentStock || 0);
        currentProductId = productId;

        try {
            modal.show();
            setTimeout(function () {
                var input = document.getElementById('modalNewStock');
                if (input) {
                    input.focus();
                    input.select();
                }
            }, 300);
        } catch (error) {
            console.error('Lỗi hiển thị modal:', error);
            alert('Không thể hiển thị form. Vui lòng thử lại.');
        }
    });

    $('.btn-update-submit').on('click', function () {
        var $btn = $(this);
        var productId = $('#modalProductId').val();
        var newStock = parseInt($('#modalNewStock').val());

        if (isNaN(newStock) || newStock < 0) {
            alert('Số lượng tồn không hợp lệ. Vui lòng nhập số nguyên không âm.');
            return;
        }

        $btn.prop('disabled', true).html('<i class="fa fa-spinner fa-spin"></i> Đang cập nhật...');

        $.ajax({
            url: updateStockUrl,
            type: 'POST',
            data: {
                productId: productId,
                stockQuantity: newStock
            },
            success: function (response) {
                if (response.success) {
                    updateStockModal.hide();

                    var $stockDisplay = currentRow.find('.stock-display');
                    $stockDisplay.text(newStock + ' sản phẩm');

                    var currentTab = currentRow.closest('.tab-pane').attr('id');

                    if (newStock > 0) {
                        $stockDisplay.css({
                            'background': '#d4edda',
                            'color': '#155724'
                        });
                    } else {
                        $stockDisplay.css({
                            'background': '#f8d7da',
                            'color': '#721c24'
                        });
                    }

                    currentRow.find('.btn-update-stock').data('current-stock', newStock);

                    if (newStock > 0 && currentTab === 'outOfStock') {
                        setTimeout(function () {
                            location.reload();
                        }, 300);
                    } else if (newStock === 0 && currentTab === 'inStock') {
                        setTimeout(function () {
                            location.reload();
                        }, 300);
                    }

                    updateTabCounts();
                } else {
                    alert('Lỗi: ' + response.message);
                    $btn.prop('disabled', false).html('<i class="fa fa-save"></i> Cập nhật');
                }
            },
            error: function () {
                alert('Có lỗi xảy ra khi cập nhật');
                $btn.prop('disabled', false).html('<i class="fa fa-save"></i> Cập nhật');
            }
        });
    });

    $('#updateStockModal').on('hidden.bs.modal', function () {
        $('#updateStockForm')[0].reset();
        $('.btn-update-submit').prop('disabled', false).html('<i class="fa fa-save"></i> Cập nhật');
    });

    $('#modalNewStock').on('keypress', function (e) {
        if (e.which === 13) {
            e.preventDefault();
            $('.btn-update-submit').click();
        }
    });

    function updateTabCounts() {
        var inStockCount = $('#inStock table tbody tr').length;
        var outOfStockCount = $('#outOfStock table tbody tr').length;
        $('#inStockCount').text(inStockCount);
        $('#outOfStockCount').text(outOfStockCount);
    }
});

