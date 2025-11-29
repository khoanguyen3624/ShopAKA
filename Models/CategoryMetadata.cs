using System.ComponentModel.DataAnnotations;

namespace ShopAKA.Models
{
    [MetadataType(typeof(CategoryMetadata))]
    public partial class Category
    {
    }

    public class CategoryMetadata
    {
        [Required(ErrorMessage = "Tên danh mục là bắt buộc")]
        [StringLength(200, ErrorMessage = "Tên danh mục không được vượt quá 200 ký tự")]
        [Display(Name = "Tên danh mục")]
        public string CategoryName { get; set; }
    }
}

