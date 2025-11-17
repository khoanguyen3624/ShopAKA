using System.ComponentModel.DataAnnotations;

namespace ShopAKA.Models
{
    [MetadataType(typeof(ProductMetadata))]
    public partial class Product
    {
    }

    public class ProductMetadata
    {
        [Required(ErrorMessage = "Mã sản phẩm là bắt buộc")]
        [Display(Name = "Mã sản phẩm")]
        public int ProductID { get; set; }

        [Required(ErrorMessage = "Danh mục là bắt buộc")]
        [Display(Name = "Danh mục")]
        public int CategoryID { get; set; }

        [Required(ErrorMessage = "Tên sản phẩm là bắt buộc")]
        [StringLength(500, ErrorMessage = "Tên sản phẩm không được vượt quá 500 ký tự")]
        [Display(Name = "Tên sản phẩm")]
        public string ProductName { get; set; }

        [Required(ErrorMessage = "Mô tả sản phẩm là bắt buộc")]
        [Display(Name = "Mô tả sản phẩm")]
        public string ProductDecription { get; set; }

        [Required(ErrorMessage = "Giá sản phẩm là bắt buộc")]
        [Range(0.01, double.MaxValue, ErrorMessage = "Giá sản phẩm phải lớn hơn 0")]
        [Display(Name = "Giá sản phẩm")]
        [DisplayFormat(DataFormatString = "{0:N0}", ApplyFormatInEditMode = true)]
        public decimal ProductPrice { get; set; }

        [Display(Name = "Hình ảnh sản phẩm")]
        public string ProductImage { get; set; }
    }
}

